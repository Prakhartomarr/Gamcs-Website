"use client";

import { useEffect, useRef, useState } from "react";
import { maturityCurve } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
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

/**
 * The curve band, in pixels, and where each stage sits inside it.
 *
 * The two clearances the band is built around are the sky above the highest
 * dot and the air between the lowest dot and the tab strip — both measured to
 * the dot's edge, which is why the centres sit further in than the clearance
 * itself. The 70px of rise between them is spent gently from 01 to 03 and
 * steeply from 03 to 05. The
 * percentages are derived, so moving BAND or the clearances moves the curve
 * with them.
 */
const BAND = 160;
const TOP = 58;
const FOOT = 32;
const SHAPE = [0, 0.1, 0.29, 0.63, 1];
const RISE = SHAPE.map((f) => ((BAND - FOOT - f * (BAND - FOOT - TOP)) / BAND) * 100);

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
  /* The strip is five equal columns across the card, so stage i's centre is
     (i + ½)/5 of it — which is where its dot goes. Read off the layout rather
     than measured, so it holds at every width and a sixth stage would need no
     new arithmetic. */
  const pts = stages.map((_, i) => ({ x: ((i + 0.5) / stages.length) * 100, y: RISE[i] }));
  const path = curveThrough(pts);
  const accent = ACCENT[active];

  /* Below 768 the strip scrolls sideways; keep the chosen tab in view. */
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = strip.current;
    const tab = tabRefs.current[active];
    if (!box || !tab || box.scrollWidth <= box.clientWidth) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({
      left: tab.offsetLeft - (box.clientWidth - tab.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [active, tabRefs]);

  return (
    <div>
      {/* ------------------------------------------------------- the curve */}
      <div className="relative hidden h-[160px] min-[768px]:block">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
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

        {/* The same path again, in the stage's accent, clipped to end under the
            chosen dot. A dash would have been simpler, but a dash pattern is
            measured in screen pixels once the stroke stops scaling, so it
            repeated along the path instead of stopping once. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ clipPath: `inset(0 ${(100 - pts[active].x).toFixed(2)}% 0 0)` }}
          className="pointer-events-none absolute inset-0 h-full w-full [transition:clip-path_300ms_var(--ease-out)] motion-reduce:transition-none"
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

        {stages.map((s, i) => {
          const isActive = i === active;
          const done = i < active;
          return (
            <div key={s.n}>
              {/* the tick that ties the dot to its tab */}
              <span
                aria-hidden="true"
                style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
                className={`absolute bottom-0 w-px border-l border-dotted ${
                  isActive ? "border-blue/40" : "border-[color:var(--line)]"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                onClick={() => onPick(i)}
                style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
                className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center"
              >
                <span
                  style={
                    isActive
                      ? { borderColor: accent, backgroundColor: accent }
                      : done
                        ? { borderColor: accent }
                        : undefined
                  }
                  className={[
                    "block rounded-full border-2 bg-white transition-all duration-200 motion-reduce:transition-none",
                    isActive
                      ? "h-[15px] w-[15px] ring-[6px] ring-blue/15"
                      : "h-[11px] w-[11px]",
                    isActive || done ? "" : "border-[color:var(--line)]",
                  ].join(" ")}
                />
              </button>
            </div>
          );
        })}

        {/* the two ends, over the dots they belong to: beside them would be
            clipped by the card's edge under 1280 */}
        <span
          aria-hidden="true"
          style={{ left: `${pts[0].x}%`, top: `${pts[0].y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap ${T.caption} text-[color:var(--ink-muted)]`}
        >
          {maturityCurve.axis.start}
        </span>
        <span
          aria-hidden="true"
          style={{ left: `${pts[pts.length - 1].x}%`, top: `${pts[pts.length - 1].y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap ${T.caption} text-[color:var(--ink-muted)]`}
        >
          {maturityCurve.axis.end}
        </span>
      </div>

      {/* --------------------------------------------------- the tab strip */}
      {/*
        Five equal columns on --soft from 768, a hairline under the row and
        between tabs. The active tab turns white with a 3px accent bar on its
        top edge, and a 1px white strip covers the row's hairline under it, so
        it joins the panel below rather than sitting in a box of its own.
        Below 768 the row scrolls sideways instead of squeezing: five tabs wide
        enough to carry a name and a question need more than a phone has.
      */}
      <div
        ref={strip}
        role="tablist"
        aria-label="Finance maturity stages"
        onKeyDown={onKeyDown}
        className={`flex overflow-x-auto border-y ${BORDER} bg-soft [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[768px]:grid min-[768px]:grid-cols-5 min-[768px]:overflow-visible`}
      >
        {stages.map((s, i) => {
          const isActive = i === active;
          const done = i < active;
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
              className={[
                "group flex w-[186px] flex-none items-center gap-3 border-t-[3px] px-4 py-3 text-left transition-colors duration-150 focus-visible:-outline-offset-4",
                "min-[768px]:w-auto min-[768px]:min-w-0 min-[768px]:gap-2.5 min-[768px]:px-3 min-[1280px]:gap-3 min-[1280px]:px-4",
                i < stages.length - 1 ? "border-r border-r-[color:var(--hair)]" : "",
                isActive
                  ? "relative bg-white after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-white"
                  : "border-t-transparent hover:bg-white/60",
              ].join(" ")}
              style={isActive ? { borderTopColor: accent } : undefined}
            >
              <span
                style={
                  isActive
                    ? { borderColor: accent, backgroundColor: accent }
                    : done
                      ? { borderColor: ACCENT[i], color: ACCENT[i] }
                      : undefined
                }
                className={[
                  "grid h-[32px] w-[32px] flex-none place-items-center rounded-full border font-heading text-[12px] font-semibold leading-none transition-colors duration-150",
                  isActive
                    ? "text-white"
                    : done
                      ? "bg-white"
                      : "border-[color:var(--hair)] bg-white text-[color:var(--ink-muted)]",
                ].join(" ")}
              >
                {s.n}
              </span>

              <span className="flex min-w-0 flex-col gap-[2px]">
                {/* 768–1023 leaves a tab about 100px of text beside its
                    circle, which broke "Management" mid-word; the short name
                    is what that width can hold. */}
                <span
                  className={`font-heading ${T.label} leading-[1.3] transition-colors duration-150 ${
                    isActive
                      ? "font-bold text-[color:var(--ink-deep)]"
                      : "font-semibold text-[color:var(--ink-muted)] group-hover:text-[color:var(--ink-deep)]"
                  }`}
                >
                  <span className="min-[768px]:hidden min-[1024px]:inline">{s.name}</span>
                  <span className="hidden min-[768px]:inline min-[1024px]:hidden">{s.short}</span>
                </span>
                <span
                  className={`${T.caption} italic text-[color:var(--ink-muted)] min-[768px]:hidden min-[1024px]:block`}
                >
                  “{s.question}”
                </span>
              </span>
            </button>
          );
        })}
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
        <div
          style={{ color: accent }}
          className="font-heading text-[11px] font-bold uppercase tracking-[0.18em]"
        >
          {fill(maturityCurve.stageLabel, { n: stage.n })}
        </div>

        <h3
          className={`mt-2 font-medium text-[color:var(--ink-deep)] ${T.headline}`}
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
            className={`border-b ${BORDER} bg-white px-6 py-2.5 text-center ${T.label} text-[color:var(--ink-muted)]`}
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
