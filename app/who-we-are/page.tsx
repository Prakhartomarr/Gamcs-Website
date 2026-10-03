import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CTA from "@/components/CTA";
import CountUp from "@/components/motion/CountUp";
import StoryMotion from "@/components/motion/StoryMotion";
import { ourStory, primaryCta, site, team } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { roster, sections } from "@/lib/content/ui";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.whoWeAre;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/who-we-are",
});

const ch = ourStory.chapters;
const founders = team.leadership;

/**
 * The rail, and the order of the grounds, in one list. The eight anchors and
 * the eight sections read from the same array, so a chapter cannot be in the
 * rail and missing from the page.
 */
const RAIL = [
  { id: "ch-00", label: ourStory.eyebrow },
  { id: "ch-01", label: ch.start.label },
  { id: "ch-02", label: ch.passion.label },
  { id: "ch-03", label: ch.saw.label },
  { id: "ch-04", label: ch.name.label },
  { id: "ch-05", label: ch.believe.label },
  { id: "ch-06", label: ch.founders.label },
  { id: "ch-07", label: ch.future.label },
];

/**
 * Sets one phrase of a client sentence in the italic serif accent.
 *
 * It splits, it never rewrites: the rendered text content is character-for-
 * character the string in `lib/content`. If that string is ever edited and the
 * phrase is no longer in it, the line renders whole rather than wrong.
 */
function accent(text: string, phrase: string) {
  const at = text.indexOf(phrase);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <em>{phrase}</em>
      {text.slice(at + phrase.length)}
    </>
  );
}

/** `01 — WHERE IT STARTED`. The numeral is scaffolding, the label is copy. */
function ChapterLabel({ n, children }: { n: string; children: string }) {
  return (
    <p className="os-label">
      <span aria-hidden="true">{n} — </span>
      {children}
    </p>
  );
}

/**
 * Our Story: the firm's founding, in seven chapters after the hero.
 *
 * This replaces the `.page-head` + `.firm-story` pair that used to be here —
 * chapter 00 is the head of the page, so there is no band above it. Every
 * sentence is client copy from `ourStory`, split at sentence boundaries only;
 * the headings are lifted out of the same paragraphs they sit above.
 *
 * Grounds alternate dark / light / grey / dark / light / blue / light / dark, so
 * no two neighbouring chapters share one and a boundary never needs a rule.
 *
 * Motion: reveals ride the site-wide `.reveal` observer in MotionLayer, the two
 * figures use CountUp, hovers are CSS. Only the hero parallax and the chapter
 * 03 before/after are scroll-linked, and both live in StoryMotion.
 */
export default function WhoWeArePage() {
  return (
    <div className="os">
      <nav className="os-rail" aria-label="Chapters">
        {RAIL.map((r) => (
          <a key={r.id} className="os-rail-dot" href={`#${r.id}`} aria-label={r.label}>
            <span aria-hidden="true" />
          </a>
        ))}
      </nav>

      {/* ── 00 · the hero ───────────────────────────────────────────── */}
      <section id="ch-00" className="os-hero">
        <div className="os-hero-art" aria-hidden="true">
          <Image src="/page-art/who-we-are.webp" alt="" fill sizes="100vw" priority />
        </div>
        <div className="container os-hero-inner">
          <p className="os-eyebrow">{ourStory.eyebrow}</p>
          <h1 className="os-hero-h">
            {ourStory.heroLines.map((line, i) => (
              <span className="os-hero-line" key={line}>
                {i === 1 ? accent(line, "financial insight") : line}
                {/* The lines are block spans; without this the accessible name
                    runs them together as "…vision.Driven by…". */}
                {i < ourStory.heroLines.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p className="os-hero-cue">{ourStory.scrollCue}</p>
        </div>
      </section>

      {/* ── 01 · where it started ───────────────────────────────────── */}
      <section id="ch-01" className="os-ch os-ch--paper">
        <div className="container">
          <div className="os-split">
            <div className="os-col reveal">
              <ChapterLabel n="01">{ch.start.label}</ChapterLabel>
              <h2 className="os-h">{ch.start.heading}</h2>
              <p className="os-body">{ch.start.body}</p>

              <dl className="os-stats">
                {ourStory.stats.map((s) => (
                  <div key={s.value}>
                    <dt className="os-stat-value">
                      <CountUp value={s.value} />
                    </dt>
                    <dd className="os-stat-label">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="os-figure reveal">
              <Image
                src={team.foundersPhoto}
                alt={fill(sections.foundersAlt, {
                  first: founders[0].name,
                  second: founders[1].name,
                  siteName: site.name,
                })}
                width={880}
                height={880}
                sizes="(max-width: 767px) 92vw, (max-width: 1279px) 50vw, 620px"
              />
            </figure>
          </div>

          {/* the four places the paragraph above names, in order */}
          <ol className="os-markers reveal">
            {ourStory.markers.map((m) => (
              <li key={m}>
                <span className="os-marker-dot" aria-hidden="true" />
                <h3 className="os-marker-h">{m}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 02 · a shared passion ───────────────────────────────────── */}
      <section id="ch-02" className="os-ch os-ch--soft">
        <div className="container">
          <div className="os-head reveal">
            <div>
              <ChapterLabel n="02">{ch.passion.label}</ChapterLabel>
              <h2 className="os-h">{ch.passion.heading}</h2>
            </div>
            <p className="os-body">{ch.passion.body}</p>
          </div>

          <div className="os-discs reveal">
            {ourStory.disciplines.map((d, i) => (
              <article className="os-disc" key={d}>
                <p className="os-disc-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="os-disc-h">{d}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 · what they saw ──────────────────────────────────────── */}
      <section id="ch-03" className="os-ch os-ch--dark">
        <div className="container">
          <div className="reveal">
            <ChapterLabel n="03">{ch.saw.label}</ChapterLabel>
            <div className="os-head os-head--wide">
              <h2 className="os-h">{ch.saw.heading}</h2>
              <p className="os-body">{ch.saw.body}</p>
            </div>
          </div>

          {/* the shift, drawn as two states of one thing */}
          <div className="os-shift reveal">
            <div className="os-shift-card os-shift-from">
              <p className="os-shift-label">{ourStory.shift.fromLabel}</p>
              <p className="os-shift-line">{ourStory.shift.fromLine}</p>
            </div>
            <div className="os-shift-arrow" aria-hidden="true">
              <svg width="40" height="18" viewBox="0 0 40 18" fill="none">
                <path
                  d="M0 9h36M29 1.5L37 9l-8 7.5"
                  stroke="var(--yellow)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="os-shift-card os-shift-to">
              <p className="os-shift-label">{ourStory.shift.toLabel}</p>
              <p className="os-shift-line">{ourStory.shift.toLine}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · the name ──────────────────────────────────────────── */}
      <section id="ch-04" className="os-ch os-ch--paper">
        <div className="container">
          <div className="os-split os-split--mid">
            <div className="os-col reveal">
              <ChapterLabel n="04">{ch.name.label}</ChapterLabel>
              <h2 className="os-h">{ch.name.heading}</h2>
              {ch.name.body.map((p) => (
                <p className="os-body" key={p.slice(0, 40)}>
                  {p}
                </p>
              ))}
            </div>

            <div className="os-mark reveal" aria-hidden="true">
              <p className="os-mark-names">
                <span>{founders[0].name.split(" ")[0]}</span>
                <i />
                <span>{founders[1].name.split(" ")[0]}</span>
              </p>
              <svg width="18" height="30" viewBox="0 0 18 30" fill="none">
                <path
                  d="M9 0v24M1.5 17.5L9 25l7.5-7.5"
                  stroke="#C2CACF"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Image src={site.logo} alt="" width={534} height={339} sizes="200px" />
              <p className="os-mark-caption">{site.legalName}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 · what we believe ───────────────────────────────────── */}
      <section id="ch-05" className="os-ch os-ch--blue">
        <div className="container os-narrow">
          <div className="reveal">
            <ChapterLabel n="05">{ch.believe.label}</ChapterLabel>
            {/* The chapter's heading, set at pull-quote scale — not a
                <blockquote>: it is the firm's own line, there is nothing to
                cite, and chapter 05 would otherwise be the one section with no
                heading in the outline. */}
            <h2 className="os-quote">
              {accent(ch.believe.heading, "uncovering the insights behind them")}
            </h2>
            <p className="os-body os-lead">{ch.believe.body}</p>
          </div>

          <ul className="os-pillars reveal">
            {ourStory.pillars.map((p) => (
              <li key={p}>
                <h3>{p}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 06 · the founders ──────────────────────────────────────── */}
      <section id="ch-06" className="os-ch os-ch--paper">
        <div className="container">
          <div className="reveal">
            <ChapterLabel n="06">{ch.founders.label}</ChapterLabel>
            <h2 className="os-h">{ch.founders.heading}</h2>
          </div>

          <div className="os-founders reveal">
            {founders.map((p) => (
              <article className="os-founder" key={p.name}>
                <div className="os-founder-shot">
                  <Image
                    src={p.photo}
                    alt={fill(roster.portraitAlt, { name: p.name, title: p.title })}
                    width={880}
                    height={1100}
                    sizes="(max-width: 767px) 92vw, 48vw"
                  />
                </div>
                <h3 className="os-founder-name">{p.name}</h3>
                <p className="os-founder-title">{p.title}</p>
              </article>
            ))}
          </div>

          <p className="os-founders-link reveal">
            <Link href="/team">{sections.fullTeam} →</Link>
          </p>
        </div>
      </section>

      {/* ── 07 · where we are going ────────────────────────────────── */}
      <section id="ch-07" className="os-ch os-ch--dark os-close">
        <div className="container">
          <div className="reveal">
            <ChapterLabel n="07">{ch.future.label}</ChapterLabel>
            <h2 className="os-h os-h--close">{ch.future.heading}</h2>
            <p className="os-body os-lead">{ch.future.body}</p>
            <div className="os-ctas">
              <CTA href={primaryCta.href} data-cta="firm-story" icon="diagonal">
                {primaryCta.label}
              </CTA>
              <CTA href="/solutions" tier="secondary" icon="arrow">
                {ourStory.secondaryCta}
              </CTA>
            </div>
          </div>
        </div>
      </section>

      <StoryMotion />
    </div>
  );
}
