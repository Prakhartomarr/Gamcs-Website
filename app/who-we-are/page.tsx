import type { Metadata } from "next";
import Image from "next/image";
import FluteShader from "@/components/ui/flute-shader";
import { PRINCIPLE_ICONS } from "@/components/ui/stroke-icons";
import Link from "next/link";
import CTA from "@/components/CTA";
import CountUp from "@/components/motion/CountUp";
import { ourStory, primaryCta, site, team } from "@/lib/content/gamcs";
import { fill } from "@/lib/content/fill";
import { sections } from "@/lib/content/ui";
import { pages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/seo";

const t = pages.whoWeAre;

/* How many of ourStory.heroLines the page head shows. */
const HERO_LINES = 2;

export const metadata: Metadata = pageMetadata({
  title: t.title,
  description: t.description,
  path: "/who-we-are",
});

const ch = ourStory.chapters;
const founders = team.leadership;

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
 * Our Story: the firm's founding, in the five sections the client sent on
 * 2026-10-19, plus a figures band under the hero and a closing band.
 *
 * Every sentence is client copy from `ourStory`. The page's visual language is
 * unchanged from the seven-chapter version this replaces: the same
 * `.page-head--art` head, the same alternating paper/soft chapter rhythm, the
 * same `.reveal` observer in MotionLayer, the same CountUp on figures. Nothing
 * here is scroll-linked — no parallax, no pins, no ScrollTrigger.
 *
 * Heading outline, which is the one thing a rebuild like this quietly breaks:
 *   h1  hero
 *   h2  GAMCS at a glance
 *   h2  01 ... h3 Our journey ... h4 per timeline entry
 *   h2  02 ... h3 per contrast column
 *   h2  03 ... h3 per item
 *   h2  04 ... h3 per founder
 *   h2  05 ... h3 per principle
 *   h2  What comes next
 */
export default function WhoWeArePage() {
  return (
    <div className="os">
      {/* ── the page head ───────────────────────────────────────────
          The same band every other inner page opens with. The three
          hero lines are the h1.

          STRIPPED TO HEADLINE + BODY (client, 2026-10-22). The "OUR STORY"
          eyebrow and the "Explore Our Journey" / "Meet the Founders" button
          pair were taken out. `ourStory.eyebrow` and `ourStory.heroCtas` are
          kept in gamcs.ts unrendered — three copy-manifest locators point at
          them (WHO-STORY-05/10/11) and source.mjs throws on a missing one.
          The #our-journey and #the-founders sections are still on the page;
          those buttons were the only links to them, so they are reached by
          scrolling now. */}
      <section className="page-head ph-story">
        <div className="container">
          {/* TWO LINES (client, 2026-10-22). The third sentence, "Focused on
              the future.", is no longer shown. heroLines still holds all
              three: manifest rows WHO-STORY-06/07/08 point at [0], [1] AND
              [2], and source.mjs throws on an index it cannot resolve — so
              the sentence is sliced off here rather than spliced out of the
              array. Raise HERO_LINES to 3 to bring it back.

              Both remaining sentences fit the h1's 532px measure on their
              own line (443px and 495px), so this needs no layout change. */}
          <h1 className="os-head-h">
            {ourStory.heroLines.slice(0, HERO_LINES).map((line, i, shown) => (
              <span className="os-head-line" key={line}>
                {line}
                {/* The lines are block spans; without this the accessible name
                    runs them together as "…vision.Driven by…". */}
                {i < shown.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p>{ourStory.heroBody}</p>
        </div>
      </section>

      {/* ── GAMCS at a glance ───────────────────────────────────────
          Six published figures in the site's own figure language —
          weight 100, -.035em, counted up by CountUp — the way the
          homepage achievements set theirs. `count` is per figure: the
          founding year is the one that must not tick up from zero. */}
      <section id="at-a-glance" className="os-ch os-ch--band os-ch--soft">
        <div className="container">
          <h2 className="os-h os-h--band reveal">{ourStory.glance.heading}</h2>
          <dl className="os-glance reveal">
            {ourStory.glance.items.map((g) => (
              <div key={g.label}>
                <dt className="os-glance-value">
                  {g.count ? <CountUp value={g.value} /> : g.value}
                </dt>
                <dd className="os-glance-label">{g.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 01 · where it started ───────────────────────────────── */}
      <section id="where-it-started" className="os-ch os-ch--paper">
        <div className="container">
          <div className="os-split">
            <div className="os-col reveal">
              <ChapterLabel n="01">{ch.start.label}</ChapterLabel>
              <h2 className="os-h">{ch.start.heading}</h2>
              {ch.start.body.map((p) => (
                <p className="os-body" key={p.slice(0, 40)}>
                  {p}
                </p>
              ))}
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

          {/* The hero's primary CTA lands here. tabIndex -1 so the browser
              moves FOCUS to it on the fragment jump, not just the viewport —
              without it a keyboard user is scrolled down and still at the
              top of the tab order. */}
          <div id="our-journey" tabIndex={-1} className="os-journey os-jump reveal">
            <h3 className="os-sub-h os-jump-h">{ch.start.journey.heading}</h3>
            <ol className="os-tl">
              {ch.start.journey.entries.map((e) => (
                <li key={e.label}>
                  <span className="os-tl-dot" aria-hidden="true" />
                  {/* The year is INSIDE the heading, not a sibling of it. A
                      reader moving by heading (NVDA H, the VoiceOver rotor)
                      lands on the h4 and hears only its own name, so a year
                      kept outside it leaves the rotor reading "College,
                      Chartered Accountancy, Corporate experience" — a
                      timeline with its dates stripped out. `.os-tl-year`
                      stays display:block, so the two lines look unchanged. */}
                  <h4 className="os-tl-h">
                    <span className="os-tl-year">{e.year}</span>
                    {e.label}
                  </h4>
                  <p className="os-tl-b">{e.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 02 · what we saw ────────────────────────────────────── */}
      <section id="what-we-saw" className="os-ch os-ch--soft">
        <div className="container">
          <div className="reveal">
            <ChapterLabel n="02">{ch.saw.label}</ChapterLabel>
            <div className="os-head os-head--wide">
              <h2 className="os-h">{ch.saw.heading}</h2>
              <p className="os-body">{ch.saw.body}</p>
            </div>
          </div>

          {/* the shift, drawn as two states of one thing */}
          <div className="os-shift reveal">
            <div className="os-shift-card os-shift-from">
              <h3 className="os-shift-label">{ch.saw.from.label}</h3>
              <p className="os-shift-line">{ch.saw.from.question}</p>
              <p className="os-shift-b">{ch.saw.from.body}</p>
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
              <h3 className="os-shift-label">{ch.saw.to.label}</h3>
              <p className="os-shift-line">{ch.saw.to.question}</p>
              <p className="os-shift-b">{ch.saw.to.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 · what we set out to build ───────────────────────── */}
      <section id="what-we-built" className="os-ch os-ch--paper">
        <div className="container">
          <div className="reveal">
            <ChapterLabel n="03">{ch.build.label}</ChapterLabel>
            <div className="os-head os-head--wide">
              <h2 className="os-h">{ch.build.heading}</h2>
              <p className="os-body">{ch.build.body}</p>
            </div>
          </div>

          <ol className="os-built reveal">
            {ch.build.items.map((it, i) => (
              <li key={it.heading}>
                <p className="os-built-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="os-built-h">{it.heading}</h3>
                <p className="os-built-b">{it.body}</p>
              </li>
            ))}
          </ol>

          {/* THE "NAME GA" LINE IS GONE (client, 2026-10-22). It was the last
              sentence of a chapter that had already been reduced to one line;
              the chapter now ends on its three cards.

              `ourStory.chapters.build.note` is DELIBERATELY still in the
              content module, and scripts/copy/manifest.json has a row that
              reads it, so removing the key would break the copy audit rather
              than tidy anything. Putting the sentence back is this element,
              nothing else. */}
        </div>
      </section>

      {/* ── 04 · the founders ───────────────────────────────────── */}
      <section id="the-founders" tabIndex={-1} className="os-ch os-ch--soft os-jump os-ch--rail">
        <div className="container">
          <div className="reveal">
            <ChapterLabel n="04">{ch.founders.label}</ChapterLabel>
            <div className="os-head os-head--wide">
              <h2 className="os-h os-jump-h">{ch.founders.heading}</h2>
              <p className="os-body">{ch.founders.body}</p>
            </div>
          </div>

          {/* Name, photo and alt text all come off `team.leadership` — this
              page restates none of them. The bio is looked up by the name
              that was just rendered, and `bios` is keyed by exactly those
              two names, so the lookup stops compiling the day the roster
              renames a founder. */}
          <div className="os-founders reveal">
            {founders.map((p) => (
              <article className="os-founder" key={p.name}>
                <div className="os-founder-shot">
                  {/* Decorative. The roster's alt ("Portrait of {name},
                      {title}") says the name and a second wording of the role
                      that the h3 and the title line directly below already
                      say — about twenty words per card that carry nothing new.
                      /team keeps that alt because there the title it names is
                      the title the card shows. */}
                  <Image
                    src={p.photo}
                    alt=""
                    width={880}
                    height={1100}
                    /* A FLAT 340px, AND DELIBERATELY NO `vw`. The card's
                       track is capped at 370, so the shot is exactly 340 from
                       viewport 406 up and 254-339 below it — one number covers
                       the lot, over-asking by at most a third on a 320 phone.

                       The `vw` matters more than the accuracy. next/image
                       builds the srcset from `deviceSizes` plus `imageSizes`,
                       but the moment `sizes` contains ANY vw it drops every
                       candidate below `deviceSizes[0] * smallestRatio`. With
                       `85vw` that floor is 640*0.85 = 544, so 384w was never
                       generated and a 1x screen had to take 640w for a 324px
                       box: measured 1.98x at 390, 1.88x at 639, 1.94x at 1023.
                       With no vw the full ladder is offered and 1x takes 384w
                       — 5,332 bytes against 10,072, twice per page. */
                    sizes="340px"
                  />
                </div>
                {/* Top right of the card, over the portrait's own corner.
                    Rendered only where there is a real profile to point at:
                    `linkedinUrl` is a personal URL and only the two founders
                    publish one. An earlier version of /team linked a
                    per-person icon at the COMPANY page for everyone, which is
                    why the field is a URL rather than a boolean — so the
                    guard is the point, not ceremony. */}
                {p.linkedinUrl ? (
                  <a
                    className="os-founder-li"
                    href={p.linkedinUrl}
                    target="_blank"
                    rel="noopener"
                    aria-label={fill(sections.linkedinOf, { name: p.name })}
                  >
                    {/* The wordmark path the roster and the footer tile both
                        use. Not the four-shape approximation that preceded
                        it: that gave the "n" a full-height left stem and read
                        as "ih" at small sizes. */}
                    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
                      <path d="M5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
                      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28z" />
                    </svg>
                  </a>
                ) : null}
                <h3 className="os-founder-name">{p.name}</h3>
                <p className="os-founder-title">{ch.founders.role}</p>
                <p className="os-founder-bio">{ch.founders.bios[p.name]}</p>
              </article>
            ))}
          </div>

          <p className="os-founders-link reveal">
            {/* aria-hidden on the glyph, the way components/CTA.tsx wraps
                every other arrow on this page — otherwise this one link's
                accessible name is read as "Meet the Full Team right arrow". */}
            <Link href="/team">
              {ch.founders.cta} <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      {/* ── 05 · where we're going ──────────────────────────────── */}
      {/* REBUILT to the client's reference (2026-10-21): the four principles
          as a 2x2 of white cards on the left, the chapter's label, heading
          and body in a narrower column on the right. It was a stacked
          heading-then-four-across-row.

          No button in the right-hand column. The reference carries one, but
          every label it could take is already the CTA card at the foot of
          this page — a second copy two sections apart is one destination
          offered twice, and inventing a third label is copy nobody wrote. */}
      <section id="where-were-going" className="os-ch os-ch--paper">
        <div className="container">
          <div className="os-future">
            <ul className="os-principles reveal">
              {ch.future.principles.map((p) => (
                <li className="os-principle" key={p.heading}>
                  {/* Same 24x24 / 1.7-stroke idiom as the solution pillars
                      and the six "how we help" points; see PRINCIPLE_ICONS
                      for why these are new geometry rather than reused
                      glyphs. Decorative — the heading beside it says what
                      the card is. */}
                  <span className="os-principle-icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {PRINCIPLE_ICONS[p.heading]}
                    </svg>
                  </span>
                  <h3>{p.heading}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>

            <div className="os-future-copy reveal">
              <ChapterLabel n="05">{ch.future.label}</ChapterLabel>
              <h2 className="os-h">{ch.future.heading}</h2>
              {ch.future.body.map((p) => (
                <p className="os-body os-lead" key={p.slice(0, 40)}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── what comes next ─────────────────────────────────────── */}
      {/* THE SITE'S STANDARD CTA CARD (client, 2026-10-21), the same
          `.case-cta` + <FluteShader/> that closes /team, /careers,
          /case-study and every service page. This page had its own: a pale
          band with a heading, a lead and two buttons, which was the one
          closing treatment on the site that did not match the others.

          It is dark, and the client asked for no dark theme in the two
          sections above — the CTA was exempted explicitly, because matching
          the rest of the site is the point of using the standard card.

          `ourStory.closing.body` stops rendering: the card is a heading and
          one control. The string stays in the content module. */}
      <section className="section os-close-cta">
        <div className="container">
          <div className="case-cta reveal">
            <FluteShader />
            <h2>{ourStory.closing.heading}</h2>
            {/* The client's own secondary here was "Schedule a Call" word for
                word, so the card's single control IS primaryCta. data-cta is
                the series this page already reported under. */}
            <CTA href={primaryCta.href} tier="secondary" data-cta="firm-story" icon="diagonal">
              {primaryCta.label}
            </CTA>
          </div>
        </div>
      </section>
    </div>
  );
}
