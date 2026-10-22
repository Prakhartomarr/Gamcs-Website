"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { howWeHelp } from "@/lib/content/gamcs";

/**
 * The homepage How We Help band: the heading, the sub and the explainer film.
 * Between the maturity curve and the pillars.
 *
 * ON BOTH (client, 2026-10-21). The homepage renders it whole — heading,
 * lead and film — as the short version a scrolling reader meets. /how-we-help
 * renders it with `heading={false}`, directly under its page head and above
 * the four-phase stack.
 *
 * `heading` exists because the head here is the SAME two strings as that
 * route's <h1> and sub: `howWeHelp.headingLead` / `headingAccent` / `sub`,
 * shared so the two places cannot drift. Rendered whole on that page they
 * would print twice within one screen, once white on the banner and once
 * dark beneath it. The homepage has no banner above this band, so there it
 * keeps them.
 *
 * It is deliberately NOT a nav target on the homepage — the navbar's "How we
 * help" goes to the route — so it carries no id and nothing links to it by
 * fragment.
 *
 * SIZING is unaffected: every one-screen rule for this band is scoped
 * `.home-tight .hwv`, and only the homepage wraps its sections in
 * `.home-tight`. On the route the band falls back to the base rules — a
 * 900px centred frame at 16:9 — which is what it should be there anyway.
 *
 * ──────────────────────────────────────────────────────────────────────
 * IT WAITS TO BE ASKED (client, 2026-10-22).
 *
 * This band used to start itself: an observer played the film when 60% of it
 * was on screen, muted, then tried to unmute and undo the pause the browser
 * imposed as the price of trying. All of that is gone. The film shows its
 * cover, a play button sits in the middle of it, and nothing happens until
 * that button is pressed — at which point it plays WITH SOUND, because the
 * press is a real user gesture and audible playback is legal from inside the
 * handler that receives it.
 *
 * WHAT WENT WITH IT, so none of it gets rebuilt by halves:
 *   - the 0.4/0.6 visibility thresholds and the play-on-enter branch
 *   - `setMuted`, `blocked`, `userMuted`, `weSetMuted` and the volumechange
 *     handler — the whole try-to-unmute-then-check-if-punished dance
 *   - the page-wide pointerup/keyup listener that retried the unmute after
 *     any gesture anywhere
 *   - the custom sound toggle; the player's own controls carry mute now
 *   - the preload-warming observer that flipped `preload` to "auto" a screen
 *     early. Nothing is fetched beyond the cover until the button is pressed,
 *     which is 13.4MB a visitor who never presses it no longer pays for.
 *
 * NO-JS STILL WORKS, and that is why `controls` is on in the server-rendered
 * markup and taken off after hydration rather than simply bound to `started`.
 * With scripts off there is no play button — it is ours, not the browser's —
 * so the native control bar has to be the way in, and the band stays a cover
 * plus a working player. With scripts on, the bar is removed on mount and
 * comes back when the film starts.
 *
 * The film's text alternative was removed at the client's instruction; see
 * the note where it used to render, and what that costs under WCAG 1.2.1.
 */

/* Asset paths, as the rest of the sections spell theirs (see Achievements'
   /page-art/…): a src is a path, not copy, so it stays out of the content
   module.

   The cover is the frame at t=76.0s, chosen by the client: stage 4 of the
   film, with all three decisions showing "Done" and the impact line reading
   "+2.4 pts margin". Lifted from the mp4 itself at its native 1920x1080
   rather than from a screen grab, so it is exactly 16:9 and has been through
   one encode instead of two.

   RE-CUT 2026-10-22: the film went from 100s to 117s and the same moment
   moved from t=73.0 to t=76.0, so the cover was lifted again rather than
   left pointing at whatever now sits at 73 — which is the middle of the
   stage BEFORE this one. Found by reading the frames, not by scaling the old
   timestamp: the cut did not stretch uniformly. */
const SRC = "/video/gamcs-explainer.mp4";
const POSTER = "/video/gamcs-explainer-cover.webp";

/** A head of the page's own, for a route whose <h1> already says the default
    one (client, 2026-10-22: /how-we-help gets a kicker, title and line). */
type FilmHead = { kicker: string; title: string; sub: string };

export default function HowWeHelpFilm({
  heading = true,
}: { heading?: boolean | FilmHead } = {}) {
  const video = useRef<HTMLVideoElement>(null);
  /* Has the visitor started it? Drives both the play button and the native
     control bar. */
  const [started, setStarted] = useState(false);
  /* False through the server render and the first client render, so the two
     agree; true from the first effect. See the no-JS note above. */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const start = useCallback(() => {
    const el = video.current;
    if (!el) return;
    /* Inside the click, which is the gesture that makes audible playback
       legal. Nothing here asks permission first or checks afterwards — the
       whole point of waiting for the press is that there is nothing to
       negotiate. */
    el.muted = false;
    el.play().then(
      () => setStarted(true),
      () => {
        /* Refused even with the gesture — a locked-down browser, or the file
           failed to load. Put the control bar back so there is still a way
           in, rather than leaving a cover with nothing on it. */
        setStarted(true);
      }
    );
  }, []);

  /* The button is unmounting as `started` goes true, and a focused element
     that disappears drops focus to <body>. Hand it to the player the button
     just revealed, which is now focusable because it has controls. Runs
     after the render that mounts them, which is why it is an effect on
     `started` rather than a rAF inside the click. */
  useEffect(() => {
    if (started) video.current?.focus();
  }, [started]);

  /* OUT OF SIGHT, PAUSED — and it stays paused. A film the visitor asked for
     is still a film talking from somewhere they can no longer see, and the
     control they would reach for has scrolled away with it. Coming back does
     not restart it: they asked once, and that was for then. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting && !el.paused) el.pause();
        }
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      className={
        heading === true ? "section hwv" : heading ? "section hwv hwv--route" : "section hwv hwv--bare"
      }
      /* Only when the heading is here to do the naming. Without it the
         section is a plain container rather than a landmark with a borrowed
         name — and it does not need one: the page's own <h1> is directly
         above it, and the <video> carries `howWeHelp.video.label`. */
      aria-labelledby={heading ? "hwv-heading" : undefined}
    >
      <div className="container">
        {/* The head is the services band's head markup exactly — .fin-center
            .reveal, .fin-h2 with the accent clause, .fin-lead — so this band
            joins the homepage's section rhythm instead of inventing one. */}
        {heading === true ? (
          <div className="fin-center reveal">
            <h2 className="fin-h2" id="hwv-heading">
              {howWeHelp.headingLead}{" "}
              <span className="accent">{howWeHelp.headingAccent}</span>
            </h2>
            <p className="fin-lead">{howWeHelp.sub}</p>
          </div>
        ) : heading ? (
          <div className="fin-center reveal">
            <span className="section-kicker">{heading.kicker}</span>
            <h2 className="fin-h2" id="hwv-heading">{heading.title}</h2>
            <p className="fin-lead">{heading.sub}</p>
          </div>
        ) : null}

        {/* The frame, not a band: see the .hwv notes in globals.css for why
            the dark film is inset on a plinth rather than given the full
            width of a dark section.

            .hwv-stage exists only from 1024 up, where the band is sized to
            one screen. It is the flexible row that takes whatever height the
            heading leaves, so the frame inside it has a DEFINITE height to
            turn into a width through aspect-ratio. Without it the frame is
            the flex item itself, and a flex item with an auto width and a
            ratio resolves its width first — it took max-width and grew the
            section 200px past the viewport. Below 1024 the wrapper is an
            ordinary div that changes nothing. */}
        <div className="hwv-stage">
          <div className="hwv-frame">
            <video
              ref={video}
              className="hwv-video"
              src={SRC}
              poster={POSTER}
              width={1920}
              height={1080}
              /* On in the server markup and until hydration, then only once
                 the film is running — see the no-JS note at the top. */
              controls={!hydrated || started}
              /* Stops iOS taking the film fullscreen the moment it starts. */
              playsInline
              /* The film is 13.4MB. "none", not "metadata": measured over
                 CDP, "metadata" kept reading ahead on localhost — 8.35s
                 buffered, ~1MB — on a page where the band was never brought
                 into view. The frame still reserves its height because the
                 ratio is in the markup and the stylesheet rather than in the
                 file's metadata, and play() starts the load itself. */
              preload="none"
              /* A <video> has no text of its own, so without this it reaches
                 the accessibility tree as an unnamed media element. It is the
                 ONLY text this element carries, the transcript having been
                 removed. */
              aria-label={howWeHelp.video.label}
            />

            {hydrated && !started ? (
              <button type="button" className="hwv-play" onClick={start}>
                {/* Drawn rather than a glyph: ▶ renders as a colour emoji on
                    some platforms and monochrome on others, and at this size
                    the difference is loud. */}
                {/* CENTRED ON ITS CENTROID, not its bounding box. A
                    triangle's visual balance point is its centroid, which
                    for this one sits a third of the way from the base — so a
                    triangle whose BOX is centred reads as pushed right.
                    These vertices put the centroid on 12,12 exactly:
                    x (8.5+8.5+19)/3 = 12, y (5.2+18.8+12)/3 = 12. No nudge
                    on the element, so it stays centred at any size. */}
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M8.5 5.2v13.6L19 12z" fill="currentColor" />
                </svg>
                {/* The button shows a triangle and no words, so this is its
                    whole accessible name rather than an addition to one. */}
                <span className="sr-only">{howWeHelp.video.play}</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* THE TEXT ALTERNATIVE IS GONE, at the client's explicit instruction
            (2026-10-20), and this comment is the record of what that costs.

            The delivered film carries an audio track — 162 kbps across all
            117 seconds, measured — so it is prerecorded SYNCHRONISED
            media, and WCAG 2.1 asks for captions (1.2.2) as well as the audio
            description or full text alternative 1.2.3 wants. It has neither,
            so this band does not meet 1.2.2 or 1.2.3 at Level A.

            The copy is deliberately LEFT IN PLACE in lib/content/gamcs.ts
            (`howWeHelp.video.alt`, `altSummary`, `altNote`) rather than
            deleted with the markup, so restoring it is one element. It is
            stale against the re-cut film and would need re-checking against
            the frames first. */}
      </div>
    </section>
  );
}
