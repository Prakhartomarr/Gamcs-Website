import type { Metadata } from "next";
import HowWeHelpFilm from "@/components/sections/HowWeHelpFilm";
import HowWeHelpPlatforms from "@/components/sections/HowWeHelpPlatforms";
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
          phases (client, 2026-10-21). Its homepage head is this page's h1
          and sub, so here it takes a head of its own, `filmHead` (client,
          2026-10-22). */}
      <HowWeHelpFilm heading={howWeHelp.filmHead} />

      {/* Under the film, leading into the phases (client, 2026-10-22). The
          film's own head markup — .fin-center, .fin-h2, .fin-lead — so the
          two read as a pair. */}
      <section className="section hwh-after" aria-labelledby="hwh-after-h">
        <div className="container">
          <div className="fin-center reveal">
            <h2 className="fin-h2" id="hwh-after-h">{howWeHelp.afterFilm.title}</h2>
            {howWeHelp.afterFilm.paragraphs.map((p) => (
              <p className="fin-lead" key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <HowWeHelpStack />

      {/* The platforms band, closing the page (client, 2026-10-22). */}
      <HowWeHelpPlatforms />
    </>
  );
}
