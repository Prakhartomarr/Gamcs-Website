import Image from "next/image";
import SectionEyebrow from "@/components/SectionEyebrow";
import { partners } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * Delivery partners.
 *
 * The firms are identified by their marks, set beside the copy rather than
 * under it — the section's right-hand column was empty space on desktop, and
 * the logos read as evidence for the heading when they sit level with it.
 *
 * `partners.names` stays empty on purpose. It was the text fallback for naming
 * firms before permission came through; the logos do that job now, and
 * printing the same three names twice would be noise. The row still renders if
 * anyone populates the array, so nothing is lost.
 */
export default function OurPartners() {
  return (
    <section className="section partners" id="partners">
      <div className="container">
        <div className="partners-layout">
          <div className="partners-copy reveal">
            <SectionEyebrow n={5} label="Our partners" />
            <h2 className="partners-heading">{partners.heading}</h2>
            <p className="partners-body">{partners.body}</p>
          </div>

          {partners.logos.length > 0 && (
            <ul className="partners-logos reveal">
              {partners.logos.map((logo) => (
                <li key={logo.file}>
                  <Image
                    src={`/logos/partners/${logo.file}`}
                    alt={logo.name}
                    width={400}
                    height={168}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {partners.names.length > 0 && (
          <ul className="partners-row reveal">
            {partners.names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}

        <div className="reveal">
          <CTA href={partners.cta.href}
            data-cta="partners" tier="secondary" className="partners-cta" icon="arrow">
            {partners.cta.label}
          </CTA>
        </div>
      </div>
    </section>
  );
}
