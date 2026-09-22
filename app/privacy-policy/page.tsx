import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import LegalBlocks from "@/components/LegalBlocks";
import Rich from "@/components/Rich";
import { contact, site } from "@/lib/content/gamcs";
import { legal, privacy } from "@/lib/content/legal";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: pages.privacy.title,
  description: pages.privacy.description,
  path: "/privacy-policy",
});

/**
 * Privacy policy. The text is lib/content/legal.ts (`privacy`), which
 * describes what THIS build actually does with data — see the notes there.
 * Anything that depends on a business or legal fact the repository cannot
 * know renders as a visible "to be confirmed" marker rather than a guess.
 */
export default function PrivacyPolicyPage() {
  const vars = {
    legalName: site.legalName,
    email: site.email,
    url: site.url.replace(/^https?:\/\//, ""),
    formFields: contact.fields.map((f) => f.label.toLowerCase()).join(", "),
  };

  return (
    <>
      <section className="page-head">
        <div className="container">
          <Breadcrumbs trail={[{ label: pages.privacy.crumb, href: "/privacy-policy" }]} />
          <div className="section-kicker">{legal.kicker}</div>
          <h1>{privacy.title}</h1>
          <p>
            <Rich parts={privacy.intro} vars={vars} />
          </p>
        </div>
      </section>

      <section className="section legal-page">
        <div className="container">
          {/* TODO(legal): delete this banner once the policy has been reviewed
              and the placeholders below have been filled in. */}
          <p className="legal-draft" role="note">
            <Rich parts={privacy.draft} vars={vars} />
          </p>

          <LegalBlocks blocks={privacy.blocks} vars={vars} />
        </div>
      </section>
    </>
  );
}
