import Image from "next/image";
import SectionEyebrow from "@/components/SectionEyebrow";
import { site, story, team } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { sections } from "@/lib/content/ui";
import CTA from "@/components/CTA";

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

  return (
    <section className="section who" id="who-we-are">
      <div className="container">
        <div className="who-row">
          <div className="who-copy reveal">
            <SectionEyebrow label={sections.whoWeAre} index="07" />
            <h2 className="who-heading">{story.heading}</h2>
            <p className="who-lead">{story.lead}</p>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
