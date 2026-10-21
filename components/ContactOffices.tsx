"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { officeCards, officeSlug, site } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { map } from "@/lib/content/ui";

/**
 * The three offices as tabs, on /contact (client, 2026-10-21).
 *
 * The page used to print one address: `<Directions>` reads `site.address`,
 * which is the registered office, so Noida and Bangalore appeared nowhere on
 * it. All three are in `officeCards` with their own basemap, and this prints
 * them.
 *
 * NOT the homepage's `OfficeMaps` deck. That one is a stack of cards a
 * visitor pages through with arrows, built to sit inside the CTA panel; this
 * is a labelled tablist, which is what a reader scanning for "which of these
 * is near me" wants. Both read the same `officeCards`, so an office that
 * moves moves in both.
 *
 * A REAL TABLIST, not three buttons that swap a div. Arrow keys move between
 * tabs and Home/End jump to the ends, which is what a screen-reader user is
 * told to expect the moment `role="tablist"` is announced; roving tabindex
 * keeps the group to one tab stop. `aria-controls` is on each tab and the
 * panel carries `aria-labelledby` back, so the pair is announced together.
 *
 * THE PANEL HOLDS THE MAP AS WELL AS THE ADDRESS. Both change when a tab is
 * chosen, so both belong inside the element the tab controls — a map sitting
 * outside the panel would swap silently. That is why the tabs sit in their
 * own row above the panel rather than tucked beside the image: the panel has
 * to be one box, and one box cannot be two disjoint grid areas.
 */

/**
 * Two-letter codes for the badge on each tab (client, 2026-10-21, matching
 * the reference's NY / CA / UK).
 *
 * Official Indian state codes, not copy: they are an abbreviation OF
 * `office.region`, which is already published, so they are not a string the
 * client has to approve or maintain. The fallback builds initials from the
 * region itself, so a fourth office in a state not listed here still gets a
 * badge rather than an empty pill.
 */
const STATE_CODE: Record<string, string> = {
  Haryana: "HR",
  "Uttar Pradesh": "UP",
  Karnataka: "KA",
};

const codeFor = (region: string) =>
  STATE_CODE[region] ??
  region
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function ContactOffices({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  /* Set once, from /contact?office=<slug>, which the footer's three city
     links write. `window.location.search` in an effect rather than
     `useSearchParams`: that hook opts the whole route into dynamic rendering
     unless it is wrapped in a Suspense boundary, and this is a tab index on a
     static page, not something worth giving up the static render for.

     The cost is that it lands after hydration, so an office other than the
     first shows Gurugram for a frame. Nothing moves on screen but the tab's
     own selected state, and the alternative costs every visitor the static
     page.

     Unknown or missing slug falls through to the default, so a hand-typed or
     stale URL still gets a working card. */
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("office");
    if (!want) return;
    const i = officeCards.findIndex((o) => officeSlug(o) === want);
    if (i < 0) return;
    setActive(i);
    /* Focus the tab they asked for, so a keyboard or screen-reader visitor
       arrives ON the control rather than at the top of the page with the
       whole document between them and it. preventScroll because the browser
       is already scrolling to #offices from the same URL — focus() would
       otherwise fight it and win, landing the tab at the viewport's top edge
       instead of the card below the header. */
    tabsRef.current[i]?.focus({ preventScroll: true });
  }, []);
  const base = useId().replace(/:/g, "");
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const count = officeCards.length;

  /* Move focus with selection: this is an automatic-activation tablist,
     which is the right default when switching panels costs nothing — no
     request, no work, just a different address and a different image. */
  const go = useCallback(
    (next: number) => {
      /* `+ count` before the modulo: in JS, -1 % 3 is -1, not 2, so this is
         what makes ArrowLeft on the first tab wrap to the last. */
      const i = (next + count) % count;
      setActive(i);
      tabsRef.current[i]?.focus();
    },
    [count]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const keys: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: count - 1,
    };
    const next = keys[e.key];
    /* Every other key falls through untouched — Tab still leaves the group,
       Enter and Space still activate the button. */
    if (next === undefined) return;
    e.preventDefault();
    go(next);
  };

  if (count === 0) return null;

  const office = officeCards[active];
  const location = `${office.locality}, ${office.region}`;
  const query = [office.street, office.locality, office.region, office.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={["cxo", className].filter(Boolean).join(" ")}>
      <div className="cxo-tabs" role="tablist" aria-label={map.visitUs}>
        {officeCards.map((o, i) => (
          <button
            key={o.coords}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel`}
            /* Roving tabindex: the group is one stop, arrows move inside it. */
            tabIndex={i === active ? 0 : -1}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            className="cxo-tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {/* The badge is decorative shorthand for the line beneath it —
                "HR" read out after "Gurugram" is noise, and the region is
                already in the panel. */}
            <span className="cxo-code" aria-hidden="true">
              {codeFor(o.region)}
            </span>
            <span className="cxo-name">{o.locality}</span>
          </button>
        ))}
      </div>

      {/* ONE panel, re-rendered, with ONE id. Three mounted panels would put
          three 960x720 basemaps on the page and load all of them; and with
          one panel every tab's `aria-controls` has to name the id that is
          actually in the document, or two of the three point at nothing. */}
      {/* NO tabIndex. The APG puts a tabpanel in the tab order only when it
          holds nothing focusable, so a reader can reach its content at all;
          this one always holds the "Get directions" link, so adding one gave
          a keyboard user an extra stop on a 1228x555 box for nothing.

          It also gave that stop a focus ring that could not be seen: the
          panel spans the whole card, so `outline-offset:-4px` drew the ring
          beneath the tablist (which paints above it) and beneath the map
          (which is the panel's own child, so it paints after the outline).
          Roughly two thirds of the perimeter never rendered, and the half
          over the map never could. Removing the stop removes both. */}
      <div
        className="cxo-panel"
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${active}`}
      >
        <div className="cxo-detail">
          {/* Not an <h3>: these sit under the section's own h2 and the tab
              above already names the city. A heading per office would put
              three more rows in the page outline for one address. */}
          <p className="cxo-city">{location}</p>
          <address className="cxo-addr">
            <span>{office.street}</span>
            <span>
              {office.locality}, {office.region} {office.postalCode}
            </span>
            {office.note ? <span className="cxo-note">{office.note}</span> : null}
          </address>
          <a
            className="cxo-dir"
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office.coords)}`}
            target="_blank"
            rel="noopener"
            /* Three of these render across a session, so the visible "Get
               directions" alone cannot tell a links list which city it routes
               to. Opens with the visible text, so speech input still matches
               it (WCAG 2.5.3). */
            aria-label={fill(map.directionsTo, { location })}
          >
            {map.directions} ↗
          </a>
        </div>

        <div className="cxo-map">
          <Image
            src={office.map}
            alt={fill(map.alt, { short: site.short, address: query })}
            width={960}
            height={720}
            unoptimized
          />
          {/* ODbL requires the credit wherever the tiles are shown. */}
          <span className="cxo-attrib">{map.attribution}</span>
        </div>
      </div>
    </div>
  );
}
