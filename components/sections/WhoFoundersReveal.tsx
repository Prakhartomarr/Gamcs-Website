"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type RevealFounder = { name: string; title: string; photo: string };

/**
 * The phone's tap-to-reveal over the founders' photograph.
 *
 * WhoWeAre is a server component and stays one; this is the only client code
 * in the section, and it takes the founders as props rather than reading the
 * content modules itself.
 *
 * It exists ONLY below 768px: `.who-reveal` is `display:none` by default in
 * globals.css and is switched on inside `@media (max-width:767px)`, so on
 * desktop the wrapper generates no box, the opener cannot be reached by
 * pointer or by Tab, and the card keeps its own `.who-founders-btn` link —
 * which the mobile block hides in turn. The two never render together.
 *
 * A disclosure, not a dialog: no focus trap, no `role="dialog"`, no scroll
 * lock. The panel covers the card, Escape closes it and focus goes back to
 * the button that opened it.
 */
export default function WhoFoundersReveal({
  founders,
  openLabel,
  teamLabel,
  closeLabel,
}: {
  founders: RevealFounder[];
  openLabel: string;
  teamLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  /* The effect below also runs on mount. Without this the page would pull
     focus down to the card as soon as it hydrated. */
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) {
      touched.current = true;
      return;
    }
    /* Opening moves focus into the panel — which is also what puts Escape
       within reach, since the handler is on the panel. Closing hands it back
       to the opener, which React has just re-mounted. */
    (open ? closer : opener).current?.focus();
  }, [open]);

  return (
    <div className="who-reveal">
      {open ? (
        <div
          className="who-reveal-panel"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          {founders.map((f) => (
            <div className="who-reveal-person" key={f.name}>
              {/* Decorative: the name is in type immediately beside it. */}
              <Image
                className="who-reveal-photo"
                src={f.photo}
                alt=""
                width={112}
                height={112}
                sizes="56px"
              />
              <div>
                <div className="who-reveal-name">{f.name}</div>
                <p className="who-reveal-title">{f.title}</p>
              </div>
            </div>
          ))}
          <div className="who-reveal-actions">
            <Link className="who-reveal-team" href="/team">
              {teamLabel}
            </Link>
            <button
              ref={closer}
              type="button"
              className="who-reveal-close"
              aria-label={closeLabel}
              onClick={() => setOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="who-reveal-bar">
          <button
            ref={opener}
            type="button"
            className="who-reveal-open"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span>{openLabel}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
