import CTA from "@/components/CTA";
import LocationMap from "@/components/ui/expand-map";
import { contact, intro, site } from "@/lib/content/gamcs";

/**
 * Homepage contact section.
 *
 * Replaces the rotating cobe globe. The globe pinned the two regions named
 * in `namedClients` — India and the UK — which was true but vague; this
 * states one concrete thing instead, the office you can actually visit, and
 * hands off to directions.
 *
 * The card renders only while `site.address` is set, so clearing the address
 * collapses this back to copy and a CTA rather than shipping an empty frame.
 */
export default function Contact() {
  const a = site.address;

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-panel">
          <div className="contact-panel-copy">
            <p className="contact-lead">
              {contact.heading} <span>{intro}</span>
            </p>
            {/* secondary -> .btn.btn-light. The primary .btn-shimmer pill is
                --blue, which is this panel's own background. */}
            <CTA tier="secondary" icon="arrow" href="/contact" data-cta="contact-panel">
              Schedule a Call
            </CTA>
          </div>

          {a ? (
            <div className="contact-panel-stage">
              <LocationMap
                location={`${a.locality}, ${a.region}`}
                address={[a.street, `${a.locality}, ${a.region} ${a.postalCode}`]}
                mapSrc={a.map}
                destination={a.coords}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
