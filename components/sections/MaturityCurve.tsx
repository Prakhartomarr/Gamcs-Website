"use client";

import { useEffect, useRef, useState } from "react";
import { maturityCurve } from "@/lib/content/gamcs";
import { DrillDown, Explain, FileStack, PackAndLag, SignalBoard } from "./MaturityVisuals";
import { ACCENT, BORDER, RADIUS, T } from "./MaturityVisuals";

/**
 * The finance maturity curve: one navigation device — a rising curve whose
 * five points ARE the tabs — and the chosen stage's panel beneath it.
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
 * already declared in globals.css, or to the per-stage accent in
 * ./MaturityVisuals.
 *
 * Stage 04 opens selected: it is where the curve is going, and the stage most
 * visitors are trying to picture.
 *
 *   ≥768   the curve. Each stage's dot sits at (i + ½)/5 of the bar — the
 *          centre of its own label — with the label directly beneath it, and
 *          the whole column is the tab.
 *   <768   the curve cannot hold five labels, so it collapses to a row of
 *          five numbered steps on one line, and only the chosen stage's name
 *          and question print, once, beneath the row.
 */

/** How high each stage sits in the curve band, 0 at the top. Accelerating. */
const RISE = [88, 80, 66, 40, 8];

/** Catmull-Rom through the points, as one cubic path. */
function curveThrough(pts: readonly { x: number; y: number }[]) {
  const d = [`M${pts[0].x},${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d.push(
      `C${c1.x.toFixed(2)},${c1.y.toFixed(2)} ${c2.x.toFixed(2)},${c2.y.toFixed(2)} ${p2.x},${p2.y}`,
    );
  }
  return d.join(" ");
}

/* ------------------------------------------------------------ small pieces */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full border ${BORDER} bg-white px-3 py-1.5 ${T.label} font-medium text-[color:var(--ink-muted)]`}
    >
      {children}
    </span>
  );
}

type Metric = { value: string; label: string };

/**
 * The stage's own profile — the same three figures on every stage, in the same
 * order. It sits with the stage's words on the left, not with the worked
 * example on the right: it describes the visitor's finance function, not the
 * illustration. A rule above it, no box: it is a footnote to the chips. The
 * figures take the stage's accent, so the row deepens as the curve rises.
 */
function Metrics({ items, accent }: { items: readonly Metric[]; accent: string }) {
  return (
    <div className={`mt-6 grid grid-cols-3 gap-x-3 border-t ${BORDER} pt-4 sm:gap-x-5`}>
      {items.map((m) => (
        <div key={m.label} className="min-w-0">
          <div
            style={{ color: accent }}
            className={`font-heading ${T.value} tracking-[-0.01em] max-[419px]:text-[14px]`}
          >
            {m.value}
          </div>
          <div className={`mt-0.5 ${T.caption} text-[color:var(--ink-muted)]`}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- the navigation */

function StageNav({
  active,
  onPick,
  onKeyDown,
  tabRefs,
  stages,
}: {
  active: number;
  onPick: (i: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  tabRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  stages: typeof maturityCurve.stages;
}) {
  const pts = stages.map((_, i) => ({ x: ((i + 0.5) / stages.length) * 100, y: RISE[i] }));
  const path = curveThrough(pts);
  const accent = ACCENT[active];

  return (
    <div
      role="tablist"
      aria-label="Finance maturity stages"
      onKeyDown={onKeyDown}
      className="relative [--curve-h:96px] min-[1024px]:[--curve-h:104px]"
    >
      {/* the spine: grey the whole way, blue as far as the chosen stage */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[var(--curve-h)] w-full min-[768px]:block"
      >
        <path
          d={path}
          fill="none"
          stroke="var(--line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* …and the same path again, in the stage's accent, clipped to end under
          the chosen dot. A dash would have been simpler, but a dash pattern is
          measured in screen pixels once the stroke stops scaling, so it
          repeated along the path instead of stopping once. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ clipPath: `inset(0 ${(100 - pts[active].x).toFixed(2)}% 0 0)` }}
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[var(--curve-h)] w-full [transition:clip-path_300ms_var(--ease-out)] motion-reduce:transition-none min-[768px]:block"
      >
        <path
          d={path}
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* …and on a phone, one line through five steps */}
      <div
        aria-hidden="true"
        className="absolute left-[10%] right-[10%] top-[21px] h-[2px] rounded bg-[color:var(--line)] min-[768px]:hidden"
      >
        <span
          style={{ width: `${(active / (stages.length - 1)) * 100}%`, backgroundColor: accent }}
          className="absolute inset-y-0 left-0 block rounded [transition:width_300ms_var(--ease-out)] motion-reduce:transition-none"
        />
      </div>

      <div className="grid grid-cols-5">
        {stages.map((s, i) => {
          const isActive = i === active;
          const a = ACCENT[i];
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
              onClick={() => onPick(i)}
              style={{ ["--rise" as string]: RISE[i] }}
              className="group relative flex flex-col items-center px-1.5 pb-1 pt-[44px] text-center focus-visible:outline-offset-2 min-[768px]:px-3 min-[768px]:pb-4 min-[768px]:pt-[calc(var(--curve-h)+10px)]"
            >
              {/* the step, on a phone */}
              <span
                aria-hidden="true"
                style={isActive ? { borderColor: a, backgroundColor: a } : undefined}
                className={`absolute top-[10px] grid h-[24px] w-[24px] place-items-center rounded-full border-2 font-heading text-[11px] font-semibold leading-none min-[768px]:hidden ${
                  isActive
                    ? "text-white"
                    : `border-[color:var(--line)] bg-white text-[color:var(--ink-muted)]`
                }`}
              >
                {s.n}
              </span>

              {/* …and the point on the curve, above it */}
              <span
                aria-hidden="true"
                style={isActive ? { borderColor: a, backgroundColor: a } : undefined}
                className={`absolute hidden -translate-y-1/2 rounded-full border-2 transition-all duration-200 motion-reduce:transition-none min-[768px]:block min-[768px]:top-[calc(var(--curve-h)*var(--rise)/100)] ${
                  isActive ? "h-[14px] w-[14px]" : "h-[11px] w-[11px] border-[color:var(--line)] bg-white group-hover:border-[color:var(--ink-muted)]"
                }`}
              />

              <span className="sr-only min-[768px]:hidden">
                {s.name} — {s.question}
              </span>

              <span className="hidden min-w-0 flex-col items-center gap-[3px] min-[768px]:flex">
                <span
                  style={isActive ? { color: a } : undefined}
                  className={`font-heading ${T.caption} font-semibold tabular-nums ${
                    isActive ? "" : "text-[color:var(--ink-muted)]"
                  }`}
                >
                  {s.n}
                </span>
                <span
                  className={`font-heading ${T.label} leading-[1.3] [overflow-wrap:anywhere] ${
                    isActive
                      ? "font-semibold text-[color:var(--ink-deep)]"
                      : "font-medium text-[color:var(--ink-muted)]"
                  }`}
                >
                  {s.name}
                </span>
                <span className={`${T.caption} italic text-[color:var(--ink-muted)]`}>
                  “{s.question}”
                </span>
                <span
                  aria-hidden="true"
                  style={isActive ? { backgroundColor: a } : undefined}
                  className={`mt-1 block h-[2px] w-7 rounded ${isActive ? "" : "bg-transparent"}`}
                />
              </span>
            </button>
          );
        })}
      </div>

      {/* the chosen stage, said once, under the row of steps */}
      <div className="px-4 pb-1 text-center min-[768px]:hidden">
        <div className={`font-heading ${T.label} font-semibold text-[color:var(--ink-deep)]`}>
          {stages[active].name}
        </div>
        <div className={`${T.caption} italic text-[color:var(--ink-muted)]`}>
          “{stages[active].question}”
        </div>
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
 * From 1280 it splits: the stage's own words and profile on the left (5fr),
 * the worked example on the right (6fr) behind a hairline. The bridge to the
 * next stage sits under the left column, in the space it leaves.
 */
function StagePanel({ stage, active, index }: { stage: Stage; active: boolean; index: number }) {
  const accent = ACCENT[index];
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
        <h3
          className={`font-medium text-[color:var(--ink-deep)] ${T.headline}`}
        >
          {stage.question}
        </h3>

        <blockquote
          style={{ borderColor: accent }}
          className={`mt-5 max-w-[62ch] border-l-2 pl-4 ${T.quote} text-[color:var(--ink-muted)]`}
        >
          “{stage.quote}”
        </blockquote>

        <div className="mt-6 flex flex-wrap gap-2">
          {stage.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>

        <Metrics items={stage.metrics} accent={accent} />
      </div>

      {/* The example spans both rows, so the bridge can sit in the space the
          left column leaves rather than adding a band under the card. */}
      <div
        className={`mt-8 ${BORDER} min-[1280px]:col-start-2 min-[1280px]:row-span-2 min-[1280px]:row-start-1 min-[1280px]:mt-0 min-[1280px]:border-l min-[1280px]:pl-[48px]`}
      >
        <div className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">
          {maturityCurve.labels.example}
        </div>

        <div className="mt-4">
          {stage.visual === "files" && <FileStack data={stage.files} />}
          {stage.visual === "pack" && <PackAndLag data={stage.pack} />}
          {stage.visual === "drill" && (
            <DrillDown data={stage.drill} active={active} accent={accent} />
          )}
          {stage.visual === "explain" && <Explain data={stage.explain} accent={accent} />}
          {stage.visual === "signals" && <SignalBoard data={stage.board} accent={accent} />}
          {/* Every stage puts a figure on screen; say so under each one. */}
          <p className={`mt-4 ${T.caption} text-[color:var(--ink-muted)]`}>
            {maturityCurve.illustrative}
          </p>
        </div>
      </div>

      {/* The bridge to the next stage. aria-live so the answer to the stage
          just chosen is announced without moving focus. */}
      <div
        className={`mt-8 max-w-[62ch] border-t ${BORDER} pt-[22px] min-[1280px]:col-start-1 min-[1280px]:row-start-2 min-[1280px]:mt-7 min-[1280px]:self-start`}
        aria-live="polite"
      >
        <div className={`font-heading ${T.label} font-semibold text-[color:var(--ink-deep)]`}>
          {maturityCurve.nextHeading}
        </div>
        <p className={`mt-[6px] ${T.body} text-[color:var(--ink-muted)]`}>{stage.next}</p>
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

  /* The card is as tall as the stage on show. Undefined until the observer
     reports, so the first paint — and a visitor whose JS never arrives — gets
     the natural height rather than a collapsed box. */
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setBodyHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
       smaller and stays. The scroll margin keeps the eyebrow clear of the
       floating header when something jumps to #maturity-curve. */
    <section
      className="section fin-sec scroll-mt-[calc(var(--header-h)+16px)] min-[768px]:[&.section]:py-[4rem]"
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
          <p className={`mt-6 ${T.label} font-semibold text-[color:var(--ink-muted)]`}>
            {maturityCurve.hint}
          </p>
        </div>

        <div
          className={`reveal mt-8 overflow-hidden ${RADIUS} border ${BORDER} bg-white [box-shadow:var(--shadow-fin)]`}
        >
          <StageNav
            active={active}
            onPick={setActive}
            onKeyDown={onKeyDown}
            tabRefs={tabRefs}
            stages={stages}
          />

          {/* The five stages are one company at five different ages, which the
              navigation alone does not say. */}
          <p
            className={`border-y ${BORDER} bg-white px-6 py-2.5 text-center ${T.label} text-[color:var(--ink-muted)]`}
          >
            {maturityCurve.narrative}
          </p>

          {/* The stages differ by more than 80px, so the card takes the height
              of the one on show and animates between them, rather than
              standing at the tallest and leaving the short ones in a field of
              white. The height comes from a ResizeObserver, not a guess, so
              stage 03 growing as it plays itself through is followed too. */}
          <div
            style={bodyHeight ? { height: bodyHeight } : undefined}
            className="overflow-hidden [transition:height_200ms_var(--ease-out)] motion-reduce:transition-none"
          >
            <div
              ref={bodyRef}
              className={`p-6 transition-[opacity,transform] [transition-duration:180ms] ease-out motion-reduce:transition-none sm:p-9 ${
                shown ? "translate-y-0 opacity-100" : "translate-y-[6px] opacity-0"
              }`}
            >
              {stages.map((s, i) => (
                <StagePanel key={s.n} stage={s} active={i === active} index={i} />
              ))}
            </div>
          </div>
        </div>

        <p className={`reveal mt-3.5 text-center ${T.caption} text-[color:var(--ink-muted)]`}>
          {maturityCurve.caveat}
        </p>

        {/* ------------------------------------- one call to action, at the end */}
        <div className="reveal mx-auto mt-10 max-w-[60ch] text-center">
          <h3 className="font-heading text-[22px] font-semibold leading-[1.3] tracking-[-0.01em] text-[color:var(--ink-deep)] sm:text-[24px]">
            {maturityCurve.close.heading}
          </h3>
          <p className={`mt-3 ${T.body} text-[color:var(--ink-muted)]`}>
            {maturityCurve.close.body}
          </p>
          <a
            href={maturityCurve.close.href}
            data-cta="maturity"
            className={`mt-5 inline-flex items-center gap-1.5 font-heading ${T.quote} font-semibold not-italic text-blue underline-offset-4 transition-colors hover:text-blue-dark hover:underline`}
          >
            {maturityCurve.close.link}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
