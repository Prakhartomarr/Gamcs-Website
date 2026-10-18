"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STEP_ICONS } from "@/components/ui/stroke-icons";
import { fill } from "@/lib/content/fill";
import { howWeHelp, whyUs } from "@/lib/content/gamcs";

/**
 * "How GAMCS Helps" — four sequential phases on an isometric stack, then the
 * six principles that hold across all four as a card grid.
 *
 * The stack used to carry the six `whyUs.points`, which asked a reader to take
 * six parallel claims as a sequence they never were. The sequence is
 * `howWeHelp.phases`; the points are qualities, so they get a grid with no
 * numbers on it.
 *
 * Layer 01 sits at the BOTTOM: the picture's whole argument is that each phase
 * rests on the one beneath it, so the foundation has to be underneath. Layers
 * at or below the selected one are lit and solid, layers above it are pale and
 * dashed — what is built versus what is still ahead.
 *
 * The stage is aria-hidden: it is a picture of the rail, and the rail plus the
 * live detail panel carry everything a screen reader needs.
 */

/* ── Colour ─────────────────────────────────────────────────────────────────
   Every colour in this file resolves through C, and every entry in C is a
   token from app/globals.css. Tints and shadows are derived from those tokens
   with `mix` rather than restated as hex, so re-pointing an entry here
   re-colours the whole section. */

const C = {
  navy: "var(--ink-deep)", // headings, active badge ground
  blue: "var(--blue)", // active / accent
  muted: "var(--ink-muted)", // body copy, idle rail text
  gray: "var(--gray)", // the principles' second sentence
  faint: "var(--chart-foreground-muted)", // idle layer labels — decoration only
  line: "var(--line)", // idle borders
  panel: "var(--white)",
  band: "var(--band-white)", // section background
} as const;

/** `c` at `pct`% over `base` (transparent unless given) — how every tint is derived. */
const mix = (c: string, pct: number, base = "transparent") =>
  `color-mix(in srgb, ${c} ${pct}%, ${base})`;

/** Brand blue over white, the one fill family the stack and the badges share. */
const tint = (pct: number) => mix(C.blue, pct, C.panel);

/* ── Content ────────────────────────────────────────────────────────────── */

const PHASES = howWeHelp.phases;

/* "One Team. One Integrated Finance Engine." -> the claim and its follow-on.
   The same cut app/careers/page.tsx makes on these same leads; one split rule
   for the leads, not two that can drift apart. */
const PRINCIPLES = whyUs.points.map((p) => {
  const cut = p.lead.indexOf(". ") + 1;
  return {
    claim: p.lead.slice(0, cut),
    rest: p.lead.slice(cut + 1),
    body: p.body,
    icon: STEP_ICONS[p.lead],
  };
});

/* ── Geometry ───────────────────────────────────────────────────────────────
   The stage tilts 55° about X after a -45° spin about Z, so a W×H layer paints
   a diamond 0.707·(W+H) wide — far wider than the layer itself. At 320×200
   that is 368px before --iso-scale. The narrowest container the site serves is
   `calc(100% - 28px)`, i.e. 332px on a 360px phone and 292px on a 320px one,
   so the phone scale is .72: 368 × .72 = 265px, inside both. `overflow-hidden`
   on the section is the backstop, not the plan — a clipped layer would read as
   a bug. Vertically the same projection spans 0.405·(W+H) = 211px, and the top
   layer's translateZ lifts it a further 0.819·(3·Z_STEP + Z_LIFT) = 129px, so
   the stage boxes are sized for ~340px of unscaled content plus the stage's
   own 62px drop. */
const LAYER_W = 320;
const LAYER_H = 200;
const Z_STEP = 46; // resting gap between layers, along the isometric Z axis
const Z_LIFT = 20; // extra lift for the active layer

const CHEVRON = "M15 5 L8 12 L15 19";

export default function HowWeHelpStack() {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
     with the stage 0–43% on screen. */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (Date.now() < lockRef.current) return;
      /* Keyboard focus anywhere in the section — a rail button or an arrow —
         holds the selection. Moving it out from under a focused control would
         change what that control does mid-press, and the detail panel is a
         live region: a screen reader would lose its text mid-sentence. */
      if (sectionRef.current?.contains(document.activeElement)) return;
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const p = (vh * 0.85 - (r.top + r.height / 2)) / (vh * 0.65);
      setActive(Math.min(PHASES.length - 1, Math.max(0, Math.floor(p * PHASES.length))));
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

  const dur = reduced ? "0ms" : "400ms";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2";

  return (
    <section
      ref={sectionRef}
      id="how-we-help"
      aria-labelledby="hwh-heading"
      className="relative w-full overflow-hidden pb-12 pt-20 [--iso-scale:.72] sm:[--iso-scale:.85] md:pb-16 md:pt-28 lg:[--iso-scale:.95]"
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
        {/* The site's own section-heading type, so this band reads like every
            other one on the page. `.section-kicker` is the shared eyebrow and
            carries no casing of its own — `.ap-panel` adds it the same way. */}
        <div className="fin-center reveal mx-auto max-w-3xl">
          <p className="section-kicker uppercase">{howWeHelp.eyebrow}</p>
          <h2 id="hwh-heading" className="fin-h2 text-balance">
            {howWeHelp.headingLead}{" "}
            {/* `.fin-h2 .accent` is nowrap so the drawn underline never breaks
                across lines. Five words is longer than a 332px phone column,
                so this accent has to wrap or it is clipped by the section's
                overflow — the same exception `.services` already makes, made
                inline here because the rule outranks any utility class. */}
            <span className="accent" style={{ whiteSpace: "normal" }}>
              {howWeHelp.headingAccent}
            </span>
          </h2>
          <p className="fin-lead">{howWeHelp.sub}</p>
        </div>

        {/*
          Phone reads stack -> rail -> detail; the tablet keeps the stack full
          width above the two columns, because between 768 and 1279 the site's
          .container caps at 920px and a third column would leave the stage too
          little to draw a 368px-wide diamond in. From 1024 the three sit in a
          row: 230 + 280 for the text columns leaves the stage ~370px, which is
          what .95 of the diamond needs.
        */}
        <div className="mt-14 grid gap-y-10 md:mt-20 md:grid-cols-2 md:gap-x-8 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)_minmax(0,280px)] lg:items-center lg:gap-x-5 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,340px)] xl:gap-x-8">
          {/* Rail — toggle buttons, not tabs: the detail panel is a live region
              the arrows also drive, not a tabpanel this list owns. */}
          <div className="relative order-2 flex flex-col lg:order-1">
            {PHASES.map((p, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <button
                  key={p.n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(i)}
                  className={`relative flex w-full items-start gap-3 rounded-lg p-[12px] text-left ${focusRing}`}
                  style={{
                    background: on ? mix(C.blue, 7) : "transparent",
                    transition: `background-color ${dur} ease`,
                  }}
                >
                  {/* Badge-to-badge connector. It runs from this badge's lower
                      edge to 12px past the item's own, which is exactly the
                      next badge's upper edge — so the track stays joined
                      however the labels wrap, and never pokes out past 04. */}
                  {i < PHASES.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-[12px] left-[29.5px] top-[48px] w-px"
                      style={{
                        background: done ? C.blue : C.line,
                        transition: `background-color ${dur} ease`,
                      }}
                    />
                  )}
                  <span
                    className="relative z-[1] flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg border font-heading text-[12px] font-bold tracking-[.08em]"
                    style={{
                      borderColor: on ? C.navy : done ? tint(30) : C.line,
                      background: on ? C.navy : done ? tint(14) : C.panel,
                      color: on ? C.panel : done ? C.blue : C.muted,
                      transition: `background-color ${dur} ease, border-color ${dur} ease, color ${dur} ease`,
                    }}
                  >
                    {p.n}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span
                      className="block font-heading text-[15px] font-semibold leading-snug"
                      style={{ color: on ? C.navy : C.muted, transition: `color ${dur} ease` }}
                    >
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: C.gray }}>
                      {p.goal}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stage — decorative; the rail is its accessible equivalent */}
          <div className="order-1 md:col-span-2 lg:order-2 lg:col-span-1">
            <div aria-hidden="true" className="flex justify-center">
              <div
                ref={stageRef}
                className="relative h-[340px] w-full sm:h-[400px] lg:h-[450px]"
              >
                <div
                  className="absolute left-1/2 top-1/2 h-0 w-0"
                  style={{
                    transform:
                      "translate(-50%,-50%) translateY(calc(62px * var(--iso-scale))) scale(var(--iso-scale)) rotateX(55deg) rotateZ(-45deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* 01 first, so the DOM reads bottom-of-stack upward and the
                      paint order matches the Z order everywhere. */}
                  {PHASES.map((p, i) => {
                    const on = i === active;
                    const above = i > active;
                    return (
                      <div
                        key={p.n}
                        onClick={() => pick(i)}
                        className="absolute cursor-pointer rounded-[18px]"
                        style={{
                          width: LAYER_W,
                          height: LAYER_H,
                          marginLeft: -LAYER_W / 2,
                          marginTop: -LAYER_H / 2,
                          transform: `translateZ(${i * Z_STEP + (on ? Z_LIFT : 0)}px)`,
                          borderWidth: on ? 1.5 : 1,
                          borderStyle: above ? "dashed" : "solid",
                          borderColor: on ? C.blue : above ? C.line : tint(32),
                          background: on ? tint(22) : above ? mix(C.navy, 4, C.panel) : tint(9),
                          boxShadow: on
                            ? `0 24px 40px -22px ${mix(C.blue, 60)}`
                            : above
                              ? `0 6px 14px -12px ${mix(C.navy, 30)}`
                              : `0 10px 20px -16px ${mix(C.navy, 45)}`,
                          transition: `transform ${dur} ease, background-color ${dur} ease, border-color ${dur} ease, box-shadow ${dur} ease`,
                        }}
                      >
                        {/* Bottom-left, and that is not a style choice. The
                            layer above is the same shape shifted up the screen
                            by Z_STEP, which in this layer's own coordinates is
                            46.5px right and 46.5px up — so the only part of a
                            layer it never hides is a 46px band along the left
                            and bottom edges. Put at the top, as the first pass
                            had it, every label but 04's was buried. The 12px
                            offset keeps the band even when the layer above is
                            the lifted active one and the band narrows to 26px. */}
                        <span
                          className="absolute bottom-[12px] left-[20px] whitespace-nowrap text-[11px] font-semibold uppercase tracking-[.16em]"
                          style={{
                            color: above ? C.faint : C.blue,
                            transition: `color ${dur} ease`,
                          }}
                        >
                          {p.n} {p.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[13px]" style={{ color: C.gray }}>
              {howWeHelp.stackCaption}
            </p>
          </div>

          {/*
            Detail. All four are rendered into one grid cell and only the active
            one is visible, so the cell is always as tall as the longest copy.
            Rendering just the active phase let the panel change height while
            the page scrolled, and everything beneath it jumped as the scroll
            advanced. `invisible` also drops the hidden three from the
            accessibility tree, so the live region announces one phase, not
            four. The arrows sit outside that grid: their labels never change,
            so there is nothing in them for the live region to re-read.
          */}
          <div aria-live="polite" className="order-3">
            <div className="grid">
              {PHASES.map((p, i) => (
                <div key={p.n} className={`[grid-area:1/1] ${i === active ? "" : "invisible"}`}>
                  <p className="font-heading text-[11px] font-bold tracking-[.2em]">
                    <span style={{ color: C.blue }}>{fill(howWeHelp.phaseLabel, { n: p.n })}</span>{" "}
                    <span style={{ color: C.gray }}>{howWeHelp.phaseTotal}</span>
                  </p>
                  <h3
                    className="mt-2 text-[24px] font-medium leading-tight tracking-[-.015em]"
                    style={{ color: C.navy }}
                  >
                    {p.name}
                  </h3>
                  <p className="mt-2 text-[15px] font-semibold" style={{ color: C.blue }}>
                    {p.goal}
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.65]" style={{ color: C.muted }}>
                    {p.detail}
                  </p>
                  <hr className="mt-5" style={{ border: 0, borderTop: `1px solid ${C.line}` }} />
                  <p className="mt-4 text-[13px] leading-snug" style={{ color: C.gray }}>
                    {i === 0
                      ? howWeHelp.firstPhaseNote
                      : fill(howWeHelp.buildsOn, { name: PHASES[i - 1].name })}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              {[
                { label: howWeHelp.prevLabel, to: active - 1, flip: false },
                { label: howWeHelp.nextLabel, to: active + 1, flip: true },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  aria-label={b.label}
                  disabled={b.to < 0 || b.to > PHASES.length - 1}
                  onClick={() => pick(b.to)}
                  className={`flex h-[44px] w-[44px] items-center justify-center rounded-lg border transition-colors hover:enabled:bg-blue/10 disabled:opacity-35 ${focusRing}`}
                  style={{ borderColor: C.line, color: C.blue }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className={`h-5 w-5 ${b.flip ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={CHEVRON} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── The six principles ─────────────────────────────────────────── */}
        <div className="mt-20 border-t pt-14 md:mt-28 md:pt-16" style={{ borderColor: C.line }}>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
            <h3
              className="text-[26px] font-medium leading-tight tracking-[-.015em]"
              style={{ color: C.navy }}
            >
              {howWeHelp.principles.heading}
            </h3>
            <p className="text-[15px] leading-snug md:max-w-[34ch] md:text-right" style={{ color: C.gray }}>
              {howWeHelp.principles.sub}
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <li
                key={p.claim}
                className="rounded-[16px] border p-5 transition-[transform,border-color] duration-200 [border-color:var(--line)] hover:-translate-y-0.5 hover:[border-color:color-mix(in_srgb,var(--ink-deep)_28%,var(--white))] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                style={{ background: C.panel }}
              >
                <span
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px]"
                  style={{ background: tint(10), color: C.blue }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {p.icon}
                  </svg>
                </span>
                <h4 className="mt-4 text-[15px] leading-snug">
                  <span className="font-bold" style={{ color: C.navy }}>
                    {p.claim}
                  </span>{" "}
                  <span className="font-medium" style={{ color: C.gray }}>
                    {p.rest}
                  </span>
                </h4>
                <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
