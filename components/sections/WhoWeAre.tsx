import Image from "next/image";
import SectionEyebrow from "@/components/SectionEyebrow";
import { site, story, team } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { sections } from "@/lib/content/ui";
import CTA from "@/components/CTA";

/**
 * Who we are: copy and CTA on the left, the founders' portrait on the right
 * over a link to the team page, and the mission line underneath.
 *
 * The portrait is the real founders rather than stock photography — the reason
 * an earlier version used `AbstractPanel` was that it would not depict people
 * who are not GAMCS, and the founders satisfy that while putting a face on the
 * firm. The box now matches the photograph's own aspect so neither of them is
 * cropped out of frame.
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
          </div>

          <div className="who-figure reveal">
            <div className="who-portrait">
              <Image
                src={team.foundersPhoto}
                alt={fill(sections.foundersAlt, { first: founders[0].name, second: founders[1].name, siteName: site.name })}
                width={880}
                height={880}
                sizes="(max-width: 1023px) 92vw, 440px"
              />
            </div>
            <CTA href="/team" tier="secondary" icon="arrow" data-cta="who-founders">
              {sections.meetFounders}
            </CTA>
          </div>
        </div>

        <p className="who-mission reveal">{story.mission}</p>
      </div>
    </section>
  );
}
