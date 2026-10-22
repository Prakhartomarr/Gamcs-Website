import type { Metadata } from "next";
import MaturityAssessment from "@/components/assessment/MaturityAssessment";
import { assessment } from "@/lib/content/assessment";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: pages.financeMaturity.title,
  description: assessment.lead,
  path: "/finance-maturity",
});

/**
 * The self-assessment's own route, reached from the maturity curve's call to
 * action on the homepage. A page rather than a modal: the curve already asks
 * "where is your finance function today?", and the answer deserves a URL that
 * can be linked to, shared and reopened.
 *
 * This stays a server component. The head below is the whole of the page that
 * a crawler sees, and it is complete without JavaScript — only the card is
 * interactive, and MaturityAssessment is the one client boundary. Nothing it
 * collects leaves the browser, so there is nothing here to render per request.
 *
 * THE SITE'S HEAD BAND (client, 2026-10-22: "the blue color head is not
 * present on the assessment page"). The eyebrow, h1, lead and the two small
 * lines sit in the same `.page-head` every other route opens with; the card
 * follows on the soft ground below it.
 */
export default function FinanceMaturityPage() {
  return (
    <>
      <section className="page-head ph-assess">
        <div className="container">
          {/* A div, not a p: `.page-head>.container>p` would out-rank the
              kicker's own colour. */}
          <div className="section-kicker">{assessment.eyebrow}</div>
          <h1>{assessment.heading}</h1>
          <p>{assessment.lead}</p>
          <p className="ph-assess-meta">{assessment.meta}</p>
          <p className="ph-assess-note">{assessment.note}</p>
        </div>
      </section>

      <section className="fma">
        <div className="container fma-inner">
          <MaturityAssessment />
        </div>
      </section>
    </>
  );
}
