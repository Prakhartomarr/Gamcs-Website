import type { ReactNode } from "react";

/**
 * Line icons for the five solution pillars, ported from the supplied
 * reference. Digital Transformation keeps the glyph of Technology & Systems
 * Implementation, one of the two pillars it merged; the BI chart glyph went
 * with the other, since FP&A's trend line already reads as a chart.
 *
 * The `data-draw` attributes are vestigial: the services section used to tween
 * stroke-dashoffset so each icon drew itself on scroll, but the glyph is now
 * rendered large and blurred, where a stroke drawing itself cannot be seen.
 * Nothing reads them any more — they are left in place because the geometry is
 * still exactly what the blurred glyph needs.
 *
 * Stroke colour comes from `currentColor`, so the surrounding element controls
 * it.
 */
export const STROKE_ICONS: Record<string, ReactNode> = {
  "fpa-cfo-advisory": (
    <>
      <polyline data-draw points="3 16.5 9.5 10 13.5 14 21 6" />
      <polyline data-draw points="15.5 6 21 6 21 11.5" />
    </>
  ),
  "finance-team-extension": (
    <>
      <circle data-draw cx="8.5" cy="8" r="3" />
      <circle data-draw cx="16" cy="9.5" r="2.4" />
      <path data-draw d="M3.5 19c0-3 2.2-5 5-5s5 2 5 5" />
      <path data-draw d="M14.5 18.5c.2-2.3 1.7-3.9 3.8-3.9 1.6 0 2.9 1 3.2 2.7" />
    </>
  ),
  "digital-transformation": (
    <>
      <line data-draw x1="4" y1="8" x2="20" y2="8" />
      <line data-draw x1="4" y1="16" x2="20" y2="16" />
      <circle data-draw cx="9" cy="8" r="2.4" />
      <circle data-draw cx="15" cy="16" r="2.4" />
    </>
  ),
  "deal-advisory": (
    <>
      <path data-draw d="M12 3l7 2.6v5.2c0 4.2-2.9 7.2-7 8.4-4.1-1.2-7-4.2-7-8.4V5.6L12 3z" />
      <polyline data-draw points="8.5 11.5 11 14 15.5 9" />
    </>
  ),
  "training-enablement": (
    <>
      <polygon data-draw points="12 5 21 9 12 13 3 9 12 5" />
      <path data-draw d="M7 10.8v4.2c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.2" />
      <line data-draw x1="21" y1="9" x2="21" y2="14" />
    </>
  ),
};

export const ARROW = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Glyphs for the six "how we help" steps, keyed by each point's `lead` so a
 * reordered `whyUs.points` cannot silently pair the wrong icon with the wrong
 * copy. Icons are not copy, which is why they live here and not in
 * lib/content/gamcs.ts.
 */
export const STEP_ICONS: Record<string, ReactNode> = {
  "One Team. One Integrated Finance Engine.": (
    <>
      <circle cx="9" cy="8.4" r="3.1" />
      <path d="M3.4 19.4a5.9 5.9 0 0 1 11.2 0" />
      <path d="M16.4 6.1a3.1 3.1 0 0 1 0 6.2" />
      <path d="M18.8 19.4a5.4 5.4 0 0 0-3.1-4.8" />
    </>
  ),
  "Independent by Design. Outcomes Above Platforms.": (
    <>
      <circle cx="5.6" cy="6" r="2.4" />
      <circle cx="18.4" cy="6" r="2.4" />
      <circle cx="12" cy="18.4" r="2.4" />
      <path d="M7.8 7.2l2.6 9M16.2 7.2l-2.6 9M8 6h8" />
    </>
  ),
  "Intelligence Built In. Not Bolted On.": (
    <>
      <path d="M9.4 2.6l1.7 4.5 4.5 1.7-4.5 1.7-1.7 4.5-1.7-4.5L3.2 8.8l4.5-1.7z" />
      <path d="M17.6 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" />
    </>
  ),
  "Boardroom Ready. Deal Room Proven.": (
    <>
      <path d="M13.6 2.8H6.8a2 2 0 0 0-2 2v14.4a2 2 0 0 0 2 2h10.4a2 2 0 0 0 2-2V8.2z" />
      <path d="M13.6 2.8v5.4h5.6" />
      <path d="M8.8 15.4l2 2 3.8-4.2" />
    </>
  ),
  "Industry-Agnostic. Business-Specific.": (
    <>
      <path d="M12 3.2l8.4 4-8.4 4-8.4-4z" />
      <path d="M3.6 12l8.4 4 8.4-4" />
      <path d="M3.6 16.4l8.4 4 8.4-4" />
    </>
  ),
  "Scale Capability. Not Overhead.": (
    <>
      <path d="M4 20V13.4M9.6 20V9.4M15.2 20v-6.6M20.8 20V5" />
      <path d="M3.4 8.2l5.4-3.6 4.6 2.6 6.4-4" />
    </>
  ),
};

/**
 * Glyphs for "the gap" panels, keyed by the `icon` of each chip and card in
 * `dataToDecision`. Ported from the gap-panels design canvas into the file's
 * idiom: bare geometry on a 24 viewBox, painted by the consumer's <svg>
 * (fill none, stroke currentColor, 1.7, round). "more" is the one exception —
 * three filled dots, so it carries its own fill and zero stroke.
 */
export const GAP_ICONS = {
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  contacts: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.2a2.8 2.8 0 0 1 0 5.6" />
      <path d="M17.5 14.4c2 .5 3.2 2.1 3.2 4.6" />
    </>
  ),
  sheet: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M9 9.5V19.5M14.8 9.5V19.5" />
    </>
  ),
  people: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="11" r="2.2" />
      <path d="M5.8 16.4c.5-1.6 1.7-2.4 3.2-2.4s2.7.8 3.2 2.4" />
      <path d="M15 10.5h3.2M15 14h3.2" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.2v2.4M12 18.4v2.4M3.2 12h2.4M18.4 12h2.4M5.8 5.8l1.7 1.7M16.5 16.5l1.7 1.7M18.2 5.8l-1.7 1.7M7.5 16.5l-1.7 1.7" />
    </>
  ),
  more: (
    <g fill="currentColor" strokeWidth="0">
      <circle cx="6.5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="17.5" cy="12" r="1.6" />
    </g>
  ),
  report: (
    <>
      <path d="M6 3.5h7.5L18 8v12.5H6z" />
      <path d="M13.5 3.5V8H18" />
      <path d="M9 12h6M9 15.5h6" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.6" />
      <path d="M12 17.2v.01" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="M15.4 15.4 20.5 20.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  cycle: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.4 4.6v4.2h-4.2" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.4 13.7 8l4.6 1.7-4.6 1.7L12 16l-1.7-4.6L5.7 9.7 10.3 8z" />
      <path d="M18.2 15.4l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z" />
    </>
  ),
  bars: (
    <>
      <path d="M4.5 19.5h15" />
      <path d="M7.5 19.5v-6M12 19.5V7.5M16.5 19.5v-9" />
    </>
  ),
  bulb: (
    <>
      <path d="M9.2 17h5.6" />
      <path d="M10 20h4" />
      <path d="M12 3.6a5.6 5.6 0 0 1 3.4 10c-.5.4-.8 1-.8 1.6H9.4c0-.6-.3-1.2-.8-1.6A5.6 5.6 0 0 1 12 3.6z" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 19.5 9 15" />
      <path d="M12.4 4.6c2.6-1 5.4-1.2 7-1 .2 1.6 0 4.4-1 7-.8 2-2.2 3.6-4 4.6l-3.2 1.7-4.1-4.1 1.7-3.2c1-1.8 2.6-3.2 4.6-4z" />
      <circle cx="14.6" cy="9.4" r="1.7" />
    </>
  ),
  chevron: <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  // `satisfies`, not an annotation: it type-checks the glyphs while keeping the
  // keys literal, so `icon` in gamcs.ts is checked against them.
} satisfies Record<string, ReactNode>;
