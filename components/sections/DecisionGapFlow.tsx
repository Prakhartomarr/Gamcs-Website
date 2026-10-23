"use client";

import { useEffect, useRef } from "react";
import { LEAK, State, blank, emitRate, fallSpeed, lose, step, type Particle } from "@/components/gap/leak";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { decisionGap as c } from "@/lib/content/gamcs";

/**
 * THE LEAK — the decision gap's pain points on a phone (2026-10-23; the
 * stylesheet shows this below 768px and hides .dg-stage, so desktop keeps its
 * fanned deck untouched).
 *
 * The four pains hang off one pipe from "the numbers" to "the decision".
 * Digits stream down it; at each pain some break away, turn red and fall, so
 * the stream thins and only a trickle reaches the decision — the section's
 * heading, drawn. Scrolling pushes more numbers through; opening a pain
 * bursts that leak.
 *
 * The DOM owns everything that matters: the pipe and its nodes are CSS, the
 * pains are native <details> (open/close with no JS, keyboard and screen
 * readers for free). The canvas behind only adds the digits, and reads the
 * nodes' positions each frame so the flow stays on the pipe while a panel
 * animates open. Reduced motion: no canvas loop at all.
 */
export default function DecisionGapFlow() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  /* Leak i's burst deadline (performance.now() ms), written by onToggle. */
  const burst = useRef<number[]>(c.pains.map(() => 0));
  /* A pending spray request from onToggle, drained by the loop. */
  const spray = useRef<number[]>([]);

  /* Pains slide in as they arrive. One observer, a data attribute, CSS. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    /* Only now may the pains start hidden: with JS off they never do. */
    el.setAttribute("data-js", "");
    const items = Array.from(el.querySelectorAll<HTMLElement>(".dgf-leak"));
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.setAttribute("data-in", ""), io.unobserve(e.target))),
      { rootMargin: "0px 0px -12% 0px" }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    if (!el || !cv || reduced) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const nav = navigator as Navigator & { deviceMemory?: number };
    const high = (nav.deviceMemory ?? 8) > 4 && (nav.hardwareConcurrency ?? 8) > 4;
    const pool: Particle[] = Array.from({ length: LEAK.pool[high ? "high" : "mid"] }, blank);
    let cursor = 0;
    const free = () => {
      for (let k = 0; k < pool.length; k++) {
        const p = pool[(cursor = (cursor + 1) % pool.length)];
        if (p.state === State.Free) return p;
      }
      return null;
    };
    const glyph = () => LEAK.glyphs[(Math.random() * LEAK.glyphs.length) | 0];

    const from = el.querySelector<HTMLElement>(".dgf-end--from .dgf-dot");
    const to = el.querySelector<HTMLElement>(".dgf-end--to .dgf-dot");
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(".dgf-node"));
    if (!from || !to || !nodes.length) return;

    let w = 0, h = 0, dpr = 1;
    const size = () => {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, LEAK.dpr);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    };

    let raf = 0, visible = false, last = 0, acc = 0, lastPulse = 0;
    let scrollY = window.scrollY, scrollV = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      /* Scroll speed, smoothed: the thumb is the pump. */
      const y = window.scrollY;
      scrollV += ((y - scrollY) / Math.max(dt, 0.001) - scrollV) * 0.15;
      scrollY = y;

      /* Geometry from the DOM, relative to the flow box. Seven rect reads,
         no writes in between, so no forced layout. */
      const box = el.getBoundingClientRect();
      const mid = (n: HTMLElement) => {
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      };
      const a = mid(from), z = mid(to);
      const leakY = nodes.map((n) => mid(n).y);
      const x0 = a.x;
      if (Math.abs(box.height - h) > 1 || Math.abs(box.width - w) > 1) size();

      for (const i of spray.current.splice(0)) {
        for (let k = 0; k < LEAK.burstCount; k++) {
          const p = free();
          if (!p) break;
          p.x = x0; p.y = leakY[i]; p.rot = 0; p.alpha = 1; p.glyph = glyph();
          lose(p, Math.random);
          p.vx *= 1.3;
        }
      }

      acc += emitRate(scrollV) * dt;
      while (acc >= 1) {
        acc--;
        const p = free();
        if (!p) break;
        p.state = State.Flow;
        p.x = x0 + (Math.random() - 0.5) * 3;
        p.y = a.y;
        p.vy = fallSpeed(scrollV) * (0.85 + Math.random() * 0.3);
        p.rot = 0; p.alpha = 1; p.next = 0; p.glyph = glyph();
      }

      const rateAt = (i: number) => (now < burst.current[i] ? LEAK.burstRate : LEAK.rate);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = `600 ${LEAK.font}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const p of pool) {
        if (p.state === State.Free) continue;
        if (step(p, dt, leakY, z.y, rateAt, Math.random) === "arrived" && now - lastPulse > 220) {
          lastPulse = now;
          to.animate([{ transform: "scale(1)" }, { transform: "scale(1.7)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
        }
        if (p.state === State.Flow) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = `rgba(${LEAK.blue},0.75)`;
          ctx.fillText(p.glyph, p.x, p.y);
        } else if (p.state === State.Lost) {
          ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
          ctx.rotate(p.rot);
          ctx.fillStyle = `rgba(${LEAK.red},${Math.max(p.alpha, 0) * 0.85})`;
          ctx.fillText(p.glyph, 0, 0);
        }
      }
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      scrollY = window.scrollY;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    size();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      ctx.clearRect(0, 0, cv.width, cv.height);
    };
  }, [reduced]);

  /* Opening a pain bursts its leak, sprays numbers out of it, and ticks
     the haptic on Android. Closing does nothing: the leak is still there. */
  const onToggle = (i: number) => (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (!e.currentTarget.open) return;
    burst.current[i] = performance.now() + LEAK.burstMs;
    spray.current.push(i);
    if (!reduced && "vibrate" in navigator) navigator.vibrate?.(LEAK.haptic);
  };

  return (
    <div className="dgf" ref={root}>
      <canvas className="dgf-canvas" ref={canvas} aria-hidden="true" />
      <p className="dgf-end dgf-end--from">
        <span className="dgf-dot" aria-hidden="true" />
        {c.flow.from}
        <span className="dgf-hint">{c.flow.hint}</span>
      </p>
      <ol className="dgf-leaks">
        {c.pains.map((p, i) => (
          <li className="dgf-leak" key={p.title} style={{ "--i": i } as React.CSSProperties}>
            <details className="dgf-d" open={i === 0} onToggle={onToggle(i)}>
              <summary className="dgf-sum">
                <span className="dgf-node" aria-hidden="true" />
                <span className="dgf-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="dgf-title">{p.title}</span>
                <svg className="dgf-chev" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 5.5 7 9.5 11 5.5" />
                </svg>
              </summary>
              <p className="dgf-body">{p.body}</p>
            </details>
          </li>
        ))}
      </ol>
      <p className="dgf-end dgf-end--to">
        <span className="dgf-dot" aria-hidden="true" />
        {c.flow.to}
      </p>
    </div>
  );
}
