/**
 * The Ascent — the maturity curve as an instrument. Everything tunable lives
 * in ASCENT; everything here is pure (no DOM, no React), so the WebGL scene,
 * the SVG fallback and the DOM marker all draw the SAME line from the same
 * maths, and `node components/maturity/ascent.check.ts` can test it.
 *
 * The idea in one line: noise is unreliable numbers. At stage 01 the curve
 * jitters and its echoes fan out; moving up the curve damps the noise until,
 * at stage 05, the echoes collapse into one calm line.
 */

export const ASCENT = {
  /** Horizontal inset of stage 01 and stage 05 from the instrument's edges,
      as a fraction of its width, so the end nodes are not clipped. */
  pad: 0.09,
  /** Noise amplitude as a fraction of the instrument's height, at stage 01
      and at stage 05. The floor keeps the line alive, never ruler-straight. */
  ampMax: 0.085,
  ampMin: 0.004,
  /** How fast the noise damps with progress; >1 holds the chaos longer and
      then clears it late, which reads as effort rather than a linear fade. */
  ampCurve: 1.6,
  /** Segments along the line. 160 is smooth at 430px and costs nothing. */
  segments: 160,
  /** Line widths in CSS px: the bright core, and the soft glow around it. */
  core: 1.6,
  glow: 22,
  /** After-images: time offsets (s) and opacities. They separate when the
      line is noisy and coincide when it is calm — the signature. */
  echoes: [
    { lag: 0.45, alpha: 0.22 },
    { lag: 0.9, alpha: 0.12 },
    { lag: 1.35, alpha: 0.07 },
  ],
  /** Brand blue #0F5E97 and a pale blue for the stretch not yet travelled. */
  color: [15 / 255, 94 / 255, 151 / 255] as const,
  ahead: [143 / 255, 178 / 255, 207 / 255] as const,
  /** Device-pixel-ratio caps per tier. */
  dpr: { high: 2, mid: 1.25 },
  /** Echo count per tier. */
  echoCount: { high: 3, mid: 1 },
  /** A frame budget: averaging over this many frames slower than this many
      ms steps the tier down (high → mid → static SVG). */
  probeFrames: 45,
  slowFrameMs: 34,
  /** Release: stages of carry per (stage/second) of fling velocity. */
  fling: 0.14,
  /** Drag past either end moves this fraction of the finger's travel. */
  rubber: 0.28,
  /** Horizontal travel (px) before a touch counts as a drag, not a tap. */
  slop: 8,
  /** Android haptic tick (ms) on crossing a stage during a drag. */
  haptic: 8,
} as const;

export type Tier = "high" | "mid" | "low";

/** Where stage `i` of `count` sits along the line, 0..1. */
export const stageT = (i: number, count: number): number =>
  ASCENT.pad + (1 - 2 * ASCENT.pad) * (i / (count - 1));

/** Progress (0..count-1, fractional while dragging) as a position 0..1. */
export const progressT = (p: number, count: number): number =>
  stageT(Math.min(Math.max(p, 0), count - 1), count);

/** The calm curve: a slow start, then a confident rise. Height 0..1, up. */
export function baseY(t: number): number {
  const s = t * t * (3 - 2 * t); // smoothstep
  return 0.14 + 0.66 * (0.3 * t + 0.7 * s);
}

/** Three detuned sines — a cheap noise that GLSL can reproduce exactly,
    which is the point: the DOM marker must sit ON the drawn line. */
export function noise(t: number, time: number): number {
  return (
    0.5 * Math.sin(17 * t + 1.3 * time) +
    0.3 * Math.sin(31 * t - 2.1 * time + 1.7) +
    0.2 * Math.sin(53 * t + 0.7 * time + 4.1)
  );
}

/** Noise amplitude for progress p. */
export function amplitude(p: number, count: number): number {
  const q = Math.min(Math.max(p / (count - 1), 0), 1);
  return ASCENT.ampMax * Math.pow(1 - q, ASCENT.ampCurve) + ASCENT.ampMin;
}

/** The drawn line's height at t, for progress p and clock `time`. */
export const curveY = (t: number, p: number, count: number, time: number): number =>
  baseY(t) + noise(t, time) * amplitude(p, count);

/** An SVG path of the line in a w×h box (y down), for the fallback. */
export function curvePath(p: number, count: number, time: number, w: number, h: number, n = 96): string {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = (t * w).toFixed(1);
    const y = ((1 - curveY(t, p, count, time)) * h).toFixed(1);
    d += (i ? "L" : "M") + x + " " + y;
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

/** A first guess at the device, before measuring real frames. */
export function guessTier(gl: boolean, memory?: number, cores?: number): Tier {
  if (!gl) return "low";
  if (memory !== undefined && memory <= 2) return "low";
  if ((memory !== undefined && memory <= 4) || (cores !== undefined && cores <= 4)) return "mid";
  return "high";
}

/** One step down the ladder after a slow probe. */
export const stepDown = (tier: Tier): Tier => (tier === "high" ? "mid" : "low");
