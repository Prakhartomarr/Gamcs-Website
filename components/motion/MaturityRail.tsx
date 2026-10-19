"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * The curve the section is named after: one line rising left to right across
 * the stage cards, a node sitting ON it above each stage, and a marker that
 * travels to whichever stage is selected. It replaces `.mc-rail`, a dashed
 * CSS fragment that carried no information at all.
 *
 * SCALING — the decision this component turns on.
 * The obvious way to stretch a decoration across a row is
 * preserveAspectRatio="none", and it is wrong here. Non-uniform scaling
 * scales the stroke along with the geometry, so one 2-unit line renders
 * thick where the curve is steep and thin where it is flat, and every
 * circle becomes an ellipse. (vector-effect fixes the stroke; nothing fixes
 * the circles.) So the viewBox is UNIFORM — the default xMidYMid meet — and
 * the element is sized `width:100%; height:auto`. The drawing still spans
 * the row exactly, because the viewBox is 1000 units wide and the nodes sit
 * at 100/300/500/700/900, which ARE the 10/30/50/70/90% column centres. The
 * price is that rendered height follows width (~85-97px across the 1280+
 * range where this is shown) rather than being a number CSS picks.
 *
 * That makes `height:auto` a contract, not a preference: give this element a
 * fixed height and `meet` letterboxes the drawing, and the nodes stop
 * lining up with the cards.
 *
 * NO MEASURING. Node positions come from `count`, not from the cards. Five
 * equal columns put their centres at those percentages by arithmetic, and
 * the row is five equal columns only at >=1280 — the one width where this
 * element is shown at all. A ResizeObserver reading five card rects to place
 * five dots would be more machinery than a decoration is worth.
 *
 * RESTING STATE. Everything renders finished in the server HTML: `d` is
 * arithmetic, no dash is written in markup, and the marker is parked on the
 * active node's own coordinates — the nodes are on the curve, so no DOM
 * measurement is needed to place it. With JS off, on a crawler, or under
 * prefers-reduced-motion the picture is already correct, and the effects
 * below only ever animate towards it.
 *
 * STYLESHEET CONTRACT — colour lives in globals.css, not here:
 *   .mc-railsvg  the <svg>; needs width:100%, height:auto, display:block
 *   .mc-railline the curve; needs `stroke` (and stroke-width/linecap)
 *   .mc-node     a stage node; needs `fill`
 *   .mc-node--on the selected stage's node
 *   .mc-marker   the travelling ring; needs `stroke`
 * `r` ships as an attribute so the nodes are visible before any stylesheet
 * loads; CSS may override it with the `r` property to size .mc-node--on, and
 * a transition there is what returns the previous node to resting size. The
 * vertical budget is 6..22 of a 28-unit box. The resting radius (5) sits
 * inside it; the selected node's 10 overhangs the top by ~5px, which is
 * why .mc-railsvg keeps overflow:visible and why the 22px margin above it
 * is a floor rather than decoration.
 */

/* A wide, shallow box: the row is ~1300px and this is a band above it, not a
   chart. 1000 wide makes node x-coordinates read as percentages.

   THE BOX IS THE RAIL'S RENDERED HEIGHT. The viewBox is uniform and the
   element is height:auto, so the rail renders at (H + DROP)/W of the row's
   width and nothing else — this is the only place its height can be set.
   72+10 drew it at ~103px; 28+5 draws it at ~41px, which is where the last
   of the height this section had to find came from. The nodes do not shrink
   with it: `r` is in user units of a box that is still 1000 wide, so the
   dots render exactly as before. The climb is gentler — 16 units, ~20px
   against the old ~49px — but it still rises left to right. */
const W = 1000;
const H = 28;
const Y_LOW = 22; // first stage, bottom of the climb
const Y_HIGH = 6; // last stage, top of it
/* How far below the curve each node's connector reaches. The viewBox grows by
   this much and the stylesheet's bottom margin goes to 0, so the svg's bottom
   edge IS the card top — which makes the connectors land exactly on the cards
   at every width. Expressing the drop in pixels instead would have drifted:
   the gap is fixed px while the drawing scales with the row. */
const DROP = 5;
/* >1 holds the line down early and lifts it late — the shape the section
   argues for, where the payoff is at the end of the journey. 1.45 is the
   flattest exponent that still reads as a curve rather than a ramp. */
const BEND = 1.45;

/* The stage row's grid gap, and the row width the gap correction is tuned at.
   Both are CSS facts (.mc-stages{gap:16px}, .container at >=1280); they live
   here because the node positions are geometry, and geometry is this file's
   job. If the grid's gap changes, change GAP. */
const GAP = 16;
const ROW = 1300;

const DRAW = 1.1; // seconds for the pen to cross the row
const GLIDE = 0.52; // --dur-panel is 260ms; the marker covers ground, so twice it

type Pt = { x: number; y: number };

const round = (n: number) => Math.round(n * 100) / 100;

const nodes = (count: number): Pt[] =>
  Array.from({ length: count }, (_, i) => ({
    /* Column centres, not naive midpoints. The row is a CSS grid of `count`
       equal columns separated by GAP px, so a card's centre sits at
       (i + 0.5)/count of the row ONLY when the gap is zero. With a gap the
       outer centres pull inward by (count-1)/2 - i gaps' worth; ignoring it
       put the end nodes ~6px off their cards. ROW is the row's typical px
       width — the correction is 6.4px at 1280 and 5.7px at 1440, so one
       constant is accurate to about a pixel across every width this svg is
       shown at, and costs no layout read. */
    x: round((((i + 0.5) / count) - ((count - 1) / 2 - i) * (GAP / ROW) / count) * W),
    y: round(Y_LOW - (Y_LOW - Y_HIGH) * (count > 1 ? (i / (count - 1)) ** BEND : 1)),
  }));

/**
 * A Catmull-Rom spline written as cubic Béziers. Chosen over hand-placed
 * control points for one reason: it passes THROUGH every point by
 * construction, which is the whole requirement — a node that sits near the
 * curve instead of on it is the failure this element would be mocked for.
 * End tangents are clamped by reusing the end points.
 */
const spline = (p: Pt[]) => {
  if (p.length < 2) return p.length ? `M${p[0].x} ${p[0].y}` : "";
  let d = `M${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[0];
    const b = p[i];
    const c = p[i + 1];
    const e = p[i + 2] ?? c;
    d +=
      `C${round(b.x + (c.x - a.x) / 6)} ${round(b.y + (c.y - a.y) / 6)}` +
      ` ${round(c.x - (e.x - b.x) / 6)} ${round(c.y - (e.y - b.y) / 6)}` +
      ` ${c.x} ${c.y}`;
  }
  return d;
};

/**
 * How far along the path a node sits. x increases monotonically along this
 * curve, so bisection finds it, and 20 halvings of a 1000-unit path land
 * well inside a thousandth of a unit. SVG offers no API that asks the
 * question directly — only the inverse, getPointAtLength.
 */
const lengthAtX = (path: SVGPathElement, total: number, x: number) => {
  let lo = 0;
  let hi = total;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).x < x) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

export default function MaturityRail({ count, active }: { count: number; active: number }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const markRef = useRef<SVGCircleElement>(null);
  /* Arc-length of every node, measured once the path is in the DOM. */
  const lens = useRef<number[]>([]);
  /* The marker's position as a distance along the path — the thing that is
     actually tweened, because a point sampled from the path is the only way
     to move along a curve without leaving it. */
  const head = useRef({ len: 0 });
  const activeRef = useRef(active);

  const pts = nodes(count);
  /* FROZEN on purpose. If the marker's cx/cy came from `active`, React would
     snap it to the new node on commit and the glide below would have nothing
     left to travel. Rendering a value that never changes means React writes
     these attributes once and GSAP owns them from then on. */
  const parked = useRef(active).current;

  /* Entrance: the pen crosses the row once, the nodes light up as it passes.
     `count` is the only input — the marker's starting node is read from a
     ref, so a different stage being selected does not redraw the curve. */
  useEffect(() => {
    const root = rootRef.current;
    const line = lineRef.current;
    const mark = markRef.current;
    if (!root || !line || !mark) return;

    /* `head.current` is a plain object made once and never reassigned, but
       reading it in the cleanup below trips the ref-in-cleanup lint rule, so
       it is captured here — same object, quieter. */
    const pos = head.current;
    const pt = nodes(count);
    const total = line.getTotalLength();
    lens.current = pt.map((p) => lengthAtX(line, total, p.x));
    pos.len = lens.current[activeRef.current] ?? 0;

    const dots = Array.from(root.querySelectorAll<SVGCircleElement>(".mc-node"));
    /* Index-aligned with `dots`: both come from the same `pts` in the same
       order, so a connector fades in with the node it belongs to. */
    const drops = Array.from(root.querySelectorAll<SVGLineElement>(".mc-drop"));
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* Undoing the entrance is the same operation as never playing it, since
       the resting state IS the finished picture. One function serves both
       the unmount and a mid-draw flip to Reduce Motion. */
    const settle = () => {
      gsap.set(line, { clearProps: "strokeDasharray,strokeDashoffset" });
      gsap.set([...dots, ...drops, mark], { clearProps: "opacity" });
      const home = pt[activeRef.current];
      if (home) {
        pos.len = lens.current[activeRef.current] ?? 0;
        mark.setAttribute("cx", String(home.x));
        mark.setAttribute("cy", String(home.y));
      }
    };

    let io: IntersectionObserver | undefined;
    let tl: gsap.core.Timeline | undefined;

    if (!mql.matches) {
      gsap.set(line, { strokeDasharray: total, strokeDashoffset: total });
      gsap.set([...dots, ...drops, mark], { opacity: 0 });

      tl = gsap.timeline({ paused: true });
      /* `ease:"none"` is not laziness about the curve — stroke-dashoffset maps
         linearly to arc length, so a linear tween is a pen moving at constant
         speed, and it lets each node's cue below be an exact fraction of the
         duration instead of an inverted ease. */
      tl.to(line, { strokeDashoffset: 0, duration: DRAW, ease: "none" }, 0);
      dots.forEach((dot, i) => {
        const at = DRAW * (lens.current[i] / total);
        tl?.to([dot, drops[i]].filter(Boolean), { opacity: 1, duration: 0.28 }, at);
      });
      tl.to(mark, { opacity: 1, duration: 0.28 }, DRAW * (pos.len / total));

      /* One observer, play once — the measurement in MotionLayer's header is
         why this is not a ScrollTrigger. A tall-target threshold miss is not
         possible here: this element is ~90px, so no backstop timer either. */
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io?.disconnect();
          tl?.play();
        },
        { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(root);
    }

    /* Enabling Reduce Motion mid-session is a real path on a laptop that
       turns it on when unplugged. Only the flip TO reduce is handled:
       replaying an entrance because a system setting changed would be the
       opposite of what the setting asks for. */
    const onPref = () => {
      if (!mql.matches) return;
      io?.disconnect();
      tl?.kill();
      gsap.killTweensOf(pos);
      settle();
    };
    mql.addEventListener("change", onPref);

    return () => {
      mql.removeEventListener("change", onPref);
      io?.disconnect();
      tl?.kill();
      gsap.killTweensOf(pos);
      settle();
    };
  }, [count]);

  /* The marker. Runs on mount too, where it finds itself already parked on
     the right node and returns without tweening. */
  useEffect(() => {
    activeRef.current = active;
    const line = lineRef.current;
    const mark = markRef.current;
    const to = lens.current[active];
    /* lens is filled by the effect above, which runs first on mount. */
    if (!line || !mark || to === undefined) return;

    const home = nodes(count)[active];
    const place = (x: number, y: number) => {
      mark.setAttribute("cx", String(x));
      mark.setAttribute("cy", String(y));
    };

    gsap.killTweensOf(head.current);
    if (head.current.len === to) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      head.current.len = to;
      place(home.x, home.y);
      return;
    }

    gsap.to(head.current, {
      len: to,
      duration: GLIDE,
      ease: "power3.inOut",
      onUpdate: () => {
        const p = line.getPointAtLength(head.current.len);
        place(p.x, p.y);
      },
      /* Land on the node's own coordinates rather than on a sample of the
         path. The two differ by a rounding error, and a marker that stops a
         hair off its node is the one thing this element must not do. */
      onComplete: () => place(home.x, home.y),
    });
  }, [active, count]);

  return (
    <svg className="mc-railsvg" ref={rootRef} viewBox={`0 0 ${W} ${H + DROP}`} aria-hidden="true">
      {/* Connectors first, so a node always sits on top of its own line. */}
      {pts.map((p) => (
        <line
          className="mc-drop"
          key={`d${p.x}`}
          x1={p.x}
          y1={p.y}
          x2={p.x}
          y2={H + DROP}
        />
      ))}
      <path className="mc-railline" ref={lineRef} d={spline(pts)} fill="none" />
      {pts.map((p, i) => (
        <circle
          className={i === active ? "mc-node mc-node--on" : "mc-node"}
          key={p.x}
          cx={p.x}
          cy={p.y}
          r={5}
        />
      ))}
      <circle
        className="mc-marker"
        ref={markRef}
        cx={pts[parked]?.x ?? 0}
        cy={pts[parked]?.y ?? 0}
        r={10}
        fill="none"
      />
    </svg>
  );
}
