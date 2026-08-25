import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/sections/FAQ";
import { faq } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about GAMCS's FP&A, BI & analytics, offshoring, systems implementation, transaction advisory, and training services.",
  path: "/faq",
});

/**
 * Doc page 11, promoted from a homepage section to its own route because the
 * doc gives it a title tag and meta description of its own.
 *
 * The accordion component is reused verbatim — this page only adds the H1 and
 * the breadcrumb, and switches the FAQPage schema on, since /faq is now the
 * canonical URL for these questions.
 */
export default function FaqPage() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: "FAQ", href: "/faq" }]} />
          <div className="section-kicker">FAQ</div>
          <h1>Frequently Asked Questions</h1>
          <p>{faq.heading}</p>
        </div>
      </section>

      <FAQ withSchema />
    </>
  );
}
