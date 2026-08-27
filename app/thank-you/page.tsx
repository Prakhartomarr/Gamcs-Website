import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { site } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Thanks for getting in touch",
    description:
      "Your enquiry is on its way to GA Management Consultants. Here is what happens next.",
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
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "Thank you", href: "/thank-you" }]} />
          <div className="section-kicker">MESSAGE READY</div>
          <h1>Thanks — your details are on their way.</h1>
          <p>
            Submitting the form opens your own email app with everything you
            entered, addressed to {site.email}. Press send there and it reaches
            us directly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ol className="next-steps">
            <li>
              <span className="next-steps-no">01</span>
              <div>
                <h2>Check your email app</h2>
                <p>
                  A draft to {site.email} should be open, pre-filled with your
                  answers. Nothing is sent until you send it.
                </p>
              </div>
            </li>
            <li>
              <span className="next-steps-no">02</span>
              <div>
                <h2>Didn&rsquo;t open?</h2>
                <p>
                  Some browsers block mail links. Write to{" "}
                  <a href={`mailto:${site.email}`}>{site.email}</a> directly, or
                  message us on{" "}
                  <a href={site.linkedin} target="_blank" rel="noopener">
                    LinkedIn
                  </a>
                  .
                </p>
              </div>
            </li>
            <li>
              <span className="next-steps-no">03</span>
              <div>
                <h2>We&rsquo;ll be in touch</h2>
                <p>
                  {site.responseTime
                    ? `We reply ${site.responseTime}.`
                    : /* TODO(business): set site.responseTime to state a real
                         reply window here. Nothing is promised until then. */
                      "One of the founders reads every enquiry and will reply by email."}
                </p>
              </div>
            </li>
          </ol>

          <div className="ctas">
            <CTA href="/" data-cta="thankyou-home" icon="arrow">
              Back to home
            </CTA>
            <CTA href="/case-study" tier="secondary" icon="arrow">
              Read case studies
            </CTA>
          </div>
        </div>
      </section>
    </>
  );
}
