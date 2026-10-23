import type { Metadata } from "next";
import LegalBlocks from "@/components/LegalBlocks";
import Rich from "@/components/Rich";
import { site } from "@/lib/content/gamcs";
import { terms } from "@/lib/content/legal";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: pages.terms.title,
  description: pages.terms.description,
  path: "/terms-of-use",
});

/**
 * Terms of Use (2026-10-24). Same page head and `.legal-page` /
 * `.legal-body` layout as the privacy and cookie policies; the text is
 * lib/content/legal.ts (`terms`).
 */
export default function TermsOfUsePage() {
  const vars = {
    legalName: site.legalName,
    email: site.email,
    url: site.url.replace(/^https?:\/\//, ""),
    siteUrl: site.url,
  };

  return (
    <>
      <section className="page-head ph-cookie ph-terms">
        <div className="container">
          <h1>{terms.title}</h1>
          <p>
            <Rich parts={terms.intro} vars={vars} />
          </p>
        </div>
      </section>

      <section className="section legal-page">
        <div className="container">
          <LegalBlocks blocks={terms.blocks} vars={vars} />
        </div>
      </section>
    </>
  );
}
