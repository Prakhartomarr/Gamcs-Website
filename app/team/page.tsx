import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Team from "@/components/shadcn-space/blocks/team-01/team";
import { primaryCta, story, team } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

export const metadata: Metadata = pageMetadata({
  title: "Our Team | Founders & Advisors",
  description:
    "Meet the founders and advisory board behind GA Management Consultants — 100+ combined years of FP&A, BI, audit, and CFO advisory experience.",
  path: "/team",
});

export default function TeamPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Team", href: "/team" }]} />
          <div className="section-kicker">TEAM</div>
          <h1>{team.h1}</h1>
          <p>{team.body}</p>
          <p className="team-mission">{story.mission}</p>
          <div className="ctas page-head-ctas">
            <CTA href={primaryCta.href}
              data-cta="team-hero" icon="diagonal">
              {primaryCta.label}
            </CTA>
            <CTA href="/case-study" tier="secondary" icon="arrow">
              Their work
            </CTA>
          </div>
        </div>
      </section>

      {/* the shadcn team-01 block, populated from the real team */}
      <Team />

      <section className="section team-cta-section">
        <div className="container">
          <div className="case-cta">
            <h2>{team.closingCta}</h2>
            <CTA href={primaryCta.href}
              data-cta="team-footer" icon="diagonal">
              {primaryCta.label}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
