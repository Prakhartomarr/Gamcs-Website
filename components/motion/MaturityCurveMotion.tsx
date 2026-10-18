"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

/**
 * The maturity curve's entrance. Renders nothing; it only animates the section
 * it is mounted inside.
 *
 * Same shape as DecisionGapMotion, deliberately — one gate, one paused
 * timeline, one IntersectionObserver, one timer backstop — because the two
 * sections sit next to each other and a reader scrolling from one into the
 * other should not meet a second motion vocabulary. Read that file first; the
 * reasoning there applies here unchanged and is not repeated.
 *
 * The section ships complete and visible in the server HTML. The only thing
 * that hides anything is the server-rendered `data-anim="pending"` gate, and
 * releasing it is this component's first and unconditional act.
 *
 * TRANSFORM OWNERSHIP, solved one rung lower than DecisionGapMotion solved it.
 * MotionLayer binds a quickTo hover lift to every [data-lift] element, which
 * here is `.mc-stage-btn`. So the entrance does not touch the button: it
 * tweens the `.mc-stage` <li> that wraps it, which carries no [data-lift] and
 * therefore has no other writer on its matrix. The card moves identically —
 * the <li> is the grid item and the button fills it — and unlike the
 * custom-property route this needs nothing from the stylesheet at all.
 * Hover keeps the button's transform, the entrance keeps the wrapper's, and
 * the two compose in the browser because they are two different elements.
 *
 * The head and the panel are plain `y`/opacity: nothing else writes them.
 *
 * The rail is left alone. It is decoration that already says "a curve" at
 * rest, and MaturityRail animates its own stroke if it animates at all.
 */

/* The stylesheet contract, and all of it: the gate. It belongs in the .mc
   block of globals.css, which this file does not own.

     .mc[data-anim="pending"] .mc-eyebrow,
     .mc[data-anim="pending"] .mc-h2,
     .mc[data-anim="pending"] .mc-lead,
     .mc[data-anim="pending"] .mc-pill,
     .mc[data-anim="pending"] .mc-stage,
     .mc[data-anim="pending"] .mc-panel{opacity:0;
       animation:mcGate .4s ease 2.6s forwards}
     @keyframes mcGate{to{opacity:1}}
     @media (scripting:none){ …same selectors{opacity:1;animation:none} }

   Opacity only, exactly as the .dg gate is: the travel is inline and GSAP's,
   and a transform in a rule would outlive the clearProps on unmount.

   Until those rules land the component is still correct — it just reveals a
   section that was never hidden, so the first paint shows it and the entrance
   then replays it. Nothing can strand it invisible either way. */

export default function MaturityCurveMotion() {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown: (() => void) | undefined;

    const arm = () => {
      const sec = document.getElementById("maturity-curve");
      if (!sec) return; // other routes do not have this section

      const release = () => sec.setAttribute("data-anim", "in");
      if (mql.matches) {
        release();
        return;
      }

      const all = (sel: string) => Array.from(sec.querySelectorAll<HTMLElement>(sel));
      const head = [
        ...all(".mc-eyebrow"),
        ...all(".mc-h2"),
        ...all(".mc-lead"),
        ...all(".mc-pill"),
      ];
      const cards = all(".mc-stage");
      const panel = all(".mc-panel");
      const moved = [...head, ...cards];

      gsap.set([...moved, ...panel], { opacity: 0 });
      gsap.set(head, { y: 14 });
      gsap.set(cards, { y: 16 });
      /* Only now: the inline from-values have replaced what the gate was
         holding, so there is no frame in which the section is visible. */
      release();

      /* Same curve and same 0.56s as the decision gap above it — power4.out
         is what --ease-out encodes, --dur-reveal is 560ms. Lands by ~1.2s. */
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.56, ease: "power4.out" },
      });
      tl.to(head, { opacity: 1, y: 0, stagger: 0.08 }, 0);
      tl.to(cards, { opacity: 1, y: 0, stagger: 0.06 }, 0.26);
      /* The panel only fades. It is the largest surface in the section, and a
         surface that size arriving on a slide reads as the page reflowing. */
      tl.to(panel, { opacity: 1, duration: 0.5 }, 0.62);

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          tl.play();
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(sec);

      /* Backstop, the same trade MotionLayer and DecisionGapMotion make:
         content winning over choreography is the right way round. */
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
        gsap.set([...moved, ...panel], { clearProps: "opacity,transform" });
        sec.setAttribute("data-anim", "in");
      };
    };

    arm();

    /* Switching the OS setting mid-session is a real path on a laptop that
       enables it on battery. */
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
