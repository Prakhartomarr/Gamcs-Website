"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { STEP_ICONS } from "@/components/ui/stroke-icons";
import { whyUs } from "@/lib/content/gamcs";
import { sections } from "@/lib/content/ui";

/**
 * "How we help" as an isometric exploded-layer stack.
 *
 * Replaced the alternating step run down a centre spine. Six layers, one per
 * `whyUs.points` entry, sit on an isometric Z axis:
 *
 *   - hovering or focusing a rail label lifts that layer out of the stack,
 *     tints it, draws a connector to it and swaps the detail copy;
 *   - left alone, the active layer advances as the stage scrolls through the
 *     viewport (the scroll effect says why the stage, not the section);
 *   - the stack scales down below 1024px and again below 640px; below 768px
 *     the rail drops underneath it and the labels are tapped.
 *
 * Copy is `whyUs` (lib/content/gamcs.ts) and the rail glyphs are the site's
 * own STEP_ICONS; this file owns only geometry, artwork and interaction. The
 * stage is aria-hidden — it is a picture of the rail, and the rail plus the
 * detail panel carry everything a screen reader needs.
 */

/* ── Colour ─────────────────────────────────────────────────────────────────
   Every colour in this file resolves through C, and every entry in C is a
   token from app/globals.css. Tints and shadows are derived from those tokens
   with `mix` rather than restated as hex, so re-pointing an entry here
   re-colours the whole section. */

const C = {
  navy: "var(--ink-deep)", // headings, active rail label
  blue: "var(--blue)", // active / accent
  blueLine: "var(--blue-light)", // active panel inner strokes
  muted: "var(--ink-muted)", // body copy, idle rail text
  faint: "var(--chart-foreground-muted)", // idle artwork and glyphs — decoration only
  line: "var(--line)", // idle panel border
  panel: "var(--white)",
  wash: "var(--soft)",
  band: "var(--band-white)", // section background
} as const;

/** `c` at `pct`% over `base` (transparent unless given) — how every tint is derived. */
const mix = (c: string, pct: number, base = "transparent") =>
  `color-mix(in srgb, ${c} ${pct}%, ${base})`;

/** The stack's one easing; the same curve as Tailwind's `ease-reel`. */
const EASE = "cubic-bezier(.22,1,.36,1)";

/* ── Layer artwork ──────────────────────────────────────────────────────────
   Each layer renders flat inside its isometric panel. Keep elements simple
   and text tiny — at this angle it reads as texture, not copy. */

type ArtProps = { on: boolean };

function ArtConsole({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  return (
    <div className="absolute inset-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: s }} />
        ))}
        <span className="ml-auto h-1.5 w-10 rounded-full" style={{ background: s }} />
      </div>
      <div className="relative grid flex-1 grid-cols-2 grid-rows-2 gap-1.5">
        {["FINANCE", "DATA", "REVENUE", "TECHNOLOGY"].map((t) => (
          <div
            key={t}
            className="flex items-end rounded-md border px-1.5 pb-1"
            style={{ borderColor: s, background: on ? mix(C.blue, 10) : C.wash }}
          >
            <span className="text-[5px] font-semibold tracking-[.14em]" style={{ color: ink }}>
              {t}
            </span>
          </div>
        ))}
        {/* the "one roof" join */}
        <span
          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: ink, background: C.panel }}
        />
      </div>
    </div>
  );
}

function ArtPlatforms({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  return (
    <div className="absolute inset-3 flex flex-col gap-2">
      <span className="text-[5px] font-semibold tracking-[.18em]" style={{ color: ink }}>
        RECOMMENDED FOR YOUR BUSINESS
      </span>
      <div className="grid flex-1 grid-cols-4 gap-1.5">
        {["ERP", "CRM", "BI", "FP&A"].map((t, i) => {
          /* the platform that fits, not the one on commission */
          const chosen = on && i === 1;
          return (
            <div
              key={t}
              className="relative flex flex-col justify-between rounded-md border p-1.5"
              style={{
                borderColor: chosen ? C.blue : s,
                background: chosen ? mix(C.blue, 14) : on ? mix(C.blue, 5) : C.wash,
              }}
            >
              <span className="h-1 w-4 rounded-full" style={{ background: s }} />
              <span className="text-[6px] font-bold tracking-[.1em]" style={{ color: ink }}>
                {t}
              </span>
              {chosen && (
                <span
                  className="absolute right-1 top-1 h-2 w-2 rounded-full"
                  style={{ background: C.blue }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ArtIntelligence({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  return (
    <div className="absolute inset-3 flex gap-2">
      <div className="flex w-1/3 flex-col justify-between py-0.5">
        {[70, 45, 90, 60].map((w, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full" style={{ background: s }} />
            <span className="h-1 rounded-full" style={{ width: `${w}%`, background: s }} />
          </div>
        ))}
      </div>
      <div
        className="relative flex-1 rounded-md border"
        style={{ borderColor: s, background: on ? mix(C.blue, 6) : C.wash }}
      >
        {/* stroke via style, not the attribute: var() is not reliable in SVG
            presentation attributes, and the children inherit it */}
        <svg
          viewBox="0 0 120 60"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ stroke: ink }}
        >
          <path d="M4 46 L26 38 L44 41 L62 24 L80 28" />
          <path d="M80 28 L100 16 L116 10" strokeDasharray="4 4" opacity=".65" />
          <circle cx="62" cy="24" r="5" />
        </svg>
        <span
          className="absolute bottom-1 right-1.5 text-[5px] font-semibold tracking-[.14em]"
          style={{ color: ink }}
        >
          ANOMALY · FORECAST
        </span>
      </div>
    </div>
  );
}

function ArtBoardroom({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  return (
    <div className="absolute inset-3 flex items-stretch gap-2">
      {["BOARD PACK", "DATA ROOM"].map((t, i) => (
        <div
          key={t}
          className="relative flex-1 rounded-md border p-2"
          style={{ borderColor: s, background: on ? mix(C.blue, 6) : C.wash }}
        >
          <div className="flex flex-col gap-1">
            {[100, 80, 92, 64, 88].map((w, j) => (
              <span key={j} className="h-[3px] rounded-full" style={{ width: `${w}%`, background: s }} />
            ))}
          </div>
          <span
            className="absolute bottom-1.5 left-2 text-[5px] font-semibold tracking-[.14em]"
            style={{ color: ink }}
          >
            {t}
          </span>
          {on && i === 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full"
              style={{ background: C.blue }}
            >
              <svg
                viewBox="0 0 12 12"
                className="h-2 w-2"
                fill="none"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: C.panel }}
              >
                <path d="M2.5 6.2 L5 8.6 L9.5 3.6" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ArtBusiness({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  const blocks = [
    { t: "REVENUE DRIVERS", span: "col-span-3" },
    { t: "MARGIN", span: "col-span-2" },
    { t: "KPIs", span: "col-span-2" },
    { t: "DECISIONS", span: "col-span-3" },
  ];
  return (
    <div className="absolute inset-3 flex flex-col gap-1.5">
      <div className="grid flex-1 grid-cols-5 grid-rows-2 gap-1.5">
        {blocks.map((b) => (
          <div
            key={b.t}
            className={`${b.span} flex items-end rounded-md border px-1.5 pb-1`}
            style={{ borderColor: s, background: on ? mix(C.blue, 7) : C.wash }}
          >
            <span className="text-[5px] font-semibold tracking-[.12em]" style={{ color: ink }}>
              {b.t}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-full"
            style={{ background: s, opacity: 1 - i * 0.07 }}
          />
        ))}
      </div>
    </div>
  );
}

function ArtScale({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  const groups = [
    { n: 1, t: "SPECIALIST" },
    { n: 3, t: "POD" },
    { n: 5, t: "FULL COE" },
  ];
  return (
    <div className="absolute inset-3 flex items-center justify-between gap-2">
      {groups.map((g) => (
        <div
          key={g.t}
          className="flex flex-1 flex-col items-center gap-1.5 rounded-md border py-2"
          style={{ borderColor: s, background: on ? mix(C.blue, 6) : C.wash }}
        >
          <div className="flex flex-wrap justify-center gap-1 px-2">
            {Array.from({ length: g.n }, (_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full"
                style={{ background: ink, opacity: on ? 1 : 0.55 }}
              />
            ))}
          </div>
          <span className="text-[5px] font-semibold tracking-[.12em]" style={{ color: ink }}>
            {g.t}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Layers ─────────────────────────────────────────────────────────────── */

type Lead = (typeof whyUs.points)[number]["lead"];

/**
 * Artwork per point, keyed by `lead` exactly as STEP_ICONS is, so reordering
 * `whyUs.points` cannot pair a picture with the wrong copy. Typed on the
 * literal leads: a missing or misspelt key fails the build.
 */
const ART: Record<Lead, ComponentType<ArtProps>> = {
  "One Team. One Integrated Finance Engine.": ArtConsole,
  "Independent by Design. Outcomes Above Platforms.": ArtPlatforms,
  "Intelligence Built In. Not Bolted On.": ArtIntelligence,
  "Boardroom Ready. Deal Room Proven.": ArtBoardroom,
  "Industry-Agnostic. Business-Specific.": ArtBusiness,
  "Scale Capability. Not Overhead.": ArtScale,
};

type Layer = {
  /** "01"–"06", from position; the content stores no numbers */
  n: string;
  /** rail label — the lead's first sentence ("One Team", "Scale Capability") */
  label: string;
  title: string;
  body: string;
  icon: ReactNode;
  Art: ComponentType<ArtProps>;
};

/** Index 0 renders at the TOP of the stack, index 5 at the base. */
const LAYERS: Layer[] = whyUs.points.map((p, i) => ({
  n: String(i + 1).padStart(2, "0"),
  label: p.lead.split(".")[0],
  title: p.lead,
  body: p.body,
  icon: STEP_ICONS[p.lead],
  Art: ART[p.lead],
}));

/* ── Geometry ───────────────────────────────────────────────────────────── */

const Z_STEP = 46; // resting gap between layers, along the isometric Z axis
const Z_LIFT = 52; // extra lift for the active layer
const Z_PART = 72; // how far the layers above the active one move away

export default function HowWeHelpStack() {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** until this timestamp scroll does not move the stack — user intent wins */
  const lockRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  /* Scroll auto-advance. Everything that touches window lives in here, so the
     server render and the first client render are identical (active 0).

     Progress is read off the STAGE, not the section: 0 when the stage's
     centre sits 85% of the way down the viewport, 1 when it reaches 20%.
     Measured off the whole section (as first built), the heading and padding
     above the stage used up most of the range — at 1440×900, 02–04 went by
     with the stage 0–43% on screen, and it was already on 05 by the time
     the stage was fully in view. */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (Date.now() < lockRef.current) return;
      /* Keyboard focus anywhere in the section — a tab or the detail panel —
         holds the selection. Moving it under a focused tab strips that tab's
         tabindex (the next Tab stops on another tab instead of the panel), and
         a screen reader reading the panel would lose its text mid-sentence. */
      if (sectionRef.current?.contains(document.activeElement)) return;
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const p = (vh * 0.85 - (r.top + r.height / 2)) / (vh * 0.65);
      setActive(Math.min(LAYERS.length - 1, Math.max(0, Math.floor(p * LAYERS.length))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const pick = useCallback((i: number) => {
    lockRef.current = Date.now() + 1500; // user intent wins over scroll for a moment
    setActive(i);
  }, []);

  /* Pointer selection. Driven by real pointer movement (pointermove), not
     mouseenter: browsers fire enter events at a pointer that is standing
     still when the page scrolls a layer under it, and the stage is the centre
     column, right where a resting desktop pointer sits — so a wheel-scroll
     used to hand the selection to whatever layer drifted under the cursor.
     While keyboard focus is in the rail, focus follows the pointer too, so
     the focused tab and the selected tab can never drift apart. */
  const hoverPick = (i: number) => {
    if (i === active) return;
    if (tabRefs.current.includes(document.activeElement as HTMLButtonElement))
      tabRefs.current[i]?.focus({ preventScroll: true }); // onFocus -> pick
    else pick(i);
  };

  /* Roving focus: arrows / Home / End move focus along the rail, and focus
     selects (onFocus -> pick), so only one handler owns selection. */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = LAYERS.length - 1;
    const from = Math.max(0, tabRefs.current.indexOf(e.target as HTMLButtonElement));
    let to: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") to = Math.min(from + 1, last);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") to = Math.max(from - 1, 0);
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = last;
    if (to === null) return;
    e.preventDefault();
    tabRefs.current[to]?.focus();
  };

  const dur = reduced ? "0ms" : "620ms";

  return (
    <section
      ref={sectionRef}
      id="how-we-help"
      aria-labelledby="hwh-heading"
      className="relative w-full overflow-hidden pb-12 pt-20 [--iso-scale:.58] sm:[--iso-scale:.76] md:pb-16 md:pt-28 lg:[--iso-scale:.95]"
      style={{ background: C.band }}
    >
      {/* soft wash behind the stack */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/4 h-[60%]"
        style={{
          background: `radial-gradient(60% 50% at 55% 50%, ${mix(C.blue, 7)}, transparent 70%)`,
        }}
      />

      <div className="container relative">
        {/* The site's own eyebrow and section-heading type, so this band reads
            like every other one on the page. */}
        <div className="fin-center reveal mx-auto max-w-3xl">
          <span className="eyebrow-num" aria-hidden="true">
            03
          </span>
          <span className="fin-eyebrow">
            <i aria-hidden="true" />
            {sections.howWeHelp}
          </span>
          <h2 id="hwh-heading" className="fin-h2 text-balance">
            {whyUs.headingLead} <span className="accent">{whyUs.headingAccent}</span>
          </h2>
          <p className="fin-lead">{whyUs.sub}</p>
        </div>

        {/*
          Rail | stage | detail, but three columns only from 1280px. Between
          768 and 1279 the site's .container caps at 920px, which would leave
          the stage column ~264px for a stack ~430px wide — it would spill over
          the rail and the copy. Below 1280 it is rail | stage with the detail
          underneath.
        */}
        <div className="mt-14 grid items-center gap-y-10 md:mt-20 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] md:gap-x-6 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,320px)] xl:gap-x-4">
          {/* Rail */}
          <div
            role="tablist"
            aria-label="How we help"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="order-2 flex flex-col gap-1 md:order-1"
          >
            {LAYERS.map((l, i) => {
              const on = i === active;
              return (
                <button
                  key={l.n}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`hwh-tab-${l.n}`}
                  aria-selected={on}
                  aria-controls="hwh-detail"
                  tabIndex={on ? 0 : -1}
                  onPointerMove={(e) => e.pointerType === "mouse" && hoverPick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                  className="group relative flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors md:justify-end md:text-right"
                  style={{ background: on ? mix(C.blue, 5) : "transparent" }}
                >
                  <span
                    className="order-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors md:order-3"
                    style={{
                      borderColor: on ? C.blue : C.line,
                      background: on ? C.blue : C.wash,
                      color: on ? C.panel : C.faint,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {l.icon}
                    </svg>
                  </span>
                  <span
                    className="order-2 font-heading text-[11px] font-bold tracking-[.16em] transition-colors md:order-2"
                    style={{ color: on ? C.blue : C.muted }}
                  >
                    {l.n}
                  </span>
                  <span
                    className="order-3 flex-1 font-heading text-[13px] font-semibold uppercase tracking-[.1em] transition-colors md:order-1 md:flex-none"
                    style={{ color: on ? C.navy : C.muted }}
                  >
                    {l.label}
                  </span>

                  {/* connector line into the stage */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-full top-1/2 hidden h-px md:block"
                    style={{
                      width: on ? 56 : 0,
                      background: C.blue,
                      opacity: on ? 1 : 0,
                      transition: `width ${dur} ${EASE}, opacity 300ms ease`,
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 hidden h-1.5 w-1.5 rounded-full md:block"
                    style={{
                      left: "calc(100% + 56px)",
                      background: C.blue,
                      opacity: on ? 1 : 0,
                      transform: `translate(-50%,-50%) scale(${on ? 1 : 0})`,
                      transition: `opacity 300ms ease, transform ${dur} ${EASE}`,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Stage — decorative; the rail is its accessible equivalent */}
          <div aria-hidden="true" className="order-1 flex justify-center md:order-2">
            <div
              ref={stageRef}
              className="relative h-[320px] w-full max-w-[320px] sm:h-[400px] sm:max-w-[430px] md:h-[450px] md:max-w-[540px]"
            >
              <div
                className="absolute left-1/2 top-1/2 h-0 w-0"
                style={{
                  transform:
                    "translate(-50%,-50%) translateY(calc(62px * var(--iso-scale))) scale(var(--iso-scale)) rotateX(55deg) rotateZ(-45deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* base → top so paint order is correct everywhere */}
                {LAYERS.map((_, idx) => {
                  const i = LAYERS.length - 1 - idx; // 5,4,3,2,1,0
                  const L = LAYERS[i];
                  const on = i === active;
                  const isBase = i === LAYERS.length - 1;
                  const z =
                    (LAYERS.length - 1 - i) * Z_STEP +
                    (i < active ? Z_PART : 0) +
                    (on ? Z_LIFT : 0);
                  return (
                    <div
                      key={L.n}
                      onPointerMove={(e) => e.pointerType === "mouse" && hoverPick(i)}
                      onClick={() => pick(i)}
                      className="absolute -ml-[180px] -mt-[120px] h-[240px] w-[360px] cursor-pointer rounded-[18px] border"
                      style={{
                        transform: `translateZ(${z}px) scale(${on ? 1.035 : 1})`,
                        transition: `transform ${dur} ${EASE}, background ${dur} ease, border-color ${dur} ease, box-shadow ${dur} ease, opacity ${dur} ease`,
                        borderColor: on ? C.blue : C.line,
                        background: on
                          ? `linear-gradient(140deg, ${mix(C.blue, 15, C.panel)}, ${mix(C.blue, 5, C.panel)})`
                          : `linear-gradient(140deg, ${mix(C.panel, 95)}, ${mix(C.wash, 50)})`,
                        opacity: on ? 1 : 0.97,
                        boxShadow: isBase
                          ? `0 0 0 1px ${on ? C.blue : C.line}, 0 7px 0 -1px ${on ? mix(C.blue, 20, C.panel) : mix(C.navy, 6, C.panel)}, 0 14px 0 -2px ${on ? mix(C.blue, 28, C.panel) : mix(C.navy, 10, C.panel)}, 0 22px 30px -14px ${mix(C.navy, 28)}`
                          : on
                            ? `0 26px 44px -24px ${mix(C.blue, 65)}`
                            : `0 10px 22px -18px ${mix(C.navy, 50)}`,
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          opacity: on ? 1 : 0,
                          transition: `opacity ${reduced ? "0ms" : "420ms"} ease ${on ? "140ms" : "0ms"}`,
                        }}
                      >
                        <L.Art on={on} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/*
            Detail. All six are rendered into one grid cell and only the active
            one is visible, so the cell is always as tall as the longest copy.
            Rendering just the active item let the panel change height while
            the page scrolled — below 1280px, where the detail sits under the
            stage, everything beneath it jumped as the scroll advanced.
            `invisible` also drops the hidden five from the accessibility tree.
            The duration is an arbitrary property, not an arbitrary duration-*
            value: tailwindcss-animate claims duration-* too, so Tailwind calls
            such a class ambiguous and emits nothing. (No bracketed spelling in
            this comment — Tailwind scans comments, and it would warn on it.)
          */}
          <div
            id="hwh-detail"
            role="tabpanel"
            aria-labelledby={`hwh-tab-${LAYERS[active].n}`}
            tabIndex={0}
            className="order-3 grid md:col-span-2 md:mx-auto md:max-w-[560px] md:text-center xl:col-span-1 xl:mx-0 xl:max-w-none xl:text-left"
          >
            {LAYERS.map((l, i) => (
              <div
                key={l.n}
                className={`[grid-area:1/1] ${
                  i === active
                    ? "animate-in fade-in slide-in-from-bottom-[10px] fill-mode-both ease-reel [animation-duration:520ms] motion-reduce:animate-none"
                    : "invisible"
                }`}
              >
                <span
                  className="font-heading text-[11px] font-bold tracking-[.2em]"
                  style={{ color: C.blue }}
                >
                  {l.n}
                </span>
                <h3
                  className="mt-2 text-[20px] font-medium leading-snug tracking-[-.01em]"
                  style={{ color: C.navy }}
                >
                  {l.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65]" style={{ color: C.muted }}>
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
