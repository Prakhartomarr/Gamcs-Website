"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { STEP_ICONS } from "@/components/ui/stroke-icons";
import { howWeHelp } from "@/lib/content/gamcs";

/**
 * "How GAMCS Helps" — four sequential phases on an isometric stack, then the
 * six principles that hold across all four as a card grid.
 *
 * The stack used to carry the six `whyUs.points`, which asked a reader to take
 * six parallel claims as a sequence they never were. The sequence is
 * `howWeHelp.phases`; the principles below it are `howWeHelp.principles`,
 * numbered 01–06 as the client wrote them (2026-10-22).
 *
 * Layer 01 sits on TOP and the stack descends to 04. An earlier pass had 01 at
 * the bottom so the foundation was literally underneath; the client reviewed
 * both against the deployed original and reversed it, so the first phase is
 * the slab you read first. Selecting a phase lifts and tints it where it
 * already sits — nothing is re-ordered on click. Layers at or before the
 * selected one are lit and solid, later ones are pale and dashed: what is
 * built versus what is still ahead.
 *
 * The stage is aria-hidden: it is a picture of the rail, and the rail plus the
 * live detail panel carry everything a screen reader needs.
 *
 * NO HEADING BLOCK. This band rendered its own h2 from `howWeHelp.headingLead`
 * / `headingAccent` and `sub` while it lived on the homepage. It is its own
 * route now (app/how-we-help/page.tsx) and the page head renders exactly those
 * three strings as the h1 and the intro, so keeping them here would print the
 * same sentence twice on one page. Everything that was under that h2 moved up
 * a level with it — phase names and the principles heading are h2, the six
 * principle claims h3 — so the page reads h1 -> h2 -> h3 with nothing skipped.
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
  blueLine: "var(--blue-light)", // artwork strokes on a lit slab
  panel: "var(--white)",
  wash: "var(--soft)", // artwork tile grounds on an unlit slab
  band: "var(--band-white)", // section background
} as const;

/** `c` at `pct`% over `base` (transparent unless given) — how every tint is derived. */
const mix = (c: string, pct: number, base = "transparent") =>
  `color-mix(in srgb, ${c} ${pct}%, ${base})`;

/** Brand blue over white, the one fill family the stack and the badges share. */
const tint = (pct: number) => mix(C.blue, pct, C.panel);

/* ── Content ────────────────────────────────────────────────────────────── */

const PHASES = howWeHelp.phases;

/* Rail glyphs, by phase index. The phases have no icons of their own, so these
   are borrowed from STEP_ICONS — the six principles' set — on meaning, not on
   key: controls/sign-off, a connected graph, the spark, a rising chart. Two of
   the six (the people glyph, the layers glyph) have no phase that wants them. */
const PHASE_ICONS = [
  "Boardroom Ready. Deal Room Proven.",
  "Independent by Design. Outcomes Above Platforms.",
  "Intelligence Built In. Not Bolted On.",
  "Scale Capability. Not Overhead.",
].map((k) => STEP_ICONS[k]);

/* The six principles (client copy, 2026-10-22), each given one of the
   STEP_ICONS glyphs on meaning: the spark for starting from the decision,
   people for finance and technology together, the graph for needs before
   platforms, layers for advice into action, the checked document for
   numbers you can trust, the chart for scale. Keyed by position, so a
   reordered list re-pairs them: reorder this too. */
const PRINCIPLE_ICONS = [
  "Intelligence Built In. Not Bolted On.",
  "One Team. One Integrated Finance Engine.",
  "Independent by Design. Outcomes Above Platforms.",
  "Industry-Agnostic. Business-Specific.",
  "Boardroom Ready. Deal Room Proven.",
  "Scale Capability. Not Overhead.",
].map((k) => STEP_ICONS[k]);
const PRINCIPLES = howWeHelp.principles.items.map((p, i) => ({
  ...p,
  icon: PRINCIPLE_ICONS[i],
}));

/* ── Slab artwork ───────────────────────────────────────────────────────────
   One picture per phase, drawn flat in the slab's own plane and then tilted
   with it. Two rules carry the whole set:

   - Everything is a div. At 55° a stroked SVG hairline aliases into dashes
     while a 1px div stays a line, and the shapes here are all rectangles.
   - Text is 5px. At this tilt it is texture — the eye reads "a checklist", "a
     chart" — so every label is one or two words. A sentence on a slab would
     be unreadable and would compete with the detail panel, which is where the
     copy actually belongs.

   `on` is the only prop: a lit slab draws in blue over a blue-tinted ground,
   an unlit one in the muted ink over --soft. */

type ArtProps = { on: boolean };

/* Artwork clears the bottom gutter the rotated slab label owns — see the
   label for where that band's width comes from. */
/* The full slab inset, as the original draws it. The 34px bottom gutter this
   used to leave was reserved for the slab label; with the label gone the
   artwork gets the sheet back. */
const ART_BOX = "absolute inset-3";
const TAG = "text-[5px] font-semibold tracking-[.14em]";

/** 01 — the close as a signed-off checklist: owners, ticks, one row still open. */
function ArtStabilise({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  const rows: [string, string][] = [
    ["BANK REC", "AP"],
    ["ACCRUALS", "GL"],
    ["PAYROLL", "HR"],
    ["REVENUE", "AR"],
    ["VARIANCE", "FP&A"],
    ["SIGN-OFF", "CFO"],
  ];
  return (
    <div className={`${ART_BOX} flex flex-col gap-[5px]`}>
      <div className="flex items-center gap-1.5">
        <span className={TAG} style={{ color: ink }}>
          CLOSE
        </span>
        <span className="h-px flex-1 rounded-full" style={{ background: s }} />
        <span className={TAG} style={{ color: ink }}>
          DAY 5
        </span>
      </div>
      {rows.map(([task, owner], i) => {
        const open = i === rows.length - 1; // the one still waiting on a signature
        return (
          <div
            key={task}
            className="flex flex-1 items-center gap-1.5 rounded-md border px-2"
            style={{
              borderColor: open ? ink : s,
              borderStyle: open ? "dashed" : "solid",
              background: open ? "transparent" : on ? mix(C.blue, 10) : C.wash,
            }}
          >
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-[2px] border"
              style={{ borderColor: ink, background: open ? "transparent" : ink }}
            />
            <span className={TAG} style={{ color: ink }}>
              {task}
            </span>
            <span
              className="ml-auto h-[3px] rounded-full"
              style={{ width: open ? 10 : 34, background: s }}
            />
            {/* axe reports this span at 3.47:1 and is wrong — do not "fix"
                it by darkening the chip. It reads the background as #9cbdd4,
                which is what you get by compositing `color-mix(..., 16%,
                transparent)` as if the layer under it were the blue itself.
                Sampled off the rendered page at deviceScaleFactor 3, the chip
                paints #D8E6EE, and #0F5E97 on that is 5.37:1 — over the 4.5
                floor, not under it.

                It is also exempt twice over: the whole stage is aria-hidden
                because it is a picture of the rail, and 5px owner tags inside
                a drawing of a close checklist are WCAG 1.4.3's incidental
                text — "part of a picture that contains significant other
                visual content". Making the background opaque would satisfy
                the tool, but `ink` is C.faint on an unlit slab, so it would
                also hand axe four pale-on-pale chips it currently cannot see,
                and the lit/unlit contrast is the thing this whole illustration
                is built on. */}
            <span
              className="rounded-[3px] px-[3px] py-px text-[5px] font-bold tracking-[.1em]"
              style={{ background: mix(ink, 16), color: ink }}
            >
              {owner}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** 02 — four separate systems feeding one spine, one line out to one report. */
function ArtConnect({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  const ground = on ? mix(C.blue, 10) : C.wash;
  return (
    <div className={`${ART_BOX} flex items-stretch`}>
      <div className="flex w-[30%] flex-col gap-1">
        {["ERP", "BANKING", "PAYROLL", "CRM"].map((t) => (
          <div
            key={t}
            className="flex flex-1 items-center rounded-md border px-1.5"
            style={{ borderColor: s, background: ground }}
          >
            <span className={TAG} style={{ color: ink }}>
              {t}
            </span>
          </div>
        ))}
      </div>
      {/* The convergence itself. Percentages, not a layout: they land on the
          centres of the four flex-1 tiles beside them at any slab scale. */}
      <div className="relative w-[18%]">
        <span className="absolute bottom-[12%] left-1/2 top-[12%] w-px" style={{ background: s }} />
        {["12%", "37%", "63%", "88%"].map((top) => (
          <span key={top} className="absolute left-0 h-px w-1/2" style={{ top, background: s }} />
        ))}
        <span className="absolute left-1/2 top-1/2 h-px w-1/2" style={{ background: ink }} />
        <span
          className="absolute left-1/2 top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: ink, background: C.panel }}
        />
      </div>
      <div
        className="relative flex-1 rounded-md border p-2"
        style={{ borderColor: s, background: ground }}
      >
        <div className="flex flex-col gap-[3px]">
          {[100, 84, 92, 70, 88, 76].map((w, i) => (
            <span
              key={i}
              className="h-[3px] rounded-full"
              style={{ width: `${w}%`, background: s }}
            />
          ))}
        </div>
        <span className={`absolute bottom-1.5 left-2 ${TAG}`} style={{ color: ink }}>
          ONE REPORT
        </span>
      </div>
    </div>
  );
}

/** 03 — results broken into drivers, with the bars continuing as a forecast. */
function ArtExplain({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  const drivers: [string, string][] = [
    ["PRICE", "+"],
    ["VOLUME", "+"],
    ["MIX", "−"],
    ["COST", "−"],
  ];
  return (
    <div className={`${ART_BOX} flex gap-2`}>
      <div className="flex w-[30%] flex-col gap-1">
        {drivers.map(([t, d]) => (
          <div
            key={t}
            className="flex flex-1 items-center rounded-md border px-1.5"
            style={{ borderColor: s, background: on ? mix(C.blue, 10) : C.wash }}
          >
            <span className={TAG} style={{ color: ink }}>
              {t}
            </span>
            <span className="ml-auto text-[6px] font-bold leading-none" style={{ color: ink }}>
              {d}
            </span>
          </div>
        ))}
      </div>
      <div
        className="relative flex flex-1 items-end gap-1 rounded-md border px-2 pb-5 pt-2"
        style={{ borderColor: s, background: on ? mix(C.blue, 6) : C.wash }}
      >
        {[38, 52, 46, 64, 58, 72, 80, 92].map((h, i) => {
          const ahead = i >= 5; // forecast: outlined, so it reads as not-yet-actual
          return (
            <span
              key={i}
              className="flex-1 rounded-t-[2px] border"
              style={{
                height: `${h}%`,
                borderColor: ahead ? ink : "transparent",
                borderStyle: ahead ? "dashed" : "solid",
                /* Half-weight when unlit: a solid grey bar is the heaviest
                   mark on the stack and an idle slab would out-shout the
                   selected one from three layers down. */
                background: ahead ? "transparent" : on ? ink : mix(ink, 50),
              }}
            />
          );
        })}
        <span className="absolute bottom-4 left-2 right-2 h-px" style={{ background: s }} />
        <span className={`absolute bottom-1 left-2 ${TAG}`} style={{ color: ink }}>
          ACTUAL
        </span>
        <span className={`absolute bottom-1 right-2 ${TAG}`} style={{ color: ink }}>
          FORECAST
        </span>
      </div>
    </div>
  );
}

/** 04 — decisions with named owners beside the outcome they are tracked on. */
function ArtDecide({ on }: ArtProps) {
  const s = on ? C.blueLine : C.line;
  const ink = on ? C.blue : C.faint;
  const decisions: [string, string][] = [
    ["PRICING", "COO"],
    ["WORKING CAPITAL", "CFO"],
    ["HEADCOUNT", "MD"],
  ];
  return (
    <div className={`${ART_BOX} flex gap-2`}>
      <div className="flex flex-1 flex-col gap-1">
        {decisions.map(([t, o]) => (
          <div
            key={t}
            className="flex flex-1 items-center gap-1.5 rounded-md border px-2"
            style={{ borderColor: s, background: on ? mix(C.blue, 10) : C.wash }}
          >
            <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: ink }} />
            <span className={TAG} style={{ color: ink }}>
              {t}
            </span>
            <span
              className="ml-auto rounded-[3px] px-[3px] py-px text-[5px] font-bold tracking-[.1em]"
              style={{ background: mix(ink, 16), color: ink }}
            >
              {o}
            </span>
          </div>
        ))}
      </div>
      <div
        className="relative flex w-[36%] flex-col rounded-md border p-2"
        style={{ borderColor: s, background: on ? mix(C.blue, 6) : C.wash }}
      >
        <span className={TAG} style={{ color: ink }}>
          IMPACT
        </span>
        <div className="relative mt-1 flex flex-1 items-end gap-1 pb-3">
          {[30, 38, 46, 54, 68, 82].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-[2px]"
              style={{ height: `${h}%`, background: ink, opacity: (on ? 1 : 0.5) * (0.5 + i * 0.1) }}
            />
          ))}
          {/* the target the decisions are measured against */}
          <span
            className="absolute inset-x-0 bottom-[58%] border-t border-dashed"
            style={{ borderColor: ink }}
          />
        </div>
        <span className={`absolute bottom-1.5 left-2 ${TAG}`} style={{ color: ink }}>
          TRACKED
        </span>
      </div>
    </div>
  );
}

/**
 * Artwork per phase, positionally. The mapped tuple type takes its length from
 * `PHASES`, so a fifth phase fails the build instead of rendering a bare slab.
 */
type SameLength<T extends readonly unknown[], U> = { [K in keyof T]: U };
const ART: SameLength<typeof PHASES, ComponentType<ArtProps>> = [
  ArtStabilise,
  ArtConnect,
  ArtExplain,
  ArtDecide,
];

/* ── Geometry ───────────────────────────────────────────────────────────────
   The stage tilts 55° about X after a -45° spin about Z, so a W×H layer paints
   a diamond 0.707·(W+H) wide and 0.405·(W+H) tall — far wider than the layer
   itself. 350×250 is the size measured off the deployed original, whose slabs
   project ~400px wide; here 0.707 × 600 × .95 = 403px at the desktop scale.

   The scales are the constraint, not the size. The narrowest container the
   site serves is `calc(100% - 28px)` — 332px on a 360px phone, 292px on a 320
   one — and the phone scale has to clear the smaller of the two, so .68:
   0.707 × 600 × .68 = 289px. `overflow-hidden` on the section is the
   backstop, not the plan: a clipped layer would read as a bug.

   Vertically the stack spans its own 0.405·(W+H) plus the top layer's
   translateZ, 0.819·(3·Z_STEP + Z_LIFT) — 376px at .95, which is what the
   stage boxes below are sized from. That maximum is reached only while 01 is
   selected, since it is the slab the lift adds to the top of. STAGE_DROP is
   half that lift, pushing the origin down so the lifted stack ends up centred
   in its box rather than riding the top edge. */
const LAYER_W = 350;
const LAYER_H = 250;
const Z_STEP = 54; // resting gap between layers, along the isometric Z axis
const Z_LIFT = 24; // extra lift for the active layer
const STAGE_DROP = Math.round((0.819 * (3 * Z_STEP + Z_LIFT)) / 2);


export default function HowWeHelpStack() {
  /* Two selections, not one. `committed` is what the reader chose — a click,
     or the scroll auto-advance — and it is what `aria-pressed` and the live
     region report. `preview` is where the mouse happens to be. Separating
     them is what lets a pointer sweep across the rail without the pressed
     state flickering under a screen reader. */
  const [committed, setCommitted] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? committed;
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
      /* A pointer parked over the stack would otherwise pin the picture to
         whatever slab it is resting on while the page scrolls past it. The
         next real pointermove re-previews; a still pointer does not. */
      setPreview(null);
      setCommitted(Math.min(PHASES.length - 1, Math.max(0, Math.floor(p * PHASES.length))));
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
    /* A finger raises no pointerleave, so a tap that left a preview behind
       would strand the stack on it. Committing always clears the preview;
       a mouse still over the target simply re-sets it to the same index. */
    setPreview(null);
    setCommitted(i);
  }, []);

  /* pointermove, not pointerenter: a wheel scroll slides a slab under a
     resting cursor and fires enter without the pointer having moved, and the
     stage sits in the centre column where a desktop cursor tends to rest.
     Mouse only — a tap has to go through onClick and commit. */
  const peek = (type: string, i: number) => {
    if (type === "mouse") setPreview(i);
  };

  const dur = reduced ? "0ms" : "400ms";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2";

  return (
    <section
      ref={sectionRef}
      id="how-we-help"
      /* pt-14 — 63px at this project's 18px root — not the pt-20/md:pt-28 this
         band carried on the homepage. That padding never rendered there:
         `.home-tight #how-we-help{padding:63px 0 36px}` overrode it, so the
         63px is what the band has always shipped with, and the move to its own
         route is the first time 90/126px ever painted. It opened 182px of
         blank under the page head; 63px closes that to 119px (>=768) and 95px
         (<768), which is the 120/96 /privacy-policy, the other plain-head
         route, opens with. The bottom stays as it is: measured, this band ends
         95px above the footer against /privacy-policy's 92px. */
      className="relative w-full overflow-hidden pb-12 pt-14 [--iso-scale:.68] sm:[--iso-scale:.85] md:pb-16 lg:[--iso-scale:.95]"
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
        {/*
          Phone reads stack -> rail -> detail; from 768 to 1279 the stack keeps
          the full width above two text columns. The three-column row waits for
          1280 because .container is pinned to 920px up to 1279, and the rail's
          longest label — EXPLAIN & ANTICIPATE, set uppercase and letter-spaced
          — needs ~300px beside a 36px chip. 300 + 340 + 64 of gaps off a
          1374px container at 1470 leaves the stage 670px for a 403px diamond.

          No top margin on it: the 63/90px that used to be here (mt-14/md:mt-20
          are 1.125x their names at this file's 18px root) separated this row
          from the section's own heading block, and the page head owns that
          now. Left in, it stacked on the section's own padding and opened
          126px on a phone, 153px at desktop, between the intro paragraph and
          the first slab.
        */}
        <div className="grid gap-y-10 md:grid-cols-2 md:gap-x-8 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)_minmax(0,340px)] xl:items-center xl:gap-x-8">
          {/* Rail — toggle buttons, not tabs: the detail panel is a live region
              the arrows also drive, not a tabpanel this list owns. */}
          <div className="relative order-2 flex flex-col gap-[2px] xl:order-1">
            {PHASES.map((p, i) => {
              const on = i === shown;
              return (
                <button
                  key={p.n}
                  type="button"
                  /* The committed phase, never the hovered one: a mouse
                     crossing the rail must not make a screen reader read four
                     pressed-state changes. */
                  aria-pressed={i === committed}
                  onClick={() => pick(i)}
                  onPointerMove={(e) => peek(e.pointerType, i)}
                  onPointerLeave={() => setPreview(null)}
                  className={`relative flex w-full items-center justify-end gap-[18px] rounded-[14px] py-[9px] pl-4 pr-[9px] text-right ${focusRing}`}
                  style={{
                    background: on ? tint(6) : "transparent",
                    transition: `background-color ${dur} ease`,
                  }}
                >
                  <span
                    className="font-heading text-[13px] font-semibold uppercase leading-none tracking-[.1em]"
                    style={{ color: on ? C.navy : C.muted, transition: `color ${dur} ease` }}
                  >
                    {p.name}
                  </span>
                  {/* C.muted, not C.faint. The idle numeral used the layer-
                      label colour, which C declares as decoration only — and
                      it is not decoration here, it is the phase number inside
                      a button a visitor clicks. #98A0A6 on the white band
                      measured 2.65:1 against the 4.5 AA floor for 13px
                      (axe, 1440). The label beside it was already on C.muted
                      and clears it at 6.39:1, so the row now reads in one
                      colour; the name keeps its own weight by being uppercase
                      at .1em in the heading face, which is where that
                      hierarchy actually came from. */}
                  <span
                    className="text-[13px] font-semibold leading-none tracking-[.08em]"
                    style={{ color: on ? C.blue : C.muted, transition: `color ${dur} ease` }}
                  >
                    {p.n}
                  </span>
                  <span
                    className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px] border"
                    style={{
                      borderColor: on ? "transparent" : C.line,
                      /* The original's filled chip is a blue-leaning navy, not
                         --ink-deep: it has to read as the same family as the
                         lit slab it points at. */
                      background: on ? mix(C.blue, 85, C.navy) : mix(C.navy, 3, C.panel),
                      color: on ? C.panel : C.faint,
                      transition: `background-color ${dur} ease, border-color ${dur} ease, color ${dur} ease`,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {PHASE_ICONS[i]}
                    </svg>
                  </span>
                  {/* Leader from the lit pill to the stack, drawn only where
                      the two are side by side — below 1280 the stack sits
                      above the rail and a line pointing right points at
                      nothing. */}
                  {on && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 items-center gap-1 xl:flex"
                    >
                      <span className="block h-px w-[49px]" style={{ background: mix(C.blue, 55) }} />
                      <span
                        className="block h-[8px] w-[8px] rounded-full"
                        style={{ background: C.blue }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Stage — decorative; the rail is its accessible equivalent */}
          <div className="order-1 md:col-span-2 xl:order-2 xl:col-span-1">
            <div aria-hidden="true" className="flex justify-center">
              <div
                ref={stageRef}
                className="relative h-[300px] w-full sm:h-[360px] lg:h-[400px]"
              >
                <div
                  className="absolute left-1/2 top-1/2 h-0 w-0"
                  style={{
                    transform: `translate(-50%,-50%) translateY(calc(${STAGE_DROP}px * var(--iso-scale))) scale(var(--iso-scale)) rotateX(55deg) rotateZ(-45deg)`,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* 01 is the TOP slab, so the translateZ counts down from the
                      last phase: preserve-3d sorts the siblings by depth, so
                      DOM order here is just reading order. */}
                  {PHASES.map((p, i) => {
                    const on = i === shown;
                    const later = i > shown;
                    const Art = ART[i];
                    return (
                      <div
                        key={p.n}
                        onClick={() => pick(i)}
                        onPointerMove={(e) => peek(e.pointerType, i)}
                        onPointerLeave={() => setPreview(null)}
                        className="absolute cursor-pointer rounded-[20px]"
                        style={{
                          width: LAYER_W,
                          height: LAYER_H,
                          marginLeft: -LAYER_W / 2,
                          marginTop: -LAYER_H / 2,
                          transform: `translateZ(${(PHASES.length - 1 - i) * Z_STEP + (on ? Z_LIFT : 0)}px)`,
                          borderWidth: on ? 1.5 : 1,
                          borderStyle: later ? "dashed" : "solid",
                          borderColor: on ? C.blue : later ? C.line : tint(32),
                          background: on ? tint(22) : later ? mix(C.navy, 4, C.panel) : tint(9),
                          /* Slabs ahead of the selected one cover it almost
                             entirely — the exposed band is only ~30px of a
                             350px slab — so the active artwork would be
                             invisible if they stayed opaque. Dropping them to
                             .45 lets it read through while each of them keeps
                             its own border and texture at half strength, so
                             they still look like slabs rather than outlines.
                             Nothing is in front of the layers below, so they
                             stay solid. */
                          opacity: i < shown ? 0.45 : 1,
                          /* One shadow for every state. It used to change with
                             the selection, which repainted four big rotated
                             surfaces on every frame of the 400ms switch for a
                             difference nobody reads at this tilt. */
                          boxShadow: `0 10px 22px -16px ${mix(C.navy, 45)}`,
                          willChange: reduced ? undefined : "transform",
                          transition: `transform ${dur} ease, background-color ${dur} ease, border-color ${dur} ease, opacity ${dur} ease`,
                        }}
                      >
                        {/* Only the selected slab carries artwork. The
                            original's stack is one printed sheet on top of
                            blank ones, and that is what makes the selection
                            legible at a 55-degree tilt: four sheets of texture
                            seen through each other is noise, not a stack.
                            Kept mounted and faded rather than unmounted, so a
                            switch cross-fades instead of popping; `dur` is
                            0ms under prefers-reduced-motion, which makes this
                            an instant swap there. */}
                        <div
                          className="absolute inset-0"
                          style={{ opacity: on ? 1 : 0, transition: `opacity ${dur} ease` }}
                        >
                          <Art on={on} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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

            Hover previews here too, and that is the one thing that could make
            this region chatter. It is kept out by splitting what is SEEN from
            what is EXPOSED: the previewed block is visible but `aria-hidden`,
            while the committed block stays in the accessibility tree behind
            it at `opacity-0` — transparent, not `invisible`, because
            visibility:hidden would empty the live region and the emptying is
            itself a change to announce. So the region's content is always
            exactly the committed phase and changes only on a click or the
            scroll auto-advance, no matter where the mouse goes.
          */}
          <div aria-live="polite" className="order-3">
            <div className="grid">
              {PHASES.map((p, i) => (
                <div
                  key={p.n}
                  aria-hidden={i !== committed}
                  className={`[grid-area:1/1] ${
                    i === shown ? "" : i === committed ? "opacity-0" : "invisible"
                  }`}
                >
                  {/* 26/1.2 over 15/1.65 is the original's pairing, measured
                      off its two-line headline and four-line body. */}
                  <h2
                    className="mt-3 text-[26px] font-medium leading-[1.2] tracking-[-.015em]"
                    style={{ color: C.navy }}
                  >
                    {p.name}
                  </h2>
                  <p className="mt-2 text-[15px] font-semibold" style={{ color: C.blue }}>
                    {p.goal}
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.65]" style={{ color: C.muted }}>
                    {p.detail}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── The six principles ─────────────────────────────────────────── */}
        <div className="mt-20 border-t pt-14 md:mt-28 md:pt-16" style={{ borderColor: C.line }}>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-10">
            <div>
              <span className="section-kicker uppercase">{howWeHelp.principles.kicker}</span>
              {/* .fin-h2, the scale every other section head on the page
                  uses (client, 2026-10-22: it was 26px against their 50). */}
              <h2 className="fin-h2 !mt-2">
                {`${howWeHelp.principles.headingLead} `}
                {/* .fin-h2 .accent is nowrap; this phrase may wrap on a phone. */}
                <span className="accent [white-space:normal]">{howWeHelp.principles.headingAccent}</span>
              </h2>
            </div>
            {/* 50ch, not 44: two balanced lines beside the heading rather than
                three (client, 2026-10-22). */}
            <p className="text-[15px] leading-snug [text-wrap:balance] md:max-w-[50ch] md:text-right" style={{ color: C.gray }}>
              {howWeHelp.principles.sub}
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <li
                key={p.n}
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
                <h3 className="mt-4 text-[15px] font-bold leading-snug" style={{ color: C.navy }}>
                  <span style={{ color: C.blue }}>{p.n}.</span> {p.title}
                </h3>
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
