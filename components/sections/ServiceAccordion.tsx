"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CTA from "@/components/CTA";
import { ARROW, STROKE_ICONS } from "@/components/ui/stroke-icons";
import { solutions } from "@/lib/content/gamcs";
import { sections } from "@/lib/content/ui";

/**
 * The five pillars as an auto-advancing accordion beside a visual panel.
 *
 * Replaces the six-card grid. The reference this follows pairs each item with
 * a product screenshot; GAMCS has no product to screenshot, and inventing
 * dashboard metrics for a finance consultancy would be fabricating exactly the
 * kind of number this firm is hired to get right. So the panel carries the
 * pillar's real `atAGlance` capabilities instead — content that already exists
 * on each solution page. Each open item shows the pillar's `tagline`.
 *
 * Pointing at a pillar opens it — no click needed. The click is kept all the
 * same: there is no hover on a phone, and the header is the keyboard control.
 *
 * Auto-advance is pausable, which WCAG 2.2.2 requires of anything that moves
 * on its own: it holds while the pointer is over the list or focus is inside
 * it, and stops for good the moment someone picks an item themselves — which
 * now includes the first hover. It never starts at all under
 * prefers-reduced-motion, or on a coarse pointer, which has no hover to hold
 * it with.
 *
 * Below 768px the list renders as a chip strip over a single white card: same
 * buttons, same accordion semantics, styled in app/globals.css.
 */
const ADVANCE_MS = 5200;
/**
 * Intent, not arrival. Reaching the last pillar drags the pointer across the
 * four above it; opening on the bare pointerenter strobes the panel through
 * every one of them on the way past. 100ms is under the ~150ms it takes to
 * notice a change, so aiming at a pillar still feels instant.
 */
const HOVER_MS = 100;

export default function ServiceAccordion() {
  const [active, setActive] = useState(0);
  /** Set once the visitor drives it themselves — auto-advance never resumes. */
  const [taken, setTaken] = useState(false);
  const [held, setHeld] = useState(false);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    /* `held` is the pause, and it is set by onPointerEnter — which a touch
       device does not reliably fire, and never keeps set. So on a phone
       nothing ever paused and the card rotated every 5.2s under a visitor
       who was reading it. A coarse pointer has no hover to pause with, so
       autoplay simply never starts there. Same effect as the reduced-motion
       read, so this adds no new hydration surface. */
    const off = (q: string) => window.matchMedia(q).matches;
    setAuto(!off("(prefers-reduced-motion: reduce)") && !off("(pointer: coarse)"));
  }, []);

  const running = auto && !taken && !held;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(
      () => setActive((i) => (i + 1) % solutions.length),
      ADVANCE_MS
    );
    return () => window.clearTimeout(t);
  }, [running, active]);

  const pick = useCallback((i: number) => {
    setTaken(true);
    setActive(i);
  }, []);

  const listRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);

  const cancelHover = useCallback(() => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  /* Mouse only. A tap fires pointerenter too, and on a phone that would open
     the item under the finger before the click that was actually aimed at it. */
  const hover = useCallback(
    (i: number, type: string) => {
      if (type !== "mouse") return;
      cancelHover();
      hoverTimer.current = window.setTimeout(() => {
        hoverTimer.current = null;
        pick(i);
      }, HOVER_MS);
    },
    [cancelHover, pick]
  );

  /* A pending open must not fire after the section is gone. */
  useEffect(() => cancelHover, [cancelHover]);

  const s = solutions[active];

  return (
    <div className="svca">
      <div
        className="svca-list"
        ref={listRef}
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={(e) => {
          if (!listRef.current?.contains(e.relatedTarget as Node)) setHeld(false);
        }}
      >
        {solutions.map((item, i) => {
          const open = i === active;
          return (
            /* The handler belongs on the item, not on the header button.
               Opening one pillar collapses another, which slides every header
               below it by ~200px — under a pointer that has not moved. Because
               the item grows to cover the pointer, it keeps the hover and no
               second pointerenter fires; hang this off .svca-head instead and
               the list walks itself down the pillars. */
            <div
              className={`svca-item${open ? " is-open" : ""}`}
              key={item.slug}
              onPointerEnter={(e) => hover(i, e.pointerType)}
              onPointerLeave={cancelHover}
            >
              <h3 className="svca-h">
                <button
                  type="button"
                  className="svca-head"
                  aria-expanded={open}
                  aria-controls={`svca-body-${item.slug}`}
                  onClick={() => {
                    cancelHover();
                    pick(i);
                  }}
                >
                  <span className="svca-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24">{STROKE_ICONS[item.slug]}</svg>
                  </span>
                  <span className="svca-title">{item.title}</span>
                </button>
              </h3>

              <div className="svca-body" id={`svca-body-${item.slug}`} role="region">
                <p>{item.tagline}</p>
                <CTA
                  tier="tertiary"
                  href={`/solutions/${item.slug}`}
                  data-cta={`svca-${item.slug}`}
                  srSuffix={`about ${item.title}`}
                >
                  {sections.learnMore}
                  {ARROW}
                </CTA>
              </div>
            </div>
          );
        })}
      </div>

      <div className="svca-card">
        {/* The oversized pillar glyph that used to bleed off this corner is gone:
            over the fluting it read as a second pattern rather than as texture. */}
        {/* Below 768px the list is a chip strip and every .svca-body is
            hidden, so the card carries the whole pillar: its index, its
            tagline and its link. `md:hidden` keeps all three out of the
            desktop render — DOM order is unchanged there. */}
        <div className="svca-panel" key={s.slug}>
          <span className="svca-index md:hidden" aria-hidden="true">
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="svca-kicker">{sections.atAGlance}</span>
          <p className="svca-panel-title">{s.title}</p>
          <p className="svca-panel-tag md:hidden">{s.tagline}</p>
          <ul className="svca-chips">
            {/* FP&A's glance list opens with the pillar's own name, which reads
                as a repeat directly under the same title */}
            {s.atAGlance.filter((c) => c !== s.title).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {/* data-cta is what Analytics.tsx:58 reads for GA4 attribution —
              it stays identical to the .svca-body copy's. */}
          <CTA
            tier="primary"
            icon="arrow"
            className="svca-go md:hidden"
            href={`/solutions/${s.slug}`}
            data-cta={`svca-${s.slug}`}
            srSuffix={`about ${s.title}`}
          >
            {sections.learnMore}
          </CTA>
        </div>
      </div>

      {/* Position only — the chips above already carry it as selected state,
          so this repeats nothing to a screen reader. */}
      <div className="svca-dots md:hidden" aria-hidden="true">
        {solutions.map((item, i) => (
          <span key={item.slug} className={i === active ? "is-on" : undefined} />
        ))}
      </div>

      {/* Announced once per change rather than the whole card being re-read,
          and only once the visitor is driving it: while it auto-advances the
          region is off, or a screen reader heard a new pillar every 5.2s. */}
      <p className="sr-only" aria-live={running ? "off" : "polite"}>
        {s.title} — {s.tagline}
      </p>
    </div>
  );
}
