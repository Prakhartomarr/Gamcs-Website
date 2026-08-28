import Image from "next/image";
import CountUp from "@/components/motion/CountUp";
import SectionEyebrow from "@/components/SectionEyebrow";
import { achievements, primaryCta, site, story, team } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * Who we are: copy and CTA on the left, the founders' portrait on the right
 * over a link to the team page, and a band of four figures underneath.
 *
 * The portrait is the real founders rather than stock photography — the reason
 * an earlier version used `AbstractPanel` was that it would not depict people
 * who are not GAMCS, and the founders satisfy that while putting a face on the
 * firm. The box now matches the photograph's own aspect so neither of them is
 * cropped out of frame.
 *
 * The four figures are the published ones, pulled from `achievements` by value
 * so there is a single source for them: they also appear in the Achievements
 * section, and this way the two can never drift apart. `CountUp` is how that
 * section already renders them, and it degrades to plain server-rendered text
 * without JS or under prefers-reduced-motion.
 */
const FIGURES = ["$525Mn", "10,000+", "90%", "100+"] as const;

export default function WhoWeAre() {
  const stats = FIGURES.map((v) =>
    achievements.items.find((i) => i.value === v)
  ).filter((i): i is (typeof achievements.items)[number] => Boolean(i));

  /* Left of frame, then right — the order the alt text names them in. */
  const founders = team.leadership;

  return (
    <section className="section who" id="who-we-are">
      <div className="container">
        <div className="who-row">
          <div className="who-copy reveal">
            <SectionEyebrow label="Who we are" />
            <h2 className="who-heading">{site.tagline}</h2>
            <p className="who-lead">{story.lead}</p>
            <p className="who-sub">{story.network}</p>
            <CTA href={primaryCta.href} tier="secondary" icon="diagonal">
              About our firm
            </CTA>
          </div>

          <div className="who-figure reveal">
            <div className="who-portrait">
              <Image
                src={team.foundersPhoto}
                alt={`${founders[0].name} and ${founders[1].name}, founders of ${site.name}`}
                width={880}
                height={852}
                sizes="(max-width: 1023px) 92vw, 440px"
              />
            </div>
            <CTA href="/team" tier="secondary" icon="arrow" data-cta="who-founders">
              Meet our founders
            </CTA>
          </div>
        </div>

        <p className="who-mission reveal">{story.mission}</p>

        <ul className="who-stats reveal">
          {stats.map((s) => (
            <li key={s.value}>
              <div className="who-stat-value">
                <CountUp value={s.value} />
              </div>
              <p className="who-stat-label">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
