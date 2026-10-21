import type { Metadata } from "next";
import HowWeHelpFilm from "@/components/sections/HowWeHelpFilm";
import HowWeHelpStack from "@/components/sections/HowWeHelpStack";
import { howWeHelp } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.howWeHelp;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/how-we-help",
});

/**
 * How we help. The band that used to sit between the maturity curve and the
 * solutions on the homepage, now its own route — the nav, the footer and the
 * 404's onward links all point here instead of at a homepage fragment.
 *
 * MOVE ONLY (client, 2026-10-20): nothing on this page that was not on that
 * band. No closing CTA, and the homepage closes the gap rather than keeping a
 * teaser, so the curve now runs straight into the solutions.
 *
 * Heading outline: h1 here, then the stack's phase names and the principles
 * heading at h2 and the six principle claims at h3. The section used to carry
 * its own h2 and render this same sentence; the page head owns it now, which
 * is why HowWeHelpStack has no heading block and everything inside it moved up
 * a level.
 */
export default function HowWeHelpPage() {
  return (
    <>
      {/* The plain `page-head`, as /privacy-policy uses, because public/page-art
          has no how-we-help.webp and the other routes' photographs are theirs.
          Dropping a 1600x620 webp in at public/page-art/how-we-help.webp and
          adding `page-head--art` here plus <PageHeadArt src="/page-art/how-we-help.webp" />
          inside this section is all this band needs to match /solutions, /team
          and /who-we-are. */}
      <section className="page-head ph-help">
        <div className="container">
          {/* One sentence, stored split so the section's `.fin-h2 .accent`
              could tint the second clause and draw its underline. There is no
              accent treatment on `.page-head h1` and inventing one is a design
              change the move did not ask for, so both halves render plain.

              Joined in one interpolation rather than `{lead} {accent}`: React
              separates two interpolations with comment nodes, which leaves the
              space its own text node, and Chrome drops a whitespace-only node
              when it computes the accessible name — the heading list and the
              VoiceOver rotor read "...where youto building..." while the
              visible text was fine. */}
          <h1>{`${howWeHelp.headingLead} ${howWeHelp.headingAccent}`}</h1>
          <p>{howWeHelp.sub}</p>
        </div>
      </section>

      {/* The same film the homepage carries, under the head and above the
          phases (client, 2026-10-21). `heading={false}`: the band's own h2
          and lead ARE this page's h1 and sub — the same three content keys —
          so rendered whole they would print twice on one screen. */}
      <HowWeHelpFilm heading={false} />

      <HowWeHelpStack />
    </>
  );
}
