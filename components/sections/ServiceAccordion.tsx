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
 * Auto-advance is pausable, which WCAG 2.2.2 requires of anything that moves
 * on its own: it holds while the pointer is over the list or focus is inside
 * it, and stops for good the moment someone picks an item themselves. Under
 * prefers-reduced-motion it never starts.
 */
const ADVANCE_MS = 5200;

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
            <div className={`svca-item${open ? " is-open" : ""}`} key={item.slug}>
              <h3 className="svca-h">
                <button
                  type="button"
                  className="svca-head"
                  aria-expanded={open}
                  aria-controls={`svca-body-${item.slug}`}
                  onClick={() => pick(i)}
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
        <span className="svca-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">{STROKE_ICONS[s.slug]}</svg>
        </span>

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
