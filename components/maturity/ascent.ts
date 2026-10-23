/**
 * The Ascent — the maturity curve as an instrument. Everything tunable lives
 * in ASCENT; everything here is pure (no DOM, no React), so the SVG line and
 * the DOM marker draw from the same maths, and
 * `node components/maturity/ascent.check.ts` can test it.
 *
 * One smooth curve (client, 2026-10-23). The first version drew it in WebGL
 * with noise that damped as the stage rose and after-images that folded into
 * the line; the client asked for a simple curve, so the noise, the echoes,
 * the GPU tiers and the WebGL scene are gone.
 */

export const ASCENT = {
  /** Horizontal inset of stage 01 and stage 05 from the instrument's edges,
      as a fraction of its width, so the end nodes are not clipped. */
  pad: 0.09,
  /** Release: stages of carry per (stage/second) of fling velocity. */
  fling: 0.14,
  /** Drag past either end moves this fraction of the finger's travel. */
  rubber: 0.28,
  /** Horizontal travel (px) before a touch counts as a drag, not a tap. */
  slop: 8,
  /** Android haptic tick (ms) on crossing a stage during a drag. */
  haptic: 8,
} as const;

/** Where stage `i` of `count` sits along the line, 0..1. */
export const stageT = (i: number, count: number): number =>
  ASCENT.pad + (1 - 2 * ASCENT.pad) * (i / (count - 1));

/** Progress (0..count-1, fractional while dragging) as a position 0..1. */
export const progressT = (p: number, count: number): number =>
  stageT(Math.min(Math.max(p, 0), count - 1), count);

/** The curve: a slow start, then a confident rise. Height 0..1, up. */
export function baseY(t: number): number {
  const s = t * t * (3 - 2 * t); // smoothstep
  return 0.14 + 0.66 * (0.3 * t + 0.7 * s);
}

/** The curve as an SVG path in a w×h box (y down). */
export function curvePath(w: number, h: number, n = 64): string {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    d += (i ? "L" : "M") + (t * w).toFixed(1) + " " + ((1 - baseY(t)) * h).toFixed(1);
  }
  return d;
}

/** Where a release lands: the nearest stage after carrying the fling
    velocity (stages/second) forward, clamped to the curve. */
export function snapTarget(p: number, velocity: number, count: number): number {
  const carried = p + velocity * ASCENT.fling;
  return Math.min(Math.max(Math.round(carried), 0), count - 1);
}

/** Past either end, the finger's travel is damped (rubber band). */
export function rubberBand(p: number, count: number): number {
  const max = count - 1;
  if (p < 0) return p * ASCENT.rubber;
  if (p > max) return max + (p - max) * ASCENT.rubber;
  return p;
}
