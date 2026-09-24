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
 * global CSS, and every colour, radius and shadow resolves to a token already
 * declared in globals.css. The one exception is POSITIVE below: this palette
 * has no green, and a rising revenue line painted in brand blue reads as
 * "brand", not as "up". It is scoped to this file.
 */

/** The soft hairline (--hair) as a border colour. */
const HAIR = "border-[color:var(--hair)]";
/** A muted green for a positive delta. See the note above. */
const POSITIVE = "#2F7A57";

const toneText: Record<string, string> = {
  good: `text-[${POSITIVE}]`,
  risk: "text-destructive",
  watch: "text-[color:var(--ink-deep)]",
};
const toneDot: Record<string, string> = {
  good: `bg-[${POSITIVE}]`,
  risk: "bg-destructive",
  watch: "bg-yellow",
};

/** Small caps micro-label, as used across this design system. */
const MICRO = "font-heading text-[10px] font-bold uppercase tracking-[0.14em]";

function Caption({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-[13px] text-[color:var(--ink-muted)]">{children}</p>;
}

/* ------------------------------------------------- 01 · versions of the truth */

/**
 * Three saves of the same month, offset like a pile on a desk. The two that
 * disagree carry their EBITDA in the destructive tone; the grid rows behind
 * them are decoration and stay aria-hidden.
 */
export function FileStack({ data }: { data: typeof maturityCurve.stages[0]["files"] }) {
  return (
    <div>
      <div className="relative mx-auto max-w-[380px] pb-[22px] pl-[26px]">
        {data.cards.map((c, i) => (
          <div
            key={c.name}
            style={{ marginLeft: `${(data.cards.length - 1 - i) * 13}px`, marginTop: i ? -28 : 0 }}
            className={`relative rounded-[12px] border ${HAIR} bg-white p-3 [box-shadow:0_10px_24px_-18px_rgba(13,24,40,.55)]`}
          >
            {/* The figure rides on the name line: the card below overlaps the
                bottom of this one, and would cover it anywhere else. */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span aria-hidden="true" className="h-[14px] w-[11px] flex-none rounded-[2px] border border-[color:var(--hair)] bg-soft" />
              <span className="min-w-0 flex-1 truncate font-heading text-[12px] font-semibold text-[color:var(--ink-deep)]">
                {c.name}
              </span>
              {c.figure ? (
                <span className="ml-auto flex-none text-[11.5px] font-semibold tabular-nums text-destructive">
                  {c.figure}
                </span>
              ) : null}
            </div>
            <div aria-hidden="true" className="mt-2.5 space-y-[5px]">
              {[100, 76, 88, 62].map((w, r) => (
                <div key={r} style={{ width: `${w}%` }} className="h-[5px] rounded-[2px] bg-soft" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <Caption>{data.caption}</Caption>
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
      <div className={`overflow-hidden rounded-[14px] border ${HAIR} bg-white`}>
        <div className={`flex items-center justify-between gap-3 border-b ${HAIR} bg-soft px-3.5 py-2.5`}>
          <span className="font-heading text-[12px] font-semibold text-[color:var(--ink-deep)]">
            {data.title}
          </span>
        </div>
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className={`border-b ${HAIR} text-left text-[color:var(--ink-muted)]`}>
              <th scope="col" className="px-3.5 py-2 font-medium">&nbsp;</th>
              <th scope="col" className="px-2 py-2 text-right font-medium tabular-nums">{labels.actual}</th>
              <th scope="col" className="px-2 py-2 text-right font-medium tabular-nums">{labels.budget}</th>
              <th scope="col" className="px-3.5 py-2 text-right font-medium tabular-nums">{labels.variance}</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r, i) => (
              <tr key={r.label} className={i ? `border-t ${HAIR}` : ""}>
                <th scope="row" className="px-3.5 py-2 text-left font-medium text-[color:var(--ink-deep)]">
                  {r.label}
                </th>
                <td className="px-2 py-2 text-right tabular-nums text-[color:var(--ink-muted)]">{r.actual}</td>
                <td className="px-2 py-2 text-right tabular-nums text-[color:var(--ink-muted)]">{r.budget}</td>
                <td
                  className={`px-3.5 py-2 text-right font-semibold tabular-nums ${
                    r.variance.startsWith("−") ? "text-destructive" : "text-[color:var(--ink-deep)]"
                  }`}
                >
                  {r.variance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        <div className="mt-2.5 flex justify-between gap-2 text-[11.5px] leading-[1.35] text-[color:var(--ink-muted)]">
          {data.timeline.map((t, i) => (
            <span
              key={t.label}
              className={`max-w-[33%] ${i === 0 ? "text-left" : i === data.timeline.length - 1 ? "text-right" : "text-center"}`}
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
}: {
  data: typeof maturityCurve.stages[2]["drill"];
  active: boolean;
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

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {data.tiles.map((t) => (
          <div key={t.label} className={`rounded-[12px] border ${HAIR} bg-white px-3.5 py-3`}>
            <div className="text-[12px] text-[color:var(--ink-muted)]">{t.label}</div>
            <div
              style={t.tone === "good" ? { color: POSITIVE } : undefined}
              className={`mt-0.5 font-heading text-[18px] font-semibold tabular-nums leading-[1.3] ${
                t.tone === "risk" ? "text-destructive" : ""
              }`}
            >
              {t.value}
            </div>
          </div>
        ))}
      </div>

      <ol className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px]">
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
              className={`rounded-full px-2 py-1 transition-colors disabled:cursor-default ${
                i === step
                  ? "bg-blue/10 font-semibold text-blue"
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

      <div className={`mt-3 rounded-[12px] border ${HAIR} bg-white p-3.5`}>
        <div className={`${MICRO} text-[color:var(--ink-muted)]`}>{data.path[step].crumb}</div>
        <div className="mt-2.5 space-y-2">
          {data.path[step].bars.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <span className="w-[86px] flex-none truncate text-[12px] text-[color:var(--ink-muted)]">
                {b.label}
              </span>
              <span className="h-[7px] flex-1 rounded-full bg-soft">
                <span
                  style={{ width: `${b.value}%` }}
                  className="block h-full rounded-full bg-blue/45 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      {step === last ? (
        <p className="mt-3 rounded-[12px] border border-blue/25 bg-blue/[0.07] px-3.5 py-3 text-[13px] leading-relaxed text-[color:var(--ink-deep)]">
          {data.finding}
        </p>
      ) : (
        <p className="mt-3 text-[12px] text-[color:var(--ink-muted)]">
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
 * The forecast half carries a tint, a band that opens with distance and a
 * dashed line: three ways of saying the same thing, because a forecast drawn
 * like an actual is a claim nobody made.
 */
function MarginChart({ data }: { data: typeof maturityCurve.stages[3]["explain"]["chart"] }) {
  const series = [...data.actual, ...data.forecast];
  const n = series.length - 1;
  const lo = Math.min(...series) - data.band - 0.6;
  const hi = Math.max(...series) + 0.6;
  const px = (i: number) => (i / n) * 100;
  const py = (v: number) => ((hi - v) / (hi - lo)) * 100;
  const at = (vals: readonly number[], from: number) =>
    vals.map((v, i) => `${i ? "L" : "M"}${px(from + i).toFixed(2)},${py(v).toFixed(2)}`).join(" ");

  const cut = data.actual.length - 1;                    // the last actual: where forecast starts
  const fwd = [data.actual[cut], ...data.forecast];      // the dashed line joins it
  const band = [
    ...fwd.map((v, i) => `${i ? "L" : "M"}${px(cut + i).toFixed(2)},${py(v + (data.band * i) / (fwd.length - 1)).toFixed(2)}`),
    ...fwd
      .map((v, i) => `L${px(cut + i).toFixed(2)},${py(v - (data.band * i) / (fwd.length - 1)).toFixed(2)}`)
      .reverse(),
    "Z",
  ].join(" ");

  return (
    <div>
      {/* legend, inline above the chart */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[color:var(--ink-muted)]">
        <span className="font-medium text-[color:var(--ink-deep)]">{data.label}</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-[2px] w-4 flex-none rounded bg-blue" />
          {data.legendActual}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0 w-4 flex-none border-t-2 border-dashed border-blue" />
          {data.legendForecast}
        </span>
      </div>

      {/* inset by half a point, so the last dot and the final label stay inside
          the column rather than hanging off its right edge */}
      <div className="relative mt-2 h-[132px] w-full px-[5px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-x-[5px] inset-y-0 h-full w-[calc(100%-10px)]"
        >
          <rect x={px(cut)} y="0" width={100 - px(cut)} height="100" fill="var(--blue)" opacity="0.045" />
          <line
            x1={px(cut)}
            y1="0"
            x2={px(cut)}
            y2="100"
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
          <path d={band} fill="var(--blue)" opacity="0.13" />
          <path
            d={at(data.actual, 0)}
            fill="none"
            stroke="var(--blue)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={at(fwd, cut)}
            fill="none"
            stroke="var(--blue)"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* the two points worth naming */}
        {[
          { i: cut, v: data.actual[cut], text: data.lastActual, end: false },
          { i: n, v: data.forecast[data.forecast.length - 1], text: data.lastForecast, end: true },
        ].map((m) => (
          <span
            key={m.text}
            style={{ left: `calc(5px + ${px(m.i)}% - ${px(m.i) / 10}px)`, top: `${py(m.v)}%` }}
            className={`absolute -translate-y-[calc(100%+9px)] whitespace-nowrap font-heading text-[11.5px] font-semibold tabular-nums text-[color:var(--ink-deep)] ${
              m.end ? "-translate-x-full" : "-translate-x-1/2"
            }`}
          >
            {m.text}
          </span>
        ))}
        {[cut, n].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ left: `calc(5px + ${px(i)}% - ${px(i) / 10}px)`, top: `${py(series[i])}%` }}
            className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue"
          />
        ))}

        <span
          className={`${MICRO} absolute right-1 top-1 text-blue/70`}
          style={{ letterSpacing: "0.1em" }}
        >
          {data.forecastTag}
        </span>
      </div>

      {/* the x axis */}
      <div className="relative mt-1.5 h-[14px] px-[5px]">
        {data.quarters.map((q, i) => (
          <span
            key={`${q}-${i}`}
            style={{ left: `calc(5px + ${px(i)}% - ${px(i) / 10}px)` }}
            className={`absolute text-[10.5px] tabular-nums ${
              i === 0 ? "" : i === n ? "-translate-x-full" : "-translate-x-1/2"
            } ${i > cut ? "text-blue/70" : "text-[color:var(--ink-muted)]"}`}
          >
            {q}
          </span>
        ))}
      </div>
    </div>
  );
}

/** KPIs, then what happened / why / what's next — the last row is the payoff. */
export function Explain({ data }: { data: typeof maturityCurve.stages[3]["explain"] }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5">
        {data.kpis.map((k) => (
          <div key={k.label} className={`rounded-[12px] border ${HAIR} bg-white px-2.5 py-2.5 sm:px-3`}>
            <div className="truncate text-[11.5px] text-[color:var(--ink-muted)]">{k.label}</div>
            <div
              style={k.tone === "good" ? { color: POSITIVE } : undefined}
              className={`mt-0.5 font-heading text-[15px] font-semibold tabular-nums leading-[1.3] sm:text-[16px] ${
                k.tone === "risk" ? "text-destructive" : ""
              }`}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-3.5 overflow-hidden rounded-[14px] border ${HAIR}`}>
        {data.rows.map((r, i) => {
          const last = i === data.rows.length - 1;
          return (
            <div
              key={r.q}
              className={`grid grid-cols-[minmax(96px,120px)_1fr] gap-3 px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                last ? "bg-blue/[0.07]" : "bg-white"
              } ${i > 0 ? `border-t ${HAIR}` : ""}`}
            >
              <div className={`font-medium ${last ? "text-blue" : "text-[color:var(--ink-muted)]"}`}>
                {r.q}
              </div>
              <div className="text-[color:var(--ink-deep)]">{r.a}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <MarginChart data={data.chart} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------- 05 · the loop, live */

/** Signal to owner to action, three live examples. No product implied: a loop. */
export function SignalBoard({ data }: { data: typeof maturityCurve.stages[4]["board"] }) {
  const { labels } = maturityCurve;
  return (
    <div>
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[10px] border ${HAIR} bg-soft px-3 py-2 ${MICRO} text-[color:var(--ink-muted)]`}
      >
        {data.flow.map((f, i) => (
          <span key={f} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">→</span>}
            {f}
          </span>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {data.cards.map((c) => (
          <div key={c.title} className={`rounded-[12px] border ${HAIR} bg-white px-3.5 py-2.5`}>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                style={c.tone === "good" ? { backgroundColor: POSITIVE } : undefined}
                className={`h-2 w-2 flex-none rounded-full ${
                  c.tone === "risk" ? "bg-destructive" : c.tone === "watch" ? "bg-yellow" : ""
                }`}
              />
              <span className="font-heading text-[13px] font-semibold text-[color:var(--ink-deep)]">
                {c.title}
              </span>
              <span className="ml-auto text-[11.5px] text-[color:var(--ink-muted)]">{labels.impact}</span>
              <span className="font-heading text-[13px] font-semibold tabular-nums text-[color:var(--ink-deep)]">
                {c.impact}
              </span>
              <span
                className={`rounded-full border ${HAIR} bg-soft px-2 py-0.5 text-[10.5px] font-medium text-[color:var(--ink-muted)]`}
              >
                {c.status}
              </span>
            </div>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-[12px] leading-[1.45] sm:grid-cols-[auto_1fr_auto_1fr] sm:gap-x-3">
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
