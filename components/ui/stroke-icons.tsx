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

/**
 * Glyphs for the four principles in /who-we-are's "where we're going"
 * chapter, keyed by each principle's `heading` the way STEP_ICONS is keyed by
 * its point's `lead` — so reordering `ourStory.chapters.future.principles`
 * cannot silently pair the wrong icon with the wrong copy.
 *
 * NEW GEOMETRY, not reused glyphs (client, 2026-10-21). The two sets above
 * are keyed to solution pillars and to the six "how we help" points, and
 * neither has a member that means "practical" or "impact over activity".
 * What is reused is the idiom: a 24x24 box, 1.7 stroke, round caps and
 * joins, colour from `currentColor` — so these sit in a tinted square beside
 * the others without looking imported.
 */
export const PRINCIPLE_ICONS: Record<string, ReactNode> = {
  /* A checklist: advice that leads to action. */
  "Practical by design": (
    <>
      <path d="M3.6 6.4 5 7.8l2.6-2.6" />
      <path d="M3.6 12.4 5 13.8l2.6-2.6" />
      <path d="M3.6 18.4 5 19.8l2.6-2.6" />
      <path d="M11 6.6h9.4M11 12.6h9.4M11 18.6h9.4" />
    </>
  ),
  /* Three nodes on one frame: finance, data and technology designed
     together rather than bolted to each other. */
  "Connected thinking": (
    <>
      <circle cx="12" cy="4.9" r="2.4" />
      <circle cx="5.2" cy="17.6" r="2.4" />
      <circle cx="18.8" cy="17.6" r="2.4" />
      <path d="M10.9 7 6.3 15.5M13.1 7l4.6 8.5M7.6 17.6h8.8" />
    </>
  ),
  /* A frame drawn around a centre: built around the business, not over it. */
  "Built around the business": (
    <>
      <path d="M4 8.4V5.2a1.2 1.2 0 0 1 1.2-1.2h3.2" />
      <path d="M15.6 4h3.2A1.2 1.2 0 0 1 20 5.2v3.2" />
      <path d="M20 15.6v3.2a1.2 1.2 0 0 1-1.2 1.2h-3.2" />
      <path d="M8.4 20H5.2A1.2 1.2 0 0 1 4 18.8v-3.2" />
      <circle cx="12" cy="12" r="3.1" />
    </>
  ),
  /* A line that climbs and keeps going: outcomes, not output. */
  "Impact over activity": (
    <>
      <path d="M3.8 19.2h16.4" />
      <path d="M6.4 15.4l4-4.4 3.2 2.8 5.4-6.2" />
      <path d="M15.2 7.6h4v4" />
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
