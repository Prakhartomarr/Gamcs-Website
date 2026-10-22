import type { Metadata } from "next";
import TeamRoster from "@/components/sections/TeamRoster";
import { story, team } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";
import CtaBand from "@/components/sections/CtaBand";

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
          {/* ONE PARAGRAPH (client, 2026-10-22). This was three: the two
              team.body entries and story.mission under it, each in its own
              <p>. Joined at render — team.body is left a two-element array
              because manifest rows point at [0] and [1], and story.mission is
              shared copy that the homepage accents and /careers prints, so
              neither is rewritten to suit this page.

              The mission keeps its emphasis as the closing clause rather than
              being flattened into the rest: .page-head .team-mission is white
              at 600 against the paragraph's #CBD2EA at 500, which is what
              made it stand out as a separate block. A span, not a <strong> —
              this is a visual accent, not a change in meaning, and the page
              head should not announce emphasis to a screen reader that the
              sentence does not carry. It starts on its own line (client,
              2026-10-23), so "Our" no longer ends the paragraph's last line. */}
          <p>
            {team.body.join(" ")}
            <br />
            <span className="team-mission">{story.mission}</span>
          </p>
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

      <CtaBand heading={team.closingCta} dataCta="team-footer" />
    </>
  );
}
