import JsonLd from "@/components/JsonLd";
import { faq } from "@/lib/content/gamcs";
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
 *
 * Renders the list only. It previously carried a numbered eyebrow and an <h2>
 * for its homepage placement; with /faq as the sole consumer that stacked a
 * third heading beneath the page's own kicker and H1, and the "9" referred to
 * a sequence a standalone page does not have. The page owns the heading, this
 * owns the questions. The schema is unconditional for the same reason: one URL
 * carries these questions now.
 */
export default function FAQ() {
  return (
    <section className="section faq-section" id="faq">
      <div className="container">
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

      <JsonLd data={faqSchema()} />
    </section>
  );
}
