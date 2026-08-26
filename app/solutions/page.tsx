import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import SolutionCards from "@/components/sections/SolutionCards";
import { primaryCta, solutionsHub } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Solutions",
  description: solutionsHub.metaDescription,
  path: "/solutions",
});

/** Doc page 2. Ordering comes from `solutions[]`, so the hub can never list a
 *  pillar that has no page, or miss one that does. */
export default function SolutionsHubPage() {
  return (
    <>
      {/* Centred only here, to match the services reference. Every other
          page-head on the site stays left-aligned, so the modifier is scoped
          rather than applied to .page-head itself. The breadcrumb stays put —
          centring it reads oddly and it is worth keeping for navigation. */}
      <section className="page-head is-centred">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Solutions", href: "/solutions" }]} />
          <div className="page-head-centre">
            <span className="eyebrow-pill">Solutions</span>
            <h1>
              {solutionsHub.h1Lead}{" "}
              <em>{solutionsHub.h1Accent}</em>
            </h1>
            <p>{solutionsHub.subhead}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SolutionCards />

          <div className="case-cta reveal">
            <h2>Not sure which pillar you need? Start with a conversation.</h2>
            <Link
              className="btn btn-shimmer"
              href={primaryCta.href}
              data-cta="solutions-hub"
              data-press
            >
              <span className="btn-label">
                {primaryCta.label} <span aria-hidden="true">↗</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
