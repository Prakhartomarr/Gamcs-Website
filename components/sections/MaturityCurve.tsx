"use client";

import { useEffect, useRef, useState } from "react";
import { maturityCurve } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { sections } from "@/lib/content/ui";
import { DrillDown, Explain, FileStack, PackAndLag, SignalBoard } from "./MaturityVisuals";

/**
 * The finance maturity curve — a rising rail of five dots, a five-tab bar,
 * the chosen stage's panel, and one call to action for the whole section.
 *
 * ALL COPY LIVES IN `maturityCurve` (lib/content/gamcs.ts), not here — this
 * file is markup and interaction only. Stage figures are illustrative and the
 * panel says so wherever a number appears.
 *
 * Section components in this codebase carry no Tailwind utilities; they
 * compose semantic classes from globals.css. This one is utility-styled
 * because it must not add global CSS. The section SHELL still uses the shared
 * primitives (.section / .fin-sec / .container / .fin-eyebrow / .fin-h2 /
 * .fin-lead) so the band reads as part of the page; only the card is
 * utilities, and every colour, radius and shadow in it resolves to a token
 * already declared in globals.css.
 *
 * Stage 04 opens selected: it is where the curve is going, and it is the
 * stage most visitors are trying to picture.
 *
 *   ≥1280      tabs: number, name and question. Body: two columns.
 *   1024–1279  tabs: number and name. Body: one column.
 *   <1024      tabs: the circle over the short name, scrolled horizontally.
 *              Body: one column. The rail is hidden below 768.
 */

/** 11px/700/.18em — the micro-label used throughout this design system. */
const LABEL = "font-heading text-[11px] font-bold uppercase tracking-[0.18em]";

/** The soft hairline (--hair) as a border colour. */
const HAIR = "border-[color:var(--hair)]";

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

/** The same three figures on every stage, in the same order and the same place. */
function Metrics({ items }: { items: readonly Metric[] }) {
  return (
    <div
      className={`divide-y divide-[color:var(--hair)] rounded-[14px] border ${HAIR} bg-soft px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:divide-y-0 sm:py-3.5`}
    >
      {items.map((m) => (
        /* Reversed on a phone so the label reads first and the figure lands on
           the right; three columns would break "Fragmented" at 298px. */
        <div
          key={m.label}
          className="flex flex-row-reverse items-baseline justify-between gap-3 py-1.5 sm:block sm:min-w-0 sm:py-0"
        >
          <div className="font-heading text-[17px] font-semibold leading-[1.3] tabular-nums tracking-[-0.01em] text-[color:var(--ink-deep)]">
            {m.value}
          </div>
          <div className="text-[12px] leading-[1.35] text-[color:var(--ink-muted)] sm:mt-0.5">
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- the rail */

/**
 * The curve itself: five stages rising left to right, so the eye reads
 * "further along → worth more". The line is one path in a 0–100 box stretched
 * to the strip (non-scaling stroke keeps it a true hairline), and the dots are
 * HTML on top at the same percentages, so they stay perfectly round whatever
 * the strip's aspect ratio.
 *
 * The dots repeat what the tablist below already does, so they are
 * aria-hidden and out of the tab order: a keyboard visitor arrows through the
 * tabs a few pixels below rather than through two identical sets of controls.
 * Hidden below 768, where the strip is too short to read as a curve at all.
 */
const RAIL: readonly { x: number; y: number }[] = [
  { x: 10, y: 84 },
  { x: 30, y: 68 },
  { x: 50, y: 51 },
  { x: 70, y: 32 },
  { x: 90, y: 13 },
];

function CurveRail({
  active,
  onPick,
  stages,
}: {
  active: number;
  onPick: (i: number) => void;
  stages: typeof maturityCurve.stages;
}) {
  const path =
    "M10,84 C17,81 23,72 30,68 S43,57 50,51 S63,39 70,32 S83,19 90,13";
  return (
    <div
      className={`relative hidden h-[108px] border-b ${HAIR} px-5 min-[768px]:block min-[1024px]:h-[126px]`}
    >
      <div className="relative mx-auto h-full max-w-[880px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <path
            d={path}
            fill="none"
            stroke="var(--hair)"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {stages.map((s, i) => {
          const isActive = i === active;
          const deep = i === stages.length - 1;
          return (
            <button
              key={s.n}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => onPick(i)}
              style={{ left: `${RAIL[i].x}%`, top: `${RAIL[i].y}%` }}
              className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center"
            >
              <span
                className={[
                  "block rounded-full border-2 transition-all duration-200 motion-reduce:transition-none",
                  isActive
                    ? `h-[13px] w-[13px] ${deep ? "border-blue-dark bg-blue-dark" : "border-blue bg-blue"}`
                    : "h-[10px] w-[10px] border-[color:var(--line)] bg-white",
                  isActive && i === 3 ? "ring-[5px] ring-blue/15" : "",
                ].join(" ")}
              />
            </button>
          );
        })}

        <span
          aria-hidden="true"
          className="absolute bottom-[6px] left-0 text-[11px] text-[color:var(--ink-muted)]"
        >
          {maturityCurve.axis.start}
        </span>
        <span
          aria-hidden="true"
          className="absolute right-0 top-[4px] text-[11px] text-[color:var(--ink-muted)]"
        >
          {maturityCurve.axis.end}
        </span>
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
 * on the right (6fr) behind a hairline. The panel carries a min-height so
 * switching stages does not move the page under the pointer.
 */
function StagePanel({ stage, active }: { stage: Stage; active: boolean }) {
  return (
    <div
      id={`stage-panel-${stage.n}`}
      role="tabpanel"
      aria-labelledby={`stage-tab-${stage.n}`}
      className={
        active
          ? "min-[1280px]:grid min-[1280px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-[1280px]:grid-rows-[auto_1fr] min-[1280px]:gap-x-[48px]"
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

      {/* The figures span both rows, so the bridge can sit in the space the
          left column leaves rather than adding a band under the card. */}
      <div
        className={`mt-8 ${HAIR} min-[1280px]:col-start-2 min-[1280px]:row-span-2 min-[1280px]:row-start-1 min-[1280px]:mt-0 min-[1280px]:border-l min-[1280px]:pl-[48px]`}
      >
        <Metrics items={stage.metrics} />

        <div className="mt-6">
          {stage.visual === "files" && <FileStack data={stage.files} />}
          {stage.visual === "pack" && <PackAndLag data={stage.pack} />}
          {stage.visual === "drill" && <DrillDown data={stage.drill} active={active} />}
          {stage.visual === "explain" && <Explain data={stage.explain} />}
          {stage.visual === "signals" && <SignalBoard data={stage.board} />}
          {/* Every stage puts a figure on screen; say so under each one. */}
          <p className="mt-4 text-[12px] text-[color:var(--ink-muted)]">
            {maturityCurve.illustrative}
          </p>
        </div>
      </div>

      {/* The bridge to the next stage. aria-live so the answer to the stage
          just chosen is announced without moving focus. */}
      <div
        className={`mt-8 max-w-[62ch] border-t ${HAIR} pt-[22px] min-[1280px]:col-start-1 min-[1280px]:row-start-2 min-[1280px]:self-end min-[1280px]:pb-1`}
        aria-live="polite"
      >
        <div className="font-heading text-[16px] font-semibold leading-[1.35] text-[color:var(--ink-deep)]">
          {fill(sections.stageNext, { n: stage.n, name: stage.name })}
        </div>
        <p className="mt-[6px] text-[14.5px] leading-relaxed text-[color:var(--ink-muted)]">
          {stage.next}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ section */

export default function MaturityCurve() {
  /* Stage 04 — Decision Intelligence — is where the curve is going. */
  const [active, setActive] = useState(3);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { stages } = maturityCurve;
  const stage = stages[active];

  /* A 180ms fade-and-lift on each switch. It starts true so the first paint,
     and any visitor whose JS is slow, sees the panel rather than nothing. */
  const [shown, setShown] = useState(true);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setShown(false);
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
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
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    /* 72px top and bottom from 768, where .section is 108px (or 80px at
       768–1279). .section is a plain globals.css class that comes after the
       utilities, so a bare py-[4rem] would lose; [&.section] raises the
       specificity to 0,2,0. Below 768, .section's own 60px is already
       smaller and stays. */
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
          className={`reveal mt-8 overflow-hidden rounded-[24px] border ${HAIR} bg-white [box-shadow:var(--shadow-fin)]`}
        >
          <CurveRail active={active} onPick={setActive} stages={stages} />

          {/* ------------------------------------------------- the tab bar */}
          {/*
            Five equal columns on --soft from 768, a hairline under the bar and
            between tabs. The active tab turns white with a 3px --blue top
            border, and a 1px white ::after strip covers the bar's hairline
            under it, so it joins the body. Below 768 the row scrolls
            sideways instead of squeezing: five 116px tabs need 580px, more
            than a phone has.
          */}
          <div
            role="tablist"
            aria-label="Finance maturity stages"
            onKeyDown={onKeyDown}
            className={`flex overflow-x-auto border-b ${HAIR} bg-soft [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:grid min-[768px]:grid-cols-5 min-[768px]:overflow-visible`}
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
                    "flex w-[116px] flex-none flex-col items-center gap-[7px] border-t-[3px] pb-3 pt-[9px] text-center focus-visible:-outline-offset-4",
                    "min-[768px]:w-auto min-[768px]:min-w-0",
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

          {/* The min-heights are the tallest stage at each width, measured, so
              the card does not resize under the pointer on a switch. */}
          <div
            className={`p-6 transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none sm:p-9 min-[768px]:min-h-[936px] min-[1280px]:min-h-[588px] ${
              shown ? "translate-y-0 opacity-100" : "translate-y-[6px] opacity-0"
            }`}
          >
            {stages.map((s, i) => (
              <StagePanel key={s.n} stage={s} active={i === active} />
            ))}
          </div>
        </div>

        <p className="reveal mt-3.5 text-center text-[12px] text-[color:var(--ink-muted)]">
          {maturityCurve.caveat}
        </p>

        {/* ------------------------------------- one call to action, at the end */}
        <div className="reveal mx-auto mt-10 max-w-[60ch] text-center">
          <h3 className="font-heading text-[22px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--ink-deep)] sm:text-[24px]">
            {maturityCurve.close.heading}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink-muted)]">
            {maturityCurve.close.body}
          </p>
          <a
            href={maturityCurve.close.href}
            data-cta="maturity"
            className="mt-5 inline-flex items-center gap-1.5 font-heading text-[15px] font-semibold text-blue underline-offset-4 transition-colors hover:text-blue-dark hover:underline"
          >
            {maturityCurve.close.link}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
