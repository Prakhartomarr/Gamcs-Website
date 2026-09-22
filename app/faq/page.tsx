import type { Metadata } from "next";
import PageHeadArt from "@/components/PageHeadArt";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/sections/FAQ";
import Link from "next/link";
import { faq, primaryCta } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: pages.faq.title,
  description: faq.intro,
  path: "/faq",
});

/**
 * Doc page 11, promoted from a homepage section to its own route because the
 * doc gives it a title tag and meta description of its own. The questions and
 * answers now come verbatim from GAMCS_Web_View_1.html (2026-09-15).
 *
 * The accordion component is reused verbatim — this page only adds the H1 and
 * the breadcrumb, and switches the FAQPage schema on, since /faq is now the
 * canonical URL for these questions.
 */
export default function FaqPage() {
  return (
    <>
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: pages.faq.crumb, href: "/faq" }]} />
          <div className="section-kicker">{faq.kicker}</div>
          <h1>{faq.heading}</h1>
          <p>{faq.intro}</p>
          <p className="faq-head-cta">
            {faq.cta} <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </p>
        </div>
              <PageHeadArt src="/page-art/faq.webp" />
      </section>

      <FAQ />
    </>
  );
}
