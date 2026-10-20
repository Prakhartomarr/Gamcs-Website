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
 * 3x2 of a 4x3 grid, the first two figures stack in the fourth column, and
 * the last two halve the bottom row. So that row crosses under the photo
 * instead of continuing the right-hand column, and no column runs the full
 * height — the thing a big-cell-plus-regular-grid layout gives away
 * immediately. Three cell shapes come out of it: the photo wide, the pair
 * near square, the bottom row wide and shallow. Exact sizes are not written
 * down here because they move with the container ladder below and a stale
 * number here is what produced a wrong `sizes` attribute once already.
 * - 769-1023: photo full width, figures 2x2 beneath it. Four tiles in three
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
              {/* sizes is the cell's measured width, band by band. It takes
                  five terms because the container is clamped twice: by its own
                  `width:min(1440px,calc(100% - 96px))`, and again by Tailwind's
                  `.container{max-width}` — so the container ladder is 768 at
                  769-1023, 920 at 1024-1279, 1184 at 1280, 1280 to 1535 and
                  1440 from 1536, and the photo cell (3 of 4 columns + 2 gaps,
                  = .75C - 5) is 768 / 685 / 883 / 955 / 1075. A single term
                  for the whole of >=1024 over-declared by up to 390px and
                  bought the next variant up the ladder for nothing.
                  The photo is 2000x1425 and object-fit:cover: the wide cells
                  crop its top and bottom, and the 7/8 phone cell crops its
                  sides instead. */}
              <Image
                src="/page-art/impact-dashboard.webp"
                alt=""
                fill
                sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1023px) min(768px, calc(100vw - 56px)), (max-width: 1279px) 685px, (max-width: 1535px) 955px, 1075px"
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
