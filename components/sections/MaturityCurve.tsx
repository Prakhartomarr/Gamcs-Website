"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ARROW } from "@/components/ui/stroke-icons";
import { maturityCurve } from "@/lib/content/gamcs";
import CTA from "@/components/CTA";

/**
 * The four maturity stages as light cards stepping up a connecting run.
 *
 * The connector is drawn, not laid out: for each consecutive pair it runs from
 * the right edge of one card to the left edge of the next, a fixed distance
 * below each card's top, so the line climbs because the cards do. Those points
 * are measured from the DOM rather than derived from the CSS, which is what
 * lets the card heights stay content-driven.
 *
 * Clicking a stage places the visitor: the card takes a selected ring, a "You
 * are here" flag moves to it, and the footnote swaps to that stage's note in a
 * live region.
 *
 * The travelling marker is gone. It rode MotionPathPlugin along one continuous
 * curve; the connector is now three separate segments with gaps between the
 * cards, and a marker would jump those gaps. The line still draws itself in —
 * a single stroke-dashoffset sweep crosses all three subpaths in order.
 */

/** below this width the run becomes a plain vertical rail */
const MOBILE = 900;

/** bloom strength per stage — the light climbs toward Decision Intelligence */
const LIT = [0.16, 0.34, 0.6, 1];

/**
 * Position of `el` relative to `root`, accumulated up the offsetParent chain.
 *
 * offsetLeft/offsetTop rather than getBoundingClientRect, because the stages
 * carry `.reveal` — held at translateY(22px) until they scroll in. A rect
 * measured before that resolves is 22px low and the whole connector sits off
 * its cards by exactly that much. Offsets are layout positions and ignore
 * transforms entirely.
 *
 * The chain has to be walked rather than read once: an element's offset is
 * relative to its offsetParent, and *any* transformed ancestor becomes one —
 * `.reveal` itself does, while its transform is still applied.
 */
const offsetIn = (el: HTMLElement, root: HTMLElement) => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
};

export default function MaturityCurve() {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const lineBgRef = useRef<SVGPathElement>(null);
  const dotsRef = useRef<SVGGElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const svg = svgRef.current;
    const line = lineRef.current;
    const lineBg = lineBgRef.current;
    const dots = dotsRef.current;
    if (!stage || !svg || !line || !lineBg || !dots) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".fmc-card"));
    let played = reduce;

    /**
     * The six points the connector touches: each card's right edge, then the
     * next card's left edge.
     *
     * Anchored a constant distance below each card's top, NOT at its vertical
     * centre. The cards' heights are content-driven and differ by ~90px, so
     * their centres do not step evenly — measured at 281/234/174/161, a last
     * step of only 13px, which flattened the segments into barely-visible
     * hooks. Anchoring off the top makes the climb exactly the CSS stagger,
     * which is even and stays even at any width.
     */
    const ANCHOR = 64;
    const layout = () => {
      if (window.innerWidth <= MOBILE) return;
      svg.setAttribute("viewBox", `0 0 ${stage.offsetWidth} ${stage.offsetHeight}`);

      const box = cards.map((c) => {
        const o = offsetIn(c, stage);
        return { left: o.x, right: o.x + c.offsetWidth, mid: o.y + ANCHOR };
      });

      const seg: string[] = [];
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < box.length - 1; i++) {
        const a = { x: box[i].right, y: box[i].mid };
        const b = { x: box[i + 1].left, y: box[i + 1].mid };
        const dx = (b.x - a.x) / 2;
        seg.push(`M ${a.x} ${a.y} C ${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`);
        pts.push(a, b);
      }
      const d = seg.join(" ");
      line.setAttribute("d", d);
      lineBg.setAttribute("d", d);

      dots.innerHTML = "";
      const r = played ? 4.5 : 0;
      pts.forEach((pt, i) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", String(pt.x));
        c.setAttribute("cy", String(pt.y));
        c.setAttribute("r", String(r));
        /* the last point is the one that lands on Decision Intelligence */
        c.setAttribute("class", `fmc-dot${i === pts.length - 1 ? " is-goal" : ""}`);
        dots.appendChild(c);
      });

      /* prime the draw, or set it drawn if it has already played */
      const len = line.getTotalLength() || 1;
      line.style.strokeDasharray = String(len);
      line.style.strokeDashoffset = played ? "0" : String(len);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(stage);
    window.addEventListener("resize", layout);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || played) continue;
          played = true;
          io.disconnect();
          if (window.innerWidth <= MOBILE) return;
          gsap.to(line, {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: "power2.inOut",
          });
          gsap.to(Array.from(dots.children), {
            attr: { r: 4.5 },
            duration: 0.4,
            stagger: 0.16,
            delay: 0.35,
            ease: "back.out(2)",
          });
        }
      },
      { threshold: 0.3 }
    );
    io.observe(stage);

    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", layout);
      gsap.killTweensOf([line, ...Array.from(dots.children)]);
    };
  }, []);

  /* Flag position tracks the selected card, measured from the DOM so it stays
     correct at any width without duplicating the layout maths. */
  useEffect(() => {
    const stage = stageRef.current;
    const flag = flagRef.current;
    if (!stage || !flag || active === null) return;
    if (window.innerWidth <= MOBILE) return;
    const card = stage.querySelectorAll<HTMLElement>(".fmc-card")[active];
    if (!card) return;
    /* Same offset-based space as the dots, or the flag drifts from them. */
    const o = offsetIn(card, stage);
    flag.style.left = `${o.x + card.offsetWidth / 2}px`;
    flag.style.top = `${o.y}px`;
  }, [active]);

  const note =
    active === null ? maturityCurve.footnote : maturityCurve.stageNotes[active];

  return (
    <section className="section fin-sec fmc" id="maturity-curve">
      <div className="container">
        <div className="reveal">
          <span className="fin-eyebrow">
            <i aria-hidden="true" />
            The maturity curve
          </span>
          <h2 className="fin-h2">
            Every finance function sits on this curve.
            <br />
            <span className="accent">Where are you?</span>
          </h2>
          <p className="fin-lead">
            Four stages separate finance that records the past from finance that
            shapes the next decision. Choose a stage to place yourself.
          </p>
        </div>

        <div className="fmc-stage" ref={stageRef}>
          <svg
            className="fmc-svg"
            ref={svgRef}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="fmcGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#0F5E97" />
                <stop offset="1" stopColor="#4A93C9" />
              </linearGradient>
            </defs>
            <path className="fmc-line-bg" ref={lineBgRef} />
            <path className="fmc-line" ref={lineRef} />
            <g ref={dotsRef} />
          </svg>

          <ol className="fmc-stages">
            {maturityCurve.stages.map((stage, i) => (
              /*
               * `reveal` sits on the <li>, not the button.
               *
               * MotionLayer adds `.visible` imperatively with classList. React
               * owns the button's className (it toggles `is-sel`), so the
               * re-render on click rewrote that attribute and stripped
               * `visible` — the clicked card snapped back to opacity:0 and
               * disappeared. The <li>'s className is static, so React never
               * touches it.
               */
              <li className="reveal" key={stage.n}>
                <button
                  type="button"
                  className={`fmc-card${active === i ? " is-sel" : ""}`}
                  style={{ "--lit": LIT[i] } as React.CSSProperties}
                  aria-pressed={active === i}
                  onClick={() => setActive(i)}
                >
                  <span className="fmc-label">{stage.n}</span>
                  <span className="fmc-body">{stage.body}</span>
                  <span className="fmc-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="fmc-name">{stage.name}</span>
                  <span className="fmc-cap" aria-hidden="true">
                    <b style={{ width: `${((i + 1) / maturityCurve.stages.length) * 100}%` }} />
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div
            className={`fmc-flag${active !== null ? " is-show" : ""}`}
            ref={flagRef}
            aria-hidden="true"
          >
            <span className="tag">You are here</span>
            <span className="stem" />
            <span className="bead" />
          </div>
        </div>

        <footer className="fmc-foot">
          {/* aria-live: the note is the answer to the button the visitor just
              pressed, so it needs announcing without moving focus. */}
          <p className="fmc-note" aria-live="polite">
            {note}
          </p>
          <CTA tier="secondary" icon="arrow" href={maturityCurve.cta.href} data-cta="maturity">
            {maturityCurve.cta.label}
          </CTA>
        </footer>
      </div>
    </section>
  );
}
