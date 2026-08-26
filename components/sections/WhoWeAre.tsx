import Link from "next/link";
import AbstractPanel from "@/components/AbstractPanel";
import SectionEyebrow from "@/components/SectionEyebrow";
import { primaryCta, site, story } from "@/lib/content/gamcs";

/**
 * Who we are + how we help.
 *
 * Composed like the reference's "About" block: numbered badge, one large
 * heading, then a three-column band of panel / copy + CTA / panel. The photo
 * slots are filled with `AbstractPanel` rather than stock imagery — the
 * layout rhythm without depicting people who are not GAMCS.

 * "How we help" now lives in its own section (HowWeHelp) as a carousel.
 */
export default function WhoWeAre() {
  return (
    <section className="section who" id="who-we-are">
      <div className="container">
        <div className="reveal">
          <SectionEyebrow n={1} label="Who we are" />
          <h2 className="who-heading">{site.tagline}</h2>
        </div>

        <div className="who-grid reveal">
          <AbstractPanel variant="rings" ratio="438 / 346" />

          <div className="who-grid-copy">
            <p>{story.lead}</p>
            <p style={{ marginTop: 14, color: "var(--ink-muted)" }}>
              {story.network}
            </p>
            <Link className="btn btn-shimmer" href={primaryCta.href} data-press>
              <span className="btn-label">
                About our firm <span aria-hidden="true">↗</span>
              </span>
            </Link>
          </div>

          <AbstractPanel variant="ribbons" ratio="3 / 2" />
        </div>

        <p className="who-mission reveal">{story.mission}</p>

      </div>
    </section>
  );
}
