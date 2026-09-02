"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { team } from "@/lib/content/gamcs";

/**
 * The team page roster: founders as large staggered cards, advisers as a
 * three-across grid, and one panel that opens for whoever is clicked.
 *
 * Two card sizes, one card anatomy. The caption sits on the photograph over a
 * gradient in both sections; the advisers' type is stepped down because their
 * cards are 329px wide against the founders' 400.
 *
 * The photographs are greyscaled in CSS rather than on disk. The nine were shot
 * in nine different places — several against white, one against a purple
 * backdrop — and the filter is what makes them read as one set. The colour
 * originals stay on disk, so this is one declaration to undo.
 *
 * Nobody has a `bio` written yet. The panel renders whatever a person does have,
 * so today it carries the title, years, location and contact links, and grows a
 * paragraph the moment a bio is filled in. That is deliberate: gating the panel
 * on a bio would leave a "+" that opens an empty dialog.
 */

type Member = {
  name: string;
  title: string;
  experience?: string;
  location?: string;
  photo: string;
  email?: string;
  linkedinUrl?: string;
  bio?: string;
};

const FOUNDERS = team.leadership as readonly Member[];
const ADVISERS = team.advisory as readonly Member[];
const EVERYONE: readonly Member[] = [...FOUNDERS, ...ADVISERS];

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
        <Image
          src={person.photo}
          alt={`Portrait of ${person.name}, ${person.title}`}
          fill
          sizes={sizes}
        />
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
          <div className="tr-sec">
            <div>
              <h2 className="tr-h">Founders</h2>
              <span className="tr-count">Two</span>
            </div>
            <div className="tr-stack">
              {FOUNDERS.map((p) => (
                <Card key={p.name} person={p} onOpen={show}
                  sizes="(max-width: 767px) 92vw, 400px" />
              ))}
            </div>
          </div>

          <div className="tr-block">
            <div className="tr-mid">
              <h2 className="tr-h">Advisory Team</h2>
              <span className="tr-count">Seven</span>
            </div>
            <div className="tr-grid">
              {ADVISERS.map((p) => (
                <Card key={p.name} person={p} onOpen={show}
                  sizes="(max-width: 767px) 92vw, (max-width: 1023px) 45vw, 329px" />
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
            <button type="button" className="tr-close" onClick={close} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="tr-ovin">
              <div className="tr-ovshot">
                <span>
                  <Image src={active.photo} alt="" fill sizes="216px" />
                </span>
                <i />
              </div>
              <h3 id="tr-ov-name">{active.name}</h3>
              <p className="tr-ovrole">{active.title}</p>
              {meta ? <p className="tr-ovmeta">{meta}</p> : null}
              <div className="tr-ovbody">
                {active.bio ? <p className="tr-bio">{active.bio}</p> : null}
                {active.linkedinUrl || active.email ? (
                  <div className="tr-ovlinks">
                    {active.linkedinUrl ? (
                      <a href={active.linkedinUrl} target="_blank" rel="noopener">
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                          <circle cx="6.1" cy="5.8" r="1.9" />
                          <rect x="4.4" y="9.3" width="3.4" height="10.3" rx="0.5" />
                          <rect x="10.1" y="9.3" width="3.3" height="10.3" rx="0.5" />
                          <path d="M13.4 14.1a3.5 3.5 0 0 1 6.3 2.1v3.4h-3.4v-3.1a1.5 1.5 0 0 0-2.9-.5z" />
                        </svg>
                        LinkedIn
                      </a>
                    ) : null}
                    {active.email ? (
                      <a href={`mailto:${active.email}`}>
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
                          stroke="currentColor" strokeWidth={1.7} strokeLinecap="round"
                          strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 6 9-6" />
                        </svg>
                        Email
                      </a>
                    ) : null}
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
