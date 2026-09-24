"use client";

import { useEffect, useRef, useState } from "react";
import { maturityCurve } from "@/lib/content/gamcs";

/**
 * The five figures in the maturity curve's stage panels — one per stage.
 *
 * ALL COPY AND EVERY NUMBER LIVES IN `maturityCurve` (lib/content/gamcs.ts).
 * These are markup and interaction only, and every one is HTML/CSS/SVG: no
 * images, nothing to load, and they reflow with the column they sit in.
 *
 * Like the section they belong to, they are utility-styled rather than adding
 * global CSS. One border colour, one radius and one type scale run through all
 * five, and a rule is drawn only where it separates data — table rows, signal
 * cards, file cards. Everything else sits on the panel's own white.
 */

/** The one border colour in this section. */
export const BORDER = "border-[color:var(--hair)]";
/** …and the one radius. */
export const RADIUS = "rounded-[12px]";

/**
 * The one type scale. Five roles and no others, except the figures, which are
 * a sixth: a number carrying a stage's profile cannot sit at body weight.
 */
export const T = {
  headline: "text-[26px] leading-[1.2] tracking-[-0.02em] sm:text-[30px]",
  value: "text-[17px] font-semibold leading-[1.3] tabular-nums",
  quote: "text-[15px] italic leading-relaxed",
  body: "text-[14px] leading-relaxed",
  label: "text-[13px] leading-[1.35]",
  caption: "text-[12px] leading-[1.4]",
} as const;

/**
 * Maturity, as colour. Stage 01 is slate — flat, manual, nobody's favourite
 * spreadsheet — and the scale walks to the brand blue at 04 and a deep navy at
 * 05. Every one of them clears 4.5:1 on white, so they can carry text as well
 * as ink. They are design, not copy, which is why they live here and not in
 * the content module.
 */
export const ACCENT = ["#667079", "#5A7387", "#2F7099", "#0F5E97", "#0A4169"] as const;

/** A muted green for a positive delta: this palette has no green of its own. */
const POSITIVE = "#2F7A57";

/** Sentence-case micro label: the section's uppercase is reserved. */
const MICRO = `${T.label} font-semibold text-[color:var(--ink-muted)]`;

function Caption({ children }: { children: React.ReactNode }) {
  return <p className={`mt-4 ${T.label} text-[color:var(--ink-muted)]`}>{children}</p>;
}

/* ------------------------------------------------- 01 · versions of the truth */

/**
 * Three saves of the same month, offset like a pile on a desk, and all three
 * disagree. The grid rows behind them are decoration and stay aria-hidden.
 */
export function FileStack({ data }: { data: typeof maturityCurve.stages[0]["files"] }) {
  return (
    <div>
      <div className="relative mx-auto max-w-[440px] pb-[28px] pl-[32px] pr-[10px]">
        {data.cards.map((c, i) => (
          <div
            key={c.name}
            style={{ marginLeft: `${(data.cards.length - 1 - i) * 15}px`, marginTop: i ? -28 : 0 }}
            className={`relative ${RADIUS} border ${BORDER} bg-white p-3.5 [box-shadow:0_10px_24px_-18px_rgba(13,24,40,.55)]`}
          >
            {/* The figure rides on the name line: the card below overlaps the
                bottom of this one, and would cover it anywhere else. */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                aria-hidden="true"
                className={`h-[15px] w-[12px] flex-none rounded-[2px] border ${BORDER} bg-soft`}
              />
              <span
                className={`min-w-0 flex-1 truncate font-heading ${T.label} font-semibold text-[color:var(--ink-deep)]`}
              >
                {c.name}
              </span>
              {c.figure ? (
                <span className={`flex-none ${T.caption} font-semibold tabular-nums text-destructive`}>
                  {c.figure}
                </span>
              ) : null}
            </div>
            <div aria-hidden="true" className="mt-3 space-y-[7px]">
              {[100, 76, 88, 62].map((w, r) => (
                <div key={r} style={{ width: `${w}%` }} className="h-[7px] rounded-[2px] bg-soft" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className={`mt-4 ${T.label} font-semibold text-[color:var(--ink-deep)]`}>{data.caption}</p>
    </div>
  );
}

/* ------------------------------------------------------- 02 · the pack, late */

/** The month's pack, and the days between the month ending and anyone reading it. */
export function PackAndLag({ data }: { data: typeof maturityCurve.stages[1]["pack"] }) {
  const { labels } = maturityCurve;
  const days = data.timeline.map((t) => Number(t.at.replace(/\D/g, "")));
  const span = Math.max(...days) || 1;
  return (
    <div>
      <div className={`${MICRO} mb-2`}>{data.title}</div>
      <table className={`w-full border-collapse ${T.body}`}>
        <thead>
          <tr className={`border-b ${BORDER} text-left ${T.caption} text-[color:var(--ink-muted)]`}>
            <th scope="col" className="py-2 font-medium">
              &nbsp;
            </th>
            <th scope="col" className="py-2 pl-2 text-right font-medium tabular-nums">
              {labels.actual}
            </th>
            <th scope="col" className="py-2 pl-2 text-right font-medium tabular-nums">
              {labels.budget}
            </th>
            <th scope="col" className="py-2 pl-2 text-right font-medium tabular-nums">
              {labels.variance}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.label} className={`border-b ${BORDER}`}>
              <th scope="row" className="py-2 pr-2 text-left font-medium text-[color:var(--ink-deep)]">
                {r.label}
              </th>
              <td className="py-2 pl-2 text-right tabular-nums text-[color:var(--ink-muted)]">
                {r.actual}
              </td>
              <td className="py-2 pl-2 text-right tabular-nums text-[color:var(--ink-muted)]">
                {r.budget}
              </td>
              {/* Favourable, not positive: spending 20.8% over budget wears a
                  plus sign and is still the bad row. */}
              <td
                className={`py-2 pl-2 text-right font-semibold tabular-nums ${
                  r.good ? "text-[color:var(--ink-deep)]" : "text-destructive"
                }`}
              >
                {r.variance}{" "}
                <span aria-hidden="true" className="font-medium opacity-70">
                  {r.good ? labels.favourableShort : labels.unfavourableShort}
                </span>
                <span className="sr-only">
                  {r.good ? labels.favourable : labels.unfavourable}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* the lag: the bar runs from the close to the meeting */}
      <div className="mt-5">
        <div className="relative h-[3px] rounded-full bg-soft">
          <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-blue/25" />
          {/* inset by half a dot, so the last one sits inside the track */}
          <div className="absolute inset-x-[5px] inset-y-0">
            {data.timeline.map((t, i) => (
              <span
                key={t.label}
                style={{ left: `${(days[i] / span) * 100}%` }}
                aria-hidden="true"
                className={`absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
                  i === data.timeline.length - 1 ? "bg-blue" : "bg-[color:var(--ink-muted)]"
                }`}
              />
            ))}
          </div>
        </div>
        {/* Each label under its own dot: day 6 of 9 is two thirds along, not
            half. The ends align inward so they cannot overhang the track. */}
        <div
          className={`relative mt-2.5 h-[34px] px-[5px] ${T.caption} text-[color:var(--ink-muted)]`}
        >
          {data.timeline.map((t, i) => (
            <span
              key={t.label}
              style={{ left: `calc(5px + ${(days[i] / span) * 100}% - ${(days[i] / span) * 10}px)` }}
              className={`absolute top-0 max-w-[36%] ${
                i === 0
                  ? "text-left"
                  : i === data.timeline.length - 1
                    ? "-translate-x-full text-right"
                    : "-translate-x-1/2 text-center"
              }`}
            >
              {t.label}
              <span className="block tabular-nums text-[color:var(--ink-deep)]">{t.at}</span>
            </span>
          ))}
        </div>
      </div>
      <Caption>{data.caption}</Caption>
    </div>
  );
}

/* ------------------------------------------------------------- the stat row */

/** Unboxed figures, divided by a hairline. Used by stages 03 and 04. */
function Stats({
  items,
  accent,
}: {
  items: readonly { label: string; value: string; tone: string }[];
  accent: string;
}) {
  return (
    <div className="flex">
      {items.map((k, i) => (
        <div
          key={k.label}
          className={`min-w-0 flex-1 ${i ? `border-l ${BORDER} pl-3 sm:pl-4` : ""} ${
            i < items.length - 1 ? "pr-3 sm:pr-4" : ""
          }`}
        >
          <div className={`truncate ${T.caption} text-[color:var(--ink-muted)]`}>{k.label}</div>
          <div
            style={{ color: k.tone === "good" ? POSITIVE : k.tone === "risk" ? undefined : accent }}
            className={`mt-0.5 font-heading ${T.value} max-[419px]:text-[15px] ${
              k.tone === "risk" ? "text-destructive" : ""
            }`}
          >
            {k.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- 03 · the drill-down */

/**
 * The dashboard that shows everything and explains nothing: each click opens
 * one more level, and the answer only arrives at the fourth.
 *
 * It walks itself through once when the tab is first opened — that is the
 * point of the figure, and a visitor who never clicks would otherwise read it
 * as a static breadcrumb. Under prefers-reduced-motion it simply starts
 * finished, with no timers at all.
 */
export function DrillDown({
  data,
  active,
  accent,
}: {
  data: typeof maturityCurve.stages[2]["drill"];
  active: boolean;
  accent: string;
}) {
  const last = data.path.length - 1;
  const [step, setStep] = useState(0);
  const played = useRef(false);

  useEffect(() => {
    if (!active || played.current) return;
    played.current = true;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(last);
      return;
    }
    const timers = data.path.map((_, i) =>
      i === 0 ? null : setTimeout(() => setStep(i), 700 + i * 850),
    );
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [active, data.path, last]);

  const level = data.path[step];
  return (
    <div>
      <Stats items={data.tiles.map((t) => ({ ...t }))} accent={accent} />

      <ol className={`mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-1 ${T.caption}`}>
        {data.path.map((p, i) => (
          <li key={p.crumb} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-[color:var(--ink-muted)]">
                →
              </span>
            )}
            <button
              type="button"
              onClick={() => setStep(i)}
              disabled={i > step + 1}
              style={i === step ? { color: accent } : undefined}
              className={`rounded-full px-2 py-1 transition-colors disabled:cursor-default ${
                i === step
                  ? "bg-blue/10 font-semibold"
                  : i <= step
                    ? "text-[color:var(--ink-deep)] hover:bg-soft"
                    : "text-[color:var(--ink-muted)]/55"
              }`}
            >
              {p.crumb}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-3">
        <div className={MICRO}>{level.crumb}</div>
        <div className="mt-2.5 space-y-2">
          {level.bars.map((b, i, all) => {
            const lastBar = i === all.length - 1;
            return (
              <div key={b.label} className="flex items-center gap-3">
                <span className={`w-[62px] flex-none truncate ${T.caption} text-[color:var(--ink-muted)]`}>
                  {b.label}
                </span>
                <span className="h-[8px] flex-1 rounded-full bg-soft">
                  <span
                    style={{
                      width: `${b.value}%`,
                      backgroundColor: lastBar ? accent : undefined,
                      opacity: lastBar ? 1 : i === all.length - 2 ? 0.55 : 0.3,
                    }}
                    className={`block h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${
                      lastBar ? "" : "bg-blue"
                    }`}
                  />
                </span>
                {"text" in b && b.text ? (
                  <span
                    style={lastBar ? { color: accent } : undefined}
                    className={`w-[38px] flex-none text-right ${T.caption} tabular-nums ${
                      lastBar ? "font-semibold" : "text-[color:var(--ink-muted)]"
                    }`}
                  >
                    {b.text}
                  </span>
                ) : null}
                {"note" in b && b.note ? (
                  <span
                    className={`flex-none rounded-full bg-blue/10 px-1.5 py-0.5 ${T.caption} font-semibold tabular-nums text-blue-dark`}
                  >
                    {b.note}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        {step === last ? (
          <p className={`mt-2 ${T.caption} font-semibold text-[color:var(--ink-muted)]`}>
            {data.annotation}
          </p>
        ) : null}
      </div>

      {step === last ? (
        <p
          style={{ borderColor: accent }}
          className={`mt-3 ${RADIUS} border-l-2 bg-blue/[0.06] px-3.5 py-3 ${T.body} text-[color:var(--ink-deep)]`}
        >
          {data.finding}
        </p>
      ) : (
        <p className={`mt-3 ${T.caption} text-[color:var(--ink-muted)]`}>
          {maturityCurve.labels.drillHint}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------- 04 · the explanation */

/**
 * Gross margin, six quarters behind and two ahead. The line is SVG in a 0–100
 * box stretched to the box (non-scaling strokes keep the weights true); every
 * label is HTML on top at the same percentages, so type stays the size it was
 * set at rather than scaling with the chart.
 *
 * Direct labels rather than a legend, three hairline gridlines rather than a
 * frame, and one number in the stage's accent: the forecast's far end, which
 * is the only figure the chart exists to show.
 */
function MarginChart({
  data,
  accent,
}: {
  data: typeof maturityCurve.stages[3]["explain"]["chart"];
  accent: string;
}) {
  const series = [...data.actual, ...data.forecast];
  const n = series.length - 1;
  const lo = Math.min(...series) - data.band - 0.8;
  const hi = Math.max(...series) + 1.4;
  const px = (i: number) => (i / n) * 100;
  const py = (v: number) => ((hi - v) / (hi - lo)) * 100;
  const at = (vals: readonly number[], from: number) =>
    vals.map((v, i) => `${i ? "L" : "M"}${px(from + i).toFixed(2)},${py(v).toFixed(2)}`).join(" ");

  const cut = data.actual.length - 1; // the last actual: where the forecast starts
  const fwd = [data.actual[cut], ...data.forecast];
  const band = [
    ...fwd.map(
      (v, i) =>
        `${i ? "L" : "M"}${px(cut + i).toFixed(2)},${py(v + (data.band * i) / (fwd.length - 1)).toFixed(2)}`,
    ),
    ...fwd
      .map((v, i) => `L${px(cut + i).toFixed(2)},${py(v - (data.band * i) / (fwd.length - 1)).toFixed(2)}`)
      .reverse(),
    "Z",
  ].join(" ");
  const grid = [40, 38, 36];
  const left = (i: number) => `calc(var(--plot-pad) + ${px(i)}% - ${px(i)} * var(--plot-pad) / 50)`;

  return (
    <div className="flex">
      {/* the y axis, as three values and nothing else. Its box is the plot's
          own height, so a gridline's percentage lands on the same pixel. */}
      <div className="relative h-[84px] w-[30px] flex-none">
        {grid.map((g) => (
          <span
            key={g}
            style={{ top: `${py(g)}%` }}
            className={`absolute right-1.5 -translate-y-1/2 ${T.caption} tabular-nums text-[color:var(--ink-muted)]`}
          >
            {g}%
          </span>
        ))}
      </div>

      {/* --plot-pad is the inset every layer shares: the SVG box, the point
          labels and the axis all offset by it, so a label centred on a point
          really is centred on it. */}
      <div className="min-w-0 flex-1 [--plot-pad:13px] sm:[--plot-pad:26px]">
        <div className="relative h-[84px] w-full px-[13px] sm:px-[26px]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-x-[13px] inset-y-0 h-full w-[calc(100%-26px)] sm:inset-x-[26px] sm:w-[calc(100%-52px)]"
          >
            {grid.map((g) => (
              <line
                key={g}
                x1="0"
                y1={py(g)}
                x2="100"
                y2={py(g)}
                stroke="var(--hair)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <rect x={px(cut)} y="0" width={100 - px(cut)} height="100" fill={accent} opacity="0.04" />
            <path d={band} fill={accent} opacity="0.14" />
            <path
              d={at(data.actual, 0)}
              fill="none"
              stroke={accent}
              strokeWidth="2.25"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={at(fwd, cut)}
              fill="none"
              stroke={accent}
              strokeWidth="2.25"
              strokeDasharray="5 4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* direct labels, in place of a legend */}
          <span
            style={{ left: left(cut - 2), top: `${py(data.actual[cut - 2])}%` }}
            className={`absolute -translate-y-[calc(100%+7px)] ${T.caption} font-semibold text-[color:var(--ink-muted)]`}
          >
            {data.tagActual}
          </span>
          <span
            style={{ left: left(n), top: `${py(data.forecast[data.forecast.length - 1])}%` }}
            className={`absolute -translate-x-full translate-y-[9px] ${T.caption} font-semibold text-[color:var(--ink-muted)]`}
          >
            {data.tagForecast}
          </span>

          {/* the last actual, muted; the forecast's end, in the stage's accent */}
          <span
            style={{ left: left(cut), top: `${py(data.actual[cut])}%` }}
            className={`absolute -translate-x-1/2 -translate-y-[calc(100%+9px)] whitespace-nowrap ${T.caption} tabular-nums text-[color:var(--ink-muted)]`}
          >
            {data.lastActual}
          </span>
          <span
            style={{
              left: left(n),
              top: `${py(data.forecast[data.forecast.length - 1])}%`,
              color: accent,
            }}
            className={`absolute -translate-x-full -translate-y-[calc(100%+9px)] whitespace-nowrap font-heading ${T.caption} font-semibold tabular-nums`}
          >
            {data.lastForecast}
          </span>
          {[cut, n].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{ left: left(i), top: `${py(series[i])}%`, backgroundColor: accent }}
              className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            />
          ))}
        </div>

        {/* One label per point, centred under it. The fiscal year only prints on
            the first quarter of each year below 640, where eight "Q1 FY25"s
            would collide. */}
        <div className="relative mt-1.5 h-[15px] px-[13px] sm:px-[26px]">
          {data.quarters.map((q, i) => (
            <span
              key={`${q}-${i}`}
              style={{ left: left(i) }}
              className={`absolute -translate-x-1/2 whitespace-nowrap ${T.caption} tabular-nums text-[color:var(--ink-muted)]`}
            >
              <span className="sm:hidden">{i % 4 === 0 ? q : q.split(" ")[0]}</span>
              <span className="hidden sm:inline">{q}</span>
            </span>
          ))}
        </div>

        <p className={`mt-2 ${T.caption} font-semibold text-[color:var(--ink-muted)]`}>
          {data.annotation}
        </p>
      </div>
    </div>
  );
}

/** The figures, then what happened / why / what's next — the last row is the payoff. */
export function Explain({
  data,
  accent,
}: {
  data: typeof maturityCurve.stages[3]["explain"];
  accent: string;
}) {
  return (
    <div>
      <Stats items={data.kpis.map((k) => ({ ...k }))} accent={accent} />

      <div className={`mt-4 overflow-hidden ${RADIUS} border ${BORDER}`}>
        {data.rows.map((r, i) => {
          const last = i === data.rows.length - 1;
          return (
            <div
              key={r.q}
              className={`grid grid-cols-[minmax(96px,120px)_1fr] gap-3 px-3.5 py-2 ${T.body} ${
                last ? "bg-blue/[0.07]" : "bg-white"
              } ${i > 0 ? `border-t ${BORDER}` : ""}`}
            >
              <div
                style={last ? { color: accent } : undefined}
                className={`font-medium ${last ? "" : "text-[color:var(--ink-muted)]"}`}
              >
                {r.q}
              </div>
              <div className="text-[color:var(--ink-deep)]">{r.a}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className={`${MICRO} mb-1`}>{data.chart.label}</div>
        <MarginChart data={data.chart} accent={accent} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------- 05 · the loop, live */

/** Signal to owner to action, three live examples. No product implied: a loop. */
export function SignalBoard({
  data,
  accent,
}: {
  data: typeof maturityCurve.stages[4]["board"];
  accent: string;
}) {
  const { labels } = maturityCurve;
  return (
    <div>
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${MICRO}`}>
        {data.flow.map((f, i) => (
          <span key={f} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">→</span>}
            {f}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {data.cards.map((c) => (
          <div key={c.title} className={`${RADIUS} border ${BORDER} px-3 py-2`}>
            <div className="flex items-center gap-2">
              {/* live, not decorative: the loop is always running */}
              <span className="relative flex h-2 w-2 flex-none">
                <span
                  aria-hidden="true"
                  style={
                    c.tone === "good"
                      ? { backgroundColor: POSITIVE }
                      : c.tone === "watch"
                        ? undefined
                        : undefined
                  }
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 [animation-duration:1.8s] motion-reduce:hidden ${
                    c.tone === "risk" ? "bg-destructive" : c.tone === "watch" ? "bg-yellow" : ""
                  }`}
                />
                <span
                  aria-hidden="true"
                  style={c.tone === "good" ? { backgroundColor: POSITIVE } : undefined}
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    c.tone === "risk" ? "bg-destructive" : c.tone === "watch" ? "bg-yellow" : ""
                  }`}
                />
              </span>
              <span className={`font-heading ${T.label} font-semibold text-[color:var(--ink-deep)]`}>
                {c.title}
              </span>
              <span className={`ml-auto ${T.caption} text-[color:var(--ink-muted)]`}>
                {labels.impact}
              </span>
              <span
                style={{ color: accent }}
                className={`font-heading ${T.label} font-semibold tabular-nums`}
              >
                {c.impact}
              </span>
              <span
                className={`rounded-full border ${BORDER} bg-soft px-2 py-0.5 ${T.caption} font-medium text-[color:var(--ink-muted)]`}
              >
                {c.status}
              </span>
            </div>
            <dl
              className={`mt-1.5 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0 ${T.caption} sm:grid-cols-[auto_1fr_auto_1fr] sm:gap-x-3`}
            >
              <dt className="text-[color:var(--ink-muted)]">{labels.why}</dt>
              <dd className="text-[color:var(--ink-deep)]">{c.why}</dd>
              <dt className="text-[color:var(--ink-muted)]">{labels.action}</dt>
              <dd className="text-[color:var(--ink-deep)]">{c.action}</dd>
              <dt className="text-[color:var(--ink-muted)]">{labels.owner}</dt>
              <dd className="text-[color:var(--ink-deep)]">{c.owner}</dd>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
