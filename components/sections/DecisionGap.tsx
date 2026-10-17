import { decisionGap as c } from "@/lib/content/gamcs";

/**
 * The decision gap: a left-aligned problem statement — a two-column head, four
 * numbered symptom cards, the question that turns the section, and three
 * sourced figures.
 *
 * A server component with no client bundle at all. Nothing here fades, waits
 * for a scroll position or reacts to a pointer — the section is complete on
 * first paint, which is why it carries no `reveal` class and no "use client".
 *
 * The 01-04 indices are NOT in this markup. They are a CSS counter, which is
 * what lets the desktop render them as a pill above each card and the phone
 * render them inline on the title's baseline, from the same four <li>s. Adding
 * them here would mean hiding one copy at every breakpoint.
 *
 * The four symptoms are a <ul> and the figures a <dl>, so the section reads in
 * order with no stylesheet at all.
 *
 * Every figure is attributed in visible text — publication, sample, then the
 * link. The sample is deliberately not hidden behind the link: a percentage
 * with no sample beside it reads as fact rather than as a survey finding, and
 * the closing note says the same thing once for all three.
 *
 * The source links open in a new tab and carry `noopener noreferrer`.
 */
export default function DecisionGap() {
  return (
    <section className="section dg" id="decision-gap" aria-labelledby="dg-heading">
      <div className="container dg-inner">
        <div className="dg-head">
          {/* One flowing sentence, not two blocks: the accent starts
              mid-line, so the colour change must not force a break. */}
          <h2 id="dg-heading" className="fin-h2 dg-h2">
            {c.headingLead} <span className="dg-accent">{c.headingAccent}</span>
          </h2>
          <p className="dg-sub">{c.lead}</p>
        </div>

        <ul className="dg-pains">
          {c.pains.map((p) => (
            <li className="dg-pain" key={p.title}>
              <h3 className="dg-pain-title">{p.title}</h3>
              <p className="dg-pain-body">{p.body}</p>
            </li>
          ))}
        </ul>

        {/* The turn. Its quote mark is a pseudo-element: it is punctuation
            around the sentence, not content, and a screen reader reading
            "quote" here would be announcing decoration. */}
        <div className="dg-turn">
          <p className="dg-turn-text">
            <strong className="dg-turn-lead">{c.turn.lead}</strong>{" "}
            <span className="dg-turn-q">{c.turn.question}</span>
          </p>
        </div>

        <dl className="dg-stats">
          {c.stats.map((s) => (
            <div className="dg-stat" key={s.value}>
              <dt className="dg-stat-value">{s.value}</dt>
              <dd className="dg-stat-label">{s.label}</dd>
              <dd className="dg-stat-source">
                {s.source} &middot; {s.sample} &middot;{" "}
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {c.sourceLabel}
                </a>
              </dd>
            </div>
          ))}
        </dl>

        <p className="dg-note">{c.statsNote}</p>
      </div>
    </section>
  );
}
