"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CTA from "@/components/CTA";
import SolutionDemo from "@/components/sections/SolutionDemo";
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
 * prefers-reduced-motion, on a coarse pointer, which has no hover to hold it
 * with, or below 768px — see AUTOPLAY.
 *
 * Below 768px the list renders as a chip strip over a single white card: same
 * buttons, same accordion semantics, styled in app/globals.css.
 */
const ADVANCE_MS = 5200;
/**
 * The three conditions under which the pillars may walk themselves, as one
 * query so a change to any of them re-reads all three.
 *
 * `min-width:768px` is the layout condition, and it is the breakpoint the
 * accordion layout itself uses. From 768px up, `.svca-list` and `.svca-card`
 * both carry a height floor sized to the tallest pillar, so an advance cannot
 * change the section's height. Below it the design is a chip strip over a
 * single card that is free to size to its own pillar — measured 2026-10-19 at
 * 390px: 473px under Deal Advisory against 636px under Digital
 * Transformation, which pushed everything from #impact to the footer down by
 * up to 164px every 5.2s under a reader who had touched nothing. Flooring the
 * card to the tallest pillar would buy that back with 164px of blank card, so
 * the chip strip stays manual instead: it is a control you tap, and a real
 * phone already never autoplayed it (pointer:coarse).
 *
 * `pointer:fine` is the pause condition: `held` is set by onPointerEnter, so a
 * device with no hover has no way to hold the rotation while reading.
 */
const AUTOPLAY =
  "(min-width:768px) and (pointer:fine) and (prefers-reduced-motion:no-preference)";
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
    /* Tracked rather than read once: width is the one condition here that
       changes while the page is open — dragging a window narrow used to leave
       the rotation running over the chip-strip layout, which is the state that
       shifts. */
    const mq = window.matchMedia(AUTOPLAY);
    const sync = () => setAuto(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const running = auto && !taken && !held;

  /* While a demo clip is actually playing, the clip's own end advances the
     accordion (2026-10-23); the timer is only the fallback for a clip that
     cannot play. */
  const [playing, setPlaying] = useState(false);
  const next = useCallback(() => setActive((i) => (i + 1) % solutions.length), []);

  useEffect(() => {
    if (!running || playing) return;
    const t = window.setTimeout(
      next,
      ADVANCE_MS
    );
    return () => window.clearTimeout(t);
  }, [running, active, playing, next]);

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

      {/* No FluteShader here, at the client's word (2026-10-20): this card
          keeps the fluted photograph. The live shader stays on the other two
          --flute-ground surfaces, the contact panel and the closing CTA. */}
      <div className="svca-card has-demo">
        {/* The oversized pillar glyph that used to bleed off this corner is gone:
            over the fluting it read as a second pattern rather than as texture. */}
        {/* Below 768px the list is a chip strip and every .svca-body is
            hidden, so the card carries the whole pillar: its index, its
            tagline and its link. `md:hidden` keeps all three out of the
            desktop render — DOM order is unchanged there. */}
        {/* The pillar's demo (2026-10-23). On desktop it IS the card; the
            panel below stays for phones, where it is the only place the
            pillar's tagline and link appear. */}
        <SolutionDemo
          key={`demo-${s.slug}`}
          slug={s.slug}
          loop={!running}
          onEnded={running ? next : undefined}
          onPlayable={setPlaying}
        />
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
