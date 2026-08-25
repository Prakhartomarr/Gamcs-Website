import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import SectionEyebrow from "@/components/SectionEyebrow";
import { faq, primaryCta } from "@/lib/content/gamcs";
import { faqSchema } from "@/lib/schema";

/**
 * FAQ accordion.
 *
 * Built on <details>/<summary>, which is keyboard operable, screen-reader
 * announced and searchable with the browser's own find-in-page — all for
 * zero JavaScript and zero new dependencies. A hand-rolled ARIA accordion
 * would add a client bundle to reproduce what the platform already does.
 *
 * Every answer is assembled from copy already on the site (see `faq` in
 * lib/content/gamcs.ts), which is what makes the FAQPage schema honest.
 */
export default function FAQ({
  /**
   * FAQPage structured data belongs on one URL. /faq is the canonical home
   * for these questions, so the homepage copy of the accordion renders
   * without the schema rather than duplicating it across two pages.
   */
  withSchema = false,
}: {
  withSchema?: boolean;
} = {}) {
  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <div className="section-head reveal">
          <div>
            <SectionEyebrow n={9} label="Questions" />
            <h2>{faq.heading}</h2>
          </div>
          <p>
            {faq.cta}{" "}
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </p>
        </div>

        <ul className="faq-list">
          {faq.items.map((item) => (
            <li key={item.q} className="reveal">
              <details className="faq-item" name="gamcs-faq">
                <summary>
                  <span className="faq-q">{item.q}</span>
                  <span className="faq-icon" aria-hidden="true" />
                </summary>
                <div className="faq-a">
                  <p>{item.a}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>

      {withSchema && <JsonLd data={faqSchema()} />}
    </section>
  );
}
