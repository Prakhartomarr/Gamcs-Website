"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { maturityCurve } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * The finance maturity curve — five stages as a 01–05 stepper, a detail
 * panel that swaps per stage, and a stage-aware CTA.
 *
 * ALL COPY LIVES IN `maturityCurve` (lib/content/gamcs.ts), not here — this
 * file is markup and interaction only. Stage figures are illustrative and the
 * panel says so wherever a number appears.
 *
 * Two things worth naming, because this section is the odd one out:
 *
 *   1. Section components in this codebase carry no Tailwind utilities; they
 *      compose semantic classes from globals.css. This one is utility-styled
 *      because it must not add global CSS. The section SHELL still uses the
 *      shared primitives (.section / .fin-sec / .container / .fin-eyebrow /
 *      .fin-h2 / .fin-lead / CTA) so the band reads as part of the page; only
 *      the interactive internals are utilities, and every colour, radius and
 *      shadow among them resolves to a token already declared in globals.css.
 *
 *   2. The stage selector is a 01–05 stepper at every width: a 45px row from
 *      768 and 56px below it, so picking one of five costs almost no scroll.
 *      Its two layouts split at 768 (see the tablist) and are the same five
 *      tabs, so there is exactly one tablist, one set of tab ids and one set
 *      of refs.
 *
 * At every width the order is the text, then the stage card at full
 * container width, then the stepper. Only the active stage's card is laid
 * out, so the card hugs its content and a switch changes its height; select()
 * scrolls the page by the difference so the stepper stays under the pointer.
 *
 * Earlier builds' drawn SVG connector, GSAP sweep and card staircase are all
 * gone: the numbers on the rail carry the order, so there is no measured
 * geometry to keep in sync and no animation to tear down.
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
    <div className="flex flex-wrap gap-x-10 gap-y-5 min-[621px]:justify-center">
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
    <div className={`max-w-xl overflow-hidden rounded-[14px] border ${HAIR} text-left min-[621px]:mx-auto`}>
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
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center min-[621px]:items-center min-[621px]:justify-center">
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
 * One stage's card. All five are rendered so each tab's aria-controls has a
 * target; only the active one is laid out, the rest are display:none.
 *
 * Its contents centre from 621px, the width at which the section's
 * .fin-center heading does, so on phones both stay left-aligned together.
 * The stage-04 ladder is the exception: its rows stay left-aligned so the
 * questions and answers line up and scan.
 */
function StagePanel({ stage, active }: { stage: Stage; active: boolean }) {
  return (
    <div
      id={`stage-panel-${stage.n}`}
      role="tabpanel"
      aria-labelledby={`stage-tab-${stage.n}`}
      className={[
        `rounded-[24px] border ${HAIR} bg-white p-6 [box-shadow:var(--shadow-fin)] sm:p-9 min-[621px]:text-center`,
        active ? "" : "hidden",
      ].join(" ")}
    >
      <div className={`${LABEL} text-blue`}>Stage {stage.n}</div>

      <h3 className="mt-2 text-[26px] font-semibold tracking-tight text-[color:var(--ink-deep)] sm:text-[30px]">
        {stage.question}
      </h3>

      {/* The left bar marks the quote while the card reads left to right;
          centred, it would hang off one side, so it goes. */}
      <blockquote className="mt-5 max-w-[62ch] border-l-2 border-blue pl-4 text-[15px] italic leading-relaxed text-[color:var(--ink-muted)] min-[621px]:mx-auto min-[621px]:border-l-0 min-[621px]:pl-0">
        “{stage.quote}”
      </blockquote>

      <div className="mt-6 flex flex-wrap gap-2 min-[621px]:justify-center">
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
  const { stages } = maturityCurve;
  const stage = stages[active];

  /* The card sits above the tabs and hugs its content, so a switch resizes
     it and would move the whole row under the pointer or the focused tab. Note where the row is before the switch and scroll by however
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
        {/* The text, then the stage card under it at full width — the same
            stack at every width, so the card reads as the answer to the
            stepper directly below it. The text is centred with .fin-center,
            like the Solutions and How We Help heads, and so goes left-aligned
            at 620px and below; the card's contents stay left-aligned. */}
        <div className="grid gap-10">
        <div className="fin-center reveal">
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

        <div className="reveal">
          {stages.map((s, i) => (
            <StagePanel key={s.n} stage={s} active={i === active} />
          ))}
        </div>
        </div>

        {/* ----------------------------------------------------- the stepper */}
        {/*
          One tablist, two layouts — the tabs, their ids and the roving
          tabIndex are the same set at every width; only the layout changes.

            ≥768    a flex row of steps: circle, two-line label, and a rail
                    between each pair taking the leftover width.
            <768    five equal grid columns: circle over a centred label, one
                    continuous rail behind the circles.

          The steps carry no gap of their own (the rails and the grid columns
          do the spacing).
        */}
        <div
          role="tablist"
          aria-label="Finance maturity stages"
          onKeyDown={onKeyDown}
          className="relative mt-10 grid grid-cols-5 min-[768px]:flex min-[768px]:items-center"
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
            return (
              <Fragment key={s.n}>
                {/* From 768 the rail sits between two steps and absorbs the
                    slack. A step is 36 + 9 + its label and the five measure
                    548px (stage 02 widest at 118.1px); with 8px of margin a
                    side, each rail is (container − 548 − 64) ÷ 4. Measured:
                    24.9px at 768 (712px container), 38.9px at 899 (768),
                    76.9px at 1024 (920), 142.9px at 1280 (1184), 166.9px at
                    1440 (1280) and 206.9px at 1920 (1440). The row spans the
                    container at every width, as the approved 899px artboard
                    does, so a wide screen lengthens the rails, never the
                    steps. At 768 each rail is 4.9px above its 20px floor, so
                    the floor binds only once the steps grow ~20px between
                    them, and then the row overflows rather than shrinks —
                    which is what the 76px cap and [hyphens:auto] hold off.
                    Hidden below 768, where the absolute rail above draws the
                    line instead. */}
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-[8px] hidden h-px min-w-[20px] flex-1 bg-line min-[768px]:block"
                  />
                )}

                {/* The button is the hit target, not the circle: 34px of
                    circle stacked on a label clears 44px on its own below 768
                    (34 + 9 + a 13px line = 56, in a 70px column), but the row
                    from 768 is one 36px line, so `py-1` — 4.5px at this 18px
                    root — takes it to 45px. `relative` keeps the white
                    circles painting over the absolute rail below 768, which
                    would otherwise draw across them; the radius shapes the
                    focus ring. */}
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
                  className="relative flex flex-col items-center gap-[9px] rounded-[18px] text-center min-[768px]:flex-row min-[768px]:py-1 min-[768px]:text-left"
                >
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
                        the short name. */}
                    <span className="min-[768px]:hidden">{s.short}</span>
                    {/* From 768 the full stage name, a word to a line — both
                        words of every name fit the 76px cap. */}
                    <span className="hidden min-[768px]:flex min-[768px]:flex-col">
                      {s.name.split(" ").map((w) => (
                        <span key={w}>{w}</span>
                      ))}
                    </span>
                  </span>
                </button>
              </Fragment>
            );
          })}
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
