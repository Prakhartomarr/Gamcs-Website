"use client";

import { useEffect, useRef } from "react";

/**
 * The clients line, fitted to its box. From 1280 up it is one justified line,
 * and SF Pro sets it about 5% narrower than Inter, so no single CSS size puts
 * both faces at 96–99% of the box. The CSS size is the Inter-safe floor (what
 * renders without JS); this scales it so the line's natural width is 97.5% of
 * the box on whichever face the device resolved. Tracking is in em, so the
 * width is linear in the font size and one pass lands it.
 */
export default function ClientsHeading({ id, children }: { id: string; children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.cssText = "";
      if (!matchMedia("(min-width:1280px)").matches) return;
      const box = el.getBoundingClientRect().width;
      const size = parseFloat(getComputedStyle(el).fontSize);
      el.style.cssText = "display:inline-block;white-space:nowrap";
      const natural = el.getBoundingClientRect().width;
      el.style.cssText = `font-size:${((size * 0.975 * box) / natural).toFixed(2)}px`;
    };
    fit();
    document.fonts.ready.then(fit); // Inter swaps in after first paint
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <h2 id={id} ref={ref}>
      {children}
    </h2>
  );
}
