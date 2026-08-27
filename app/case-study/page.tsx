import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CaseStudyCard from "@/components/CaseStudyCard";
import { caseStudies, primaryCta } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

export const metadata: Metadata = pageMetadata({
  title: "Case Studies | Finance, FP&A, BI & Transaction Engagements",
  description:
    "Real GAMCS engagements across D2C, SaaS, healthcare, hospitality, pharma, and non-profits — FP&A, BI dashboards, systems implementation, and a $525M PE transaction.",
  path: "/case-study",
});

export default function CaseStudyPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Case Studies", href: "/case-study" }]} />
          <div className="section-kicker">CASE STUDY</div>
          <h1>{caseStudies.heading}</h1>
          <p>{caseStudies.intro}</p>
          <div className="ctas page-head-ctas">
            <CTA href={primaryCta.href}
              data-cta="case-study-hero" icon="diagonal">
              {primaryCta.label}
            </CTA>
            <CTA href="/#solutions" tier="secondary" icon="arrow">
              See our services
            </CTA>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <h2>{caseStudies.sectionTitle}</h2>
            </div>
            <p>
              {caseStudies.items.length} engagements. Every one of them started
              with a conversation.
            </p>
          </div>

          <div className="case-list">
            {caseStudies.items.map((c) => (
              <CaseStudyCard item={c} key={c.no} />
            ))}
          </div>

          <div className="case-cta">
            <h2>Recognise your own numbers in any of these?</h2>
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
