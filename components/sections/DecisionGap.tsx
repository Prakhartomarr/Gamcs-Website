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
 * `data-lift` on each FIGURE opts it into the hover lift MotionLayer already
 * binds page-wide (one gsap.quickTo per node, no new observers here). GSAP
 * owns their transform, so hover CSS on the figures must stay to colour,
 * border and shadow.
 *
 * The symptom cards deliberately do NOT carry it any more. They sit in a 3D
 * deck whose fan, pointer tilt and hover travel DecisionGapMotion writes on
 * the same matrix, and two writers on one transform do not layer — they fight,
 * frame by frame. One owner, and it is the deck.
 *
 * Every figure is attributed in visible text — publication, then the link.
 * The SAMPLE SIZE used to sit between them, and the reasoning was that a
 * percentage with no sample beside it reads as fact rather than as a survey
 * finding. The client had it taken out on 2026-10-21. What that argument
 * was protecting is PARTLY still here: the publication is named in visible
 * text and the link goes to the page that states the figure, so a reader
 * can still check the number. What is gone is any on-page signal of how
 * many people were surveyed.
 *
 * WORTH KNOWING, because the two decisions compound: `statsNote` — the line
 * that said these are survey findings rather than a claim about every
 * organisation — was taken out on 2026-10-20, also at the client's word
 * (see the note below the list). With the sample sizes out as well, the
 * three percentages now publish with a publication name and a link and
 * nothing else. Restoring either is one element.
 *
 * `decisionGap.stats[].sample` is untouched in the content module, and the
 * copy manifest still tracks all three strings.
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
          {/* `leadParts` is `lead` split at four phrases so each can take the
              red mark; concatenated it IS `lead`, which is asserted in the
              content module's comment and is what the copy check reads. The
              spans carry no role — the colour is emphasis and the sentence
              reads in order without it. */}
          <p className="dg-sub">
            {c.leadParts.map((part, i) =>
              part.mark ? (
                <span className="dg-mark" key={i}>
                  {part.t}
                </span>
              ) : (
                <span key={i}>{part.t}</span>
              )
            )}
          </p>
        </div>

        {/* The stage. It is a plain wrapper below 768 (display:contents, so
            the phone rail below is laid out exactly as it was) and the
            perspective container from 768 up. The deck's fan, the pointer
            tilt and the hover travel are all written by GSAP, so with JS off
            this is four cards in a panel — never a collapsed stack. */}
        <div className="dg-stage">
          <ul className="dg-pains">
            {c.pains.map((p) => (
              <li className="dg-pain" key={p.title}>
                <h3 className="dg-pain-title">{p.title}</h3>
                <p className="dg-pain-body">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>

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
              {/* Source and link only. `s.sample` — "475 respondents",
                  "400+ finance leaders", "2,000 US finance leaders" — came
                  out at the client's request (2026-10-21). The citation is
                  intact: each figure still names the publication it came
                  from and links to the page that states it, which is what
                  keeps the number checkable. The sample sizes stay in the
                  content module. */}
              <dd className="dg-stat-source">
                {s.source} &middot;{" "}
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

        {/* `c.statsNote` is deliberately NOT rendered (client, 2026-10-20).
            It was added here earlier the same day and taken out again at the
            client's word, so the copy and `.dg-note`'s styling both stay
            where they are: restoring it is one element, not a rewrite. The
            trade it makes is on the record — three survey percentages now
            publish without the line that says they are survey findings and
            not a claim about every organisation. */}
      </div>

      <DecisionGapMotion />
    </section>
  );
}
