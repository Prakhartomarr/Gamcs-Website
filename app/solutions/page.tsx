import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeadArt from "@/components/PageHeadArt";
import PillarBlocks from "@/components/sections/PillarBlocks";
import { primaryCta, solutions, solutionsHub } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

const t = pages.solutions;

export const metadata: Metadata = {
  ...pageMetadata({
    title: t.title,
    description: solutionsHub.metaDescription,
    path: "/solutions",
  }),
  /* The title tag carries "| GAMCS" itself, so it is set absolute. */
  title: { absolute: solutionsHub.titleTag },
};

/**
 * The solutions hub: a statement of what GAMCS does, a rail to jump to any
 * pillar, then the five pillars at full width.
 *
 * It used to be a grid of six equal cards, which gave every pillar the same
 * two-line blurb and no room to say what it delivers. The page now leads with
 * each pillar's own argument and lists its services underneath, so a visitor
 * can judge a pillar without leaving for the detail page — while the card's
 * CTA still takes them there when they want the full version.
 *
 * The rail is plain anchors rather than a scroll-spy: it is a server component
 * with no JS, and the highlight a spy would add is not worth a client bundle
 * on a page whose job is to be read.
 */
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

      <section className="section pillars-section">
        <div className="container">
          <PillarBlocks />

          <div className="case-cta reveal">
            <h2>{t.closing}</h2>
            <CTA href={primaryCta.href} data-cta="solutions-hub" icon="diagonal">
              {primaryCta.label}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
