import { site } from "@/lib/content/gamcs";

/**
 * Office location and directions.
 *
 * Renders nothing until `site.address` is filled in. GAMCS publishes no
 * postal address anywhere — not on gamcs.in, not in the privacy policy — and
 * a map pinned to a guessed location is worse than no map at all.
 *
 * TODO(business): set `site.address` in lib/content/gamcs.ts. This block, the
 * PostalAddress in the Organization JSON-LD and a "Get directions" link all
 * start rendering from that one edit — no further code changes needed.
 */
export default function Directions() {
  const a = site.address;
  if (!a) return null;

  const query = [a.street, a.locality, a.region, a.postalCode, a.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="directions">
      <div className="section-kicker" style={{ color: "var(--yellow)" }}>
        VISIT US
      </div>
      <address className="directions-address">
        {a.street}
        <br />
        {a.locality}, {a.region} {a.postalCode}
      </address>
      <iframe
        className="directions-map"
        title={`Map showing the ${site.short} office at ${query}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        className="contact-details-value"
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noopener"
      >
        Get directions ↗
      </a>
    </div>
  );
}
