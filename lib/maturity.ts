/**
 * Scoring for the finance maturity self-assessment (/finance-maturity).
 *
 * Arithmetic only — no React, and nothing from lib/content. The page owns
 * every word; this owns the numbers, so the client can reword the whole
 * questionnaire without anyone re-reading the gates. scripts/maturity-check.mjs
 * re-derives those gates independently and brute-forces all 5^8 answer sets
 * against this file.
 */

export const QUESTION_COUNT = 8;

export type Answer = 1 | 2 | 3 | 4 | 5;

export type CapabilityKey = "foundation" | "reporting" | "insight" | "decisions";

/**
 * Both exported functions clamp rather than throw. They are called from a
 * component that builds the answers up one question at a time, so they will
 * routinely see a short array — a half-finished quiz must not be able to take
 * the page down, and an exception thrown during render would do exactly that.
 * An unanswered or out-of-range question scores 1, the floor, so a partial
 * result can only ever improve as the remaining questions are answered.
 */
const normalise = (answers: Answer[]): number[] =>
  Array.from({ length: QUESTION_COUNT }, (_, i) => {
    const v = Math.round(Number(answers[i]));
    return Number.isFinite(v) ? Math.min(5, Math.max(1, v)) : 1;
  });

/**
 * The client's stage gates, in the order they were given.
 *
 * This is a waterfall on purpose, and must stay one. The gates are mutually
 * exclusive ONLY because they are evaluated in order: "Q5 < 4 or Q6 < 4" is
 * true of a great many answer sets that are also Stage 1. Rewritten as five
 * independent booleans it would look tidier and would start returning the
 * wrong stage the first time someone reordered or short-circuited them.
 */
export function stageFor(answers: Answer[]): 1 | 2 | 3 | 4 | 5 {
  const a = normalise(answers);
  const q = (n: number) => a[n - 1]; // 1-based, to read against the questionnaire
  if (q(1) < 3 || q(2) < 3 || q(4) < 3) return 1;
  if (q(3) < 3) return 2;
  if (q(5) < 4 || q(6) < 4) return 3;
  if (!a.every((v) => v >= 4)) return 4;
  return 5;
}

/**
 * The four capability bars, each the mean of its topic pair.
 *
 * A mean of two integers lands on .0 or .5 and is returned as such — the
 * client's mockup prints "1.5 / 5", so rounding here would contradict the
 * design rather than tidy it.
 */
export function capabilityScores(answers: Answer[]): Record<CapabilityKey, number> {
  const a = normalise(answers);
  const mean = (x: number, y: number) => (a[x - 1] + a[y - 1]) / 2;
  return {
    foundation: mean(1, 4),
    reporting: mean(2, 3),
    insight: mean(5, 6),
    decisions: mean(7, 8),
  };
}
