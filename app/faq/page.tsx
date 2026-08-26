import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/sections/FAQ";
import Link from "next/link";
import { faq, primaryCta } from "@/lib/content/gamcs";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: faq.intro,
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
          <div className="section-kicker">{faq.kicker}</div>
          <h1>{faq.heading}</h1>
          <p>{faq.intro}</p>
          <p className="faq-head-cta">
            {faq.cta} <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </p>
        </div>
      </section>

      <FAQ />
    </>
  );
}
