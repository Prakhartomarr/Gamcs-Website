import Image from "next/image";
import SectionEyebrow from "@/components/SectionEyebrow";
import { partners } from "@/lib/content/gamcs";

/**
 * Delivery partners, set as the lower part of the client logo wall: same white
 * band, no divider, and the gap from the client logos to the "Our partners"
 * pill matches the one between the client heading and those logos. The heading
 * is sized as a sub-heading of that section, not a peer of its heading.
 *
 * Just the pill, the heading and the three firms' marks. The marks sit in one
 * row beside the heading from 1024px up and in a row under it below that; the
 * measurements behind the breakpoints are in app/globals.css.
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
        {/* The pill sits on its own row so the marks can centre on the HEADING
            line rather than on the pill and heading together, which left them
            riding high above the line they belong to. */}
        <div className="partners-layout reveal">
          <SectionEyebrow label="Our partners" />

          <div className="partners-line">
            <h2 className="partners-heading">{partners.heading}</h2>

            {partners.logos.length > 0 && (
              <ul className="partners-logos">
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
        </div>

        {partners.names.length > 0 && (
          <ul className="partners-row reveal">
            {partners.names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
