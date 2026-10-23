"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { decisionGap as c } from "@/lib/content/gamcs";

/**
 * The decision gap's pain points on a phone (2026-10-23; the stylesheet shows
 * this below 768px and hides .dg-stage, so desktop keeps its fanned deck).
 *
 * The four pains sit on one plain line from "the numbers" to "the decision",
 * each marked by a red node. The falling-digits canvas that first ran along
 * it came out the same day at the client's word: a simple line.
 *
 * Everything is DOM: the line and nodes are CSS, the pains are native
 * <details> (open/close with no JS, keyboard and screen readers for free).
 * Script only adds the arrival slide and a haptic tick on open.
 */
export default function DecisionGapFlow() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  /* Pains slide in as they arrive. One observer, a data attribute, CSS. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    /* Only now may the pains start hidden: with JS off they never do. */
    el.setAttribute("data-js", "");
    const items = Array.from(el.querySelectorAll<HTMLElement>(".dgf-leak"));
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.setAttribute("data-in", ""), io.unobserve(e.target))),
      { rootMargin: "0px 0px -12% 0px" }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  /* A light haptic tick when a pain opens, on Android. */
  const onToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open && !reduced && "vibrate" in navigator) navigator.vibrate?.(6);
  };

  return (
    <div className="dgf" ref={root}>
      <p className="dgf-end dgf-end--from">
        <span className="dgf-dot" aria-hidden="true" />
        {c.flow.from}
        <span className="dgf-hint">{c.flow.hint}</span>
      </p>
      <ol className="dgf-leaks">
        {c.pains.map((p, i) => (
          <li className="dgf-leak" key={p.title}>
            <details className="dgf-d" open={i === 0} onToggle={onToggle}>
              <summary className="dgf-sum">
                <span className="dgf-node" aria-hidden="true" />
                <span className="dgf-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="dgf-title">{p.title}</span>
                <svg className="dgf-chev" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 5.5 7 9.5 11 5.5" />
                </svg>
              </summary>
              <p className="dgf-body">{p.body}</p>
            </details>
          </li>
        ))}
      </ol>
      <p className="dgf-end dgf-end--to">
        <span className="dgf-dot" aria-hidden="true" />
        {c.flow.to}
      </p>
    </div>
  );
}
