"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import dynamic from "next/dynamic";

/* WebGL, ESM-only, and it touches the GPU at import time — it must never be
   evaluated on the server. Nothing is rendered in its place while it loads:
   the hero's own #EFEFEF ground is the placeholder. */
const HeroShader = dynamic(() => import("@/components/hero/HeroShader"), {
  ssr: false,
});
import CustomerLogoRow from "@/components/hero/CustomerLogoRow";
import ShimmerCTA from "@/components/motion/ShimmerCTA";
import { hero, primaryCta } from "@/lib/content/gamcs";

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();

  /* Entrance timeline + scroll parallax. GSAP is the only ticker in the hero. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reduce) {
      root.dataset.anim = "ready";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    let failsafe = 0;
    const ctx = gsap.context(() => {
      gsap.set(".line-inner", { yPercent: 115 });
      gsap.set([".sub", ".ctas"], { opacity: 0, y: 16 });
      gsap.set(".ribbon-field", { opacity: 0 });
      gsap.set(".hero-clients", { opacity: 0, y: 18 });
      root.dataset.anim = "ready";

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        /* Layer promotion is granted for the entrance and handed back at the end,
           so the hero is not left holding a dozen composited layers. */
        onComplete: () => gsap.set(".line-inner", { willChange: "auto" }),
      });
      tl.to(".ribbon-field", { opacity: 1, duration: 1.1, ease: "power1.out" }, 0)
        .to(".line-inner", { yPercent: 0, duration: 0.85, stagger: 0.12 }, "-=0.55")
        .to(".sub", { opacity: 1, y: 0, duration: 0.6 }, "-=0.35")
        .to(".ctas", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to(".hero-clients", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5");

      failsafe = window.setTimeout(() => {
        if (tl.progress() === 0) tl.progress(1);
      }, 2800);

      const st = { trigger: root, start: "top top", end: "bottom top", scrub: true as const };
      gsap.to(".hero-copy", { yPercent: -12, autoAlpha: 0.55, ease: "none", scrollTrigger: { ...st, end: "70% top" } });
    }, rootRef);

    return () => {
      clearTimeout(failsafe);
      ctx.revert();
    };
  }, [reduce]);

  return (
    <section className="hero page" ref={rootRef} data-anim="pending">
      <HeroShader />

      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title">
            <span className="line">
              <span className="line-inner">{hero.line1}</span>
            </span>
            <span className="line">
              <span className="line-inner">
                <em>{hero.line2}</em>
              </span>
            </span>
          </h1>
          <p className="sub">{hero.subhead}</p>
          <div className="ctas">
            <ShimmerCTA href={primaryCta.href} cta="hero">
              {primaryCta.label} <span aria-hidden="true">↗</span>
            </ShimmerCTA>
            <Link className="btn btn-light" href="/#how-we-help" data-press>
              <span className="btn-label">
                How We Help <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </div>

        <CustomerLogoRow />
      </div>
    </section>
  );
}
