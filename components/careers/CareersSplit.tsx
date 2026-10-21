"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import CTA from "@/components/CTA";
import PageHeadArt from "@/components/PageHeadArt";
import SectionEyebrow from "@/components/SectionEyebrow";
import ApplyDialog, { type ApplyRequest } from "@/components/careers/ApplyDialog";
import { careers } from "@/lib/content/gamcs";

const { open } = careers;
const mailto = `mailto:${careers.email}`;
const Mail = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

/**
 * The split: the dark panel that stays put, and the column that scrolls past
 * it. `children` are the server-rendered blocks in that column (Why GAMCS,
 * How we work), below the no-openings section this renders itself.
 *
 * The panel is plain CSS `position: sticky`. The only script on it is a
 * sentinel that marks it `data-pinned` once the page has moved, which folds
 * the intro and meta line away so Apply still fits a 720px-high laptop. The
 * lane is a stretched grid cell, so the column beside it never moves when the
 * panel changes height.
 */
export default function CareersSplit({ children }: { children: ReactNode }) {
  const id = useId();
  const [pinned, setPinned] = useState(false);
  const [bar, setBar] = useState(false);
  const [request, setRequest] = useState<ApplyRequest | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const heroCtas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPinned(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Phone Apply bar: in once the hero's own Apply has scrolled away, out again
     when the footer arrives — the same two observers as StickyMobileCTA, which
     stands down on this route. */
  useEffect(() => {
    const top = heroCtas.current;
    const foot = document.querySelector("footer");
    if (!top || !foot) return;
    let topGone = false;
    let footIn = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === top) topGone = !e.isIntersecting && e.boundingClientRect.top < 0;
        else footIn = e.isIntersecting;
      }
      setBar(topGone && !footIn);
    });
    io.observe(top);
    io.observe(foot);
    return () => io.disconnect();
  }, []);

  /* Every Apply opens the overlay. Nothing pre-selects a track or a location
     any more, so the form asks for both itself. */
  const apply = () => ({ type: "button" as const, onClick: () => setRequest({}) });

  return (
    <>
      <div className="container cr-split">
        <div className="cr-lane">
          <div className="cr-sentinel" ref={sentinel} aria-hidden="true" />
          <aside className="cr-panel page-head--art" aria-label="Careers at GAMCS" data-pinned={pinned ? "" : undefined}>
            <PageHeadArt src="/page-art/team.webp" />
            <div className="cr-panel-in">
              <h1>
                {careers.h1} <span>{careers.h1Accent}</span>
              </h1>
              <div className="cr-fold"><div>
                <p className="cr-intro">{careers.intro}</p>
                <p className="cr-meta">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  {careers.meta}
                </p>
              </div></div>
              <div className="cr-rule" />
              <div className="ctas" ref={heroCtas}>
                <CTA {...apply()} icon="diagonal" data-cta="careers-hero">{careers.applyLabel}</CTA>
              </div>
              <a className="cr-mail" href={mailto}><Mail />{careers.email}</a>
            </div>
          </aside>
        </div>

        <div className="cr-col">
          {/* NO OPENINGS (client, 2026-10-22). This was a filterable list of
              the five practice-area tracks, each with an "Open application"
              pill and its own Apply button, under a "Showing 5 of 5 tracks"
              counter. The client has nothing open, and the cards read as five
              vacancies, so the list, the counter and both filter renders are
              gone. What is left says so and keeps the CV route open.

              The copy the list used — open.chip/workOn/areaLabel/locationLabel/
              all/showingTracks/showingOpenings/apply, and careers.tracks — is
              still in gamcs.ts and still resolves for the copy manifest. Note
              careers.tracks is NOT dead: its ids are the Apply form's track
              select and the whitelist /api/careers validates against. */}
          <section id="tracks" aria-labelledby={`${id}-tracks`} className="reveal">
            <SectionEyebrow label={open.eyebrow} />
            <h2 id={`${id}-tracks`}>{open.heading}</h2>
            <p className="cr-sub">{open.sub}</p>
            <div className="ctas">
              <CTA {...apply()} icon="diagonal" data-cta="careers-open">{careers.applyLabel}</CTA>
            </div>
            <div className="cr-other">
              <p>
                {open.other} <span>{open.otherLead} <a href={mailto}>{careers.email}</a></span>
              </p>
              <Mail size={22} />
            </div>
          </section>
          {children}
        </div>
      </div>

      <div className="cr-bar" role="region" aria-label="Apply" data-show={bar ? "" : undefined} aria-hidden={!bar}>
        <div>
          <strong>{open.eyebrow}</strong>
          <span className="cr-bar-meta">{careers.meta}</span>
        </div>
        <CTA {...apply()} icon="diagonal" data-cta="careers-sticky" tabIndex={bar ? undefined : -1}>{careers.applyLabel}</CTA>
      </div>

      <ApplyDialog request={request} onClose={() => setRequest(null)} />
    </>
  );
}
