"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CTA from "@/components/CTA";
import { ARROW, STROKE_ICONS } from "@/components/ui/stroke-icons";
import { solutions, solutionsHub } from "@/lib/content/gamcs";

/**
 * The six pillars as an auto-advancing accordion beside a visual panel.
 *
 * Replaces the six-card grid. The reference this follows pairs each item with
 * a product screenshot; GAMCS has no product to screenshot, and inventing
 * dashboard metrics for a finance consultancy would be fabricating exactly the
 * kind of number this firm is hired to get right. So the panel carries the
 * pillar's real `atAGlance` capabilities instead — content that already exists
 * on each solution page.
 *
 * Pointing at a pillar opens it — no click needed. The click is kept all the
 * same: there is no hover on a phone, and the header is the keyboard control.
 *
 * Auto-advance is pausable, which WCAG 2.2.2 requires of anything that moves
 * on its own: it holds while the pointer is over the list or focus is inside
 * it, and stops for good the moment someone picks an item themselves — which
 * now includes the first hover. Under prefers-reduced-motion it never starts.
 */
const ADVANCE_MS = 5200;
/**
 * Intent, not arrival. Reaching the sixth pillar drags the pointer across the
 * five above it; opening on the bare pointerenter strobes the panel through
 * every one of them on the way past. 100ms is under the ~150ms it takes to
 * notice a change, so aiming at a pillar still feels instant.
 */
const HOVER_MS = 100;

export default function ServiceAccordion() {
  const previewFor = new Map<string, (typeof solutionsHub.previews)[number]>(
    solutionsHub.previews.map((p) => [p.slug, p])
  );

  const [active, setActive] = useState(0);
  /** Set once the visitor drives it themselves — auto-advance never resumes. */
  const [taken, setTaken] = useState(false);
  const [held, setHeld] = useState(false);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    setAuto(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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
  const link = previewFor.get(s.slug);

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
                <p>{previewFor.get(item.slug)?.blurb ?? item.intro}</p>
                <CTA
                  tier="tertiary"
                  href={`/solutions/${item.slug}`}
                  data-cta={`svca-${item.slug}`}
                  srSuffix={`about ${item.title}`}
                >
                  {previewFor.get(item.slug)?.linkLabel ?? "Learn more"}
                  {ARROW}
                </CTA>
                {/* Fills over one dwell. Keyed to the slug so it restarts on
                    each change rather than continuing a half-run animation. */}
                {running ? (
                  <span className="svca-prog" key={item.slug} aria-hidden="true">
                    <i style={{ animationDuration: `${ADVANCE_MS}ms` }} />
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="svca-card">
        {/* The oversized pillar glyph that used to bleed off this corner is gone:
            over the fluting it read as a second pattern rather than as texture. */}
        <div className="svca-panel" key={s.slug}>
          <span className="svca-kicker">At a glance</span>
          <p className="svca-panel-title">{s.title}</p>
          <ul className="svca-chips">
            {s.atAGlance.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* The panel swaps on a timer, so its change is announced once rather
          than the whole card being re-read. */}
      <p className="sr-only" aria-live="polite">
        {s.title} — {link?.blurb ?? s.intro}
      </p>
    </div>
  );
}
