import type { Metadata } from "next";
import PillarBlocks from "@/components/sections/PillarBlocks";
import Velaris from "@/components/ui/velaris";
import { solutions, solutionsHub } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.solutions;

/**
 * The solutions hub, rebuilt to the measurements in docs/unity-spec.md.
 *
 * A quiet page: an off-white ground, near-black text, and two things on it —
 * a hero that fills a screen and five pillar blocks, each a gradient card
 * beside the list of what that pillar delivers.
 *
 * The hero is a 2×2: the headline at display size top left, a gradient tile
 * top right, the standing intro bottom left, and one chip per pillar bottom
 * right. The chips are the page's own navigation — they replaced a sticky
 * sub-nav bar, which on a page of five long sections was a rail that followed
 * you around saying what the chips say once.
 *
 * Everything here is scoped under `.sol`: this page carries a different ground
 * and a different type scale from the rest of the site, and nothing outside it
 * should change.
 */

export const metadata: Metadata = {
  ...pageMetadata({
    title: t.title,
    description: solutionsHub.metaDescription,
    path: "/solutions",
  }),
  /* The title tag carries "| GAMCS" itself, so it is set absolute. */
  title: { absolute: solutionsHub.titleTag },
};

export default function SolutionsHubPage() {
  return (
    <div className="sol">
      <section className="sol-hero" aria-labelledby="sol-h1">
        <div className="sol-hero-grid">
          <h1 className="sol-h1" id="sol-h1">
            {solutionsHub.h1}
          </h1>

          {/* The tile is the page's one image, and it is drawn rather than
              loaded: the same shader the cards use, at a sixth of the size. */}
          <span className="sol-tile" aria-hidden="true">
            <Velaris
              height="100%"
              dpr={1.5}
              speed={0.9}
              grain={0.18}
              bg="#0D6A8E"
              colors={["#1B7FB8", "#10B981", "#5EEAD4", "#0F5E97"]}
            />
          </span>

          <p className="sol-intro">{solutionsHub.subhead}</p>

          <nav className="sol-chips" aria-label={t.pill}>
            {solutions.map((s) => (
              <a key={s.slug} href={`#${s.slug}`}>
                {s.navLabel}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <PillarBlocks />
    </div>
  );
}
