import Image from "next/image";
import CountUp from "@/components/motion/CountUp";
import { achievements } from "@/lib/content/gamcs";

/**
 * Figures exactly as published on the live site — no rounding, no reformatting.
 *
 * A bento (styles in globals.css): the transaction value over a photograph,
 * and the other four as flat tiles around it. The DOM is unchanged from the
 * two-column version it replaces — card, then the four figures in their
 * wrapper, each figure label / value / note — because the phone layout orders
 * those three children with `order` and CountUp hangs off the value. The bento
 * is spans over the same markup, not a re-nesting of it.
 *
 * Why spans rather than a feature cell beside a rail (>=1024): the photo is
 * 3x2 of a 4x3 grid, 30+/100+ stack in the fourth column, and 50+/10+ halve
 * the last row. So the last row crosses under the photo instead of continuing
 * the right-hand column, and no column runs the full height — the thing a
 * big-cell-plus-regular-grid layout gives away immediately. Three cell shapes
 * come out of it at a 1374px container: 1025x~420 for the photo, 328x~210 for
 * the pair (near square), 677x~170 for the last row (wide).
 * - 768-1023: photo full width, figures 2x2 beneath it. Four tiles in three
 *   columns would orphan one, and the spans above have no room to read.
 * - <=768: the phone artboard — photo, then the figures as a hairlined list,
 *   number over label. Unchanged by the bento.
 *
 * Only the photo cell carries an image. The other four are type on a hairline
 * tile, so the one photograph stays the section's single focal point.
 */
/* Every published figure is shown: the transaction value on the card, the
   other four beside it. Positions rather than values, so a figure can be
   re-worded in the content file without touching this. */
const CARD = 0;
const FIGURES = [1, 2, 3, 4] as const;

export default function Achievements() {
  const card = achievements.items[CARD];
  const figures = FIGURES.map((i) => achievements.items[i]);

  return (
    <section className="metrics" id="impact">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <h2>{achievements.lead}</h2>
          </div>
        </div>

        <div className="ach-grid">
          {card && (
            <article className="ach-card reveal">
              {/* sizes = the cell's own width, which is 3/4 of the container
                  less a gap from >=1024 (1075px at the 1440px cap), the whole
                  container at 768-1023, and the container's phone width below
                  that. The photo is 2000x1425 and object-fit:cover, so the
                  wider-than-tall cell crops its top and bottom. */}
              <Image
                src="/page-art/impact-dashboard.webp"
                alt=""
                fill
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 96px), 1075px"
              />
              <div className="ach-card-value">
                <CountUp value={card.value} />
              </div>
              <p className="ach-card-label">{card.label}</p>
              <p className="ach-card-note">{card.note}</p>
            </article>
          )}

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
