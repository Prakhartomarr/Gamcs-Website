import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import SolutionPillars from "@/components/sections/SolutionPillars";
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
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Solutions", href: "/solutions" }]} />
          <div className="section-kicker">SOLUTIONS</div>
          <h1>{solutionsHub.h1}</h1>
          <p>{solutionsHub.subhead}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SolutionPillars />

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
