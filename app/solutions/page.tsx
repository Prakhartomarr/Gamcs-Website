import type { Metadata } from "next";
import PillarBlocks from "@/components/sections/PillarBlocks";
import PillarRail from "@/components/sections/PillarRail";
import ToolLogos from "@/components/sections/ToolLogos";
import { solutionsHub } from "@/lib/content/gamcs";
import CtaBand from "@/components/sections/CtaBand";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.solutions;

/**
 * The solutions hub: the site's own head band, then the five pillars as
 * gradient cards beside what each one delivers.
 *
 * The band is the site's — the same component and styling every other page's
 * head uses, so this page arrives looking like the rest of GAMCS. Below it the
 * page switches ground: everything inside `.sol` carries the off-white and the
 * larger type scale measured in docs/unity-spec.md.
 *
 * A jump rail of the five pillar anchors sits under the band (PillarRail),
 * pointing at the #slug anchors on the cards below.
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
    <>
      <section className="page-head ph-solutions">
        <div className="container">
          <h1>
            {solutionsHub.h1Lead} <em>{solutionsHub.h1Accent}</em>
          </h1>
          {/* The five pillars as jump buttons, between the heading and the
              subhead (client, 2026-10-22). */}
          <PillarRail />
          <p>{solutionsHub.subhead}</p>
        </div>
      </section>

      {/* The homepage's tools logo cloud, between the head and the pillars
          (client, 2026-10-22). */}
      <ToolLogos className="tool-logos--page" />

      <div className="sol">
        <PillarBlocks />
      </div>

      {/* The closing CTA band, the Team page's (client, 2026-10-23). */}
      <CtaBand heading={solutionsHub.closingCta} dataCta="solutions-footer" />
    </>
  );
}
