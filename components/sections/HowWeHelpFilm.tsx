"use client";

import { useEffect, useRef } from "react";
import { howWeHelp } from "@/lib/content/gamcs";

/**
 * The homepage How We Help band: the heading, the sub, the explainer film and
 * the film's text alternative. Between the maturity curve and the pillars.
 *
 * ALONGSIDE /how-we-help, not instead of it (client, 2026-10-20). That route
 * keeps the four-phase stack and the six principles; this is the short version
 * a scrolling reader meets. It is deliberately NOT a nav target — the navbar's
 * "How we help" still goes to the route — so it carries no id and nothing
 * links to it by fragment.
 *
 * COPY: the same `howWeHelp.headingLead` / `headingAccent` / `sub` the route's
 * page head renders. Reused, not duplicated into new keys, so the two places
 * cannot drift.
 *
 * A client component for one reason: the in-view playback below. Everything
 * else here is static markup and still arrives in the server-rendered HTML,
 * including the whole text alternative — with JavaScript off the band is a
 * poster, working controls and the transcript, which is the resting state and
 * is complete on its own.
 */

/* Asset paths, as the rest of the sections spell theirs (see Achievements'
   /page-art/…): a src is a path, not copy, so it stays out of the content
   module. The poster is the frame at t=6s, NOT frame 0 — the film fades up
   from black and its first ~1.5s would be a black rectangle in the band. */
const SRC = "/video/gamcs-explainer.mp4";
const POSTER = "/video/gamcs-explainer-poster.webp";

export default function HowWeHelpFilm() {
  const video = useRef<HTMLVideoElement>(null);
  /* True once we have started the film ourselves, so a second pass over the
     band cannot start it again: it autoplays ONCE (client), it is not a loop. */
  const autoplayed = useRef(false);
  /* The time we paused the film at when it left the viewport, or null when the
     pause was not ours. A time rather than a flag: it is also the proof that
     nobody has touched the film since, so coming back into view cannot override
     a visitor who played or scrubbed it in the meantime. */
  const pausedAt = useRef<number | null>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          /* Gone from the viewport entirely: PAUSE. The observer deliberately
             stays connected for this. It used to disconnect on the first
             intersection, which made the film play once but also left a 1080p
             decode running and the whole 5.7MB streaming four screens behind a
             visitor who had merely scrolled past. Nothing else watches the
             element, so this is the only place the exit edge exists. */
          if (!el.paused && !el.ended) {
            el.pause();
            pausedAt.current = el.currentTime;
          }
          return;
        }
        /* On screen but under the start threshold: leave it alone. The two
           edges are deliberately different — it starts at 40% so the opening
           line is not missed, and it only stops once the frame is completely
           gone. One shared edge would both pause a film still half on screen
           and flip between play and pause on jitter around 40%. */
        if (entry.intersectionRatio < 0.4) return;

        /* Back in view. Resume our own pause, and only ours: if the time has
           moved off the one we stopped at, or the film is already running, the
           visitor has taken it over since and it is theirs. */
        if (pausedAt.current !== null) {
          const untouched = el.paused && el.currentTime === pausedAt.current;
          pausedAt.current = null;
          if (untouched) el.play().catch(() => {});
          return;
        }

        /* Reduced motion: no autoplay at all, not a quieter one. 47 seconds of
           moving type starting by itself is exactly what this preference asks
           us not to do, and the poster plus the controls are already the whole
           fallback, so this branch needs no markup of its own.

           Read HERE rather than once at mount: the band sits most of a
           homepage below the fold, so there is a long window in which a visitor
           can turn the preference on — or an auditor can emulate it on an
           already-loaded page — before the film is ever reached. A live read
           costs nothing and needs no change listener. */
        if (
          autoplayed.current ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          return;
        }
        /* Only a film still sitting untouched at its poster starts by itself.
           The control bar is on screen and clickable well before this 40%
           threshold, so the visitor may already have played it — or played and
           paused it — and taking that back is the one thing autoplay must
           never do. */
        if (!el.paused || el.currentTime > 0) return;
        autoplayed.current = true;
        /* play() returns a promise that REJECTS when the browser declines:
           a stricter autoplay policy, data-saver, iOS Low Power Mode. That is
           a refusal, not a fault — the poster and the controls are the
           fallback and there is nothing to repair — so it is swallowed here
           rather than left to surface as an unhandled rejection in the
           console. */
        el.play().catch(() => {});
      },
      /* Two edges, so the callback above can tell "gone" from "not up yet".
         0.4 is where it starts: the film is ~500px tall at desktop width, so a
         lower ratio starts it while it is still a sliver at the bottom edge
         and the visitor misses the opening line, and it is kept well under 1
         because the frame is taller than a short laptop viewport minus the
         floating header. 0 is where it stops. */
      { threshold: [0, 0.4] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="section hwv" aria-labelledby="hwv-heading">
      <div className="container">
        {/* The head is the services band's head markup exactly — .fin-center
            .reveal, .fin-h2 with the accent clause, .fin-lead — so this band
            joins the homepage's section rhythm instead of inventing one. */}
        <div className="fin-center reveal">
          <h2 className="fin-h2" id="hwv-heading">
            {howWeHelp.headingLead}{" "}
            <span className="accent">{howWeHelp.headingAccent}</span>
          </h2>
          <p className="fin-lead">{howWeHelp.sub}</p>
        </div>

        {/* The frame, not a band: see the .hwv notes in globals.css for why
            the dark film is inset on a plinth rather than given the full
            width of a dark section. */}
        <div className="hwv-frame">
          <video
            ref={video}
            className="hwv-video"
            src={SRC}
            poster={POSTER}
            width={1920}
            height={1080}
            /* Kept, per the client: a visitor can replay and scrub. Which is
               also what makes the no-autoplay paths — reduced motion, a
               browser that refuses — complete rather than broken. */
            controls
            /* `muted` is not a taste decision: every browser refuses to
               autoplay audible video, and the file has no audio track to
               mute. `playsInline` stops iOS taking the film fullscreen the
               moment it starts. */
            muted
            playsInline
            /* The film is 5.7MB and every homepage visitor would otherwise
               pay for it on a band most of them never scroll to. "none", not
               "metadata": measured over CDP, "metadata" kept reading ahead on
               localhost — 8.35s of a 47.2s film buffered, ~1MB, on a page
               where the band was never brought into view. "none" fetches the
               56KB poster and nothing else, and the frame still reserves its
               height because the ratio is in the markup and the stylesheet
               rather than in the file's metadata. play() starts the load
               itself, so autoplay and the controls both still work. */
            preload="none"
            /* A <video> has no text of its own, so without this it reaches
               the accessibility tree as an unnamed media element. No
               aria-describedby to the transcript below: a reference wins over
               hidden-ness, so a closed disclosure would still be read out in
               full as this element's description. It is the next thing in the
               document instead, and the name says to look for it. */
            aria-label={howWeHelp.video.label}
          />
        </div>

        {/* THE TEXT ALTERNATIVE (WCAG 2.1.1). Visible, in a closed
            disclosure, rather than visually hidden — three reasons:
            the film is silent and all-type, so sighted visitors who cannot
            play it, or will not sit through 47 seconds, want this too; it is
            findable by the browser's own find-in-page, which hidden text is
            not; and a page-visible alternative cannot rot unnoticed the way
            sr-only copy does. Closed by default because the band's brief is
            heading, sub, film — the transcript expanded would be the longest
            thing on the homepage.

            Native <details>, and the FAQ's own card classes: same keyboard
            behaviour, same focus ring, same +/x marker, no new CSS. */}
        <details className="faq-item hwv-alt">
          <summary>
            <span className="faq-q">{howWeHelp.video.altSummary}</span>
            <span className="faq-icon" aria-hidden="true" />
          </summary>
          <div className="faq-a">
            <p>{howWeHelp.video.altNote}</p>
            <ul>
              {howWeHelp.video.alt.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </section>
  );
}
