"use client";

import { useEffect, useRef } from "react";

/**
 * The drifting mesh behind a pillar card.
 *
 * Two layers — this element and its ::after — carrying large soft colour fields
 * that travel on long, mismatched loops (23s and 31s), so the pattern never
 * visibly repeats. Both animate `transform` only, which the compositor can do
 * without repainting; animating the gradient positions instead would repaint
 * a blurred layer every frame, five times over.
 *
 * The animation is paused until the card is on screen. Five cards animating
 * whether or not you can see them is work for nothing, and this page is long.
 * Under prefers-reduced-motion the CSS stops it outright and the mesh holds a
 * still frame.
 */
export default function PillarMesh() {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => node.toggleAttribute("data-run", entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return <span className="pillar-mesh" ref={el} aria-hidden="true" />;
}
