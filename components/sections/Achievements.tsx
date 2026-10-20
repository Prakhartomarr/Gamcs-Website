import CountUp from "@/components/motion/CountUp";
import { achievements } from "@/lib/content/gamcs";

/**
 * Figures exactly as published on the live site — no rounding, no reformatting.
 *
 * Four columns, each a rule over a label, the figure and its qualifier
 * (client, 2026-10-20). The figures are the brand blue; everything around
 * them is type on the band's own white.
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
 * ORDER. Not the content module's order: the two largest lead, so the column
 * a reader meets first is the strongest claim.
 *
 * WHAT IS NOT SHOWN. `achievements.items` publishes five figures; this draws
 * four. The fifth, "10+ data warehouses built", is the smallest number in the
 * set and the one whose label needs the most explaining. It is untouched in
 * the content module — adding its index to SHOWN puts it back.
 */

/* Positions rather than values, so a figure can be re-worded in the content
   file without touching this: 0 $2Bn+, 3 150+, 2 100+, 1 30+. */
const SHOWN = [0, 3, 2, 1] as const;

export default function Achievements() {
  const figures = SHOWN.map((i) => achievements.items[i]).filter(Boolean);

  return (
    <section className="metrics" id="impact">
      <div className="container">
        {/* No heading (client, 2026-10-20). "Results so far" sat over four
            labelled figures that already say what they are; the band reads
            as results without a line telling it to. `achievements.lead` and
            `heading` both stay in the content module as retired copy. */}

        <div className="ach-grid">
          {/* The wrapper generates no box (`display:contents`); its children
              are the grid's own cells. It stays because `.reveal` staggers
              per figure and the four need to be siblings for that. */}
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
