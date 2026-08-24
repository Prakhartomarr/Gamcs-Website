import GlobeFeatureSection from "@/components/ui/globe-feature-section";
import { contact, intro, namedClients } from "@/lib/content/gamcs";

/**
 * Homepage contact section: the globe feature block.
 *
 * The form no longer lives here — it is on /contact, which this CTA points
 * at. Markers pin the two regions GAMCS names publicly (both come from the
 * testimonial clients in `namedClients`), so the globe states something true
 * rather than decorating with random dots.
 */
const REGION_COORDS: Record<string, [number, number]> = {
  India: [28.61, 77.21], // Delhi
  UK: [51.51, -0.13], // London
};

export default function Contact() {
  const markers = namedClients
    .map((c) => REGION_COORDS[c.region])
    .filter(Boolean)
    .map((location) => ({ location, size: 0.09 }));

  return (
    <section className="contact" id="contact">
      <div className="container">
        <GlobeFeatureSection
          lead={contact.heading}
          body={intro}
          ctaLabel="Schedule a Call"
          ctaHref="/contact"
          markers={markers}
        />
      </div>
    </section>
  );
}
