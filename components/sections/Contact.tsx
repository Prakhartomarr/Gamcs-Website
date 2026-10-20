import CTA from "@/components/CTA";
import FluteShader from "@/components/ui/flute-shader";
import OfficeMaps from "@/components/ui/office-maps";
import { contact, intro, officeCards, primaryCta } from "@/lib/content/gamcs";

/**
 * Homepage contact section.
 *
 * Replaces the rotating cobe globe. The globe pinned the two regions named
 * in `namedClients` — India and the UK — which was true but vague; this
 * states one concrete thing instead, the office you can actually visit, and
 * hands off to directions.
 *
 * The cards render only while `officeCards` has an entry, and that list is
 * empty whenever the registered office is unknown, so this collapses back to
 * copy and a CTA rather than shipping an empty frame or someone else’s address.
 * Still a server component: all of the open/closed state is inside OfficeMaps,
 * which is the only client boundary this section has.
 */
export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-panel">
          <FluteShader />
          <div className="contact-panel-copy">
            <p className="contact-lead">
              {contact.heading} <span>{intro}</span>
            </p>
            {/* secondary -> .btn.btn-light. The primary .btn-shimmer pill is
                --blue, which is this panel's own background. */}
            <CTA tier="secondary" icon="arrow" href={primaryCta.href} data-cta="contact-panel">
              {primaryCta.label}
            </CTA>
          </div>

          {/* OfficeMaps IS the stage, not something inside it: open, the row
              has to span both columns of .contact-panel, and only a grid item
              can do that. */}
          {officeCards.length ? <OfficeMaps className="contact-panel-stage" /> : null}
        </div>
      </div>
    </section>
  );
}
