"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
 * else here is static markup and still arrives in the server-rendered HTML —
 * with JavaScript off the band is a poster and working controls, which is the
 * resting state and is complete on its own.
 *
 * The film's text alternative was removed at the client's instruction; see
 * the note where it used to render, and what that costs under WCAG 1.2.1.
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

  /* ---- sound on while the band is on screen (client, 2026-10-21) ----
     Three pieces of state, and each exists because of a specific way this
     can go wrong.

     `soundOn` drives the toggle's label and icon. It mirrors el.muted
     rather than leading it, so the control still tells the truth when the
     visitor mutes from the native controls bar instead.

     `userMuted` is the visitor's own choice, and it OUTRANKS the scroll
     rule for the rest of the visit. Without it, muting the film by hand and
     scrolling away would un-mute it again on the way back, which reads as
     the page arguing with you.

     `weSetMuted` is how the volumechange handler tells our own writes from
     theirs: the event fires either way and carries no origin. */
  const [soundOn, setSoundOn] = useState(false);
  const userMuted = useRef(false);
  const weSetMuted = useRef(true);

  /* Chrome and Edge PAUSE a playing video if a script unmutes it before the
     page has had a real user gesture. So this never unmutes hopefully: it
     asks `navigator.userActivation` first, and where that is missing it
     unmutes and then checks whether the film was stopped as a punishment,
     putting it back if so. Either way the toggle stays reading "Turn on
     sound", which is the prompt and the remedy in one control — clicking it
     IS the gesture, and every later scroll works. */
  const setMuted = useCallback((next: boolean) => {
    const el = video.current;
    if (!el) return;
    if (!next && userMuted.current) return;
    if (!next) {
      const activated = navigator.userActivation?.hasBeenActive;
      if (activated === false) return;
      const wasPlaying = !el.paused;
      weSetMuted.current = false;
      el.muted = false;
      setSoundOn(true);
      if (wasPlaying) {
        /* A frame later: the pause, if it comes, is the browser's answer to
           the line above. */
        requestAnimationFrame(() => {
          if (!el.paused || el.ended) return;
          weSetMuted.current = true;
          el.muted = true;
          setSoundOn(false);
          el.play().catch(() => {});
        });
      }
      return;
    }
    weSetMuted.current = true;
    el.muted = true;
    setSoundOn(false);
  }, []);

  /* The toggle. It is also the gesture that unblocks everything above. */
  const toggleSound = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (el.muted) {
      userMuted.current = false;
      setMuted(false);
    } else {
      userMuted.current = true;
      setMuted(true);
    }
  }, [setMuted]);

  /* volumechange fires for our writes and the native controls alike. A mute
     we did not ask for is the visitor's, and it sticks. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const onVolume = () => {
      setSoundOn(!el.muted);
      if (el.muted && !weSetMuted.current) userMuted.current = true;
      if (!el.muted) userMuted.current = false;
    };
    el.addEventListener("volumechange", onVolume);
    return () => el.removeEventListener("volumechange", onVolume);
  }, []);

  /* START FETCHING ON APPROACH (client, 2026-10-21). The film is 13.4MB and
     `preload="none"`, so before this it began downloading only when play()
     was called — at the 0.4 edge, by which point the band is already on
     screen and the first seconds buffer while the visitor watches. That is
     the stutter.

     A second observer with 800px of rootMargin flips preload to "auto" about
     a screen early, so the fetch has a head start and play() meets a primed
     buffer. It disconnects on the first hit: this is a one-way switch, and
     the cost is still paid only by visitors heading for the band rather than
     by every homepage load, which is what `preload="none"` was protecting. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const warm = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (el.preload !== "auto") el.preload = "auto";
        warm.disconnect();
      },
      { rootMargin: "800px 0px" }
    );
    warm.observe(el);
    return () => warm.disconnect();
  }, []);

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
          /* Silence on the way out too, and unconditionally — the film may
             be paused by the line above, or already paused, or ended, and
             in every one of those the band is off screen and must not be
             the thing making noise. `userMuted` is not consulted: muting is
             never the choice being overridden. */
          setMuted(true);
          return;
        }
        /* On screen but under the start threshold: leave it alone. The two
           edges are deliberately different — it starts at 40% so the opening
           line is not missed, and it only stops once the frame is completely
           gone. One shared edge would both pause a film still half on screen
           and flip between play and pause on jitter around 40%. */
        /* The audio edge, at 0.6 — above the 0.4 the film starts at, so a
           band that is only half up is already playing but still silent.
           Below it, silence; the ratio is checked on every callback rather
           than latched, so scrolling back out part-way mutes again without
           needing the 0 edge. */
        if (entry.intersectionRatio >= 0.6) setMuted(false);
        else setMuted(true);

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
      { threshold: [0, 0.4, 0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [setMuted]);

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
            /* Kept, per the client: a visitor can replay and scrub. Which is
               also what makes the no-autoplay paths — reduced motion, a
               browser that refuses — complete rather than broken. */
            controls
            /* `muted` is not a taste decision: every browser refuses to
               autoplay audible video. It used to be moot — the delivered
               file had no audio track — but the 2026-10-20 cut carries one,
               measured at 165 kbps across all 100 seconds. So this now
               genuinely silences something, and the accessible name says so.
               `playsInline` stops iOS taking the film fullscreen the moment
               it starts. */
            muted
            playsInline
            /* The film is 13.4MB — it was 5.7MB before the 2026-10-20 cut
               doubled its length — and every homepage visitor would
               otherwise pay for it on a band most of them never scroll to.
               "none", not "metadata": measured over CDP, "metadata" kept
               reading ahead on localhost — 8.35s buffered, ~1MB, on a page
               where the band was never brought into view. At the new size
               that argument is twice as strong. "none" fetches the 58KB
               poster and nothing else, and the frame still reserves its
               height because the ratio is in the markup and the stylesheet
               rather than in the file's metadata. play() starts the load
               itself, so autoplay and the controls both still work. */
            preload="none"
            /* A <video> has no text of its own, so without this it reaches
               the accessibility tree as an unnamed media element. It is now
               the ONLY text this element carries, the transcript having been
               removed, so it is the whole of what a screen reader is told
               about 47 seconds of silent film. */
            aria-label={howWeHelp.video.label}
          />
          {/* The sound toggle, always visible — not behind hover, and not
              the native controls bar, which only appears on hover and is
              therefore no use to a touch or keyboard visitor looking for
              the off switch. WCAG 1.4.2 wants a mechanism to stop audio
              that starts on its own, and "on hover" is not one.

              ONE control doing two jobs: while the film is silent it reads
              "Turn on sound", which is also the prompt when the browser has
              refused to unmute without a gesture — and clicking it supplies
              that gesture. While it is playing sound it reads "Mute the
              film" and is the stop control.

              aria-live on the label: the name changes under the visitor's
              own click, so a screen reader should hear what it became. */}
          <button
            type="button"
            className="hwv-sound"
            onClick={toggleSound}
            aria-pressed={soundOn}
          >
            {/* Drawn, not an emoji: the speaker emoji renders as a colour
                glyph on some platforms and a monochrome one on others, and
                at this size the difference is loud. */}
            <svg
              className="hwv-sound-ico"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 6h2L8.5 3.5v9L5.5 10h-2z" />
              {soundOn ? (
                <>
                  <path d="M11 6.2a2.6 2.6 0 0 1 0 3.6" />
                  <path d="M12.8 4.4a5.2 5.2 0 0 1 0 7.2" />
                </>
              ) : (
                <path d="M11.2 6.2 14 9m0-2.8L11.2 9" />
              )}
            </svg>
            <span>{soundOn ? howWeHelp.video.soundOff : howWeHelp.video.soundOn}</span>
          </button>
        </div>
        </div>

        {/* THE TEXT ALTERNATIVE IS GONE, at the client's explicit instruction
            (2026-10-20), and this comment is the record of what that costs.

            The film has no audio track — probed on the delivered file, which
            carries a `vide` handler and no `soun` — so it is prerecorded
            VIDEO-ONLY content. WCAG 2.1 SC 1.2.1 requires such content to
            have either an audio description or a text alternative that
            presents equivalent information. It now has neither, so this band
            does not meet 1.2.1 Level A.

            The copy is deliberately LEFT IN PLACE in lib/content/gamcs.ts
            (`howWeHelp.video.alt`, `altSummary`, `altNote`) rather than
            deleted with the markup, so restoring it is one element. It is
            stale against the re-cut film and would need re-checking against
            the frames first. */}
      </div>
    </section>
  );
}
