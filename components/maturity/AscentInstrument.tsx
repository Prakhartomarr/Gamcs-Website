"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { dur, ease } from "@/lib/motion";
import { ASCENT, curvePath, curveY, progressT, rubberBand, snapTarget, stageT } from "./ascent";

/* The scene is ~6KB of WebGL that nothing above the fold needs: it loads
   only once the instrument is near the viewport (see `near`). */
const AscentScene = dynamic(() => import("./AscentScene"), { ssr: false });

type Stage = { n: string; name: string; tag: string };

type Props = {
  stages: readonly Stage[];
  active: number;
  onChange: (i: number) => void;
  /** Accessible name of the tablist. */
  label: string;
  /** "Swipe along the curve" — shown on touch until the first interaction. */
  hint: string;
  /** id of the tabpanel the nodes control. */
  panelId: string;
};

/* The SVG fallback's drawing box. Its stroke is non-scaling, so the box can
   stretch to any aspect and the line stays 1.6px. */
const VB_W = 1000;
const VB_H = 300;

/**
 * The maturity curve as an instrument: drag along it (or tap a node, or use
 * the arrow keys) and the stage under the marker becomes the selected tab.
 *
 * Progress is a float in a ref, not React state: a drag writes it 60 times a
 * second, and only the integer stage it rounds to goes up to the parent.
 *
 * Three renderers, one geometry (./ascent.ts): the server-rendered SVG path
 * (no JS, no WebGL, reduced tier), and the lazy WebGL scene drawn over it once
 * it has painted a frame.
 */
export default function AscentInstrument({ stages, active, onChange, label, hint, panelId }: Props) {
  const count = stages.length;
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const prog = useRef({ p: active });
  const reveal = useRef({ r: 1 });
  const tween = useRef<gsap.core.Tween | null>(null);
  /* The one-time "it moves" hint. Anything else that moves the marker kills
     it first, so the hint can never fight a real choice. */
  const nudge = useRef<gsap.core.Tween | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const lastStage = useRef(active);
  const activeRef = useRef(active);
  activeRef.current = active;

  const [near, setNear] = useState(false);
  const [mode, setMode] = useState<"svg" | "gl" | "fallback">("svg");
  const [why, setWhy] = useState<string>();
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [touched, setTouched] = useState(false);

  /* The SVG path and the marker, at a frozen clock. The WebGL scene paints
     the marker itself (its clock moves), so this stands down in "gl". */
  const paint = useCallback(() => {
    if (modeRef.current === "gl") return;
    const { p } = prog.current;
    path.current?.setAttribute("d", curvePath(p, count, 0, VB_W, VB_H));
    const r = reveal.current.r;
    if (path.current) path.current.style.strokeDashoffset = String(1 - r);
    const m = marker.current;
    const { w, h } = size.current;
    if (m && w) {
      const t = progressT(p, count);
      m.style.transform = `translate3d(${(t * w).toFixed(1)}px, ${((1 - curveY(t, p, count, 0)) * h).toFixed(1)}px, 0)`;
      m.style.opacity = r >= t ? "1" : "0";
    }
  }, [count]);

  /* Writes progress. Only a finger reports every stage it crosses (with a
     haptic tick each); a programmatic move reports its destination once, in
     go(), so a jump from 01 to 05 does not flick the panel through 02-04. */
  const setP = useCallback(
    (p: number, fromDrag = false) => {
      prog.current.p = p;
      if (fromDrag) {
        const stage = Math.min(Math.max(Math.round(p), 0), count - 1);
        if (stage !== lastStage.current) {
          lastStage.current = stage;
          onChange(stage);
          if ("vibrate" in navigator) navigator.vibrate?.(ASCENT.haptic);
        }
      }
      paint();
    },
    [count, onChange, paint]
  );

  const heading = useRef<number | null>(null);
  const go = useCallback(
    (i: number) => {
      const target = Math.min(Math.max(i, 0), count - 1);
      if (heading.current === target && tween.current?.isActive()) return;
      nudge.current?.kill();
      tween.current?.kill();
      heading.current = target;
      if (target !== lastStage.current) {
        lastStage.current = target;
        onChange(target);
      }
      if (reduced) {
        setP(target);
        return;
      }
      tween.current = gsap.to(prog.current, {
        p: target,
        duration: dur.snap,
        ease: ease.snap,
        onUpdate: () => setP(prog.current.p),
      });
    },
    [count, reduced, setP, onChange]
  );

  /* A selection made elsewhere (the parent, a keyboard) travels the marker. */
  useEffect(() => {
    if (lastStage.current !== active) go(active);
  }, [active, go]);

  /* Size, for the marker and for turning finger pixels into stages. */
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      size.current = { w: e.contentRect.width, h: e.contentRect.height };
      paint();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [paint]);

  /* Near the viewport: load the scene. In view: draw the line in, then —
     on touch, once — nudge the marker as a hint that it moves. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const pre = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        pre.disconnect();
      }
    }, { rootMargin: "400px 0px" });
    pre.observe(el);
    if (reduced) return () => pre.disconnect();

    const rv = reveal.current;
    rv.r = 0;
    paint();
    let draw: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      draw = gsap.to(rv, {
        r: 1, duration: 1.4, ease: ease.inOut, onUpdate: paint,
        onComplete: () => {
          if (!window.matchMedia("(pointer: coarse)").matches || tween.current?.isActive()) return;
          nudge.current = gsap.to(prog.current, {
            p: `+=${activeRef.current < count - 1 ? 0.35 : -0.35}`,
            duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 1, delay: 0.2,
            onUpdate: () => setP(prog.current.p),
          });
        },
      });
    }, { threshold: 0.35 });
    io.observe(el);
    return () => {
      pre.disconnect();
      io.disconnect();
      draw?.kill();
      nudge.current?.kill();
      rv.r = 1;
      paint();
    };
  }, [reduced, count, paint, setP]);

  /* ---- the gesture --------------------------------------------------- */
  const drag = useRef<{
    id: number; x: number; y: number; p: number; locked: boolean; dead: boolean;
    samples: { t: number; p: number }[];
  } | null>(null);

  const stepPx = () => (size.current.w * (1 - 2 * ASCENT.pad)) / (count - 1) || 1;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, p: prog.current.p, locked: false, dead: false, samples: [] };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || d.dead) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.locked) {
      /* Vertical intent wins outright: the page scrolls, the curve stays. */
      if (Math.abs(dy) > ASCENT.slop && Math.abs(dy) > Math.abs(dx)) {
        d.dead = true;
        return;
      }
      if (Math.abs(dx) < ASCENT.slop) return;
      d.locked = true;
      nudge.current?.kill();
      tween.current?.kill();
      heading.current = null;
      area.current?.setPointerCapture(e.pointerId);
      setTouched(true);
    }
    const p = rubberBand(d.p + dx / stepPx(), count);
    const now = performance.now();
    d.samples.push({ t: now, p });
    while (d.samples.length > 2 && now - d.samples[0].t > 90) d.samples.shift();
    setP(p, true);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (d.locked) {
      const s = d.samples;
      const span = s.length > 1 ? (s[s.length - 1].t - s[0].t) / 1000 : 0;
      const v = span > 0 ? (s[s.length - 1].p - s[0].p) / span : 0; // stages per second
      go(snapTarget(prog.current.p, v, count));
      return;
    }
    if (d.dead) return;
    /* A tap on the curve: the nearest stage to the finger. */
    const box = area.current?.getBoundingClientRect();
    if (!box) return;
    const t = (e.clientX - box.left) / box.width;
    let best = 0;
    for (let i = 1; i < count; i++) if (Math.abs(stageT(i, count) - t) < Math.abs(stageT(best, count) - t)) best = i;
    setTouched(true);
    go(best);
  };

  /* WAI-ARIA tabs, automatic activation: arrows move focus and selection. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(active + 1, count - 1);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(active - 1, 0);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = count - 1;
    if (next === null) return;
    e.preventDefault();
    go(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="mc-ascent" ref={root} data-mode={mode} data-fallback={why} data-touched={touched || undefined}>
      <div
        className="mc-ascent-area"
        ref={area}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        aria-hidden="true"
      >
        <svg className="mc-ascent-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
          <path
            ref={path}
            d={curvePath(active, count, 0, VB_W, VB_H)}
            pathLength={1}
            strokeDasharray="1 1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {near && mode !== "fallback" && (
          <AscentScene
            count={count}
            getProgress={() => prog.current.p}
            getReveal={() => reveal.current.r}
            reduced={reduced}
            marker={marker}
            onReady={() => setMode("gl")}
            onFallback={(reason) => {
              setWhy(reason);
              setMode("fallback");
              requestAnimationFrame(paint);
            }}
          />
        )}
        <span className="mc-ascent-marker" ref={marker} />
      </div>

      <ul className="mc-ascent-nodes" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {stages.map((s, i) => (
          <li key={s.n} role="presentation" style={{ "--x": stageT(i, count) } as React.CSSProperties}>
            <button
              className="mc-node"
              type="button"
              role="tab"
              id={`mc-tab-${s.n}`}
              aria-selected={i === active}
              aria-controls={panelId}
              tabIndex={i === active ? 0 : -1}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              onClick={() => {
                setTouched(true);
                go(i);
              }}
              /* Hover selects with a mouse (client, 2026-10-21). Only where
                 hover is real: a phone's emulated mouse events, or content
                 scrolling under a resting cursor, must not pick a stage. */
              onMouseEnter={() => {
                if (window.matchMedia("(hover: hover)").matches) go(i);
              }}
            >
              <span className="mc-node-n">{s.n}</span>
              <span className="mc-node-name">{s.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mc-ascent-hint" aria-hidden="true">
        <span>←</span> {hint} <span>→</span>
      </p>
    </div>
  );
}
