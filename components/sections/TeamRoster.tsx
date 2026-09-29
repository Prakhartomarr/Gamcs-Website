"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { team } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { roster } from "@/lib/content/ui";

/**
 * The team page roster: the two founders side by side under their heading,
 * advisers as a three-across grid, and one panel that opens for whoever is
 * clicked.
 *
 * Two card sizes, one card anatomy. The caption sits on the photograph over a
 * gradient in both sections; the advisers' type is stepped down because four
 * of their cards fit a row at ~306px against the founders' 400.
 *
 * The photographs are greyscaled in CSS rather than on disk. The nine were shot
 * in nine different places — several against white, one against a purple
 * backdrop — and the filter is what makes them read as one set. The colour
 * originals stay on disk, so this is one declaration to undo.
 *
 * Only Gaurav has a `bio` so far. The panel renders whatever a person does
 * have, so the other nine still open on the title, years, location and contact
 * links and grow paragraphs the moment a bio is filled in. That is deliberate:
 * gating the "+" on a bio would hide it on nine of ten cards.
 */

type Member = {
  name: string;
  title: string;
  experience?: string;
  location?: string;
  /** Missing until the client sends a headshot; the card falls back to initials. */
  photo?: string;
  email?: string;
  linkedinUrl?: string;
  /** One entry per paragraph; the panel prints a <p> for each. */
  bio?: readonly string[];
  /** Middot-separated, as the client writes it — one cell in the copy doc. */
  expertise?: string;
};

const FOUNDERS = team.leadership as readonly Member[];
const ADVISERS = team.advisory as readonly Member[];
const EVERYONE: readonly Member[] = [...FOUNDERS, ...ADVISERS];

/** "Ramesh Yadav" -> "RY", for the tile that stands in for a missing headshot. */
const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
    strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

function Card({
  person,
  onOpen,
  sizes,
}: {
  person: Member;
  onOpen: (name: string, el: HTMLButtonElement) => void;
  sizes: string;
}) {
  return (
    <button
      type="button"
      className="tr-card"
      onClick={(e) => onOpen(person.name, e.currentTarget)}
      aria-haspopup="dialog"
    >
      <span className="tr-shot">
        {person.photo ? (
          <Image
            src={person.photo}
            alt={fill(roster.portraitAlt, { name: person.name, title: person.title })}
            fill
            sizes={sizes}
          />
        ) : (
          /* The name is printed in the caption below, so the tile is decorative. */
          <span className="tr-init" aria-hidden="true">{initials(person.name)}</span>
        )}
        <span className="tr-cap">
          <span className="tr-rule" />
          <span className="tr-name">{person.name}</span>
          <span className="tr-role">{person.title}</span>
        </span>
      </span>
      <span className="tr-plus" aria-hidden="true">
        <Plus />
      </span>
    </button>
  );
}

export default function TeamRoster() {
  const [open, setOpen] = useState<string | null>(null);
  /* Focus goes back where it came from, or the page loses the reader's place. */
  const opener = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const show = useCallback((name: string, el: HTMLButtonElement) => {
    opener.current = el;
    setOpen(name);
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    /* The page behind must not scroll under the dialog. */
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const active = EVERYONE.find((p) => p.name === open) ?? null;
  const meta = active
    ? [active.experience, active.location].filter(Boolean).join(" · ")
    : "";

  return (
    <>
      <section className="section tr" id="people">
        <div className="container">
          <div className="tr-duo">
            <div className="tr-duo-mid">
              <h2 className="tr-h">{roster.founders}</h2>
              <p className="tr-duo-note">{roster.foundersNote}</p>
            </div>
            {FOUNDERS.map((p) => (
              <Card key={p.name} person={p} onOpen={show}
                sizes="(max-width: 767px) 92vw, (max-width: 1023px) 45vw, 380px" />
            ))}
          </div>

          <div className="tr-block">
            <div className="tr-mid">
              <h2 className="tr-h">{roster.advisory}</h2>
            </div>
            <div className="tr-grid">
              {ADVISERS.map((p) => (
                <Card key={p.name} person={p} onOpen={show}
                  sizes="(max-width: 767px) 92vw, (max-width: 1023px) 45vw, 320px" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {active ? (
        <div className="tr-ovwrap" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div
            className="tr-ov"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tr-ov-name"
            tabIndex={-1}
            ref={panel}
          >
            <button type="button" className="tr-close" onClick={close} aria-label={roster.close}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="tr-ovin">
              <div className="tr-ovshot">
                <span>
                  {active.photo ? (
                    <Image src={active.photo} alt="" fill sizes="216px" />
                  ) : (
                    <span className="tr-init" aria-hidden="true">{initials(active.name)}</span>
                  )}
                </span>
                <i />
                {/* Under the portrait's hairline, not at the foot of the bio:
                    the right-hand column was empty below the picture and the
                    buttons sat a scroll away past four paragraphs.

                    Icons only, side by side. `roster.linkedin` and
                    `roster.email` are still the labels — they move to
                    aria-label, so the words stay in the copy document and a
                    screen reader still announces them. An icon link with no
                    accessible name is unusable without sight. */}
                {active.linkedinUrl || active.email ? (
                  <div className="tr-ovlinks">
                    {active.linkedinUrl ? (
                      <a href={active.linkedinUrl} target="_blank" rel="noopener"
                        aria-label={roster.linkedin}>
                        {/* The wordmark, not the old four-shape approximation:
                            that one gave the "n" a full-height left stem, so at
                            this size it read as "ih". The same path is still in
                            the footer's tile, where 17px hides it. */}
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                          <path d="M5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
                          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z" />
                        </svg>
                      </a>
                    ) : null}
                    {active.email ? (
                      <a href={`mailto:${active.email}`} aria-label={roster.email}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                          stroke="currentColor" strokeWidth={1.7} strokeLinecap="round"
                          strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 6 9-6" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <h3 id="tr-ov-name">{active.name}</h3>
              <p className="tr-ovrole">{active.title}</p>
              {meta ? <p className="tr-ovmeta">{meta}</p> : null}
              <div className="tr-ovbody">
                {active.bio?.map((para) => (
                  <p className="tr-bio" key={para.slice(0, 32)}>
                    {para}
                  </p>
                ))}
                {active.expertise ? (
                  <div className="tr-exp">
                    <h4>{roster.expertiseLabel}</h4>
                    <p>{active.expertise}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
