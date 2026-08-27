import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PillarBlocks from "@/components/sections/PillarBlocks";
import { primaryCta, solutions, solutionsHub } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

export const metadata: Metadata = pageMetadata({
  title: "Solutions",
  description: solutionsHub.metaDescription,
  path: "/solutions",
});

/**
 * The solutions hub: a statement of what GAMCS does, a rail to jump to any
 * pillar, then the six pillars at full width.
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
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Solutions", href: "/solutions" }]} />
          <span className="eyebrow-pill">Solutions</span>
          <h1>
            {solutionsHub.h1Lead} <em>{solutionsHub.h1Accent}</em>
          </h1>
          <p>{solutionsHub.subhead}</p>
        </div>
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
            <h2>Not sure which pillar you need? Start with a conversation.</h2>
            <CTA href={primaryCta.href} data-cta="solutions-hub" icon="diagonal">
              {primaryCta.label}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
