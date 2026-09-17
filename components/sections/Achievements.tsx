import Image from "next/image";
import CountUp from "@/components/motion/CountUp";
import SectionEyebrow from "@/components/SectionEyebrow";
import { achievements } from "@/lib/content/gamcs";

/**
 * Figures exactly as published on the live site — no rounding, no reformatting.
 *
 * Four of the eight published figures, picked by value: the deal figure over a
 * photograph, and three beside it (label first, number under it). The other
 * four stay in the content file but are not shown.
 *
 * Layout (styles in globals.css), with the measurements behind each breakpoint.
 * Numbers are Sora 300 at -0.035em; widths are the rendered ink.
 * - >=1024: card and figures side by side, minmax(0,2fr) minmax(0,1fr), 72px
 *   gap. Card min-height clamp(360px,27.78vw,400px): 400 at 1440 as designed,
 *   360 below 1296. Card number clamp(60px,7.2222vw,104px), figures
 *   clamp(44px,4.1667vw,60px), except at 1024-1279: the container is pinned at
 *   920 there (card 565px, figure column 283px), so the type is held at 74px
 *   and 44px, the 1024 values, rather than growing inside boxes that don't.
 *   "10,000+" is then 174px of 283; the longest label wraps to 2 balanced
 *   lines (1 line from 1280), and the figures keep 51px between them. From
 *   1280 (column 371px) "10,000+" is 211-237px.
 * - 768-1023: card full width, 320px tall; figures in a 3-column row, 48px
 *   under the card as the card is under the heading. Columns are 216-235px,
 *   so the 174px "10,000+" has 42px or more to spare; labels wrap to at most
 *   2 lines, each sits 10px over its number, and the numbers share one
 *   baseline (so label tops differ by a line).
 * - <=767: the phone artboard, figures stacked. A 3-column row would fit down
 *   to 622px, but only just: the container is 640px at most here, so columns
 *   are 174-192px (0-18px to spare) and every label wraps.
 * - White text on the photo, sampled against the rendered pixels behind it at
 *   360-1920: the lightest pixel still gives 6.2:1 for the number and 5.8:1
 *   for the label, so the design's scrims are used unchanged.
 */
const CARD = "$525Mn";
const FIGURES = ["10,000+", "90%", "100+"] as const;

type Item = (typeof achievements.items)[number];
const byValue = (v: string) => achievements.items.find((i) => i.value === v);

export default function Achievements() {
  const card = byValue(CARD);
  const figures = FIGURES.map(byValue).filter((i): i is Item => Boolean(i));

  return (
    <section className="metrics" id="impact">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <SectionEyebrow label={achievements.heading} />
            <h2>{achievements.lead}</h2>
          </div>
        </div>

        <div className="ach-grid">
          {card && (
            <article className="ach-card reveal">
              {/* sizes = the width the 1600x620 photo is drawn at under
                  object-fit:cover (card height x 2.58), which is wider than
                  the card at every width: 260px, 320px, then 360-400px tall */}
              <Image
                src="/page-art/who-we-are.webp"
                alt=""
                fill
                sizes="(max-width: 767px) 671px, (max-width: 1023px) 826px, 1032px"
              />
              <div className="ach-card-value">
                <CountUp value={card.value} />
              </div>
              <p className="ach-card-label">{card.label}</p>
            </article>
          )}

          <div className="ach-figures">
            {figures.map((m) => (
              <article className="ach-figure reveal" key={m.value}>
                <p className="ach-figure-label">{m.label}</p>
                <div className="ach-figure-value">
                  <CountUp value={m.value} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
