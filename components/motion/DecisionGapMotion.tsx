"use client";

import { useEffect } from "react";
import { gsap } from "gsap";

/**
 * The decision gap's entrance and its deck. Renders nothing; it only animates
 * the section it is mounted inside.
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
 * That contract now covers GEOMETRY as well as opacity. The stylesheet's
 * `.dg-stage` block is four square cards in a panel; the fan, the deck's tilt
 * and the hover travel are transforms written here. A reader with no JS gets
 * the panel, never a deck frozen half-dealt.
 *
 * One IntersectionObserver and one timeline, deliberately. MotionLayer's
 * header records the measurement: ScrollTrigger.batch put ~50 scroll-measured
 * triggers on the page and took style-recalc from 298ms to 583ms, because it
 * reads layout on the main thread. This section does not need scrub, pin or
 * progress — it needs "play once, when seen" — which is an observer's whole
 * job, done off the main thread.
 *
 * TRANSFORM OWNERSHIP. The symptom cards no longer carry `data-lift`, so
 * MotionLayer's page-wide quickTo hover lift never binds to them and this
 * file is the single writer on their matrix — which it has to be, because the
 * fan, the deal-out and the hover all live on the same transform. The figures
 * still carry it, so their travel still rides the independent `--dg-rise`
 * length rather than `transform`, and the two systems never meet.
 *
 * THE FAN IS MEASURED, NOT TABULATED. Each card's rotation and depth come
 * from where its centre actually sits across the deck, so the same code gives
 * a four-across fan at 1280, a gentler two-up fan at 768, and nothing at all
 * on the phone rail — with no breakpoint table to drift out of step with the
 * stylesheet, and no wrong answer after a font swap or a copy change.
 */

/* The stylesheet contract:
     .dg-stage{display:contents}                       (<768: no box at all)
     @media (min-width:768px){ .dg-stage{perspective:1500px}
                               .dg-pains{transform-style:preserve-3d}
                               .dg-pain{transform-style:preserve-3d} }
     .dg-stat{translate:0 var(--dg-rise,0)}
   No rule may set `opacity` or `transform` on the elements below outside the
   gate: the hidden values are inline and are cleared when this unmounts, and
   a rule setting them would outlive the cleanup. */

type Fan = { rotationY: number; z: number; y: number; x: number };

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
      const stage = sec.querySelector<HTMLElement>(".dg-stage");
      const deck = sec.querySelector<HTMLElement>(".dg-pains");
      const cards = all<HTMLElement>(".dg-pain");
      const clauses = [...all(".dg-turn-lead"), ...all(".dg-turn-q")];
      const stats = all(".dg-stat");
      const fades = [...words, ...sub, ...clauses];

      /* The stage is only a box from 768 up — below that it is
         display:contents and the phone block draws the rail instead. */
      const spatial = window.matchMedia("(min-width: 768px)");
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
      const fans = new Map<HTMLElement, Fan>();

      /* Must run before anything is transformed: it reads laid-out geometry.
         `t` is the card centre's position across the deck, -1 at the left
         edge to +1 at the right, so the outer cards turn and recede most and
         a card at the centre barely moves — which is what a hand of cards
         does. `x` is the from-value: a fraction of the distance to the deck's
         centre, so the four start as a loose stack and are dealt out. */
      const measure = () => {
        fans.clear();
        if (!deck || !spatial.matches) return;
        const dr = deck.getBoundingClientRect();
        const dcx = dr.left + dr.width / 2;
        const half = dr.width / 2 || 1;
        cards.forEach((card) => {
          const r = card.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const t = (cx - dcx) / half;
          fans.set(card, {
            rotationY: -t * 11,
            z: -Math.abs(t) * 58,
            y: Math.abs(t) * 10,
            x: (dcx - cx) * 0.18,
          });
        });
      };

      sec.classList.add("dg--motion");
      measure();

      gsap.set(fades, { opacity: 0 });
      gsap.set(words, { y: 14 });
      gsap.set(sub, { y: 12 });
      gsap.set(stats, { opacity: 0, "--dg-rise": "16px" });
      if (stage) gsap.set(stage, { opacity: 0, y: spatial.matches ? 26 : 0 });
      /* `.dg-note` is not animated because it is not rendered — see the note
         in DecisionGap.tsx. If it comes back it needs a tween HERE and a
         selector in all four gate lists, or it paints and then snaps. */

      const dealt = spatial.matches && fans.size > 0;
      if (dealt) {
        const mid = (cards.length - 1) / 2;
        cards.forEach((card, i) => {
          const f = fans.get(card);
          if (!f) return;
          gsap.set(card, {
            opacity: 0,
            x: f.x,
            y: 26,
            z: -220,
            rotationY: 0,
            rotationZ: (i - mid) * 1.6,
          });
        });
      } else {
        gsap.set(cards, { opacity: 0, y: 16 });
      }
      /* Only now: the inline from-values have replaced what the gate was
         holding, so there is no frame in which the section is visible. */
      release();

      /* power4.out is quintic-out, which is the curve --ease-out
         (cubic-bezier(.23,1,.32,1)) encodes — same motion vocabulary as the
         CSS reveals, without registering CustomEase for one section. .56s is
         --dur-reveal. */
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.56, ease: "power4.out" },
      });

      /* The accent words continue the same stagger rather than starting their
         own: it is one sentence that changes colour mid-line, and a second
         stagger would read as a second heading. */
      tl.to(words, { opacity: 1, y: 0, stagger: 0.045 }, 0);
      tl.to(sub, { opacity: 1, y: 0, duration: 0.5 }, 0.18);
      /* The stage arrives first and empty: the reader sees the surface, then
         the cards land on it. */
      if (stage) tl.to(stage, { opacity: 1, y: 0, duration: 0.7 }, 0.36);

      if (dealt) {
        cards.forEach((card, i) => {
          const f = fans.get(card);
          if (!f) return;
          tl.to(
            card,
            {
              opacity: 1,
              x: 0,
              y: f.y,
              z: f.z,
              rotationY: f.rotationY,
              rotationZ: 0,
              duration: 0.95,
              ease: "power3.out",
            },
            0.58 + i * 0.085
          );
        });
      } else {
        tl.to(cards, { opacity: 1, y: 0, stagger: 0.07 }, 0.4);
      }

      /* The turn is the pivot of the section, not the showreel: the two
         clauses only fade, 120ms apart, and never move. */
      tl.to(clauses, { opacity: 1, duration: 0.44, stagger: 0.12 }, 1.08);
      /* The figures rise and fade only — CountUp owns the numbers and starts
         on its own intersect, so counting them here would run them twice. */
      tl.to(stats, { opacity: 1, "--dg-rise": "0px", stagger: 0.07 }, 1.18);

      /* Listeners are recorded as they are bound so teardown can remove
         exactly what was added, including on a breakpoint this run never
         took. */
      const bound: Array<[HTMLElement, string, EventListener]> = [];
      const on = (el: HTMLElement, type: string, fn: EventListener) => {
        el.addEventListener(type, fn);
        bound.push([el, type, fn]);
      };

      if (stage && deck && dealt && fine.matches) {
        /* The deck tilts toward the pointer. quickTo retargets an existing
           tween instead of starting a new one per move, so this is two
           property writes a frame rather than a tween per event. The clamps
           are small on purpose: 5 and 7 degrees is enough for the cards to
           separate in depth and not enough for the section to read as
           unstable under the cursor. */
        const rx = gsap.quickTo(deck, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(deck, "rotationY", { duration: 0.6, ease: "power3.out" });
        on(stage, "pointermove", (e) => {
          const r = stage.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const ev = e as PointerEvent;
          rx(-((ev.clientY - r.top) / r.height - 0.5) * 5);
          ry(((ev.clientX - r.left) / r.width - 0.5) * 7);
        });
        on(stage, "pointerleave", () => {
          rx(0);
          ry(0);
        });

        /* Pick one up: it comes off the stage, straightens toward the
           reader, and the other three settle back. The guard matters —
           a pointer resting over the deck while the entrance is still
           running would otherwise fight the deal for the rest of it. */
        cards.forEach((card) => {
          on(card, "pointerenter", () => {
            if (tl.progress() < 1) return;
            const f = fans.get(card);
            if (!f) return;
            gsap.to(card, {
              z: f.z + 108,
              y: f.y - 12,
              rotationY: f.rotationY * 0.3,
              duration: 0.5,
              ease: "power3.out",
              overwrite: "auto",
            });
            cards.forEach((other) => {
              if (other === card) return;
              const g = fans.get(other);
              if (!g) return;
              gsap.to(other, {
                z: g.z - 26,
                opacity: 0.72,
                duration: 0.5,
                ease: "power3.out",
                overwrite: "auto",
              });
            });
          });
          on(card, "pointerleave", () => {
            if (tl.progress() < 1) return;
            cards.forEach((other) => {
              const g = fans.get(other);
              if (!g) return;
              gsap.to(other, {
                z: g.z,
                y: g.y,
                rotationY: g.rotationY,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out",
                overwrite: "auto",
              });
            });
          });
        });
      }

      /* The fan is a function of laid-out width, so a resize invalidates it —
         including a resize that crosses 768 in either direction, which is why
         the transforms are cleared before re-measuring rather than adjusted.
         Only once the entrance has landed: re-measuring mid-deal would read
         the cards' in-flight positions. */
      let rid = 0;
      const onResize = () => {
        window.clearTimeout(rid);
        rid = window.setTimeout(() => {
          if (tl.progress() < 1) return;
          gsap.set(cards, { clearProps: "transform" });
          if (deck) gsap.set(deck, { clearProps: "transform" });
          measure();
          if (spatial.matches && fans.size) {
            cards.forEach((card) => {
              const f = fans.get(card);
              if (!f) return;
              gsap.set(card, {
                x: 0,
                y: f.y,
                z: f.z,
                rotationY: f.rotationY,
                rotationZ: 0,
              });
            });
          }
        }, 180);
      };
      window.addEventListener("resize", onResize);

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
        window.clearTimeout(rid);
        window.removeEventListener("resize", onResize);
        bound.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
        io.disconnect();
        tl.kill();
        gsap.killTweensOf(cards);
        if (deck) gsap.killTweensOf(deck);
        /* Clear exactly what was set and nothing more. The cards' transform
           IS cleared here, unlike the old version — this file owns it now
           that they are no longer [data-lift]. */
        gsap.set(fades, { clearProps: "opacity,transform" });
        gsap.set(stats, { clearProps: "opacity,--dg-rise" });
        gsap.set(cards, { clearProps: "opacity,transform" });
        if (stage) gsap.set(stage, { clearProps: "opacity,transform" });
        if (deck) gsap.set(deck, { clearProps: "transform" });
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
