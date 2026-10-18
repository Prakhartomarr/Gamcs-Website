import { Fragment } from "react";
import CountUp from "@/components/motion/CountUp";
import DecisionGapMotion from "@/components/motion/DecisionGapMotion";
import DecisionGapSignal from "@/components/motion/DecisionGapSignal";
import { decisionGap as c } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { sections } from "@/lib/content/ui";

/**
 * The decision gap: a left-aligned problem statement — a two-column head, four
 * numbered symptom cards, the question that turns the section, and three
 * sourced figures.
 *
 * Still a server component: no "use client" here. The plain, complete section
 * below is the RESTING STATE, and it is the whole contract — it is what ships
 * in the HTML, what a crawler reads, what renders with JavaScript off, and
 * what a reader with prefers-reduced-motion gets. The three client components
 * it mounts (CountUp, DecisionGapSignal, DecisionGapMotion) are additive, and
 * DecisionGapMotion is the only thing that may add `dg--motion` to the section
 * — every "hidden until animated" rule is scoped under that class, so when it
 * never arrives nothing is ever hidden.
 *
 * The 01-04 indices are NOT in this markup. They are a CSS counter, which is
 * what lets the desktop render them as a pill above each card and the phone
 * render them inline on the title's baseline, from the same four <li>s. Adding
 * them here would mean hiding one copy at every breakpoint.
 *
 * The four symptoms are a <ul> and the figures a <dl>, so the section reads in
 * order with no stylesheet at all.
 *
 * `data-lift` on each symptom and each figure opts them into the hover lift
 * MotionLayer already binds page-wide (one gsap.quickTo per node, no new
 * observers here). GSAP owns their transform, so hover CSS on these cards must
 * stay to colour, border and shadow.
 *
 * Every figure is attributed in visible text — publication, sample, then the
 * link. The sample is deliberately not hidden behind the link: a percentage
 * with no sample beside it reads as fact rather than as a survey finding, and
 * the closing note says the same thing once for all three.
 *
 * The figure card is clickable through to its source, which is CSS stretching
 * the ONE source link over the card — not a second wrapping anchor. A card
 * inside a <dl> cannot be an anchor, and nesting two interactive elements
 * would be a keyboard trap. So there is exactly one tab stop per figure, and
 * it is the link that was always there.
 *
 * Its visible word is "Source" on all three, so each gets an aria-label naming
 * its publication (sections.sourceLink): three identical link names fail WCAG
 * 2.4.4 and are useless in a screen reader's link list. The label starts with
 * the visible word, so it still satisfies Label in Name, and it says the tab
 * is new — which is why the arrow beside it is drawn by CSS, on
 * .dg-stat-link::after, and is not markup: it is an affordance that moves on
 * hover, and it must never reach the accessible name.
 *
 * The source links open in a new tab and carry `noopener noreferrer`.
 */

/* The heading is split per word so the choreography has something to stagger.
   One flat list — lead words, then accent words — because the gap between the
   two clauses is then just another gap between words: the sentence keeps
   flowing and the colour changes mid-line instead of starting a second block.
   The separating space is a text node BETWEEN the spans, never whitespace
   inside one: `.dg-w` goes inline-block under `.dg--motion` so it can be
   transformed, and a trailing space inside an inline-block is trimmed at the
   end of its line box — every word would run together. Left outside the boxes
   it stays ordinary collapsible whitespace, so the words also still wrap. */
const words = [
  ...c.headingLead.split(/\s+/).map((w) => ({ w, accent: false })),
  ...c.headingAccent.split(/\s+/).map((w) => ({ w, accent: true })),
];

export default function DecisionGap() {
  return (
    <section
      className="section dg"
      id="decision-gap"
      aria-labelledby="dg-heading"
      /* The entrance gate, server-rendered so the section never paints
         visible and then hides. DecisionGapMotion releases it; the
         stylesheet heals it if that never happens. */
      data-anim="pending"
    >
      <div className="container dg-inner">
        <div className="dg-head">
          <h2 id="dg-heading" className="fin-h2 dg-h2">
            {words.map(({ w, accent }, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className={accent ? "dg-w dg-w--accent" : "dg-w"}>{w}</span>
              </Fragment>
            ))}
          </h2>
          <p className="dg-sub">{c.lead}</p>
        </div>

        <ul className="dg-pains">
          {c.pains.map((p) => (
            <li className="dg-pain" key={p.title} data-lift>
              <h3 className="dg-pain-title">{p.title}</h3>
              <p className="dg-pain-body">{p.body}</p>
            </li>
          ))}
        </ul>

        {/* The turn. Its quote mark is a pseudo-element on the row: it is
            punctuation around the sentence, not content, and a screen reader
            reading "quote" here would be announcing decoration. The signal
            strip beside it is drawn, so it is hidden from the tree outright. */}
        <div className="dg-turn">
          <div className="dg-turn-row">
            <p className="dg-turn-text">
              <strong className="dg-turn-lead">{c.turn.lead}</strong>{" "}
              <span className="dg-turn-q">{c.turn.question}</span>
            </p>
          </div>
          <div className="dg-signal" aria-hidden="true">
            <DecisionGapSignal />
          </div>
        </div>

        <dl className="dg-stats">
          {c.stats.map((s) => (
            <div className="dg-stat" key={s.value} data-lift>
              <dt className="dg-stat-value">
                <CountUp value={s.value} />
              </dt>
              <dd className="dg-stat-label">{s.label}</dd>
              <dd className="dg-stat-source">
                {s.source} &middot; {s.sample} &middot;{" "}
                <a
                  className="dg-stat-link"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={fill(sections.sourceLink, {
                    label: c.sourceLabel,
                    publication: s.source,
                  })}
                >
                  {c.sourceLabel}
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <p className="dg-note">{c.statsNote}</p>
      </div>

      <DecisionGapMotion />
    </section>
  );
}
