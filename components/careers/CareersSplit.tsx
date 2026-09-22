"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTA from "@/components/CTA";
import PageHeadArt from "@/components/PageHeadArt";
import SectionEyebrow from "@/components/SectionEyebrow";
import ApplyDialog, { type ApplyRequest } from "@/components/careers/ApplyDialog";
import { careers } from "@/lib/content/gamcs";

const { open, tracks, roles, locations } = careers;
const mailto = `mailto:${careers.email}`;

/* One list: named roles (none today) sit above the open-application tracks. */
const rows = [
  ...roles.map((r) => ({ id: r.id, track: r.track, title: r.title, body: r.summary, label: "", locations: r.locations })),
  ...tracks.map((t) => ({ id: t.id, track: t.id, title: t.title, body: t.workOn, label: open.workOn, locations: locations.map((l) => l.id) })),
];

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const Mail = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

/**
 * The split: the dark panel that stays put, and the track list it filters.
 * `children` are the server-rendered blocks that follow the tracks in the
 * scrolling column (Why GAMCS, How we work).
 *
 * The panel is plain CSS `position: sticky`. The only script on it is a
 * sentinel that marks it `data-pinned` once the page has moved, which folds
 * the breadcrumb, intro and meta line away so the filters and Apply still fit
 * a 720px-high laptop. The lane is a stretched grid cell, so the column beside
 * it never moves when the panel changes height.
 */
export default function CareersSplit({ children }: { children: ReactNode }) {
  const id = useId();
  const [area, setArea] = useState("all");
  const [loc, setLoc] = useState("all");
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

  const shown = rows.filter((r) => (area === "all" || r.track === area) && (loc === "all" || r.locations.includes(loc)));
  const locLabel = (ids: string[]) =>
    locations.filter((l) => ids.includes(l.id) && (loc === "all" || l.id === loc)).map((l) => l.label).join(" · ");

  /* Every Apply opens the overlay; a track's own button pre-selects it, and a
     chosen location filter carries into the form's location preference. */
  const apply = (track?: string) => ({ type: "button" as const, onClick: () => setRequest({ track, loc }) });

  const filters = (suffix: string, className: string) => (
    <div className={className}>
      <div>
        <label htmlFor={`${id}-area-${suffix}`}>{open.areaLabel}</label>
        <div className="cr-select">
          <select id={`${id}-area-${suffix}`} value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="all">{open.all}</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-loc-${suffix}`}>{open.locationLabel}</label>
        <div className="cr-select">
          <select id={`${id}-loc-${suffix}`} value={loc} onChange={(e) => setLoc(e.target.value)}>
            <option value="all">{open.all}</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <Chevron />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="container cr-split">
        <div className="cr-lane">
          <div className="cr-sentinel" ref={sentinel} aria-hidden="true" />
          <aside className="cr-panel page-head--art" aria-label="Careers at GAMCS" data-pinned={pinned ? "" : undefined}>
            <PageHeadArt src="/page-art/team.webp" />
            <div className="cr-panel-in">
              <div className="cr-fold"><div>
                <Breadcrumbs trail={[{ label: "Careers", href: "/careers" }]} />
              </div></div>
              <div className="section-kicker">{careers.kicker}</div>
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
              {filters("p", "cr-filters")}
              <div className="ctas" ref={heroCtas}>
                <CTA {...apply()} icon="diagonal" data-cta="careers-hero">{careers.applyLabel}</CTA>
              </div>
              <a className="cr-mail" href={mailto}><Mail />{careers.email}</a>
            </div>
          </aside>
        </div>

        <div className="cr-col">
          <section id="tracks" aria-labelledby={`${id}-tracks`} className="reveal">
            <SectionEyebrow label={open.eyebrow} />
            <h2 id={`${id}-tracks`}>{open.heading}</h2>
            <p className="cr-sub">{open.sub}</p>
            {filters("t", "cr-filters cr-filters--page")}
            <p className="cr-count" aria-live="polite">
              Showing {shown.length} of {rows.length} {roles.length ? "openings" : "tracks"}
            </p>
            <ul className="cr-tracks">
              {rows.map((r, i) => (
                <li key={r.id} className="cr-track" hidden={!shown.includes(r)}>
                  <div className="cr-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <h3>{r.title}</h3>
                    {r.label ? <div className="cr-caps">{r.label}</div> : null}
                    <p>{r.body}</p>
                    <div className="cr-chips">
                      <span className="cr-chip cr-chip--open">{open.chip}</span>
                      <span className="cr-chip">{locLabel(r.locations)}</span>
                    </div>
                  </div>
                  <CTA {...apply(tracks.some((t) => t.id === r.track) ? r.track : undefined)} icon="diagonal" data-cta={`careers-track-${r.id}`} srSuffix={`to ${r.title}`}>Apply</CTA>
                </li>
              ))}
              {/* Survives every filter, so the list can never read as empty. */}
              <li className="cr-other">
                <p>
                  {open.other} <span>{open.otherLead} <a href={mailto}>{careers.email}</a></span>
                </p>
                <Mail size={22} />
              </li>
            </ul>
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
