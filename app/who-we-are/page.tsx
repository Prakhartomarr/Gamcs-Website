import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTA from "@/components/CTA";
import { primaryCta, story } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Who We Are | Our Story",
  /* The lead's own opening sentence — a meta description has ~160 characters
     to work with and the full lead runs 331. */
  description:
    "GA Management Consultants (GAMCS) is a high-impact management consulting firm serving clients across India and globally.",
  path: "/who-we-are",
});

/**
 * The firm story in full.
 *
 * The homepage section carries `story.heading` and `story.lead` and hands off
 * here; `story.body` and `story.close` render nowhere else. That split is the
 * reason this route exists: run end to end, the story is ~1,400 characters,
 * which stood the homepage's copy column 1,090px tall against a 440px
 * portrait. It also gives "About our firm" somewhere honest to point — it used
 * to go to the contact form.
 */
export default function WhoWeArePage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Who We Are", href: "/who-we-are" }]} />
          <div className="section-kicker">WHO WE ARE</div>
          <h1>{story.heading}</h1>
          <p>{story.lead}</p>
        </div>
      </section>

      <section className="section firm-story">
        <div className="container">
          {story.body.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          <p className="firm-close">{story.close}</p>
          <p className="who-mission">{story.mission}</p>
          <div className="ctas">
            <CTA href={primaryCta.href} data-cta="firm-story" icon="diagonal">
              {primaryCta.label}
            </CTA>
            <CTA href="/team" tier="secondary" icon="arrow">
              Meet our founders
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
