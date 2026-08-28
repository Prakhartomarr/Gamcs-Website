import Image from "next/image";

import { site } from "@/lib/content/gamcs";

/**
 * Office location and directions.
 *
 * Renders nothing while `site.address` is null, so removing the address
 * removes this block, the PostalAddress in the Organization JSON-LD and the
 * homepage map card in one edit.
 *
 * The map is a static image, not a Google Maps iframe. The iframe version
 * loaded a third-party frame — and its cookies — on every visit to this page,
 * before the visitor had answered the cookie banner. This asks nothing of
 * anyone until they click through to directions, which is a deliberate act.
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
      <div className="directions-map">
        <Image
          src={a.map}
          alt={`Map showing the ${site.short} office at ${query}`}
          width={960}
          height={720}
          unoptimized
        />
        {/* ODbL requires the credit wherever the tiles are shown */}
        <span className="directions-attrib">© OpenStreetMap</span>
      </div>
      <a
        className="contact-details-value"
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a.coords)}`}
        target="_blank"
        rel="noopener"
      >
        Get directions ↗
      </a>
    </div>
  );
}
