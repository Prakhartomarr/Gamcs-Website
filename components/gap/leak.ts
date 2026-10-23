/**
 * The Leak — the decision gap on a phone. Numbers (real digits) stream down a
 * pipe from "the numbers" to "the decision"; at each of the four pain points
 * some break off, turn red and fall away. Everything tunable is in LEAK, and
 * the per-particle step is pure, so `node components/gap/leak.check.ts`
 * can test the model without a canvas.
 */

export const LEAK = {
  /** Chance a number is lost at each leak. Four leaks at 0.3 deliver
      0.7^4 ≈ 24% — the stream visibly thins, which is the whole message. */
  rate: 0.3,
  /** While a leak has just been opened (tapped), it loses most of the flow. */
  burstRate: 0.85,
  burstMs: 700,
  /** Numbers sprayed out of a leak the moment it is opened. */
  burstCount: 10,
  /** Emission: a resting trickle, plus a share of scroll speed (px/s). */
  emitBase: 7,
  emitPerScroll: 0.05,
  emitMax: 40,
  /** Fall speed down the pipe (px/s), plus a share of scroll speed. */
  speed: 70,
  speedPerScroll: 0.12,
  speedMax: 260,
  /** A lost number's sideways throw (px/s), gravity (px/s²), fade (1/s).
      Small throws on purpose: lost numbers drip down the gutter between
      the pipe and the cards, where they stay visible, rather than flying
      under the cards. */
  throwMin: 12,
  throwMax: 48,
  gravity: 170,
  fade: 1.05,
  /** Pool size per tier; the pool is preallocated and recycled. */
  pool: { high: 180, mid: 100 },
  /** Device-pixel-ratio cap. */
  dpr: 1.5,
  glyphs: "0123456789%.",
  font: 10,
  /** Brand blue for numbers in flow, the section's red for lost ones. */
  blue: "15,94,151",
  red: "199,38,26",
  /** Android haptic tick (ms) when a leak is opened. */
  haptic: 6,
} as const;

export const State = { Free: 0, Flow: 1, Lost: 2 } as const;
export type State = (typeof State)[keyof typeof State];

export type Particle = {
  state: State;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  alpha: number;
  glyph: string;
  /** Index of the next leak this number has to pass. */
  next: number;
};

export const blank = (): Particle => ({
  state: State.Free, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, alpha: 0, glyph: "0", next: 0,
});

/** Overall share expected to arrive, for a given per-leak rate and count. */
export const survival = (rate: number, leaks: number): number => Math.pow(1 - rate, leaks);

/** Scroll speed (px/s) → emission per second and fall speed, both capped. */
export const emitRate = (scroll: number): number =>
  Math.min(LEAK.emitBase + Math.abs(scroll) * LEAK.emitPerScroll, LEAK.emitMax);
export const fallSpeed = (scroll: number): number =>
  Math.min(LEAK.speed + Math.abs(scroll) * LEAK.speedPerScroll, LEAK.speedMax);

/** Send a particle tumbling out of the pipe. `rand` is injected for tests. */
export function lose(p: Particle, rand: () => number): void {
  p.state = State.Lost;
  p.vx = LEAK.throwMin + rand() * (LEAK.throwMax - LEAK.throwMin);
  p.vy = -20 + rand() * 60;
  p.vr = (rand() - 0.5) * 8;
}

/**
 * Advance one particle by dt seconds. Returns "arrived" when a number in
 * flow reaches the decision, else nothing. `leakY` are the leak heights,
 * top to bottom; `rateAt(i)` is the current loss chance at leak i.
 */
export function step(
  p: Particle, dt: number, leakY: readonly number[], toY: number,
  rateAt: (i: number) => number, rand: () => number,
): "arrived" | void {
  if (p.state === State.Flow) {
    p.y += p.vy * dt;
    while (p.next < leakY.length && p.y >= leakY[p.next]) {
      const i = p.next++;
      if (rand() < rateAt(i)) {
        p.y = leakY[i];
        lose(p, rand);
        return;
      }
    }
    if (p.y >= toY) {
      p.state = State.Free;
      return "arrived";
    }
  } else if (p.state === State.Lost) {
    p.vy += LEAK.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    p.alpha -= LEAK.fade * dt;
    if (p.alpha <= 0) p.state = State.Free;
  }
}
