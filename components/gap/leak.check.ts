/* Self-check for the Leak model. Run: node components/gap/leak.check.ts */
import assert from "node:assert/strict";
import { LEAK, State, blank, emitRate, fallSpeed, step, survival } from "./leak.ts";

// the message: four leaks lose most of the flow, but not all of it
const s = survival(LEAK.rate, 4);
assert.ok(s > 0.15 && s < 0.35, `survival ${s}`);

// a seeded run agrees with the closed form
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const leakY = [100, 200, 300, 400];
let arrived = 0;
const N = 20000;
for (let k = 0; k < N; k++) {
  const p = blank();
  p.state = State.Flow;
  p.vy = 100;
  for (let t = 0; t < 600 && p.state !== State.Free; t++) {
    if (step(p, 1 / 60, leakY, 500, () => LEAK.rate, rand) === "arrived") arrived++;
  }
}
assert.ok(Math.abs(arrived / N - s) < 0.02, `simulated ${arrived / N} vs ${s}`);

// a fast particle cannot skip a leak in one big step
const fast = blank();
fast.state = State.Flow;
fast.vy = 100000;
let lost = false;
step(fast, 1, leakY, 500, (i) => (i === 2 ? 1 : 0), rand);
lost = fast.state === State.Lost;
assert.ok(lost && fast.y === 300, "leak 3 must catch even a fast particle");

// lost particles fade out and free their slot
const g = blank();
g.state = State.Lost;
g.alpha = 1;
for (let t = 0; t < 120; t++) step(g, 1 / 60, leakY, 500, () => 0, rand);
assert.equal(g.state, State.Free);

// scroll drives flow, within caps
assert.equal(emitRate(0), LEAK.emitBase);
assert.ok(emitRate(500) > emitRate(0));
assert.equal(emitRate(1e6), LEAK.emitMax);
assert.equal(fallSpeed(1e6), LEAK.speedMax);

console.log("leak model: ok");
