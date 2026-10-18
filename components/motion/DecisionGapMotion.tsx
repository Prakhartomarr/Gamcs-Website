"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

/**
 * The decision gap's entrance. Renders nothing; it only animates the section
 * it is mounted inside.
 *
 * The approved plain section is the resting state, so this is a gate before it
 * is a timeline: `dg--motion` lands on the section only once this effect has
 * run and only when motion is permitted. With JS off, on a crawler, or under
 * prefers-reduced-motion the class never arrives — which is why every hidden
 * start value here is written INLINE, in the same pass that adds the class,
 * rather than as a stylesheet rule. A rule cannot be made conditional on JS
 * having run; an inline style set by this effect already is. Nothing in the
 * stylesheet needs to hide anything for this to work, so nothing can strand
 * the section invisible if this component never mounts or throws.
 *
 * One IntersectionObserver and one timeline, deliberately. MotionLayer's
 * header records the measurement: ScrollTrigger.batch put ~50 scroll-measured
 * triggers on the page and took style-recalc from 298ms to 583ms, because it
 * reads layout on the main thread. This section does not need scrub, pin or
 * progress — it needs "play once, when seen" — which is an observer's whole
 * job, done off the main thread. Keeping it to one timeline also means the
 * rhythm is legible in one block and killable in one call.
 *
 * TRANSFORM OWNERSHIP. MotionLayer binds a gsap.quickTo hover lift to every
 * [data-lift] element, which is both the symptom cards and the figure cards.
 * `transform` is therefore already owned, and a second writer on the same
 * matrix does not layer — it fights, frame by frame, for the ~0.6s the
 * entrance and a pointer can overlap. So the cards' rise is NOT a transform:
 * it is a `--dg-rise` length the stylesheet feeds to the independent
 * `translate` property, which composes with `transform` in the browser instead
 * of competing for it. Hover keeps the matrix, the entrance keeps the
 * property, and neither has to know about the other. Elements that are not
 * [data-lift] — the heading words, the lead, the turn's clauses — are tweened
 * with plain `y`, because nothing else is writing their transform.
 *
 * The gold rule under the heading is a pseudo-element, which GSAP cannot
 * target, so it is driven the same way: a `--dg-rule-sx` scale factor tweened
 * on the <h2> and consumed by `.dg-h2::after`. Chosen over handing it to a CSS
 * transition on an `.is-in` class because a transition would be the one piece
 * of the choreography outside the timeline — unkillable, and timed in a second
 * place. Both custom properties fall back to their resting value, so an
 * unstyled or half-styled build loses the draw, never the rule.
 */

/* The stylesheet contract, all of it scoped under `.dg--motion`:
     .dg--motion .dg-w{display:inline-block}
     .dg--motion .dg-pain,.dg--motion .dg-stat{translate:0 var(--dg-rise,0)}
     .dg--motion .dg-h2::after{transform:scaleX(var(--dg-rule-sx,1));
       transform-origin:left}
   Those three are additive. No rule may set `opacity` or `transform` on the
   elements below: the hidden values are inline and are cleared when this
   unmounts, and a rule setting them would outlive the cleanup. */

export default function DecisionGapMotion() {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown: (() => void) | undefined;

    const arm = () => {
      const sec = document.getElementById("decision-gap");
      if (!sec) return; // other routes do not have this section

      /* The section ships hidden behind data-anim="pending" so it never
         paints visible and then snaps away. Releasing that gate is this
         component's first duty and is unconditional: a reader with Reduce
         Motion on must see the section NOW, not after the stylesheet's 2.6s
         fallback, and they are never going to reach the timeline below. */
      const release = () => sec.setAttribute("data-anim", "in");
      if (mql.matches) {
        release();
        return;
      }

      const all = <T extends HTMLElement>(sel: string) =>
        Array.from(sec.querySelectorAll<T>(sel));
      const words = all(".dg-w");
      const sub = all(".dg-sub");
      const pains = all(".dg-pain");
      const clauses = [...all(".dg-turn-lead"), ...all(".dg-turn-q")];
      const stats = all(".dg-stat");
      const h2 = sec.querySelector<HTMLElement>(".dg-h2");
      const fades = [...words, ...sub, ...clauses];

      sec.classList.add("dg--motion");
      gsap.set([...fades, ...pains, ...stats], { opacity: 0 });
      gsap.set(words, { y: 14 });
      gsap.set(sub, { y: 12 });
      gsap.set([...pains, ...stats], { "--dg-rise": "16px" });
      if (h2) gsap.set(h2, { "--dg-rule-sx": 0 });
      /* Only now: the inline from-values have replaced what the gate was
         holding, so there is no frame in which the section is visible. */
      release();

      /* power4.out is quintic-out, which is the curve --ease-out
         (cubic-bezier(.23,1,.32,1)) encodes — same motion vocabulary as the
         CSS reveals, without registering CustomEase for one section. .56s is
         --dur-reveal; the whole thing lands by ~1.36s. */
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.56, ease: "power4.out" },
      });

      /* The accent words continue the same stagger rather than starting their
         own: it is one sentence that changes colour mid-line, and a second
         stagger would read as a second heading. */
      tl.to(words, { opacity: 1, y: 0, stagger: 0.045 }, 0);
      tl.to(sub, { opacity: 1, y: 0, duration: 0.5 }, 0.18);
      if (h2) tl.to(h2, { "--dg-rule-sx": 1, duration: 0.6 }, 0.2);
      tl.to(pains, { opacity: 1, "--dg-rise": "0px", stagger: 0.07 }, 0.3);
      /* The turn is the pivot of the section, not the showreel: the two
         clauses only fade, 120ms apart, and never move. */
      tl.to(clauses, { opacity: 1, duration: 0.44, stagger: 0.12 }, 0.52);
      /* The figures rise and fade only — CountUp owns the numbers and starts
         on its own intersect, so counting them here would run them twice. */
      tl.to(stats, { opacity: 1, "--dg-rise": "0px", stagger: 0.07 }, 0.66);

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          tl.play();
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(sec);

      /* Backstop, the same trade MotionLayer makes: if the section was
         already on screen when this mounted and the observer never delivered,
         the entrance would hold it at opacity 0 for good. Content winning
         over choreography is the right way round. */
      const net = window.setTimeout(() => {
        if (tl.progress() === 0 && sec.getBoundingClientRect().top < window.innerHeight) {
          io.disconnect();
          tl.play();
        }
      }, 1200);

      teardown = () => {
        window.clearTimeout(net);
        io.disconnect();
        tl.kill();
        /* Clear exactly what was set and nothing more. `transform` is cleared
           on the elements this owns outright, and deliberately NOT on the
           cards: that matrix is MotionLayer's, and clearing it here would
           cancel a hover it is mid-way through. */
        gsap.set(fades, { clearProps: "opacity,transform" });
        gsap.set([...pains, ...stats], { clearProps: "opacity,--dg-rise" });
        if (h2) gsap.set(h2, { clearProps: "--dg-rule-sx" });
        sec.classList.remove("dg--motion");
      };
    };

    arm();

    /* Switching the OS setting mid-session is a real path on a laptop that
       enables it on battery. Tearing down returns the section to its resting
       state immediately, even mid-entrance. */
    const onChange = () => {
      teardown?.();
      teardown = undefined;
      arm();
    };
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
      teardown?.();
    };
  }, []);

  return null;
}
