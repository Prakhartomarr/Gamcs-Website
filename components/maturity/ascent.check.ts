/* Self-check for the Ascent maths. Run: node components/maturity/ascent.check.ts */
import assert from "node:assert/strict";
import { baseY, curvePath, progressT, rubberBand, snapTarget, stageT } from "./ascent.ts";

const N = 5;

// stages span the padded width, ends symmetric
assert.equal(stageT(0, N).toFixed(3), "0.090");
assert.equal(stageT(N - 1, N).toFixed(3), "0.910");
assert.equal(progressT(-3, N), stageT(0, N)); // clamped

// the curve only ever rises: a maturity curve has no dips
for (let t = 0; t < 1; t += 0.01) assert.ok(baseY(t + 0.01) > baseY(t));

// the path starts at the left edge and ends at the right
const d = curvePath(1000, 300);
assert.ok(d.startsWith("M0.0 "));
assert.ok(/L1000\.0 [\d.]+$/.test(d));

// snapping: a still release rounds; a fling carries; never past the ends
assert.equal(snapTarget(1.4, 0, N), 1);
assert.equal(snapTarget(1.4, 3, N), 2); // 1.4 + 0.42 → 2
assert.equal(snapTarget(3.8, 20, N), 4);
assert.equal(snapTarget(0.2, -20, N), 0);

// rubber band only outside the range
assert.equal(rubberBand(2, N), 2);
assert.ok(rubberBand(-1, N) > -1 && rubberBand(-1, N) < 0);
assert.ok(rubberBand(5, N) > 4 && rubberBand(5, N) < 5);

console.log("ascent maths: ok");
