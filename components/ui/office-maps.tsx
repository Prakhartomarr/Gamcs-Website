"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LocationMap from "@/components/ui/expand-map";
import { officeCards } from "@/lib/content/gamcs";

/* ----------------------------------------------------------------
 * OfficeMaps
 *
 * The three offices as a pile of cards, front one flat and square on, the
 * other two peeking out behind it, with a pair of arrows underneath to deal
 * through them (client, 2026-10-21, against a screen recording they sent).
 *
 * WHAT THIS REPLACES. A single registered-office card plus a "See all 3
 * offices" disclosure that laid the other two out in a row beside it. The
 * pile shows there are three without being told, so the disclosure has gone
 * and with it the remount-on-toggle trick that used to stop the row's
 * collapse animating a width nobody asked to animate.
 *
 * GURUGRAM STARTS AT THE FRONT, found by the `registered` flag rather than by
 * position: by index the front card would be whatever entry happens to be
 * first, which is not necessarily this firm's own address.
 *
 * TWO CONTROLS, NOT ONE. The arrows change which office is in front; the
 * front card keeps the job it already had, which is to open on click and show
 * its address and directions. Clicking the pile to advance it would have
 * meant taking that away, or making one card mean two different things
 * depending on where it sits, which is not something a screen reader can
 * announce.
 *
 * THE CARDS BEHIND ARE `inert`. They are visible, so `aria-hidden` alone
 * would be a lie about content a sighted visitor can see, and on its own it
 * would leave their button and directions link in the tab order behind a card
 * nobody can read. `inert` removes both at once. It is set through a ref
 * because React 18 does not forward the attribute from JSX.
 *
 * ONE INTRODUCTION, THEN IT STOPS (client, 2026-10-22). This carried "no
 * autoplay" until now. The deck opens its front card once when it first
 * scrolls into view, holds it 2.5s, shuts it, then deals through all three
 * offices at 3s a turn and stops with Gurugram back in front — about 11.5s
 * end to end. One round, once per page load.
 *
 * IT IS NOT A CAROUSEL and deliberately does not become one. It ends on its
 * own, so there is no indefinitely moving content sitting beside the page's
 * main call to action; the arrows remain the only thing that moves it after
 * that.
 *
 * ANY INTERACTION ENDS IT FOR GOOD — an arrow, a click on the card, a
 * pointer entering the deck, or focus landing inside it. Focus especially:
 * the card's toggle carries aria-expanded and an accessible name that swings
 * between "Show the ... address" and "Hide the ...". `expand-map.tsx` used
 * to open itself on intersection and that is exactly what it broke, flipping
 * a focused control's state and name with no input from the user. Cancelling
 * on focus-capture means the sequence can never reach a control someone is
 * already on.
 *
 * prefers-reduced-motion skips the whole thing; the deck simply starts as it
 * always did, closed and on Gurugram.
 * ---------------------------------------------------------------- */

/* The introduction's two beats. Exported as named constants because the
   timings are the client's and are the thing most likely to be re-asked. */
const INTRO_OPEN_MS = 2500;
const INTRO_TURN_MS = 3000;

const FRONT = Math.max(
  0,
  officeCards.findIndex((o) => o.registered)
);

export default function OfficeMaps({ className }: { className?: string }) {
  const [active, setActive] = useState(FRONT);
  /* ONE FLAG FOR THE WHOLE DECK, not one per card. Expanded stays expanded
     while you page through the offices; before this the outgoing card was
     forced shut and the incoming one arrived closed, so changing office while
     reading an address meant opening it again every time. */
  const [expanded, setExpanded] = useState(false);
  const count = officeCards.length;

  const step = useCallback(
    (delta: number) => setActive((i) => (i + delta + count) % count),
    [count]
  );

  const rootRef = useRef<HTMLDivElement>(null);
  /* Every pending beat, so one cancel reaches all of them. `introSpent` is a
     ref, not state: nothing renders from it and flipping it must not cost a
     re-render of three maps. */
  const introTimers = useRef<number[]>([]);
  const introSpent = useRef(false);

  const stopIntro = useCallback(() => {
    introSpent.current = true;
    for (const t of introTimers.current) window.clearTimeout(t);
    introTimers.current = [];
  }, []);

  /* Clear on unmount as well: a timer that fires after the deck has gone
     calls setState on an unmounted tree. */
  useEffect(
    () => () => {
      for (const t of introTimers.current) window.clearTimeout(t);
    },
    []
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el || introSpent.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        /* Disconnect before running, not after: this is once per page load,
           so scrolling away and back must not deal the deck again. */
        io.disconnect();
        if (introSpent.current) return;
        const at = (ms: number, fn: () => void) =>
          introTimers.current.push(window.setTimeout(fn, ms));

        setExpanded(true);
        at(INTRO_OPEN_MS, () => setExpanded(false));
        /* `count` turns, not count - 1: three offices take three steps to
           bring the first one back to the front. The first turn is a full
           interval after the card shuts, so the close is not swallowed by a
           step landing on top of it. */
        for (let n = 1; n <= count; n++) {
          at(INTRO_OPEN_MS + INTRO_TURN_MS * n, () => {
            step(1);
            if (n === count) introSpent.current = true;
          });
        }
      },
      /* Half the deck, so it has actually arrived rather than clipping the
         bottom of the viewport while the visitor is still scrolling past. */
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [count, step, stopIntro]);

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      /* The three ways a visitor takes hold of the deck. Pointer-down and
         focus are captured so they land before the control's own handler,
         and pointer-enter covers a mouse arriving without a click. */
      onPointerEnter={stopIntro}
      onPointerDownCapture={stopIntro}
      onFocusCapture={stopIntro}
      className={["locdeck", className].filter(Boolean).join(" ")}
      /* The neighbours have to stand further off once the front card opens:
         it grows 272 -> 408 wide and would otherwise cover them completely.
         CSS reads this; the measurement is in the comment there. */
      data-expanded={expanded}
    >
      <div className="locdeck-stage">
        {officeCards.map((o, i) => {
          /* 0 is the front card; 1 is the one the next arrow brings in and
             peeks from the right, 2 is the one the back arrow brings in and
             peeks from the left. Depth drives the transform in globals.css,
             so the arithmetic lives here and the look lives there. */
          const depth = (i - active + count) % count;
          return (
            <DeckItem key={o.coords} depth={depth}>
              <LocationMap
                location={`${o.locality}, ${o.region}`}
                /* City, street, then city, region and postcode, with the
                   landmark note where there is one.

                   This was written to match the footer's Offices column line
                   for line. It no longer does: that column is "Find us" now
                   and prints the city alone since 2026-10-22, which
                   makes these cards the one place on the site that shows all
                   three streets. Not a coupling to restore — the two have
                   different jobs — but the reason the full lines matter here
                   is now that they are not anywhere else.
                   KNOWN CONSEQUENCE, already flagged on the footer: `o.name`
                   is dropped, so the Noida and Bangalore cards no longer say
                   which firm trades at those addresses and can read as GAMCS
                   branches. The name is still in `officeCards` and is one
                   line to put back. */
                address={[
                  o.street,
                  `${o.locality}, ${o.region} ${o.postalCode}`,
                  ...(o.note ? [o.note] : []),
                ]}
                mapSrc={o.map}
                destination={o.coords}
                open={depth === 0 && expanded}
                /* Only ever called from the card's own toggle, never from a
                   change to `open` — so the introduction driving `expanded`
                   directly cannot cancel itself here. */
                onOpenChange={(next) => {
                  stopIntro();
                  setExpanded(next);
                }}
              />
            </DeckItem>
          );
        })}
      </div>

      <div className="locdeck-nav">
        <button
          type="button"
          className="locdeck-arrow"
          onClick={() => {
            stopIntro();
            step(-1);
          }}
          aria-label="Previous office"
        >
          <svg width="17" height="14" viewBox="0 0 17 14" fill="none" aria-hidden="true">
            <path
              d="M16 7H1.5M7 1.5L1 7l6 5.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* The only thing that announces the change. The arrows keep one name
            each rather than naming the office they will reveal, so their
            labels do not shift under a screen reader between presses. */}
        <p className="locdeck-status" aria-live="polite">
          {officeCards[active].locality}, {officeCards[active].region}
          <span className="sr-only">
            {" "}
            — office {active + 1} of {count}
          </span>
        </p>

        <button
          type="button"
          className="locdeck-arrow"
          onClick={() => {
            stopIntro();
            step(1);
          }}
          aria-label="Next office"
        >
          <svg width="17" height="14" viewBox="0 0 17 14" fill="none" aria-hidden="true">
            <path
              d="M1 7h14.5M10 1.5L16 7l-6 5.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* `inert` has to go on through a ref: React 18 drops an unknown `inert` prop
   rather than writing the attribute, and the boolean-attribute spelling
   (`inert=""`) is what the browser reads. */
function DeckItem({ depth, children }: { depth: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (depth === 0) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [depth]);

  return (
    <div className="locdeck-item" data-depth={depth} ref={ref}>
      {children}
    </div>
  );
}
