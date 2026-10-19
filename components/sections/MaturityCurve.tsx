"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import MaturityCurveMotion from "@/components/motion/MaturityCurveMotion";
import MaturityRail from "@/components/motion/MaturityRail";
import { maturityCurve } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";

/**
 * The finance maturity curve: a row of five stage cards that are the tabs, and
 * the chosen stage's panel beneath them.
 *
 * ALL COPY LIVES IN `maturityCurve` (lib/content/gamcs.ts), not here — this
 * file is markup and interaction only.
 *
 * Unlike the version it replaces, this one carries NO Tailwind utilities: every
 * class is a semantic `.mc-*` hook styled in globals.css, like the rest of the
 * sections in this codebase. The class names are a contract with that
 * stylesheet, so renaming one here silently unstyles a block.
 *
 * The cards show the SHORT question (`cardQuestion`) and the panel shows the
 * full one (`question`). They are two different strings on purpose: the card
 * has one line of room, the panel has a sentence's worth.
 *
 * Several fields the old design rendered — `tags`, `metrics`, the `visual`
 * figures, `short`, `axis`, `hint`, `labels`, `nextHeading` — are deliberately
 * left unrendered rather than deleted; the client asked that the retired copy
 * stay in the content module, and ./MaturityVisuals.tsx stays on disk with it.
 *
 * Stage 04 opens selected: it is where the curve is going, and the stage most
 * visitors are trying to picture.
 */

/**
 * One line icon per stage, in the panel's pale square. None was specified
 * except stage 04's line chart, so the other four were chosen to say the
 * stage's verb rather than its subject — all 24px, 1.5px stroke, same
 * construction, so the five read as one set as the visitor clicks across them:
 *
 *   01 Stabilise  two stacked planes — a base laid under the next one
 *   02 Report     a page of ruled lines — the monthly pack
 *   03 Automate   a refresh arc — the report that rebuilds itself
 *   04 Explain    a line chart, from the mockup
 *   05 Decide     a target — the decision that has an intended outcome
 *
 * Fragments, not whole <svg>s, so the shared attributes are declared once at
 * the single call site.
 */
const ICONS = [
  <>
    <path d="M12 3 21 8l-9 5-9-5 9-5Z" />
    <path d="m3 14 9 5 9-5" />
  </>,
  <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </>,
  <>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.49-6.01" />
    <path d="M20.5 4v5h-5" />
  </>,
  <>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="m7 15 4-5 3 3 4-6" />
  </>,
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </>,
];

export default function MaturityCurve() {
  const { stages } = maturityCurve;
  /* Stage 04 — Performance Insight — is where the curve is going. */
  const [active, setActive] = useState(3);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* Where the row scrolls sideways rather than fitting five cards — phones —
     the chosen card has to be brought into view itself; a click on a
     half-visible card would otherwise select a card the visitor cannot see. */
  const row = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const box = row.current;
    const tab = tabRefs.current[active];
    if (!box || !tab || box.scrollWidth <= box.clientWidth) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({
      left: tab.offsetLeft - (box.clientWidth - tab.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [active]);

  /* The panel's cross-fade on a pick. It lives HERE and not in
     MaturityCurveMotion because React already knows the moment the selection
     changes: a key-change effect is that moment exactly, with no observer
     watching the DOM for state that is a useState two lines up, and no prop
     plumbed into a component whose whole job is the entrance.

     It animates the panel's two children rather than the panel, so it cannot
     collide with the entrance's opacity tween on `.mc-panel` if a visitor
     picks a stage while that is still running.

     Not on first mount — that frame belongs to the entrance. */
  const panel = useRef<HTMLDivElement>(null);
  const picked = useRef(false);
  useEffect(() => {
    const el = panel.current;
    if (!picked.current) {
      picked.current = true;
      return;
    }
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parts = Array.from(el.children);
    /* 200ms is --dur-panel rounded down: the panel is answering a click, so
       it has to be finished before the visitor looks for the answer. */
    const tween = gsap.fromTo(
      parts,
      { opacity: 0, y: 6 },
      {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
        stagger: 0.05,
        clearProps: "opacity,transform",
      }
    );
    return () => {
      tween.kill();
      gsap.set(parts, { clearProps: "opacity,transform" });
    };
  }, [active]);

  /* The WAI-ARIA tabs pattern, automatic activation: an arrow key both moves
     focus and swaps the panel, and only the selected tab is in the tab order,
     so the row is one stop rather than five. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = stages.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(active + 1, last);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(active - 1, 0);
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const stage = stages[active];
  /* `stages` is `as const`, so each stage's `blocks` is its own readonly tuple
     of literal types; widening here keeps .map() off a five-way union. */
  const blocks: readonly { label: string; body: string }[] = stage.blocks;

  return (
    <section
      className="section mc"
      id="maturity-curve"
      aria-labelledby="mc-heading"
      /* The entrance gate, server-rendered so the section never paints
         visible and then hides. MaturityCurveMotion releases it; the
         stylesheet heals it if that never happens. Same mechanism as
         #decision-gap and .hero. */
      data-anim="pending"
    >
      <MaturityCurveMotion />
      <div className="container mc-inner">
        <div className="mc-head">
          {/* One sentence, in one colour: the heading is still stored in two
              pieces because the design it was written for coloured the second
              one, and the retired copy stays as it is. */}
          <h2 className="mc-h2" id="mc-heading">
            {maturityCurve.heading} {maturityCurve.headingAccent}
          </h2>
          <p className="mc-lead">{maturityCurve.lead}</p>
        </div>

        {/* One board holds the curve, the five stages and the panel, so the
            three read as one instrument rather than three stacked cards. The
            CTA band stays outside it — it is what the section says ABOUT the
            curve, not part of it. */}
        <div className="mc-board">
        {/* The curve fragment over the row, now drawn rather than bordered.
            The wrapper stays: `.mc-rail` is the flow box — its width, its
            54px of height, its auto left margin and its display:none on
            phones — and the svg inside only fills it. */}
        <div className="mc-rail" aria-hidden="true">
          <MaturityRail count={stages.length} active={active} />
        </div>

        {/* A list of five, so the row still reads as five stages with no
            stylesheet; the <li>s are presentational only because a tablist may
            own nothing but its tabs. */}
        <ul className="mc-stages" ref={row} role="tablist" aria-label={maturityCurve.eyebrow} onKeyDown={onKeyDown}>
          {stages.map((s, i) => (
            <li className="mc-stage" key={s.n} role="presentation">
              <button
                className="mc-stage-btn"
                type="button"
                role="tab"
                id={`mc-tab-${s.n}`}
                aria-selected={i === active}
                aria-controls="mc-panel"
                tabIndex={i === active ? 0 : -1}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                onClick={() => setActive(i)}
                /* MotionLayer's page-wide hover lift. Safe on a tab here
                   only because selection is drawn with border, ground and
                   shadow and no transform at all, so the lift has the
                   matrix to itself — and the entrance moves the <li>, not
                   this button, for the same reason. */
                data-lift
              >
                <span className="mc-stage-n">{s.n}</span>
                <span className="mc-stage-name">{s.name}</span>
                <span className="mc-stage-q">{s.cardQuestion}</span>
                <span className="mc-stage-tag">{s.tag}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* One panel, re-filled on each pick, rather than five with four
            hidden: the stages share a shape, and only one of them is ever a
            tab's target. */}
        <div
          className="mc-panel"
          id="mc-panel"
          role="tabpanel"
          aria-labelledby={`mc-tab-${stage.n}`}
          ref={panel}
        >
          <div className="mc-panel-main">
            <div className="mc-panel-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[active]}
              </svg>
            </div>
            {/* "Stage 04 · Explain", from the stage's own number and tag —
                CSS uppercases it, so the content module keeps words a human
                can read. The middot is a separator, not copy. */}
            <p className="mc-panel-label">
              {fill(maturityCurve.stageLabel, { n: stage.n })} · {stage.tag}
            </p>
            <h3 className="mc-panel-name">{stage.name}</h3>
            <p className="mc-panel-q">{stage.question}</p>
            <p className="mc-panel-body">{stage.description}</p>
          </div>

          {/* Each block's label comes from the stage, not from here: stage 05
              ends the curve, so its last two blocks are labelled differently
              from the other four stages'. */}
          <div className="mc-panel-blocks">
            {blocks.map((b) => (
              <div className="mc-block" key={b.label}>
                <p className="mc-block-label">{b.label}</p>
                <p className="mc-block-body">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
        </div>

        <div className="mc-cta">
          <div className="mc-cta-copy">
            <h3 className="mc-cta-h">{maturityCurve.cta.heading}</h3>
            <p className="mc-cta-body">{maturityCurve.cta.body}</p>
          </div>
          <Link className="mc-cta-btn" href={maturityCurve.cta.href} data-cta="maturity">
            {maturityCurve.cta.label}
          </Link>
        </div>

      </div>
    </section>
  );
}
