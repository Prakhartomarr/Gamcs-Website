import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeadArt from "@/components/PageHeadArt";
import PillarBlocks from "@/components/sections/PillarBlocks";
import { solutionsHub } from "@/lib/content/gamcs";
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
 * A jump rail of the five pillar anchors used to sit under the band; it was
 * taken out. The #slug anchors it pointed at are still on the cards.
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
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: t.crumb, href: "/solutions" }]} />
          <span className="eyebrow-pill">{t.pill}</span>
          <h1>
            {solutionsHub.h1Lead} <em>{solutionsHub.h1Accent}</em>
          </h1>
          <p>{solutionsHub.subhead}</p>
        </div>
        <PageHeadArt src="/page-art/solutions.webp" />
      </section>

      <div className="sol">
        <PillarBlocks />
      </div>
    </>
  );
}
