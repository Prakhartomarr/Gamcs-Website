"use client";

import { useRef, useState } from "react";
import { maturityCurve } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { sections } from "@/lib/content/ui";
import CTA from "@/components/CTA";

/**
 * The finance maturity curve — one stage card whose top edge is a five-tab
 * bar (01–05), a body that swaps per stage, and a stage-aware footer CTA.
 *
 * ALL COPY LIVES IN `maturityCurve` (lib/content/gamcs.ts), not here — this
 * file is markup and interaction only. Stage figures are illustrative and the
 * panel says so wherever a number appears.
 *
 * Section components in this codebase carry no Tailwind utilities; they
 * compose semantic classes from globals.css. This one is utility-styled
 * because it must not add global CSS. The section SHELL still uses the shared
 * primitives (.section / .fin-sec / .container / .fin-eyebrow / .fin-h2 /
 * .fin-lead / CTA) so the band reads as part of the page; only the card is
 * utilities, and every colour, radius and shadow in it resolves to a token
 * already declared in globals.css.
 *
 * The card, top to bottom: a tab bar along its top edge (one tablist, five
 * tabs), the active stage's panel, and a footer that answers the chosen stage
 * with the CTA. Everything inside the card is left-aligned; only the heading
 * block above it centres (.fin-center).
 *
 *   ≥1280      tabs: number, name and question. Body: two columns.
 *   1024–1279  tabs: number and name. Body: one column.
 *   <1024      tabs: the circle over the short name. Body: one column.
 *
 * The breakpoints come from measurements, and the tab bar, body and page
 * showed no overflow at any tested width from 360 to 1920. The tabs sit above
 * the body, so a switch only resizes the card below them. Measured at 1440,
 * 1366, 1280, 1024 and 390, across clicks and arrow keys, the tab bar, the
 * body's top edge and scrollY did not move while the card height changed by
 * up to 581px, so a switch needs no scroll compensation.
 */

/** 11px/700/.18em Sora — the micro-label used throughout this design system. */
const LABEL = "font-heading text-[11px] font-bold uppercase tracking-[0.18em]";

/** The soft hairline (--hair) as a border colour. */
const HAIR = "border-[color:var(--hair)]";

/**
 * Signal tone -> brand palette. There is no red/amber/green semantic scale in
 * this design system, so risk borrows --destructive (the one token that means
 * "bad"), watch takes the yellow accent, and good takes brand blue.
 */
const TONE: Record<string, string> = {
  risk: "bg-destructive",
  watch: "bg-yellow",
  good: "bg-blue",
};

/* ------------------------------------------------------------ small pieces */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full border ${HAIR} bg-white px-3 py-1.5 text-[12px] font-medium text-[color:var(--ink-muted)]`}
    >
      {children}
    </span>
  );
}

type Metric = { value: string; label: string };

function Metrics({ items }: { items: readonly Metric[] }) {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-5">
      {items.map((m) => (
        <div key={m.label}>
          <div className="font-heading text-[19px] font-semibold leading-[1.3] tabular-nums tracking-[-0.01em] text-[color:var(--ink-deep)]">
            {m.value}
          </div>
          <div className="mt-0.5 text-[13px] text-[color:var(--ink-muted)]">{m.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Stage 03 — a live dashboard, sketched. Bars run oldest to newest. */
function DashboardMock({
  tiles,
}: {
  tiles: readonly { label: string; value: string; bars: readonly number[] }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.label} className={`rounded-[14px] border ${HAIR} bg-white p-4`}>
          <div className="text-[12px] text-[color:var(--ink-muted)]">{t.label}</div>
          <div className="mt-1 font-heading text-[18px] font-semibold leading-[1.3] tabular-nums text-[color:var(--ink-deep)]">
            {t.value}
          </div>
          <div className="mt-3 flex h-10 items-end gap-1" aria-hidden="true">
            {t.bars.map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-[2px] ${
                  i === t.bars.length - 1 ? "bg-blue" : "bg-blue/20"
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stage 04 — the question ladder. The last rung is the payoff. */
function Ladder({ rows }: { rows: readonly { q: string; a: string }[] }) {
  return (
    <div className={`max-w-xl overflow-hidden rounded-[14px] border ${HAIR}`}>
      {rows.map((r, i) => {
        const last = i === rows.length - 1;
        return (
          <div
            key={r.q}
            className={`grid grid-cols-[minmax(120px,150px)_1fr] gap-4 px-4 py-3 text-[13px] ${
              last ? "bg-blue/[0.07]" : "bg-white"
            } ${i > 0 ? `border-t ${HAIR}` : ""}`}
          >
            <div
              className={`font-medium ${last ? "text-blue" : "text-[color:var(--ink-muted)]"}`}
            >
              {r.q}
            </div>
            <div className="text-[color:var(--ink-deep)]">{r.a}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Stage 05 — signals in, recommendations out. */
function SignalFlow({
  signals,
  outputs,
  engine,
}: {
  signals: readonly { label: string; dir: string }[];
  outputs: readonly { label: string; tone: string }[];
  engine: string;
}) {
  const arrow = (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="hidden h-[14px] w-[14px] flex-none fill-none stroke-current stroke-2 text-[color:var(--ink-muted)] sm:block"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
  return (
    <div className="flex flex-col items-start gap-[14px] sm:flex-row sm:items-center">
      <div className="flex flex-col gap-2">
        {signals.map((s) => (
          <div
            key={s.label}
            className={`flex items-center justify-between gap-4 rounded-[10px] border ${HAIR} bg-white px-3 py-1.5 text-[13px] text-[color:var(--ink-deep)]`}
          >
            <span>{s.label}</span>
            <span aria-hidden="true" className="text-[color:var(--ink-muted)]">
              {s.dir === "up" ? "↑" : "↓"}
            </span>
          </div>
        ))}
      </div>

      {arrow}

      <div className="flex-none rounded-[14px] bg-blue-dark px-[20px] py-4 text-center font-heading text-[13px] font-semibold leading-[1.35] text-white [box-shadow:var(--shadow-fin)]">
        {engine.split(" ").map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {arrow}

      <div className="flex flex-col gap-2">
        {outputs.map((o) => (
          <div
            key={o.label}
            className={`flex items-center gap-2.5 rounded-[10px] border ${HAIR} bg-white px-3 py-1.5 text-[13px] text-[color:var(--ink-deep)]`}
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 flex-none rounded-full ${TONE[o.tone] ?? "bg-blue"}`}
            />
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- stage panel */

type Stage = (typeof maturityCurve.stages)[number];

/**
 * One stage's body. All five are rendered so each tab's aria-controls has a
 * target; only the active one is laid out, the rest are display:none.
 *
 * From 1280 it splits: quote and tags on the left (5fr), figures and visual
 * on the right (6fr) behind a hairline, 48px gap and 48px inset. The right
 * column is narrowest at 1280 (a 1184px container, so 525px of content), and
 * the widest visual, the stage-05 signal diagram, needs 493px there (437px of
 * nodes plus four 14px gaps), so it fits with 33px spare. From 1024 to 1279
 * the container is 920px, which would leave the right column 381px, so the
 * columns stack there with no divider.
 */
function StagePanel({ stage, active }: { stage: Stage; active: boolean }) {
  return (
    <div
      id={`stage-panel-${stage.n}`}
      role="tabpanel"
      aria-labelledby={`stage-tab-${stage.n}`}
      className={
        active
          ? "min-[1280px]:grid min-[1280px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-[1280px]:gap-x-[48px]"
          : "hidden"
      }
    >
      <div>
        <div className={`${LABEL} text-blue`}>{fill(sections.stage, { n: stage.n })}</div>

        <h3 className="mt-2 text-[26px] font-medium leading-[1.2] tracking-[-0.02em] text-[color:var(--ink-deep)] sm:text-[30px]">
          {stage.question}
        </h3>

        <blockquote className="mt-5 max-w-[62ch] border-l-2 border-blue pl-4 text-[15px] italic leading-relaxed text-[color:var(--ink-muted)]">
          “{stage.quote}”
        </blockquote>

        <div className="mt-6 flex flex-wrap gap-2">
          {stage.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      <div className={`mt-8 ${HAIR} min-[1280px]:mt-0 min-[1280px]:border-l min-[1280px]:pl-[48px]`}>
        <Metrics items={stage.metrics} />

        {stage.visual !== "metrics" && (
          <div className="mt-7">
            {stage.visual === "dashboard" && <DashboardMock tiles={stage.tiles} />}
            {stage.visual === "ladder" && <Ladder rows={stage.ladder} />}
            {stage.visual === "signals" && (
              <SignalFlow
                signals={stage.signals}
                outputs={stage.outputs}
                engine={maturityCurve.engineName}
              />
            )}
            {/* Every stage from 03 up puts a figure on screen; say so. */}
            <p className="mt-6 text-[12px] text-[color:var(--ink-muted)]">
              {maturityCurve.illustrative}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ section */

export default function MaturityCurve() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { stages } = maturityCurve;
  const stage = stages[active];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = stages.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(active + 1, last);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(active - 1, 0);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    /* 72px top and bottom from 768, where .section is 108px (or 80px at
       768–1279). .section is a plain globals.css class that comes after the
       utilities, so a bare py-[4rem] would lose; [&.section] raises the
       specificity to 0,2,0 (measured: 72px from 768 to 1920). Below 768,
       .section's own 60px is already smaller and stays. */
    <section
      className="section fin-sec min-[768px]:[&.section]:py-[4rem]"
      id="maturity-curve"
    >
      <div className="container">
        <div className="fin-center reveal">
          <span className="eyebrow-num" aria-hidden="true">
            02
          </span>
          <span className="fin-eyebrow">
            <i aria-hidden="true" />
            {maturityCurve.eyebrow}
          </span>
          <h2 className="fin-h2">
            {maturityCurve.heading}
            <br className="hidden sm:block" />{" "}
            <span className="accent">{maturityCurve.headingAccent}</span>
          </h2>
          <p className="fin-lead">{maturityCurve.lead}</p>
          <p className={`${LABEL} mt-6 text-[color:var(--ink-muted)]`}>{maturityCurve.hint}</p>
        </div>

        <div
          className={`reveal mt-10 overflow-hidden rounded-[24px] border ${HAIR} bg-white [box-shadow:var(--shadow-fin)]`}
        >
          {/* ------------------------------------------------- the tab bar */}
          {/*
            Five equal columns on --soft, a hairline under the bar and between
            tabs. The active tab turns white with a 3px --blue top border, and
            a 1px white ::after strip covers the bar's hairline under it, so it
            joins the body. A −1px bottom margin would do the same, but it
            shrinks the row by 1px whenever the active tab is the only tallest
            one ("Management Information" alone wraps at 1353–1535), and the
            body would jump on a switch. With the strip, the bar height does
            not depend on the active tab at any width from 360 to 1920.

            Tab widths are the container minus the card border, split five
            ways: 66px at 360, 153px at 900–1023 (the container is 768px
            there), 184px at 1024–1279 and 236px at 1280.

              ≥1024  circle beside the full name (13.5px). At 1024 a tab
                     leaves 98.6px for the name (184 − 1 hairline − 40
                     padding − 32 circle − 12 gap), enough for the widest
                     word, "Management". At 900–1023 it leaves 68px, or
                     84px even with 12px padding, and the word broke
                     mid-letter there.
              ≥1280  the question line joins the name, and every label is
                     one line. The widest, "Management Information" when
                     active (600), is 164.5px in SF Pro and in Inter, more
                     than the 151.4px a 236px tab leaves at 20px padding. So
                     1280–1375 runs 12px padding and an 8px gap, which
                     leaves 171px; from 1376 the container is 1280px, the
                     tab 255px, and the 20/12 spacing fits again.
              <1024  compact: the circle over the short name, 10px, or
                     11.5px from 768, in the body font as the old phone
                     stepper used. "Continuous", the widest short label, is
                     55.8px in it (60.4px in Sora) in a 66px tab at 360.

            The smallest tab is 66×77.5px, at 360. The shortest is 71px tall,
            at 1024–1279. Every target clears 44px.

            The focus ring is drawn inside the tab (outline-offset −4px)
            because the card's overflow:hidden clips anything outside it.
          */}
          <div
            role="tablist"
            aria-label="Finance maturity stages"
            onKeyDown={onKeyDown}
            className={`grid grid-cols-5 border-b ${HAIR} bg-soft`}
          >
            {stages.map((s, i) => {
              const isActive = i === active;
              const tabText = `leading-[1.3] [overflow-wrap:anywhere] ${
                isActive
                  ? "font-semibold text-[color:var(--ink-deep)]"
                  : "font-medium text-[color:var(--ink-muted)]"
              }`;
              return (
                <button
                  key={s.n}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`stage-tab-${s.n}`}
                  aria-selected={isActive}
                  aria-controls={`stage-panel-${s.n}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={[
                    "flex min-w-0 flex-col items-center gap-[7px] border-t-[3px] pb-3 pt-[9px] text-center focus-visible:-outline-offset-4",
                    "min-[1024px]:flex-row min-[1024px]:gap-[12px] min-[1024px]:px-[20px] min-[1024px]:pb-[17px] min-[1024px]:pt-[16px] min-[1024px]:text-left",
                    "min-[1280px]:gap-[8px] min-[1280px]:px-[12px] min-[1376px]:gap-[12px] min-[1376px]:px-[20px]",
                    i < stages.length - 1 ? "border-r border-r-[color:var(--hair)]" : "",
                    isActive
                      ? "relative border-t-blue bg-white after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-white"
                      : "border-t-transparent",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-[32px] w-[32px] flex-none place-items-center rounded-full border font-heading text-[12px] font-semibold leading-none",
                      isActive
                        ? "border-blue bg-blue text-white shadow-[0_10px_20px_-12px] shadow-blue/75"
                        : "border-[color:var(--hair)] bg-white text-[color:var(--ink-muted)]",
                    ].join(" ")}
                  >
                    {s.n}
                  </span>

                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span
                      className={`${tabText} text-[11px] min-[768px]:text-[11.5px] min-[1024px]:hidden`}
                    >
                      {s.short}
                    </span>
                    <span className={`${tabText} hidden font-heading text-[13.5px] min-[1024px]:block`}>
                      {s.name}
                    </span>
                    <span className="hidden text-[12px] italic [line-height:normal] text-[color:var(--ink-muted)] min-[1280px]:block">
                      “{s.question}”
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-9">
            {stages.map((s, i) => (
              <StagePanel key={s.n} stage={s} active={i === active} />
            ))}

            {/* ------------------------------------------------- the footer */}
            <div
              className={`mt-8 flex flex-col gap-6 border-t ${HAIR} pt-[28px] sm:flex-row sm:items-center sm:justify-between sm:gap-[32px]`}
            >
              {/* aria-live: this is the answer to the stage the visitor just
                  chose, so it needs announcing without moving focus. */}
              <div className="max-w-[62ch]" aria-live="polite">
                <div className="font-heading text-[17px] font-semibold leading-[1.35] text-[color:var(--ink-deep)]">
                  {fill(sections.stageNext, { n: stage.n, name: stage.name })}
                </div>
                <p className="mt-[7px] text-[15px] leading-relaxed text-[color:var(--ink-muted)]">
                  {stage.next}
                </p>
              </div>
              <CTA
                tier="primary"
                icon="diagonal"
                href={maturityCurve.cta.href}
                className="shrink-0"
                data-cta="maturity"
              >
                {maturityCurve.cta.label}
              </CTA>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
