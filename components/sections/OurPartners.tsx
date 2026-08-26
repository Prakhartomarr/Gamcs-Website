import Link from "next/link";
import SectionEyebrow from "@/components/SectionEyebrow";
import { partners } from "@/lib/content/gamcs";

/**
 * Delivery partners.
 *
 * The names row renders only once `partners.names` is populated. The doc names
 * two advisory firms, but naming a partner publicly is their call to make, not
 * ours — so the section ships as heading, body and CTA until permission comes
 * through, exactly as `Directions` waits on a real address. Nothing here is a
 * visible placeholder, and adding the names fills the row automatically.
 */
export default function OurPartners() {
  return (
    <section className="section partners" id="partners">
      <div className="container">
        <div className="reveal">
          <SectionEyebrow n={5} label="Our partners" />
          <h2 className="partners-heading">{partners.heading}</h2>
          <p className="partners-body">{partners.body}</p>
        </div>

        {partners.names.length > 0 && (
          <ul className="partners-row reveal">
            {partners.names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}

        <div className="reveal">
          <Link
            className="btn btn-light partners-cta"
            href={partners.cta.href}
            data-cta="partners"
            data-press
          >
            <span className="btn-label">
              {partners.cta.label} <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
