import CountUp from "@/components/motion/CountUp";
import SectionEyebrow from "@/components/SectionEyebrow";
import { achievements } from "@/lib/content/gamcs";

/**
 * Figures exactly as published on the live site — no rounding, no reformatting.
 *
 * Layout is a 6-column bento: the two figures that carry the most weight get
 * full accent panels in the blue and near-black already used by the Solutions
 * block, so the section reads as part of the same system rather than a new
 * one. The remaining six sit as bordered tiles, two columns each.
 */
const HERO_ORDER = ["$525Mn", "10,000+"] as const;

export default function Achievements() {
  const heroes = HERO_ORDER.map((v) =>
    achievements.items.find((i) => i.value === v)
  ).filter((i): i is (typeof achievements.items)[number] => Boolean(i));

  const rest = achievements.items.filter(
    (i) => !HERO_ORDER.includes(i.value as (typeof HERO_ORDER)[number])
  );

  return (
    <section className="metrics" id="impact">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <SectionEyebrow n={4} label={achievements.heading} />
            <h2>{achievements.lead}</h2>
          </div>
        </div>

        <div className="stat-bento">
          {heroes.map((m, i) => (
            <article
              className={`stat-hero ${i === 0 ? "is-blue" : "is-dark"} reveal`}
              key={m.value}
            >
              <div className="stat-hero-value">
                <CountUp value={m.value} />
              </div>
              <p className="stat-hero-label">{m.label}</p>
            </article>
          ))}

          {rest.map((m) => (
            <article className="stat-tile reveal" key={m.value} data-lift>
              <div className="stat-tile-value">
                <CountUp value={m.value} />
              </div>
              <p className="stat-tile-label">{m.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
