/* Self-check for the Ascent maths. Run: node components/maturity/ascent.check.ts */
import assert from "node:assert/strict";
import { amplitude, guessTier, progressT, rubberBand, snapTarget, stageT, stepDown } from "./ascent.ts";

const N = 5;

// stages span the padded width, ends symmetric
assert.equal(stageT(0, N).toFixed(3), "0.090");
assert.equal(stageT(N - 1, N).toFixed(3), "0.910");
assert.equal(progressT(-3, N), stageT(0, N)); // clamped

// noise damps monotonically up the curve, to the floor at stage 05
for (let p = 0; p < N - 1; p += 0.25) assert.ok(amplitude(p, N) > amplitude(p + 0.25, N));
assert.ok(Math.abs(amplitude(N - 1, N) - 0.004) < 1e-9);

// snapping: a still release rounds; a fling carries; never past the ends
assert.equal(snapTarget(1.4, 0, N), 1);
assert.equal(snapTarget(1.4, 3, N), 2); // 1.4 + 0.42 → 2
assert.equal(snapTarget(3.8, 20, N), 4);
assert.equal(snapTarget(0.2, -20, N), 0);

// rubber band only outside the range
assert.equal(rubberBand(2, N), 2);
assert.ok(rubberBand(-1, N) > -1 && rubberBand(-1, N) < 0);
assert.ok(rubberBand(5, N) > 4 && rubberBand(5, N) < 5);

// tiers
assert.equal(guessTier(false), "low");
assert.equal(guessTier(true, 2, 8), "low");
assert.equal(guessTier(true, 4, 8), "mid");
assert.equal(guessTier(true, 8, 4), "mid");
assert.equal(guessTier(true, 8, 8), "high");
assert.equal(stepDown("high"), "mid");
assert.equal(stepDown("mid"), "low");

console.log("ascent maths: ok");
