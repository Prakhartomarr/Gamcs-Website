import CountUp from "@/components/motion/CountUp";
import Rich from "@/components/Rich";
import { achievements } from "@/lib/content/gamcs";

/**
 * Figures exactly as published on the live site — no rounding, no reformatting.
 *
 * Six, in two rows of three: a rule over a label, the figure and its
 * qualifier. The figures are the brand blue; everything around them is type
 * on the band's own white. Four across until 2026-10-21, when the client
 * added the fifth and sixth — six across would have put each label in a
 * 200px column at 1440, and these labels run to "Financial models, budgets &
 * plans delivered".
 *
 * WHAT WENT. This was a bento: "$2Bn+" set over a blurred stock photograph of
 * a laptop as a dark card, with the other four as bordered white tiles in a
 * 2x2 beside it. The photograph was a stock admin dashboard whose own KPI
 * strip sat on the card's top edge, so it needed a two-axis scrim to stop a
 * reader resolving six figures that were not the client's — a picture that
 * has to be obscured to be honest is not carrying the section. The tile
 * borders went with it: a hairline box around each figure was a card doing
 * nothing a rule does not already do.
 *
 * ORDER. Not the content module's order: the strongest claims lead, so the
 * cell a reader meets first carries the most weight. The two the client added
 * on 2026-10-21 close the set, which is where they asked for them.
 *
 * ALL SIX ARE SHOWN. "Data warehouses built" sat in the content module
 * unrendered for a day — the smallest number in the set and the label that
 * needed the most explaining — and came back at 15+ with a qualifier that
 * explains it.
 */

/* Positions rather than values, so a figure can be re-worded in the content
   file without touching this: 0 $2Bn+, 3 150+, 5 Up to 90%, 1 30+, 4 15+,
   2 100+.

   "Up to 90%" AND "100+" TRADED PLACES (client, 2026-10-22) — the third and
   sixth cells, which are the right-hand column of each row at three across.
   Worth knowing what it does to the reading: the band's five other figures
   count what was BUILT and that one counts what it DID, so the set no longer
   closes on its only outcome. It ends on "Financial models, budgets & plans
   delivered" instead and the outcome now sits at the end of the first row.

   The order only reads as rows at three columns. It wraps to two from 768
   and to one below 640, where these two become cells 3 and 6 of a different
   shape — nothing to fix, just not a layout that can hold a pairing. */
const SHOWN = [0, 3, 5, 1, 4, 2] as const;

export default function Achievements() {
  const figures = SHOWN.map((i) => achievements.items[i]).filter(Boolean);

  return (
    <section className="metrics" id="impact">
      <div className="container">
        {/* The heading is back, rewritten by the client (2026-10-21). It
            heads the figures AND the testimonial carousel below them, which
            is why that carousel's own heading is now screen-reader only and
            why the two bands close up into one. The band ran without a
            heading for a day on the reasoning that labelled figures say what
            they are; this one does something the figures cannot, which is
            tell a reader the clients are part of the same claim. */}
        <div className="section-head reveal">
          <div>
            <h2>
              <Rich parts={achievements.headingParts} />
            </h2>
          </div>
        </div>

        <div className="ach-grid">
          {/* The wrapper generates no box (`display:contents`); its children
              are the grid's own cells. It stays because `.reveal` staggers
              per figure and the six need to be siblings for that. */}
          <div className="ach-figures">
            {figures.map((m) => (
              <article className="ach-figure reveal" key={m.value}>
                <p className="ach-figure-label">{m.label}</p>
                <div className="ach-figure-value">
                  <CountUp value={m.value} />
                </div>
                <p className="ach-figure-note">{m.note}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
