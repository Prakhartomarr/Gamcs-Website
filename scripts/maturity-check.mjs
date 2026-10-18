// The one runnable check for the maturity scoring. Exits non-zero on any failure.
//   all 5^8 answer sets -> exactly one of five independently written gates
//   the same 5^8 -> lib/maturity.ts agrees with those gates, one by one
//   the stage distribution -> the counts the client signed off
//   the mockup's answer set -> the four capability figures printed in it
// usage: node scripts/maturity-check.mjs   (no dev server, no network)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;
const step = (name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

/* node cannot import a .ts file on every version the repo supports, so the
   module is transpiled with the typescript already in devDependencies and
   imported from a temp file. Type erasure only — the logic under test is the
   source in lib/, not a copy of it kept in step by hand. */
const src = fs.readFileSync(path.join(ROOT, "lib/maturity.ts"), "utf8");
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gamcs-maturity-"));
const built = path.join(tmp, "maturity.mjs");
fs.writeFileSync(built, js);
const { QUESTION_COUNT, stageFor, capabilityScores } = await import(pathToFileURL(built).href);

/* The five gates, re-derived from the client's waterfall and written out here
   independently: each one is fully qualified, so none depends on the gates
   above it. That is the whole point of the exercise — a check that imported
   stageFor and compared it to itself would prove nothing. If exactly one of
   these is true for all 390,625 answer sets, the waterfall they were expanded
   from has no gap and no overlap, and stageFor can be compared against them. */
const GATES = [
  (a) => a[0] < 3 || a[1] < 3 || a[3] < 3,
  (a) => a[0] >= 3 && a[1] >= 3 && a[3] >= 3 && a[2] < 3,
  (a) => a[0] >= 3 && a[1] >= 3 && a[3] >= 3 && a[2] >= 3 && (a[4] < 4 || a[5] < 4),
  (a) =>
    a[0] >= 3 && a[1] >= 3 && a[3] >= 3 && a[2] >= 3 && a[4] >= 4 && a[5] >= 4 &&
    !a.every((v) => v >= 4),
  (a) => a.every((v) => v >= 4),
];

step("the module exports eight questions", QUESTION_COUNT === 8, `QUESTION_COUNT = ${QUESTION_COUNT}`);

const total = 5 ** QUESTION_COUNT;
const counts = [0, 0, 0, 0, 0];
const answers = new Array(QUESTION_COUNT);
let ambiguous = 0; // answer sets matching none or several gates
let disagreed = 0;
let firstAmbiguous = null;
let firstDisagreement = null;

for (let i = 0; i < total; i++) {
  for (let d = 0, n = i; d < QUESTION_COUNT; d++, n = Math.floor(n / 5)) {
    answers[d] = (n % 5) + 1;
  }
  let stage = 0;
  let hits = 0;
  for (let g = 0; g < 5; g++) if (GATES[g](answers)) { hits++; stage = g + 1; }
  if (hits !== 1) {
    ambiguous++;
    firstAmbiguous ??= `[${answers}] matched ${hits} gates`;
    continue;
  }
  counts[stage - 1]++;
  const got = stageFor(answers);
  if (got !== stage) {
    disagreed++;
    firstDisagreement ??= `[${answers}] gates say ${stage}, stageFor says ${got}`;
  }
}

step(`every one of ${total.toLocaleString("en-US")} answer sets matches exactly one gate`, ambiguous === 0, firstAmbiguous ?? "no gaps, no overlaps");
step("stageFor agrees with the gates on all of them", disagreed === 0, firstDisagreement ?? `${total.toLocaleString("en-US")} agreements`);

const EXPECTED = [306250, 33750, 42525, 7844, 256];
const got = counts.join(", ");
step("the stage distribution is unchanged", got === EXPECTED.join(", "), `[${got}] vs [${EXPECTED.join(", ")}]`);

/* The exact answer set in the client's mockup, so this check also pins the
   bars in the design to the code that draws them. */
const MOCKUP = [3, 3, 1, 3, 2, 2, 1, 2];
const WANT = { foundation: 3, reporting: 2, insight: 2, decisions: 1.5 };
const bars = capabilityScores(MOCKUP);
step(
  "the mockup's answers give the mockup's capability bars",
  Object.entries(WANT).every(([k, v]) => bars[k] === v),
  Object.entries(bars).map(([k, v]) => `${k} ${v}`).join(", ")
);

/* Guarding: the component calls both functions while the quiz is still being
   filled in, so a short or dirty array must return a number, not throw. */
let threw = "";
let partial;
try {
  partial = [stageFor([]), stageFor([5, 5]), stageFor([9, 0, 5, 5, 5, 5, 5, 5]), stageFor(new Array(8).fill(5))];
} catch (err) { threw = err.message; }
step("a part-finished or out-of-range answer set is clamped, not thrown on", !threw && partial.join(",") === "1,1,1,5", threw || `stages [${partial}]`);
step("an unanswered question scores 1", capabilityScores([5, 5, 5, 5]).insight === 1, `insight ${capabilityScores([5, 5, 5, 5]).insight}`);

fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
