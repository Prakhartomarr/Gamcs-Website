import type { Metadata } from "next";
import FluteShader from "@/components/ui/flute-shader";
import TeamRoster from "@/components/sections/TeamRoster";
import { primaryCta, story, team } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

const t = pages.team;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/team",
});

export default function TeamPage() {
  return (
    <>
      <section className="page-head ph-team">
        <div className="container">
          <h1>{team.h1}</h1>
          {team.body.map((para) => (
            <p key={para.slice(0, 32)}>{para}</p>
          ))}
          <p className="team-mission">{story.mission}</p>
          {/* NO BUTTONS IN THIS HEAD (client, 2026-10-22). "Schedule a Call"
              and "Their work" were both taken out; the band is headline,
              intro and mission only. The closing band below still carries
              "Schedule a Call", and /case-study is still reachable from the
              nav and seven other places, so nothing is orphaned.
              `pages.team.theirWork` is kept unrendered — manifest row
              TEAM-HEAD-05 points at it. */}
        </div>
      </section>

      {/* Founders as large staggered cards, advisers three across, each opening
          a bio panel. The page head above keeps the H1, the two-paragraph
          intro and the mission; each roster section carries its own eyebrow,
          heading and note, which the client wrote separately from the head and
          which say what that group of people is, not what the firm is. */}
      <TeamRoster />

      <section className="section team-cta-section">
        <div className="container">
          <div className="case-cta">
            <FluteShader />
            <h2>{team.closingCta}</h2>
            <CTA href={primaryCta.href} tier="secondary"
              data-cta="team-footer" icon="diagonal">
              {primaryCta.label}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
