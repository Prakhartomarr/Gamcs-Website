"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { toolLogos } from "./icons";

/**
 * Floating integration ecosystem.
 *
 * Two performance decisions here:
 *  - The float loop is a single GSAP tween per chip on GSAP's existing ticker,
 *    rather than a second animation runtime, and it is killed when the hero
 *    leaves the viewport.
 *  - Chip → card illumination toggles a class directly on the target card.
 *    It used to live in React state on Hero, so every chip hover re-rendered
 *    the whole hero subtree (three cards, seven chips, the client row) while
 *    the pointer was moving.
 */
export default function HeroChips() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".ichip").forEach((el, i) => {
        gsap.to(el, {
          y: -11,
          rotation: i % 2 ? 1.8 : -1.8,
          duration: 2.1 + i * 0.13,
          delay: i * 0.08,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, rootRef);

    /* Ambient motion must not run unseen: pause the float tweens whenever the
       hero is off-screen, resume when it returns. */
    const chips = root.querySelectorAll(".ichip");
    const io = new IntersectionObserver(
      ([entry]) =>
        gsap.getTweensOf(chips).forEach((t) => (entry.isIntersecting ? t.play() : t.pause())),
      { threshold: 0 }
    );
    io.observe(root.closest(".hero") ?? root);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div className="chips" aria-hidden="true" ref={rootRef}>
      <div className="orbit">
        {toolLogos.map((t) => (
        <div
          className={`chipwrap ${t.cls}`}
          key={t.cls}
          onMouseEnter={() => {
            document.querySelector(`[data-card="${t.link}"]`)?.classList.add("illuminated");
          }}
          onMouseLeave={() => {
            document.querySelector(`[data-card="${t.link}"]`)?.classList.remove("illuminated");
          }}
        >
          <div className="ichip">
            {t.svg}
            <span className="chip-tip">{t.label}</span>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}
