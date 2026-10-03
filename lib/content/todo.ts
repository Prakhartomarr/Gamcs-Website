/**
 * Missing facts, in one place.
 *
 * A `[[TODO: …]]` string is not a bug and not an oversight. It is a fact the
 * business has not given us yet, rendered on the page as a visible hole so
 * that nobody — client, reviewer or the next person editing this repo — can
 * mistake a guess for something the firm actually said.
 *
 * THE RULE: a placeholder is always better than a plausible guess. Never
 * replace one with a number, an employer, a client, a sector, a year or a
 * credential that is not published somewhere we can point at. Replace it only
 * with the client's own answer — ideally by typing that answer into the cell
 * named in `code` in content-doc/GAMCS-website-copy.docx and running the copy
 * importer (scripts/copy/import.mjs), which writes it back into this module.
 *
 * Two consumers read this list, so it is the single source for both:
 *   `npm run check:todos`  — scripts/check-todos.mjs; fails if a marker in
 *                            lib/content is not registered here, or if a row
 *                            here no longer has a marker on the page.
 *   `prebuild`             — the same script in warn mode, because the page
 *                            genuinely ships with holes today.
 *
 * Markers live as plain string literals in the content modules, NOT as calls
 * to `TODO()`: the copy pipeline (scripts/copy/source.mjs) can only read and
 * rewrite literals, and a placeholder's whole point is that the client can
 * answer it in the copy document. `TODO()` is for a marker built at runtime,
 * and for stating here exactly what the page shows.
 */
export const TODO = (what: string) => `[[TODO: ${what}]]`;

export const TODOS = [
  {
    field: "whoWeAre.hero.proof[1]",
    code: "WHO-HERO-04",
    need: "sectors served",
    /* The third proof point in the hero. The repo names sectors only for
       advisers' past careers and for case studies — never as the sectors the
       firm serves, and never for either founder. */
  },
  {
    field: "whoWeAre.story.timeline[0].year",
    code: "WHO-ORIGIN-04",
    need: "year the founders met at college",
  },
  {
    field: "whoWeAre.story.timeline[1].year",
    code: "WHO-ORIGIN-07",
    need: "year both founders qualified as Chartered Accountants",
  },
  {
    field: "whoWeAre.story.timeline[2].year",
    code: "WHO-ORIGIN-10",
    need: "year the founders first worked together in corporate finance",
    /* 2023 is the only year the repo states. The three above are the three
       steps before it, and each names its own year rather than reading
       "[[TODO: year]]" three times: identical text collapses into one cell in
       the copy document, so one answer would have silently answered all three. */
  },
].map((t) => ({ ...t, text: TODO(t.need) }));
