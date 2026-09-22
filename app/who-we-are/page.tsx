import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeadArt from "@/components/PageHeadArt";
import CTA from "@/components/CTA";
import { primaryCta, story } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.whoWeAre;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
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
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: t.crumb, href: "/who-we-are" }]} />
          <div className="section-kicker">{t.kicker}</div>
          <h1>{story.heading}</h1>
          <p>{story.lead}</p>
        </div>
              <PageHeadArt src="/page-art/who-we-are.webp" />
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
              {t.meetFounders}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
