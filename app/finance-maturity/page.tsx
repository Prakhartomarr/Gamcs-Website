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
 * No `page-head--art`: the other routes pair that class with a file under
 * /page-art, and this route has no artwork of its own.
 */
export default function FinanceMaturityPage() {
  return (
    <section className="fma">
      <div className="container fma-inner">
        <header className="fma-head">
          <p className="fma-eyebrow">{assessment.eyebrow}</p>
          <h1 className="fma-h1">{assessment.heading}</h1>
          <p className="fma-lead">{assessment.lead}</p>
          <p className="fma-meta">{assessment.meta}</p>
          <p className="fma-note">{assessment.note}</p>
        </header>

        <MaturityAssessment />
      </div>
    </section>
  );
}
