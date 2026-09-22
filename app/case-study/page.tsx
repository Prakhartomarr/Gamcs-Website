import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeadArt from "@/components/PageHeadArt";
import CaseStudyCard from "@/components/CaseStudyCard";
import { caseStudies, primaryCta } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

const t = pages.caseStudy;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/case-study",
});

export default function CaseStudyPage() {
  return (
    <>
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: t.crumb, href: "/case-study" }]} />
          <div className="section-kicker">{t.kicker}</div>
          <h1>{caseStudies.heading}</h1>
          <p>{caseStudies.intro}</p>
          <div className="ctas page-head-ctas">
            <CTA href={primaryCta.href}
              data-cta="case-study-hero" icon="diagonal">
              {primaryCta.label}
            </CTA>
            <CTA href="/#solutions" tier="secondary" icon="arrow">
              {t.seeServices}
            </CTA>
          </div>
        </div>
              <PageHeadArt src="/page-art/case-study.webp" />
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <h2>{caseStudies.sectionTitle}</h2>
            </div>
            <p>{fill(t.count, { count: caseStudies.items.length })}</p>
          </div>

          <div className="case-list">
            {caseStudies.items.map((c) => (
              <CaseStudyCard item={c} key={c.no} />
            ))}
          </div>

          <div className="case-cta">
            <h2>{t.closing}</h2>
            <CTA href={primaryCta.href}
              data-cta="case-study-footer" icon="diagonal">
              {primaryCta.label}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
