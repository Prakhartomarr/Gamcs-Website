import type { Metadata } from "next";
import PageHeadArt from "@/components/PageHeadArt";
import Breadcrumbs from "@/components/Breadcrumbs";
import Rich from "@/components/Rich";
import { site } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

const t = pages.thankYou;

export const metadata: Metadata = {
  ...pageMetadata({
    title: t.title,
    description: t.description,
    path: "/thank-you",
  }),
  /* A confirmation page has no standalone search value and would look like
     thin content to a crawler. */
  robots: { index: false, follow: true },
};

/**
 * Post-submission confirmation.
 *
 * The contact form has no server behind it: submitting hands the details to
 * the visitor's own mail client, addressed to info@gamcs.in. This page says
 * exactly that, because telling someone "we've received it" when the message
 * may still be sitting unsent in their drafts is the one thing worse than no
 * confirmation at all.
 *
 * No reply-time claim appears unless `site.responseTime` is set — see the
 * TODO on that field.
 */
export default function ThankYouPage() {
  const vars = { email: site.email, linkedin: site.linkedin };
  const [check, reopen, reply] = t.steps;
  return (
    <>
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: t.crumb, href: "/thank-you" }]} />
          <div className="section-kicker">{t.kicker}</div>
          <h1>{t.h1}</h1>
          <p>{fill(t.lead, vars)}</p>
        </div>
              <PageHeadArt src="/page-art/thank-you.webp" />
      </section>

      <section className="section">
        <div className="container">
          <ol className="next-steps">
            <li>
              <span className="next-steps-no">01</span>
              <div>
                <h2>{check.heading}</h2>
                <p>
                  <Rich parts={check.body} vars={vars} />
                </p>
              </div>
            </li>
            <li>
              <span className="next-steps-no">02</span>
              <div>
                <h2>{reopen.heading}</h2>
                <p>
                  <Rich parts={reopen.body} vars={vars} />
                </p>
              </div>
            </li>
            <li>
              <span className="next-steps-no">03</span>
              <div>
                <h2>{reply.heading}</h2>
                <p>
                  {site.responseTime ? (
                    fill(reply.reply, { responseTime: site.responseTime })
                  ) : (
                    /* TODO(business): set site.responseTime to state a real
                       reply window here. Nothing is promised until then. */
                    <Rich parts={reply.body} vars={vars} />
                  )}
                </p>
              </div>
            </li>
          </ol>

          <div className="ctas">
            <CTA href="/" data-cta="thankyou-home" icon="arrow">
              {t.backHome}
            </CTA>
            <CTA href="/case-study" tier="secondary" icon="arrow">
              {t.readCaseStudies}
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
