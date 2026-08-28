"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";

/* ----------------------------------------------------------------
 * LocationMap
 *
 * A card that shows a place name, and opens to reveal the full address
 * over a map with a "Get directions" hand-off.
 *
 * The 21st.dev original animates with framer-motion. Everything it does
 * here — the expand, the parallax scale, the pin drop, the tilt — is a
 * transform or a size transition, so it runs on CSS instead and the site
 * gains no dependency. Styles live in globals.css as `.locmap-*`, the way
 * the rest of the site's components are styled.
 *
 * The map is a STATIC image, not a live embed. That means no API key, no
 * third-party request on page load, and nothing to gate behind the cookie
 * banner — Google is only ever contacted when a visitor clicks through to
 * directions, which is a deliberate act. Trade-off: it does not pan.
 *
 * The tiles are OpenStreetMap. `attribution` renders the credit their
 * licence requires; do not remove it while the image is OSM-derived.
 * ---------------------------------------------------------------- */

export type LocationMapProps = {
  /** Short human label, e.g. "Gurugram, Haryana". */
  location: string;
  /** Postal address, one line per array entry. */
  address: string[];
  /** Static map image, centred on `destination`. */
  mapSrc: string;
  /** "lat,lng" — what Google Maps routes to. Coordinates, not a text
      address, so the pin cannot resolve somewhere else. */
  destination: string;
  /** Credit line for the basemap. Required by ODbL for OSM tiles. */
  attribution?: string;
  className?: string;
};

export default function LocationMap({
  location,
  address,
  mapSrc,
  destination,
  attribution = "© OpenStreetMap",
  className,
}: LocationMapProps) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  /* The tilt writes to the node directly rather than through state: a
     setState per pointermove would re-render the card ~60 times a second
     to change one transform. */
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    el.style.transform = `rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 7).toFixed(2)}deg)`;
  }, []);

  const resetTilt = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = "";
  }, []);

  return (
    <div
      className={["locmap", className].filter(Boolean).join(" ")}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
    >
      <div className={`locmap-card${open ? " is-open" : ""}`} ref={cardRef}>
        <div className="locmap-grid" aria-hidden="true" />

        <div className="locmap-layer" aria-hidden="true">
          <Image
            className="locmap-img"
            src={mapSrc}
            alt=""
            width={960}
            height={720}
            /* already sized and compressed for this slot — re-encoding it
               through the optimiser buys nothing */
            unoptimized
          />
          <div className="locmap-fade" />
          <span className="locmap-pin">
            <svg width="34" height="42" viewBox="0 0 24 30" fill="none">
              <path
                d="M12 0C5.92 0 1 4.92 1 11c0 8.02 11 19 11 19s11-10.98 11-19c0-6.08-4.92-11-11-11z"
                fill="var(--blue)"
              />
              <circle cx="12" cy="11" r="3.7" fill="#fff" />
            </svg>
          </span>
          <span className="locmap-attrib">{attribution}</span>
        </div>

        <div className="locmap-content">
          <svg
            className="locmap-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--blue)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" x2="9" y1="3" y2="18" />
            <line x1="15" x2="15" y1="6" y2="21" />
          </svg>

          <div>
            <p className="locmap-place">{location}</p>
            <address className="locmap-addr" id={panelId}>
              {address.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < address.length - 1 ? <br /> : null}
                </span>
              ))}
            </address>
            <div className="locmap-dir-row">
              <a
                className="locmap-dir"
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* A real button rather than a click handler on the card, so the
            card opens from the keyboard and announces its state. It sits
            under the directions link in the stack, which is what keeps that
            link clickable without a stopPropagation dance. */}
        <button
          type="button"
          className="locmap-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">
            {open ? `Hide the ${location} address` : `Show the ${location} address`}
          </span>
        </button>
      </div>

      <p className="locmap-hint" aria-hidden="true">
        Click to expand
      </p>
    </div>
  );
}

export { LocationMap };
