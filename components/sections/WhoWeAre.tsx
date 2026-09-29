import Image from "next/image";
import SectionEyebrow from "@/components/SectionEyebrow";
import { site, story, team } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { roster, sections } from "@/lib/content/ui";
import CTA from "@/components/CTA";
import WhoFoundersReveal from "@/components/sections/WhoFoundersReveal";

/**
 * Who we are: the copy, its CTA and the mission line on the left, the
 * founders' portrait on the right over a link to the team page.
 *
 * The portrait is the real founders rather than stock photography — the reason
 * an earlier version used `AbstractPanel` was that it would not depict people
 * who are not GAMCS, and the founders satisfy that while putting a face on the
 * firm. The box is a 530x620 portrait; the photograph is square, so `cover`
 * takes 7.3% off each side, which on this frame is backdrop either side of the
 * two of them and not shoulder.
 *
 * The link to the team page sits inside the card rather than under it.
 */
export default function WhoWeAre() {
  /* Left of frame, then right — the order the alt text names them in. */
  const founders = team.leadership;

  /* Counted, never typed: the third figure is everyone the /team page lists,
     so an adviser joining moves it on its own. */
  const people = team.leadership.length + team.advisory.length;
  const stats = [
    { value: story.stats.yearsValue, label: story.stats.yearsLabel },
    { value: story.stats.foundedValue, label: story.stats.foundedLabel },
    { value: String(people), label: story.stats.peopleLabel },
  ];

  return (
    <section className="section who" id="who-we-are">
      <div className="container">
        <div className="who-row">
          <div className="who-copy reveal">
            <SectionEyebrow label={sections.whoWeAre} />
            <h2 className="who-heading">{story.heading}</h2>
            <p className="who-lead">{story.lead}</p>

            {/* Phone only. `.who-stats` is display:none until 767px, so on
                desktop this generates no box and the column below it is
                unchanged; the order it renders in on mobile is set by
                `order` on the grid, not by its position here. */}
            <div className="who-stats">
              {stats.map((s) => (
                <div className="who-stat" key={s.label}>
                  <div className="who-stat-value">{s.value}</div>
                  <p className="who-stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* The section opens the story and hands the rest to /who-we-are.
                It used to point at /contact, which is not what the label says. */}
            <CTA href="/who-we-are" tier="secondary" icon="diagonal">
              {sections.aboutFirm}
            </CTA>

            {/* The mission closes the copy column, beside the portrait, rather
                than running the container's full width underneath the row. */}
            <p className="who-mission reveal">{story.mission}</p>
          </div>

          <div className="who-figure reveal">
            <div className="who-portrait">
              <Image
                src={team.foundersPhoto}
                alt={fill(sections.foundersAlt, { first: founders[0].name, second: founders[1].name, siteName: site.name })}
                width={880}
                height={880}
                sizes="(max-width: 1279px) 92vw, 530px"
              />
              {/* Inside the card, bottom left, on frosted glass. It is the same
                  CTA as before — same href, same arrow — restyled by the class;
                  it is still the Link that component renders. */}
              <CTA
                href="/team"
                tier="secondary"
                icon="arrow"
                data-cta="who-founders"
                className="who-founders-btn"
              >
                {sections.meetFounders}
              </CTA>

              {/* Phone only, and the replacement for the link above rather
                  than an addition to it: `.who-reveal` is display:none until
                  767px, where the same block hides `.who-founders-btn`. */}
              <WhoFoundersReveal
                founders={founders.map((f) => ({ name: f.name, title: f.title, photo: f.photo }))}
                openLabel={sections.meetFounders}
                teamLabel={sections.fullTeam}
                closeLabel={roster.close}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
