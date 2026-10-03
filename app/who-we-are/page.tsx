import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { primaryCta, site, team, whoWeAre } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";
import { foundersSchema } from "@/lib/schema";

const t = pages.whoWeAre;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/who-we-are",
  /* This page's own title already ends in the brand, so it opts out of the
     layout's "%s | GA Management Consultants" template rather than shipping
     the name twice in two different forms. */
  brandedTitle: true,
});

const c = whoWeAre;
const [gaurav, abhinav] = team.leadership;

/**
 * A fact the repo does not have yet, rendered so it cannot ship unnoticed.
 *
 * The strings live in `lib/content` as `[[TODO: what is needed]]`; this only
 * recognises the shape. In development it draws a dashed amber underline and
 * names the missing field in the title attribute. In production it renders the
 * string and nothing else — no wrapper, no class — so the outline can never
 * reach a visitor. `NODE_ENV` is inlined at build time, so the branch costs
 * nothing at runtime.
 *
 * Anything that is NOT a placeholder passes straight through, which is why
 * every value that might one day be answered can be wrapped unconditionally.
 */
const DEV = process.env.NODE_ENV !== "production";
const TODO = /^\[\[TODO:\s*(.+?)\s*\]\]$/;

function Todo({ children }: { children: string }) {
  const m = TODO.exec(children);
  if (!m || !DEV) return <>{children}</>;
  return (
    <span className="os-todo" title={`Unanswered: ${m[1]}`}>
      {children}
    </span>
  );
}

/**
 * Sets one phrase of a client sentence in the accent colour.
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

/* The wordmark, the same two paths as the roster's icon — an "n" with a short
   left stem, which is the one that does not read as "ih" at this size. */
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true">
      <path d="M5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z" />
    </svg>
  );
}

/* `whoWeAre.leadership.founders` is positional — [0] is team.leadership[0] —
   so the cards are zipped here rather than repeating either name. */
const LEADERS = c.leadership.founders.map((copy, i) => ({
  ...copy,
  person: team.leadership[i],
}));

/**
 * /who-we-are — the credibility page.
 *
 * Six sections answering one question: can a CFO trust these two people with
 * their finance function. That is why this is not the seven-chapter founders'
 * biography it replaces, and why the two figures that used to animate are
 * gone — a year that counts up reads as a claim being sold. The "100+
 * combined years" is absent on purpose; `whoWeAre`'s own comment says why.
 *
 * Every section sits in one `.container` with one left edge. Grounds run
 * white, white, soft grey, white, white, soft grey. The uppercase
 * letter-spaced treatment belongs to the eyebrows and to nothing else.
 *
 * Motion is the site-wide `.reveal` observer in MotionLayer — one
 * IntersectionObserver for the whole site, already carrying the
 * reduced-motion and no-JS branches — shortened to a 200ms fade-up by the
 * stylesheet. No GSAP, no ScrollTrigger and no CountUp on this route.
 */
export default function WhoWeArePage() {
  return (
    <div className="os">
      {/* Both founders as Person nodes: name, the client's own job title, the
          real personal LinkedIn profile and the firm, by reference to the
          Organization the layout already emits. Nothing else is established —
          see lib/schema.ts. */}
      <JsonLd data={foundersSchema()} />

      {/* ── 01 · hero ─────────────────────────────────────────────────
          The stock skyscraper and the `.page-head--art` band are gone. The
          page opens on the two people it is asking you to trust, beside the
          claim they are making. */}
      <section className="os-s">
        <div className="container os-hero">
          <div className="os-hero-copy reveal">
            <p className="section-kicker os-eyebrow">{c.hero.eyebrow}</p>
            <h1 className="fin-h2 os-h1">{c.hero.h1}</h1>
            <p className="os-body os-sub">{c.hero.subhead}</p>

            {/* Three facts, as text. Not counters: two of them are not numbers
                at all, and the one year on the page is a fact, not a score. */}
            <ul className="os-proof">
              {c.hero.proof.map((p) => (
                <li key={p}>
                  <Todo>{p}</Todo>
                </li>
              ))}
            </ul>

            <div className="os-hero-ctas">
              <CTA href={primaryCta.href} data-cta="who-hero" icon="diagonal">
                {primaryCta.label}
              </CTA>
              {/* A text link, not CTA's `tertiary` tier — that one is
                  `.fsvc-link`, a bordered pill, which would have put two
                  pills side by side and given the hero two primary actions. */}
              <span className="os-link os-link--inline">
                <Link href={c.seeHowWeHelp.href}>{c.seeHowWeHelp.label} →</Link>
              </span>
            </div>
          </div>

          <figure className="os-hero-fig reveal">
            <Image
              src={team.foundersPhoto}
              alt={fill(c.hero.photoAlt, {
                first: gaurav.name,
                second: abhinav.name,
                siteName: site.short,
              })}
              width={880}
              height={880}
              sizes="(max-width: 767px) 92vw, 420px"
              priority
            />
          </figure>
        </div>
      </section>

      {/* ── 02 · our story ────────────────────────────────────────────
          One paragraph and four steps, where there used to be three chapters,
          a logo explainer and a stats row. The naming point is a clause now
          rather than a band with a large mark in it. */}
      <section className="os-s">
        <div className="container">
          <div className="os-story reveal">
            <p className="section-kicker os-eyebrow">{c.story.eyebrow}</p>
            <h2 className="fin-h2 os-h2">{c.story.h2}</h2>
            <p className="os-body">{c.story.body}</p>
          </div>

          {/* A hairline with a dot per step. No cells and no boxes: the rule is
              one border on the list, the dots are pseudo-elements on the items,
              so the line always meets the dot it belongs to. */}
          <ol className="os-tl reveal">
            {c.story.timeline.map((s) => (
              <li key={s.label}>
                <p className="os-tl-year">
                  <Todo>{s.year}</Todo>
                </p>
                <h3 className="os-tl-h">{s.label}</h3>
                <p className="os-tl-p">{s.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 03 · what we believe ──────────────────────────────────────
          The statement is the client's own sentence, unchanged. Below it the
          four words it combines, each given one line of meaning — hairlines
          between them, no cards: a card around a title and a sentence is a
          box drawn for its own sake. */}
      <section className="os-s os-s--soft">
        <div className="container">
          <div className="os-stmt-wrap reveal">
            <h2 className="fin-h2 os-stmt">
              {accent(c.believe.statement, c.believe.emphasis)}
            </h2>
          </div>

          <ul className="os-grid reveal" style={{ "--os-cols": 4 } as CSSProperties}>
            {c.believe.pillars.map((p) => (
              <li key={p.title}>
                <h3 className="os-grid-h">{p.title}</h3>
                <p className="os-grid-p">{p.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 04 · how we work ──────────────────────────────────────────── */}
      <section className="os-s">
        <div className="container">
          <div className="reveal">
            <p className="section-kicker os-eyebrow">{c.howWeWork.eyebrow}</p>
            <h2 className="fin-h2 os-h2">{c.howWeWork.h2}</h2>
          </div>

          <ul className="os-grid reveal" style={{ "--os-cols": 3 } as CSSProperties}>
            {c.howWeWork.columns.map((col) => (
              <li key={col.title}>
                <h3 className="os-grid-h">{col.title}</h3>
                <p className="os-grid-p">{col.line}</p>
              </li>
            ))}
          </ul>

          {/* The shift, on one line. It used to be two 150px-tall cards with a
              label and a sentence each; the contrast is in the words. */}
          <p className="os-compare reveal">
            <span className="os-compare-from">{c.howWeWork.shift.from}</span>
            <span className="os-compare-arrow" aria-hidden="true">
              →
            </span>
            <span className="os-compare-to">{c.howWeWork.shift.to}</span>
          </p>

          <p className="os-link reveal">
            <Link href={c.howWeWork.maturityLink.href}>
              {c.howWeWork.maturityLink.label} →
            </Link>
          </p>
        </div>
      </section>

      {/* ── 05 · leadership ───────────────────────────────────────────
          Two cards, and the portraits are a 200px column inside them rather
          than half the container each. The advisers are a row of faces, names
          and their own job titles — nothing in `lib/content` carries a
          one-line description for any of the eight, so none is written. */}
      <section className="os-s">
        <div className="container">
          <div className="reveal">
            <p className="section-kicker os-eyebrow">{c.leadership.eyebrow}</p>
            <h2 className="fin-h2 os-h2">{c.leadership.h2}</h2>
          </div>

          <ul className="os-ld reveal">
            {LEADERS.map(({ person, role, bio, previously, chips }) => (
              <li className="os-ld-card" key={person.name}>
                <figure className="os-ld-shot">
                  <Image
                    src={person.photo}
                    alt={fill(c.leadership.portraitAlt, {
                      name: person.name,
                      short: site.short,
                    })}
                    width={800}
                    height={1040}
                    sizes="(max-width: 767px) 180px, 170px"
                  />
                </figure>

                <div className="os-ld-body">
                  <h3 className="os-ld-name">{person.name}</h3>
                  <p className="os-ld-role">{role}</p>
                  <p className="os-ld-bio">{bio}</p>
                  <p className="os-ld-prev">
                    <b>{c.leadership.previouslyLabel}</b> {previously}
                  </p>
                  <ul className="os-ld-chips">
                    {chips.map((chip) => (
                      <li key={chip}>{chip}</li>
                    ))}
                  </ul>
                  <a
                    className="os-ld-li"
                    href={person.linkedinUrl}
                    target="_blank"
                    rel="noopener"
                    aria-label={fill(c.leadership.linkedinLabel, { name: person.name })}
                  >
                    <LinkedInIcon />
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="os-adv-h reveal">{c.leadership.advisersHeading}</h3>
          <ul className="os-adv reveal">
            {team.advisory.map((a) => (
              <li key={a.name}>
                <Image
                  src={a.photo}
                  alt={fill(c.leadership.adviserAlt, { name: a.name, title: a.title })}
                  width={104}
                  height={104}
                  sizes="52px"
                />
                <div>
                  <p className="os-adv-n">{a.name}</p>
                  {/* Their real title. There is no one-line description field
                      for anyone on the roster, and a sentence about an adviser
                      that nobody wrote is a sentence invented. */}
                  <p className="os-adv-t">{a.title}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="os-link reveal">
            <Link href="/team">{c.leadership.fullTeam} →</Link>
          </p>
        </div>
      </section>

      {/* ── 06 · closing ──────────────────────────────────────────────── */}
      <section className="os-s os-s--soft">
        <div className="container">
          <div className="os-close reveal">
            <h2 className="fin-h2 os-h2">{c.closing.h2}</h2>
            <p className="os-body">{c.closing.body}</p>
            <div className="os-ctas">
              <CTA href={primaryCta.href} data-cta="firm-story" icon="diagonal">
                {primaryCta.label}
              </CTA>
              <CTA href={c.seeHowWeHelp.href} tier="secondary" icon="arrow">
                {c.seeHowWeHelp.label}
              </CTA>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
