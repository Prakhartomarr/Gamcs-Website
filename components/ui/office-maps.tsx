"use client";

import { useId, useState } from "react";
import LocationMap from "@/components/ui/expand-map";
import { fill } from "@/lib/content/fill";
import { officeCards } from "@/lib/content/gamcs";
import { map } from "@/lib/content/ui";

/* ----------------------------------------------------------------
 * OfficeMaps
 *
 * The registered office's card, and a disclosure that puts the other two
 * beside it. Every card is still a LocationMap, still a static image, still
 * opens on its own for its own address and directions.
 *
 * WHERE THE TRIGGER GOES, and why it is not on the card.
 * LocationMap already covers its whole card with a real button
 * (.locmap-toggle, z-3) — that is how the card opens from the keyboard and
 * announces its state. A second button laid over the same card to reveal the
 * other offices would be two controls occupying the same pixels, and putting
 * one inside the other is invalid HTML on top of that; the usual escape, a
 * click handler on a wrapping div with stopPropagation, is not a control at
 * all. So the trigger is a SIBLING, above the row and in the flow: the card
 * keeps its one job, the trigger has its own, and no event has to be stopped.
 *
 * IT NOW SITS BELOW THE ROW, under the card and above "Click to expand"
 * (client, 2026-10-20). It used to be first in the DOM as well as first on
 * the page, so the region it controlled followed it in the tab order. It has
 * moved in the DOM rather than being pushed down with `order`: visual order
 * and focus order stay the same as each other either way, and a mismatch
 * between them is the thing WCAG 2.4.3 is actually about. The cost is that
 * the keyboard now reaches the cards before the control that reveals them,
 * which `aria-controls` still describes correctly.
 *
 * Focus stays put on the trigger across a toggle, because nothing it could
 * be sitting on is ever unmounted.
 *
 * Motion: none here. The row's entrance lives in globals.css behind
 * prefers-reduced-motion: no-preference, and each card's own transitions are
 * LocationMap's problem, which it already handles.
 * ---------------------------------------------------------------- */

export default function OfficeMaps({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const rowId = useId();
  /* Collapsed is the registered office alone, found by its flag: by
     position this card is whatever entry happens to be first, which is not
     this firm's address to publish. Same component, same props it had as the
     single card. */
  const shown = open ? officeCards : officeCards.filter((o) => o.registered);

  return (
    <div
      className={["locmaps", className].filter(Boolean).join(" ")}
      data-open={open}
    >
      <div className="locmaps-row" id={rowId}>
        {shown.map((o) => (
          <LocationMap
            /* The `open` state is IN THE KEY, so toggling the row remounts
               every card instead of re-rendering it (client, 2026-10-20).

               THE BUG IT FIXES. .locmap-card carries `transition: width .52s`
               for its own expand, and in the open row its width is 100% of a
               third of the panel. Collapsing re-rendered the same element with
               a new width, so that transition ran on a layout change nobody
               asked to animate: measured, the card dropped to 45px, grew back
               out from a fixed left edge over 520ms with its centre sliding
               159px to the right, and then jumped left to centre once the
               tween finished. Right, back, then centre.

               A card that has just mounted has no previous width to transition
               FROM, so it paints at 320px, centred, on the first frame. The
               same remount also drops the card's own `open` state, which is
               what makes an expanded card snap shut with the row rather than
               being left at 480x340 in a 520px stage.

               Cost: the image reloads from cache and any pointer tilt resets.
               Focus is safe — the trigger is a sibling and is never unmounted,
               and it is where focus has to be to press it. */
            key={`${o.coords}-${open}`}
            location={`${o.locality}, ${o.region}`}
            /* The firm name leads the address because it is not the same firm
               at all three: the Noida and Bangalore cards would otherwise read
               as GAMCS branches. It is inside the card, so the collapsed view
               is unchanged. */
            address={[
              o.name,
              o.street,
              `${o.locality}, ${o.region} ${o.postalCode}`,
              ...(o.note ? [o.note] : []),
            ]}
            mapSrc={o.map}
            destination={o.coords}
          />
        ))}
      </div>

      <button
        type="button"
        className="locmaps-toggle"
        aria-expanded={open}
        aria-controls={rowId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? map.hideOffices : fill(map.showOffices, { count: officeCards.length })}
      </button>
    </div>
  );
}
