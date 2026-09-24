import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeadArt from "@/components/PageHeadArt";
import PillarBlocks from "@/components/sections/PillarBlocks";
import { solutions, solutionsHub } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.solutions;

/**
 * The solutions hub: the site's own head band, the jump rail, then the five
 * pillars as gradient cards beside what each one delivers.
 *
 * The band and the rail are the site's — the same component and styling every
 * other page's head uses, so this page arrives looking like the rest of GAMCS.
 * Below them the page switches ground: everything inside `.sol` carries the
 * off-white and the larger type scale measured in docs/unity-spec.md.
 *
 * The rail is plain anchors rather than a scroll-spy: it is a server component
 * with no JS, and the highlight a spy would add is not worth a client bundle
 * on a page whose job is to be read.
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

      <nav className="pillar-rail" aria-label="Solution pillars">
        <div className="container">
          <ul>
            {solutions.map((s) => (
              <li key={s.slug}>
                <a href={`#${s.slug}`}>{s.navLabel}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sol">
        <PillarBlocks />
      </div>
    </>
  );
}
