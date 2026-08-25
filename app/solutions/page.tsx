import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { primaryCta, solutions, solutionsHub } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Solutions",
  description: solutionsHub.metaDescription,
  path: "/solutions",
});

/** Doc page 2. Ordering comes from `solutions[]`, so the hub can never list a
 *  pillar that has no page, or miss one that does. */
export default function SolutionsHubPage() {
  const byslug = new Map(solutions.map((s) => [s.slug, s]));

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
          <ul className="pillar-grid">
            {solutionsHub.previews.map((p, i) => {
              const s = byslug.get(p.slug);
              if (!s) return null;
              return (
                <li className="pillar-card reveal" key={p.slug} data-lift>
                  <Link href={`/solutions/${s.slug}`}>
                    {/* Number only: the pillar name is the heading directly
                        below, and the eyebrow pill repeated it verbatim. */}
                    <span className="pillar-n" aria-hidden="true">
                      {i + 1}
                    </span>
                    <h2>{s.title}</h2>
                    <p>{p.blurb}</p>
                    <span className="pillar-link">
                      {p.linkLabel} <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

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
