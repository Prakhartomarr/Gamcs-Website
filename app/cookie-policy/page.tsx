import PageHeadArt from "@/components/PageHeadArt";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LegalBlocks from "@/components/LegalBlocks";
import Rich from "@/components/Rich";
import { site } from "@/lib/content/gamcs";
import { cookiePolicy, legal } from "@/lib/content/legal";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: pages.cookiePolicy.title,
  description: pages.cookiePolicy.description,
  path: "/cookie-policy",
});

/**
 * Cookie Policy. Same page-head, `.legal-page` / `.legal-body` classes and
 * breadcrumb as the privacy policy; the text is lib/content/legal.ts
 * (`cookiePolicy`), the approved copy (doc page 13), so no draft banner.
 */
export default function CookiePolicyPage() {
  const vars = {
    legalName: site.legalName,
    email: site.email,
    url: site.url.replace(/^https?:\/\//, ""),
    siteUrl: site.url,
  };

  return (
    <>
      <section className="page-head page-head--art">
        <div className="container">
          <Breadcrumbs trail={[{ label: pages.cookiePolicy.crumb, href: "/cookie-policy" }]} />
          <div className="section-kicker">{legal.kicker}</div>
          <h1>{cookiePolicy.title}</h1>
          <p>
            <Rich parts={cookiePolicy.intro} vars={vars} />
          </p>
        </div>
              <PageHeadArt src="/page-art/cookie-policy.webp" />
      </section>

      <section className="section legal-page">
        <div className="container">
          <LegalBlocks blocks={cookiePolicy.blocks} vars={vars} />
        </div>
      </section>
    </>
  );
}
