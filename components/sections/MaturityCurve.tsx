"use client";

import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { maturityCurve } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * The finance maturity curve — five stages as an ascending staircase, a detail
 * panel that swaps per stage, a comparison grid whose active column lights up,
 * and a stage-aware CTA.
 *
 * ALL COPY LIVES IN `maturityCurve` (lib/content/gamcs.ts), not here — this
 * file is markup and interaction only. Stage figures are illustrative and the
 * panel says so wherever a number appears.
 *
 * Two conventions worth naming, because this section is the odd one out:
 *
 *   1. Section components in this codebase carry no Tailwind utilities; they
 *      compose semantic classes from globals.css. This one is utility-styled
 *      because it must not add global CSS. The section SHELL still uses the
 *      shared primitives (.section / .fin-sec / .container / .fin-eyebrow /
 *      .fin-h2 / .fin-lead / CTA) so the band reads as part of the page; only
 *      the interactive internals are utilities, and every colour, radius and
 *      shadow among them resolves to a token already declared in globals.css.
 *
 *   2. 900px, not a Tailwind breakpoint, is where the staircase unstacks —
 *      it is the width this section has always broken at, and `min-[900px]:`
 *      spells it without touching tailwind.config. Below 900 the same five
 *      tabs render as a 01–05 stepper instead of cards: the stacked cards
 *      measured 837px tall at both 390 and 899, which is a whole screen of
 *      scroll for a control that picks one of five. Both faces live inside
 *      the one tab button and swap with CSS, so there is still exactly one
 *      tablist, one set of tab ids and one set of refs.
 *
 * From 1400px the stage card sits beside the heading instead of under the
 * staircase. Every stage's card is rendered into one grid cell; there the
 * inactive ones stay in flow but invisible, so the cell keeps the tallest
 * card's height and the stage cards below never move under the pointer when
 * the stage changes. 1400, not 1280: beside the heading the card only has the
 * ~520px the stage-05 signal row needs from about there (a scrollbar
 * included); narrower, that row stacks and the tallest card doubles. Below
 * 1400px the card sits under the paragraph, only the active one is laid out,
 * and it hugs its content.
 *
 * The previous build's drawn SVG connector and GSAP sweep are gone with it:
 * the climb is now carried by the card heights themselves, so there is no
 * measured geometry to keep in sync and no animation to tear down.
 */

/** 11px/700/.18em Sora — the micro-label used throughout this design system. */
const LABEL = "font-heading text-[11px] font-bold uppercase tracking-[0.18em]";

/** Soft hairline (--hair) and the harder one (--hair-2), as border utilities. */
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
          <div className="font-heading text-[19px] font-semibold tabular-nums tracking-tight text-[color:var(--ink-deep)]">
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
          <div className="mt-1 font-heading text-[18px] font-semibold tabular-nums text-[color:var(--ink-deep)]">
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
    <div aria-hidden="true" className="hidden text-[color:var(--ink-muted)] sm:block">
      &rarr;
    </div>
  );
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
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

      <div className="rounded-[14px] bg-blue-dark px-5 py-4 text-center font-heading text-[13px] font-semibold leading-snug text-white [box-shadow:var(--shadow-fin)]">
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
              className={`h-2 w-2 rounded-full ${TONE[o.tone] ?? "bg-blue"}`}
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
 * One stage's card. All five are rendered into the same grid cell: the active
 * one shows; the rest are display:none below 1400px, and from 1400px stay in
 * flow but invisible so the cell keeps the tallest card's height.
 */
function StagePanel({ stage, active }: { stage: Stage; active: boolean }) {
  return (
    <div
      id={`stage-panel-${stage.n}`}
      role="tabpanel"
      aria-labelledby={`stage-tab-${stage.n}`}
      className={[
        `rounded-[24px] border ${HAIR} bg-white p-6 [box-shadow:var(--shadow-fin)] [grid-area:1/1] sm:p-9 min-[1400px]:self-end`,
        active ? "" : "hidden min-[1400px]:invisible min-[1400px]:block",
      ].join(" ")}
    >
      <div className={`${LABEL} text-blue`}>Stage {stage.n}</div>

      <h3 className="mt-2 text-[26px] font-semibold tracking-tight text-[color:var(--ink-deep)] sm:text-[30px]">
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

      <div className="mt-8 space-y-7">
        <Metrics items={stage.metrics} />
        {stage.visual === "dashboard" && <DashboardMock tiles={stage.tiles} />}
        {stage.visual === "ladder" && <Ladder rows={stage.ladder} />}
        {stage.visual === "signals" && (
          <SignalFlow
            signals={stage.signals}
            outputs={stage.outputs}
            engine={maturityCurve.engineName}
          />
        )}
      </div>

      {/* Every stage from 03 up puts a figure on screen; say so. */}
      {stage.visual !== "metrics" && (
        <p className="mt-6 text-[12px] text-[color:var(--ink-muted)]">
          {maturityCurve.illustrative}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ section */

export default function MaturityCurve() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { stages, tableRows } = maturityCurve;
  const stage = stages[active];

  /* Below 1400px the card sits above the tabs and hugs its content, so a
     switch resizes it and would move the whole row under the pointer or the
     focused tab. Note where the row is before the switch and scroll by however
     far it moved. Scroll anchoring can't be relied on for this: its anchor is
     often inside the panel that just got hidden, and Safari has none. */
  const rowTop = useRef<number | null>(null);
  const select = (i: number) => {
    rowTop.current = tabRefs.current[i]?.parentElement?.getBoundingClientRect().top ?? null;
    setActive(i);
  };
  useLayoutEffect(() => {
    const before = rowTop.current;
    rowTop.current = null;
    const row = tabRefs.current[active]?.parentElement;
    if (before === null || !row) return;
    const moved = row.getBoundingClientRect().top - before;
    /* instant: html's scroll-behavior:smooth would otherwise animate it */
    if (moved) window.scrollBy({ top: moved, behavior: "instant" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = stages.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(active + 1, last);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(active - 1, 0);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="section fin-sec" id="maturity-curve">
      <div className="container">
        {/* The heading beside the stage card from 1400px, the card under the
            paragraph below that. items-end rests both on the line above the
            stage cards, so the card reads as theirs. */}
        <div className="grid gap-10 min-[1400px]:grid-cols-2 min-[1400px]:items-end min-[1400px]:gap-14">
        <div className="reveal">
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
          <p className={`${LABEL} mt-7 text-[color:var(--ink-muted)]`}>{maturityCurve.hint}</p>
        </div>

        <div className="reveal grid">
          {stages.map((s, i) => (
            <StagePanel key={s.n} stage={s} active={i === active} />
          ))}
        </div>
        </div>

        {/* ------------------------------------------------------- the curve */}
        {/*
          One tablist, three layouts — the tabs, their ids and the roving
          tabIndex are the same set at every width; only the face changes.

            ≥900    the staircase. Bottoms align and each card is taller than
                    the last, so the run reads as a climb without anything
                    being drawn: `items-end` plus a per-card --h.
            768–899 a flex row of steps: circle, two-line label, and a rail
                    between each pair taking the leftover width.
            <768    five equal grid columns: circle over a centred label, one
                    continuous rail behind the circles.

          The steps carry no gap of their own below 900 (the rails and the
          grid columns do the spacing), so `gap-3` is scoped to ≥900.
        */}
        <div
          role="tablist"
          aria-label="Finance maturity stages"
          onKeyDown={onKeyDown}
          className="relative mt-10 grid grid-cols-5 min-[768px]:flex min-[768px]:items-center min-[900px]:mt-14 min-[900px]:items-end min-[900px]:gap-3"
        >
          {/* Below 768 a single rail runs behind all five circles at their
              centre — top 17px is half the 34px circle — inset half a column
              (10% of five columns) at each end so it starts and stops under
              the outer circles instead of running to the container edge. */}
          <span
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-[17px] h-px bg-line min-[768px]:hidden"
          />

          {stages.map((s, i) => {
            const isActive = i === active;
            /* later stages sit deeper in brand blue */
            const tint = 0.05 + i * 0.035 + (isActive ? 0.06 : 0);
            return (
              <Fragment key={s.n}>
                {/* 768–899 the rail sits between two steps and absorbs the
                    slack: a step is 36 + 9 + its label, and the widest step is
                    stage 02 at 118.1px, so the five measure 548px of the 712px
                    container at 768px wide (768 − 56) and the four rails split
                    the remaining 164px — 24.9px each plus 8px of margin a side,
                    4.9px above their 20px floor. Wider they grow until the
                    container caps at 768px, so 38.9px from about 824 up.
                    The floor binds only if a label gains ~4px,
                    and then the row overflows rather than shrinks — which is
                    what the 76px cap and [hyphens:auto] hold off.
                    Hidden below 768, where the absolute rail above draws the
                    line instead, and above 899, where the cards take over. */}
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-[8px] hidden h-px min-w-[20px] flex-1 bg-line min-[768px]:block min-[900px]:hidden"
                  />
                )}

                <button
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`stage-tab-${s.n}`}
                  aria-selected={isActive}
                  aria-controls={`stage-panel-${s.n}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => select(i)}
                  style={{ "--h": `${186 + i * 28}px` } as CSSProperties}
                  className={[
                    "group relative rounded-[18px] text-left",
                    /* --dur-panel is the site's 260ms token, set as an arbitrary
                       property: an arbitrary duration-* value is ambiguous under
                       tailwindcss-animate (it claims duration-* too), so Tailwind
                       emitted nothing and the cards ran at the 150ms default. */
                    "transition-[border-color,box-shadow,transform] ease-reel [transition-duration:var(--dur-panel)]",
                    /* Every card utility is scoped to ≥900. Below that the tab
                       is the step face alone: no border, no padding, no card
                       background, and overflow left visible so the active
                       circle's glow is not clipped. `flex-1` in particular has
                       to stay off between 768 and 899 — a growing step would
                       eat the width the rails are there to take. */
                    "min-[900px]:h-[var(--h)] min-[900px]:flex-1 min-[900px]:overflow-hidden min-[900px]:border min-[900px]:bg-white min-[900px]:p-5",
                    /* an arbitrary box-shadow property, not the shadow utility:
                       given a bare var() that utility is read as a shadow colour,
                       so no shadow was drawn at all */
                    isActive
                      ? "min-[900px]:border-blue min-[900px]:[box-shadow:var(--shadow-fin)]"
                      : "min-[900px]:border-[color:var(--hair)] min-[900px]:hover:border-blue/40 min-[900px]:hover:-translate-y-1 min-[900px]:hover:[box-shadow:var(--shadow-fin)]",
                  ].join(" ")}
                >
                  {/* pinstripes, fading downward */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 hidden min-[900px]:block"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to right, var(--hair) 0 1px, transparent 1px 26px)",
                      maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 78%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 78%)",
                    }}
                  />
                  {/* brand wash, deepening up the curve */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/3 min-[900px]:block"
                    style={{
                      background: `linear-gradient(to top, rgba(15,94,151,${tint}), transparent)`,
                    }}
                  />

                  {/* ------------------------------------------ step face */}
                  {/* The hit target is this span, not the circle: 34px of
                      circle stacked on a label clears 44px on its own below
                      768 (34 + 9 + a 13px line = 56, in a 70px column), but
                      the 768–899 row is one 36px line, so `py-1` — 4.5px at
                      this 18px root — takes it to 45px. The padding sits on
                      the face rather than the button so it cannot collide
                      with the card's `p-5` in the ≥900 cascade. */}
                  <span className="flex flex-col items-center gap-[9px] text-center min-[768px]:flex-row min-[768px]:py-1 min-[768px]:text-left min-[900px]:hidden">
                    <span
                      className={[
                        "grid h-[34px] w-[34px] flex-none place-items-center rounded-full border font-heading text-[12px] font-semibold leading-none tracking-[0.02em]",
                        "min-[768px]:h-[36px] min-[768px]:w-[36px] min-[768px]:text-[12.5px]",
                        isActive
                          ? "border-blue bg-blue text-white shadow-[0_10px_20px_-12px] shadow-blue/75"
                          : "border-[color:var(--hair)] bg-white text-[color:var(--ink-muted)]",
                      ].join(" ")}
                    >
                      {s.n}
                    </span>

                    <span
                      className={[
                        /* hyphens + overflow-wrap are the guard for a label
                           that outgrows its column; text-wrap:balance is not,
                           every step label is a single word. */
                        "text-[10px] leading-[1.3] [hyphens:auto] [overflow-wrap:break-word]",
                        "min-[768px]:max-w-[76px] min-[768px]:text-[11.5px] min-[768px]:leading-[1.35]",
                        isActive
                          ? "font-bold text-[color:var(--ink-deep)]"
                          : "font-medium text-[color:var(--ink-muted)]",
                      ].join(" ")}
                    >
                      {/* A column is ~70px at 354px, so below 768 the label is
                          the short name. Stage 04 overrides it: `short` is
                          "Decision intel." for the comparison grid, which is
                          three lines here. */}
                      <span className="min-[768px]:hidden">
                        {"stepLabel" in s ? s.stepLabel : s.short}
                      </span>
                      {/* From 768 the full stage name, a word to a line — both
                          words of every name fit the 76px cap. */}
                      <span className="hidden min-[768px]:flex min-[768px]:flex-col">
                        {s.name.split(" ").map((w) => (
                          <span key={w}>{w}</span>
                        ))}
                      </span>
                    </span>
                  </span>

                  {/* ------------------------------------------ card face */}
                  <span className="relative hidden h-full flex-col min-[900px]:flex">
                    <span
                      className={`${LABEL} ${isActive ? "text-blue" : "text-[color:var(--ink-muted)]"}`}
                    >
                      Stage {s.n}
                    </span>
                    <span className="mt-3 block font-heading text-[17px] font-semibold leading-snug text-[color:var(--ink-deep)]">
                      {s.name}
                    </span>
                    <span className="mt-1.5 block text-[13px] italic text-[color:var(--ink-muted)]">
                      {s.teaser}
                    </span>

                    <span className="mt-auto block pt-6">
                      <span className="block h-[3px] w-full rounded-full bg-soft">
                        <span
                          className="block h-full rounded-full bg-blue transition-[width] duration-500 ease-reel"
                          style={{ width: `${((i + 1) / stages.length) * 100}%` }}
                        />
                      </span>
                    </span>
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>

        {/* ------------------------------------------------------ comparison */}
        <p className={`${LABEL} mt-16 text-[color:var(--ink-muted)]`}>
          {maturityCurve.comparisonLabel}
        </p>

        {/* The scroller is the bounded box, not the page: min-w on the table
            keeps the columns readable and the overflow stays in here. */}
        <div className={`mt-4 overflow-x-auto rounded-[18px] border ${HAIR} bg-white`}>
          <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
            <thead>
              <tr>
                <th scope="col" className={`${LABEL} bg-soft px-5 py-4 text-[color:var(--ink-muted)]`}>
                  Dimension
                </th>
                {stages.map((s, i) => (
                  <th
                    key={s.n}
                    scope="col"
                    aria-current={i === active ? "true" : undefined}
                    className={`${LABEL} px-5 py-4 transition-colors ${
                      i === active ? "bg-blue/10 text-blue" : "bg-soft text-[color:var(--ink-muted)]"
                    }`}
                  >
                    {s.n} {s.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.dimension} className={`border-t ${HAIR}`}>
                  <th
                    scope="row"
                    className="px-5 py-4 font-heading text-[14px] font-semibold text-[color:var(--ink-deep)]"
                  >
                    {row.dimension}
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className={`px-5 py-4 transition-colors ${
                        i === active
                          ? "bg-blue/[0.05] font-medium text-[color:var(--ink-deep)]"
                          : "text-[color:var(--ink-muted)]"
                      }`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------ CTA */}
        <div
          className={`mt-10 flex flex-col gap-6 rounded-[24px] border ${HAIR} bg-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8`}
        >
          {/* aria-live: this is the answer to the stage the visitor just
              chose, so it needs announcing without moving focus. */}
          <div className="max-w-[62ch]" aria-live="polite">
            <div className="font-heading text-[17px] font-semibold text-[color:var(--ink-deep)]">
              If you’re at Stage {stage.n} — {stage.name}
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[color:var(--ink-muted)]">
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
    </section>
  );
}
