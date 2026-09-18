"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CTA from "@/components/CTA";
import { dataToDecision as d } from "@/lib/content/gamcs";

/**
 * "The gap" as a race to the decision (gap design, direction A).
 *
 * Two lanes run from one start line to one dashed finish line, "The decision".
 * Lane 1 is the typical reality: six source chips feed a red start node, and
 * a dashed path meanders through Reporting, Questions, Manual investigation
 * and Decision delayed, the stations alternating above and below it. Lane 2
 * is GAMCS: three chips merge into one green line, through the GAMCS hub,
 * then Data, Insight, Decision and Action on a straight line to the same
 * finish. Each lane header carries a progress rail (Days / weeks, Hours /
 * days). Copy is `dataToDecision` in gamcs.ts; nothing here is prose.
 *
 * STAGE GEOMETRY. The desktop artboard is 1296 wide; its SVG keeps that
 * coordinate space (`DW`) but stretches only horizontally: the stage is a
 * fixed 410px tall, the SVG is `preserveAspectRatio="none"` with non-scaling
 * strokes, and every HTML overlay sits at `left: x/1296 %`, `top: y px`. So
 * the lane geometry follows the container while text, cards and vertical
 * gaps stay the size the artboard set — a uniformly scaled stage measured
 * 1–3px of card/header collisions at the 920px container, this measures
 * none. Nodes and packets are HTML dots for the same reason (circles in a
 * stretched SVG go elliptical).
 *
 * BREAKPOINTS, measured:
 *   ≥1280   container 1184–1440, x-scale .914–1.11: the artboard as drawn.
 *           Lane-1 cards floor at the artboard's 176px ("Manual
 *           investigation" is 145.2px at 13.5px/600 Sora); lane-2 cards are
 *           12.35% of the stage (160px at 1296), which leaves ≥14.7px
 *           between Data and Insight at 1184. The feeders start 16–60
 *           artboard-px inside their chips: the chips are fixed-size while
 *           the feeders scale, and started at the chips' artboard right
 *           edges they measured 2–10px of daylight at x-scale 1.11
 *           (viewports ≥1544, where the container stops growing).
 *   ≤1399   the lane-2 header sits at 212px, not the artboard's 208: an open
 *           below-path lane-1 card ends at 216px and at container 1184 the
 *           header's subtitle reaches under "Questions" (35×2.8px of overlap
 *           at 208; at 212 the title box starts at 215.2 and the subtitle at
 *           ~218.5, both clear).
 *   1024–1279  container 920, x-scale .71. 12.5px card type and 10×12
 *           padding. Lane-2 cards keep their 12.35% (114px, 11px apart);
 *           lane-1 cards floor at 160px: at 140 "Manual investigation"
 *           (134.4px at 12.5px) wrapped to two lines and its open card, 111px
 *           tall and anchored above the path, covered the "Days / weeks" rail
 *           label; at 160 it is one line, the open card stops 2.5px under the
 *           label, and "Decision delayed" (110.4px) is still one line inside
 *           the stage (741–901 of 920). Open captions cap at 51px, three 17px
 *           lines: "Insight"'s 90px inner width and "Manual investigation"'s
 *           caption need them and the 40px desktop cap clipped a line. The
 *           closing lines sit 40px under the stage there, so the 100px open
 *           "Insight" card (bottom 434) clears them. The sixth chip is nudged
 *           12×8px: fixed-size chips on a .71 stage measured "Other tools"
 *           10×12px into "Operations".
 *   ≤1023   the phone artboard: lane 1 then lane 2 as panels, each a vertical
 *           path with the stations beside it, one full-width button, rails
 *           under each panel. The stations are list items, not buttons: their
 *           captions are always visible, so there is nothing to expand. 1023
 *           is where the horizontal stage first fails, measured with the
 *           stage forced on at container 768 (x-scale .59): "Excel" overlaps
 *           "HRIS" and "Other tools" overlaps "Operations" (0.4×20 and
 *           11.4×4px, nudge included), each lane header's two groups are 16px
 *           apart, "The decision" label ends 2px outside the container and
 *           "Manual investigation" wraps.
 *
 * MOTION. One paused GSAP master timeline, replayed with restart():
 *   - the typical packet: MotionPathPlugin legs along the lane-1 path with
 *     dwells at Reporting (.40s) and Questions (1.39s), a decaying yoyo stall
 *     at Manual investigation (2.51s → 5.28s) and arrival at Decision delayed
 *     at 6.60s;
 *   - the GAMCS packet: through the hub (.45s), Data (1.11s), Insight
 *     (1.77s), Decision (2.40s), arriving at Action at 3.00s while the other
 *     is still stalled;
 *   - station rings and lifts are placed with position parameters derived
 *     from the leg table (`runLane`), so retiming a leg retimes its highlight.
 *     The lift tweens the card's `--d2d-lift` custom property, never its
 *     transform: gsap ≥3.13 folds a CSS `translate` into its inline transform
 *     and writes `translate:none` the first time it tweens x/y on an element,
 *     which killed the CSS hover/focus/open lift after the first run (a
 *     hovered card measured 0px of lift, caption only). The hub is ringed,
 *     not lifted, as the artboard's hub keyframe draws it;
 *   - each rail is one linear scaleX tween the length of its lane's run, so
 *     it fills with elapsed time and freezes on arrival — no numbers;
 *   - the hub's idle pulse is CSS.
 * Station progress along a path is found by bisection on the path itself
 * (`progressAt`), so a station's ring fires exactly where its node is at any
 * container width. ScrollTrigger fires the run once when the layout wrapper's
 * top (the lane-1 header on desktop, the first panel on the phone) reaches
 * 60% of the viewport; a page that loads with the section already scrolled
 * past (a /#… link) shows the finished run instead of playing it off screen.
 * The button replays it. Under prefers-reduced-motion the end state is set
 * and no tween is registered. Everything is rebuilt when the section's width
 * changes, because the packets' path is in stage pixels. The two layout
 * wrappers carry no .reveal: ScrollTrigger measures the trigger while the
 * reveal is still translated 22px down, which measured as a trigger 22px late.
 */

/* ── Desktop geometry (artboard space: 1296 wide, 410 tall) ─────────────── */

const DW = 1296;
const pct = (x: number) => `${(x / DW) * 100}%`;

const START_X = 318;
const END_X = 1156;
const T_NODES = [
  [490, 92],
  [682, 136],
  [884, 92],
  [1156, 136],
] as const;
const HUB_X = 452;
const G_NODES = [636, 812, 988, 1156] as const;
const LANE2_Y = 322;
const T_CHIPS = [
  [2, 40],
  [92, 34],
  [14, 78],
  [108, 84],
  [0, 126],
  [118, 140],
] as const;
const G_CHIP_TOPS = [276, 312, 348] as const;
/** Each starts inside its chip (see BREAKPOINTS ≥1280), on the chip's centre line. */
const T_FEEDERS = [
  "M30,53 C140,53 200,90 318,114",
  "M118,47 C200,47 250,80 318,114",
  "M42,91 C150,91 210,100 318,114",
  "M135,97 C220,97 260,104 318,114",
  "M47,139 C160,139 230,130 318,114",
  "M164,153 C250,153 280,132 318,114",
];
const G_FEEDERS = [
  "M66,289 C172,289 204,322 250,322",
  "M52,325 C160,325 204,322 250,322",
  "M56,361 C162,361 204,322 250,322",
];
/** The lane paths, x scaled by `s`: 1 for the SVG, stage-px/1296 for the packet tween. */
const lane1 = (s = 1) =>
  `M${318 * s},114 C${384 * s},114 ${420 * s},92 ${490 * s},92 C${560 * s},92 ${612 * s},136 ${682 * s},136 C${766 * s},136 ${804 * s},92 ${884 * s},92 C${986 * s},92 ${1014 * s},136 ${1156 * s},136`;
const lane2 = (s = 1) => `M${318 * s},${LANE2_Y} L${1156 * s},${LANE2_Y}`;

/* ── Phone geometry (24px-wide tracks, from the phone artboard) ─────────── */

const P1 = "M12 1 C6 6 18 11 12 16 C4 27 20 35 12 46 C4 57 20 65 12 76 C4 87 20 95 12 106";
const P1_H = 128;
const P1_YS = [16, 46, 76, 106];
const P2 = "M12 19 L12 128";
const P2_H = 150;
const P2_HUB_Y = 19;
const P2_YS = [38, 68, 98, 128];

/* ── Timing (seconds), from the artboard keyframes ──────────────────────── */

type Leg = { dur: number; dwell?: number; stall?: boolean };
/** Arrive Reporting .40, Questions 1.39, Manual 2.51 (stalled to 5.28), Decision delayed 6.60. */
const T_LEGS: Leg[] = [
  { dur: 0.4, dwell: 0.53 },
  { dur: 0.46, dwell: 0.59 },
  { dur: 0.53, dwell: 2.77, stall: true },
  { dur: 1.32 },
];
/** Hub .45, Data 1.11, Insight 1.77, Decision 2.40, Action 3.00. */
const G_LEGS: Leg[] = [
  { dur: 0.45, dwell: 0.24 },
  { dur: 0.42, dwell: 0.3 },
  { dur: 0.36, dwell: 0.3 },
  { dur: 0.33, dwell: 0.3 },
  { dur: 0.3 },
];
/** How far back the stalled packet slips, in path progress, per yoyo. */
const STALL = [0.061, 0.052, 0.044];

type RawPath = ReturnType<typeof MotionPathPlugin.stringToRawPath>;

/** Progress along `raw` where the point's `axis` coordinate reaches `v` (paths here are monotonic). */
function progressAt(raw: RawPath, axis: "x" | "y", v: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (MotionPathPlugin.getPositionOnPath(raw, mid)[axis] < v) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

type Lane = {
  pk: HTMLElement;
  path: string;
  axis: "x" | "y";
  /** Stations in order; each carries `data-at`, its coordinate on `axis` in artboard units. */
  stops: HTMLElement[];
  legs: Leg[];
  rail: HTMLElement;
  trail: SVGPathElement | null;
  /** Scale from artboard x to path px (desktop), 1 on the phone. */
  sx: number;
};

/** Adds one lane's legs, rings and rail to `tl`; returns the lane's run time. */
function runLane(tl: gsap.core.Timeline, l: Lane) {
  const raw = MotionPathPlugin.cacheRawPathMeasurements(MotionPathPlugin.stringToRawPath(l.path));
  let t = 0;
  let from = 0;
  l.legs.forEach((leg, i) => {
    const last = i === l.legs.length - 1;
    const stop = l.stops[i];
    const to = last ? 1 : progressAt(raw, l.axis, Number(stop.dataset.at) * l.sx);
    tl.to(l.pk, { motionPath: { path: l.path, start: from, end: to }, duration: leg.dur }, t);
    if (l.trail) tl.to(l.trail, { strokeDashoffset: 100 - to * 100, duration: leg.dur }, t);
    t += leg.dur;
    from = to;

    const ring = stop.querySelector(".d2d-ring");
    /* Only station cards lift (not the hub, not the phone dots), and only via
       their custom property: a transform tween would neutralise the CSS lift. */
    const lift = stop.classList.contains("d2d-st");
    if (leg.stall) {
      STALL.forEach((a, k) =>
        tl.to(
          l.pk,
          { motionPath: { path: l.path, start: to, end: to - a }, duration: 0.396, repeat: 1, yoyo: true, ease: "sine.inOut" },
          t + k * 0.792
        )
      );
    }
    tl.to(ring, { opacity: 1, duration: last ? 0.35 : 0.12 }, t);
    if (lift) tl.to(stop, { "--d2d-lift": "-3px", duration: last ? 0.5 : 0.3, ease: last ? "back.out(3)" : "power2.out" }, t);
    if (!last) {
      const off = t + (leg.dwell ?? 0);
      tl.to(ring, { opacity: 0, duration: 0.14 }, off - 0.14);
      if (lift) tl.to(stop, { "--d2d-lift": "0px", duration: 0.3 }, off - 0.2);
      t = off;
    }
  });
  tl.fromTo(l.rail, { scaleX: 0 }, { scaleX: 1, duration: t, ease: "none" }, 0);
  return t;
}

/* ── Markup ─────────────────────────────────────────────────────────────── */

type Tone = "t" | "g";

function Ring() {
  return <i className="d2d-ring" aria-hidden="true" />;
}

function Station({
  id,
  tone,
  label,
  caption,
  at,
  end,
  style,
  open,
  onToggle,
}: {
  id: string;
  tone: Tone;
  label: string;
  caption: string;
  at: number;
  end?: boolean;
  style: CSSProperties;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`d2d-st d2d-${tone} d2d-stop--${tone}${end ? " d2d-st--end" : ""}${open ? " is-open" : ""}`}
      aria-expanded={open}
      data-at={at}
      style={style}
      onClick={() => onToggle(id)}
    >
      <span className="d2d-st-t">{label}</span>
      <span className="d2d-st-c"><span>{caption}</span></span>
      <Ring />
    </button>
  );
}

function LaneHead({ tone, title, subtitle, rail, className = "" }: { tone: Tone; title: string; subtitle: string; rail: string; className?: string }) {
  return (
    <div className={`d2d-lh d2d-${tone} ${className}`}>
      <span className="d2d-lh-l">
        <i aria-hidden="true" />
        <b>{title}</b>
        <span>{subtitle}</span>
      </span>
      <span className="d2d-lh-r">
        <span className="d2d-rail-lbl">{rail}</span>
        <span className="d2d-rail" aria-hidden="true">
          <span className={`d2d-fill d2d-fill--${tone}`} />
        </span>
      </span>
    </div>
  );
}

/** The phone artboard's panel: header, chips, a vertical track with the stations beside it, rail. */
function Panel({ tone, lane }: { tone: Tone; lane: typeof d.today | typeof d.gamcs }) {
  const g = tone === "g";
  const ys = g ? P2_YS : P1_YS;
  const hub = "hub" in lane ? lane.hub : null;
  return (
    <div className={`d2d-pn d2d-${tone} d2d-pn--${tone}`}>
      <div className="d2d-pn-h">
        <i aria-hidden="true" />
        <b>{lane.title}</b>
      </div>
      <p className="d2d-pn-s">{lane.subtitle}</p>
      <ul className="d2d-pn-chips" role="list">
        {lane.chips.map((c) => (
          <li key={c.label}>{c.label}</li>
        ))}
      </ul>
      <div className="d2d-pn-run">
        <div className="d2d-track" aria-hidden="true">
          <svg width="24" height={g ? P2_H : P1_H} viewBox={`0 0 24 ${g ? P2_H : P1_H}`}>
            <path className="d2d-base" d={g ? P2 : P1} />
            <path className={`d2d-trail d2d-trail--${tone}`} d={g ? P2 : P1} pathLength={100} />
          </svg>
          {hub && (
            <i className={`d2d-phub d2d-stop--${tone}`} data-at={P2_HUB_Y} style={{ top: P2_HUB_Y }}>
              <Ring />
            </i>
          )}
          {ys.map((y) => (
            <i className={`d2d-pdot d2d-stop--${tone}`} data-at={y} style={{ top: y }} key={y}>
              <Ring />
            </i>
          ))}
          <i className={`d2d-pk d2d-pk--${tone}`} />
        </div>
        <ol className="d2d-steps" role="list">
          {hub && (
            <li className="d2d-hubrow">
              <b>{hub.name}</b>
              <span>{hub.caption}</span>
            </li>
          )}
          {lane.steps.map((s) => (
            <li key={s.label}>
              <b>{s.label}</b>
              <span>{s.caption}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="d2d-pn-rail">
        <span className="d2d-rail" aria-hidden="true">
          <span className={`d2d-fill d2d-fill--${tone}`} />
        </span>
        <span className="d2d-rail-lbl">{lane.rail}</span>
      </div>
    </div>
  );
}

export default function DataToDecision() {
  const rootRef = useRef<HTMLElement>(null);
  const runRef = useRef<() => void>();
  /** Whether the run has happened; a rebuild then shows the end state and sets no trigger. */
  const ranRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);
    let mm: gsap.MatchMedia | undefined;

    const build = () => {
      mm?.revert();
      mm = gsap.matchMedia(root);
      mm.add(
        { desk: "(min-width: 1024px)", phone: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { desk, reduce } = ctx.conditions as { desk: boolean; reduce: boolean };
          const lay = root.querySelector<HTMLElement>(desk ? ".d2d-desk" : ".d2d-phone")!;
          const $ = <T extends Element = HTMLElement>(s: string) => lay.querySelector<T>(s)!;
          const $$ = (s: string) => Array.from(lay.querySelectorAll<HTMLElement>(s));
          const sx = desk ? $(".d2d-stage").clientWidth / DW : 1;
          const lanes: Lane[] = (["t", "g"] as const).map((tone) => ({
            pk: $(`.d2d-pk--${tone}`),
            path: desk ? (tone === "t" ? lane1(sx) : lane2(sx)) : tone === "t" ? P1 : P2,
            axis: desk ? "x" : "y",
            stops: $$(`.d2d-stop--${tone}`),
            legs: tone === "t" ? T_LEGS : G_LEGS,
            rail: $(`.d2d-fill--${tone}`),
            trail: desk ? null : $<SVGPathElement>(`.d2d-trail--${tone}`),
            sx,
          }));

          /* Idle: packets parked on the start nodes. */
          lanes.forEach((l) => {
            const raw = MotionPathPlugin.stringToRawPath(l.path);
            const p = MotionPathPlugin.getPositionOnPath(raw, reduce ? 1 : 0);
            gsap.set(l.pk, { x: p.x, y: p.y, autoAlpha: 1 });
          });

          if (reduce) {
            /* The end state, and no tween: packets at the finish, rails full, arrival rings on. */
            lanes.forEach((l) => {
              const last = l.stops[l.stops.length - 1];
              gsap.set(l.rail, { scaleX: 1 });
              gsap.set(last.querySelector(".d2d-ring"), { opacity: 1 });
              if (last.classList.contains("d2d-st")) gsap.set(last, { "--d2d-lift": "-3px" });
              if (l.trail) gsap.set(l.trail, { strokeDashoffset: 0 });
            });
            runRef.current = () => {
              ranRef.current = true;
            };
            return;
          }

          const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
          lanes.forEach((l) => runLane(tl, l));
          runRef.current = () => {
            ranRef.current = true;
            tl.restart();
          };
          if (ranRef.current) tl.progress(1);
          else
            ScrollTrigger.create({
              trigger: lay,
              start: "top 60%",
              once: true,
              onEnter: (self) => {
                if (ranRef.current) return;
                setStarted(true);
                /* Loaded already past the section (a /#… link): the finished run, not one played off screen. */
                if (self.progress === 1) {
                  ranRef.current = true;
                  tl.progress(1);
                  return;
                }
                runRef.current?.();
              },
            });
        }
      );
    };

    build();
    let width = root.clientWidth;
    const ro = new ResizeObserver(() => {
      if (root.clientWidth === width) return;
      width = root.clientWidth;
      build();
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
      mm?.revert();
    };
  }, []);

  const run = () => {
    setStarted(true);
    runRef.current?.();
  };

  const stationStyle = (x: number, i: number): CSSProperties =>
    i % 2 ? { left: pct(x), top: 148 } : { left: pct(x), bottom: 330 };

  return (
    <section className="section d2d" id="data-to-decision" aria-labelledby="d2d-heading" ref={rootRef}>
      <div className="container">
        <div className="d2d-head reveal">
          <span className="eyebrow-num" aria-hidden="true">
            01
          </span>
          <span className="eyebrow-pill">{d.eyebrow}</span>
          <h2 id="d2d-heading" className="fin-h2">
            {d.headingLead}
            <br />
            <span className="d2d-accent">{d.headingAccent}</span>
          </h2>
          <p className="d2d-body">{d.body}</p>
          <CTA className="d2d-run" onClick={run}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.6 2.9 13 8l-8.4 5.1z" />
            </svg>
            {started ? d.replay : d.run}
          </CTA>
        </div>

        {/* ───── desktop: one wide stage ───── */}
        <div className="d2d-desk">
          <LaneHead tone="t" {...d.today} />
          <div className="d2d-stage">
            <svg viewBox={`0 0 ${DW} 410`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="d2d-gx" x1={START_X} y1={LANE2_Y} x2={END_X} y2={LANE2_Y} gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#4A93C9" />
                  <stop offset="0.42" stopColor="#0F5E97" />
                  <stop offset="1" stopColor="#3A7755" />
                </linearGradient>
              </defs>
              {/* start line and finish line, broken around the lane-2 header */}
              <g className="d2d-sline">
                <path d={`M${START_X},36 V196`} />
                <path d={`M${START_X},240 V404`} />
              </g>
              <g className="d2d-fline">
                <path d={`M${END_X},36 V196`} />
                <path d={`M${END_X},240 V404`} />
              </g>
              <g className="d2d-feed-t">
                {T_FEEDERS.map((p) => (
                  <path d={p} key={p} />
                ))}
              </g>
              <g className="d2d-feed-g">
                {G_FEEDERS.map((p) => (
                  <path d={p} key={p} />
                ))}
              </g>
              <path className="d2d-stub" d={`M250,${LANE2_Y} L${START_X},${LANE2_Y}`} />
              <path className="d2d-path-t" d={lane1()} />
              <path className="d2d-path-g" d={lane2()} />
              <g className="d2d-stem">
                {T_NODES.map(([x, y], i) => (
                  <path d={`M${x},${y} v${i % 2 ? 12 : -12}`} key={x} />
                ))}
                {G_NODES.map((x) => (
                  <path d={`M${x},${LANE2_Y} v12`} key={x} />
                ))}
              </g>
            </svg>

            <span className="d2d-dline" style={{ left: pct(END_X) }}>
              {d.decisionLine}
            </span>

            <ul className="d2d-chips d2d-chips--t" role="list">
              {d.today.chips.map((c, i) => (
                <li key={c.label} style={{ left: pct(T_CHIPS[i][0]), top: T_CHIPS[i][1] }}>
                  {c.label}
                </li>
              ))}
            </ul>
            <i className="d2d-node d2d-node--start d2d-t" style={{ left: pct(START_X), top: 114 }} aria-hidden="true" />
            {T_NODES.map(([x, y]) => (
              <i className="d2d-node d2d-t" style={{ left: pct(x), top: y }} key={x} aria-hidden="true" />
            ))}
            {d.today.steps.map((s, i) => (
              <Station
                key={s.label}
                id={`t${i}`}
                tone="t"
                {...s}
                at={T_NODES[i][0]}
                end={i === 3}
                style={stationStyle(T_NODES[i][0], i)}
                open={open === `t${i}`}
                onToggle={toggle}
              />
            ))}

            <LaneHead tone="g" {...d.gamcs} className="d2d-lh--g" />
            <ul className="d2d-chips d2d-chips--g" role="list">
              {d.gamcs.chips.map((c, i) => (
                <li key={c.label} style={{ left: pct(4), top: G_CHIP_TOPS[i] }}>
                  {c.label}
                </li>
              ))}
            </ul>
            <i className="d2d-node d2d-node--start d2d-g" style={{ left: pct(START_X), top: LANE2_Y }} aria-hidden="true" />
            <span className="d2d-hub-cap" style={{ left: pct(HUB_X) }}>
              {d.gamcs.hub.caption}
            </span>
            <div className="d2d-hub d2d-stop--g" data-at={HUB_X} style={{ left: pct(HUB_X) }}>
              <i className="d2d-hub-pulse" aria-hidden="true" />
              <Ring />
              <span>{d.gamcs.hub.name}</span>
            </div>
            {G_NODES.map((x) => (
              <i className="d2d-node d2d-g" style={{ left: pct(x), top: LANE2_Y }} key={x} aria-hidden="true" />
            ))}
            {d.gamcs.steps.map((s, i) => (
              <Station
                key={s.label}
                id={`g${i}`}
                tone="g"
                {...s}
                at={G_NODES[i]}
                end={i === 3}
                style={{ left: pct(G_NODES[i]), top: 334 }}
                open={open === `g${i}`}
                onToggle={toggle}
              />
            ))}

            <i className="d2d-pk d2d-pk--t d2d-t" aria-hidden="true" />
            <i className="d2d-pk d2d-pk--g d2d-g" aria-hidden="true" />
          </div>
        </div>

        {/* ───── phone: the two lanes as vertical panels ───── */}
        <div className="d2d-phone">
          <Panel tone="t" lane={d.today} />
          <Panel tone="g" lane={d.gamcs} />
        </div>

        <div className="d2d-close reveal">
          <p>{d.closeLead}</p>
          <p className="d2d-accent">{d.closeAccent}</p>
        </div>
      </div>
    </section>
  );
}
