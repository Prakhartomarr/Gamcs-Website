import type { ReactNode } from "react";

/**
 * Line icons for the six solution pillars, ported from the supplied
 * reference.
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
  "fpa-strategic-finance": (
    <>
      <polyline data-draw points="3 16.5 9.5 10 13.5 14 21 6" />
      <polyline data-draw points="15.5 6 21 6 21 11.5" />
    </>
  ),
  "bi-decision-intelligence": (
    <>
      <line data-draw x1="5" y1="20" x2="19" y2="20" />
      <line data-draw x1="7.5" y1="20" x2="7.5" y2="13" />
      <line data-draw x1="12" y1="20" x2="12" y2="8" />
      <line data-draw x1="16.5" y1="20" x2="16.5" y2="11" />
    </>
  ),
  "offshoring-centers-of-excellence": (
    <>
      <circle data-draw cx="8.5" cy="8" r="3" />
      <circle data-draw cx="16" cy="9.5" r="2.4" />
      <path data-draw d="M3.5 19c0-3 2.2-5 5-5s5 2 5 5" />
      <path data-draw d="M14.5 18.5c.2-2.3 1.7-3.9 3.8-3.9 1.6 0 2.9 1 3.2 2.7" />
    </>
  ),
  "technology-systems-implementation": (
    <>
      <line data-draw x1="4" y1="8" x2="20" y2="8" />
      <line data-draw x1="4" y1="16" x2="20" y2="16" />
      <circle data-draw cx="9" cy="8" r="2.4" />
      <circle data-draw cx="15" cy="16" r="2.4" />
    </>
  ),
  "transaction-advisory-due-diligence": (
    <>
      <path data-draw d="M12 3l7 2.6v5.2c0 4.2-2.9 7.2-7 8.4-4.1-1.2-7-4.2-7-8.4V5.6L12 3z" />
      <polyline data-draw points="8.5 11.5 11 14 15.5 9" />
    </>
  ),
  "finance-capability-building": (
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
 * Glyphs for the seven "how we help" steps, keyed by each point's `lead` so a
 * reordered `whyUs.points` cannot silently pair the wrong icon with the wrong
 * copy. Icons are not copy, which is why they live here and not in
 * lib/content/gamcs.ts.
 */
export const STEP_ICONS: Record<string, ReactNode> = {
  "Tailored to Your Business": (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 1.8v2.6M12 19.6v2.6M1.8 12h2.6M19.6 12h2.6" />
    </>
  ),
  "One Integrated Team": (
    <>
      <circle cx="9" cy="8.4" r="3.1" />
      <path d="M3.4 19.4a5.9 5.9 0 0 1 11.2 0" />
      <path d="M16.4 6.1a3.1 3.1 0 0 1 0 6.2" />
      <path d="M18.8 19.4a5.4 5.4 0 0 0-3.1-4.8" />
    </>
  ),
  "Platform-Agnostic by Design": (
    <>
      <circle cx="5.6" cy="6" r="2.4" />
      <circle cx="18.4" cy="6" r="2.4" />
      <circle cx="12" cy="18.4" r="2.4" />
      <path d="M7.8 7.2l2.6 9M16.2 7.2l-2.6 9M8 6h8" />
    </>
  ),
  "AI Built In, Not Bolted On": (
    <>
      <path d="M9.4 2.6l1.7 4.5 4.5 1.7-4.5 1.7-1.7 4.5-1.7-4.5L3.2 8.8l4.5-1.7z" />
      <path d="M17.6 14l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" />
    </>
  ),
  "Deal-Ready When It Counts": (
    <>
      <path d="M13.6 2.8H6.8a2 2 0 0 0-2 2v14.4a2 2 0 0 0 2 2h10.4a2 2 0 0 0 2-2V8.2z" />
      <path d="M13.6 2.8v5.4h5.6" />
      <path d="M8.8 15.4l2 2 3.8-4.2" />
    </>
  ),
  "Proven Across Industries": (
    <>
      <path d="M12 3.2l8.4 4-8.4 4-8.4-4z" />
      <path d="M3.6 12l8.4 4 8.4-4" />
      <path d="M3.6 16.4l8.4 4 8.4-4" />
    </>
  ),
  "Cost Structure That Scales With You": (
    <>
      <path d="M4 20V13.4M9.6 20V9.4M15.2 20v-6.6M20.8 20V5" />
      <path d="M3.4 8.2l5.4-3.6 4.6 2.6 6.4-4" />
    </>
  ),
};
