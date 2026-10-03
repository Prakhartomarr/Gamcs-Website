import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CTA from "@/components/CTA";
import CountUp from "@/components/motion/CountUp";
import PageHeadArt from "@/components/PageHeadArt";
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
 * Below the head everything is light — white and grey alternating, the way
 * every other inner page runs. An earlier version put chapters 03, 05 and 07
 * on dark and brand blue and opened on a full-viewport hero with a chapter
 * rail; it was a better story and a worse page, because it did not look like
 * the site it belongs to.
 *
 * Motion: reveals ride the site-wide `.reveal` observer in MotionLayer and the
 * two figures use CountUp — the same two mechanisms every other page uses.
 * Nothing here is scroll-linked: no parallax, no pins, no ScrollTrigger.
 */
export default function WhoWeArePage() {
  return (
    <div className="os">
      {/* ── 00 · the page head ──────────────────────────────────────
          The same band every other inner page opens with — .page-head
          .page-head--art, 60vh, the photograph running behind the header,
          copy bottom-aligned. This page used to open on a full-viewport
          hero with a chapter rail down the side; it read as a different
          site. The three lines survive as the h1. */}
      <section id="ch-00" className="page-head page-head--art">
        <div className="container">
          <h1 className="os-head-h">
            {ourStory.heroLines.map((line, i) => (
              <span className="os-head-line" key={line}>
                {line}
                {/* The lines are block spans; without this the accessible name
                    runs them together as "…vision.Driven by…". */}
                {i < ourStory.heroLines.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
        </div>
        <PageHeadArt src="/page-art/who-we-are.webp" />
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
      <section id="ch-03" className="os-ch os-ch--soft">
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
                  stroke="var(--blue)"
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
      <section id="ch-05" className="os-ch os-ch--paper">
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
      <section id="ch-07" className="os-ch os-ch--soft os-close">
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

    </div>
  );
}
