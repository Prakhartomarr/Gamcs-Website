import Image from "next/image";
import CountUp from "@/components/motion/CountUp";
import SectionEyebrow from "@/components/SectionEyebrow";
import { achievements, primaryCta, site, story, team } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * Who we are: copy and CTA on the left, a founder portrait on the right, and a
 * band of four figures underneath.
 *
 * The portrait is a real founder rather than stock photography — the reason
 * the previous version of this section used `AbstractPanel` was that it would
 * not depict people who are not GAMCS, and a founder satisfies that while
 * still putting a face on the firm.
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

  const founder = team.leadership[0];
  /* "Founder | FP&A & Due Diligence Specialist" -> "Founder" */
  const role = founder.title.split("|")[0].trim();

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

          <div className="who-portrait reveal">
            <Image
              src={founder.photo}
              alt={`${founder.name}, ${role}`}
              width={880}
              height={1056}
              sizes="(max-width: 1023px) 92vw, 440px"
            />
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
