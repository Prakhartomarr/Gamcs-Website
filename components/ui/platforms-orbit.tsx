"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CarouselItem } from "@/components/ui/feature-carousel";

/**
 * The platforms band below `lg` (client, 2026-10-23: the stacked pill picker
 * read as a settings menu on phones). One category at a time: its tools orbit
 * a hub carrying the category icon, and a pulse runs down each spoke into the
 * hub, so "we integrate these" is the picture rather than a caption. A rail
 * of chips above picks the category; a swipe across the orbit (which drags
 * the dial with the finger) or the arrows step through them. The panel under
 * the orbit names every tool, so the logos never have to be legible on their
 * own; the orbit is aria-hidden for that reason.
 *
 * Motion budget, kept small for mid-range phones: the spin, the pulses and the
 * autoplay bar are CSS transform/opacity animations on the compositor. GSAP
 * only runs the half-second swap between categories and the dial's spring
 * back. Every timeline is held in a ref and killed on cleanup: a killed tween
 * leaves GSAP's global timeline, a paused or finished one would keep its
 * removed tiles alive (see MotionLayer, 2026-10-22). No gsap.context either,
 * since it keeps every tween it records until it is reverted, which autoplay
 * would grow by two timelines every few seconds.
 *
 * Autoplay steps every 5s while the band is on screen and stops for good at
 * the first tap, swipe or key. Under prefers-reduced-motion the CSS drops the
 * spin, pulses and autoplay bar, and swaps happen without tweens; the setting
 * is read in handlers and effects only, never during render, so the server
 * and first client render agree (the logo-clouds hydration fix, 2026-10-22).
 */
const SWIPE = 40;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function PlatformsOrbit({ items }: { items: CarouselItem[] }) {
  /* `active` follows the visitor at once (chip, counter); `shown` is what the
     orbit and panel hold, and trails `active` by the out-tween. */
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const inTl = useRef<gsap.core.Timeline | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const entered = useRef(false);
  const len = items.length;
  const item = items[shown];

  const go = (i: number, byUser = true) => {
    setActive(((i % len) + len) % len);
    if (byUser) setAuto(false);
  };

  /* The parts that assemble on entry and after every swap: spokes draw out
     from the hub, tiles spring onto them, the panel's lines rise in turn. */
  const playIn = () => {
    const root = rootRef.current;
    if (!root || reduced()) return;
    const q = gsap.utils.selector(root);
    inTl.current?.kill();
    inTl.current = gsap
      .timeline()
      .fromTo(q(".po-ray"), { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: "power3.out", stagger: 0.04 })
      .fromTo(q(".po-tile"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)", stagger: 0.05 }, 0.08)
      .fromTo(q(".po-hub"), { scale: 0.86 }, { scale: 1, duration: 0.8, ease: "elastic.out(1,0.45)" }, 0)
      .fromTo(q(".po-read > *"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.05 }, 0.05);
  };

  useEffect(() => {
    const root = rootRef.current!;
    const dial = dialRef.current;
    /* Two thresholds: any pixel in view assembles the orbit once, a third
       of it in view runs autoplay. */
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !entered.current) {
          entered.current = true;
          playIn();
        }
        setInView(e.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35] },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      inTl.current?.kill();
      if (dial) gsap.killTweensOf(dial);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only; playIn reads refs
  }, []);

  /* Out: the current tiles fall into the hub, then the swap. A second tap
     mid-flight kills this and starts again from wherever the tiles are. */
  useEffect(() => {
    if (active === shown) return;
    if (reduced()) {
      setShown(active);
      return;
    }
    const q = gsap.utils.selector(rootRef.current);
    inTl.current?.kill();
    const tl = gsap
      .timeline({ onComplete: () => setShown(active) })
      .to(q(".po-tile"), { scale: 0, opacity: 0, duration: 0.22, ease: "power2.in", stagger: 0.02 })
      .to(q(".po-ray"), { scaleY: 0, duration: 0.2, ease: "power2.in" }, 0)
      .to(q(".po-read > *"), { opacity: 0, y: -6, duration: 0.18 }, 0);
    return () => {
      tl.kill();
    };
  }, [active, shown]);

  // In: runs before paint so the new tiles never flash at full size.
  const swapped = useRef(false);
  useLayoutEffect(() => {
    /* New tiles start their counter-spin at zero while the ring is already
       part-way round, which leaves every logo tilted. Starting their clocks
       when the ring's started puts the two spins back in step. */
    const root = rootRef.current!;
    const t = root.querySelector(".po-spin")?.getAnimations()[0]?.startTime;
    if (t != null) root.querySelectorAll(".po-upright").forEach((u) => u.getAnimations().forEach((a) => (a.startTime = t)));
    if (!swapped.current) {
      swapped.current = true;
      return;
    }
    playIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the swap only
  }, [shown]);

  // Keep the picked chip in the rail's view without moving the page.
  useEffect(() => {
    const rail = railRef.current;
    const tab = rail?.querySelectorAll<HTMLElement>("[role=tab]")[active];
    if (!rail || !tab) return;
    rail.scrollTo({
      left: tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2,
      behavior: reduced() ? "auto" : "smooth",
    });
  }, [active]);

  const onKey = (e: KeyboardEvent) => {
    const to = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: len - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const i = ((to % len) + len) % len;
    go(i);
    railRef.current?.querySelectorAll<HTMLElement>("[role=tab]")[i]?.focus();
  };

  /* The swipe. `touch-action: pan-y` leaves vertical scrolling to the
     browser, which cancels the pointer when it takes over. */
  const onDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: PointerEvent) => {
    if (!drag.current || reduced()) return;
    gsap.set(dialRef.current, { rotation: (e.clientX - drag.current.x) * 0.25 });
  };
  const onUp = (e: PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (e.type === "pointerup" && Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(e.clientY - d.y)) go(active + (dx < 0 ? 1 : -1));
    if (!reduced()) gsap.to(dialRef.current, { rotation: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
  };

  const n = item.tools.length;
  const pad = (v: number) => String(v).padStart(2, "0");

  return (
    <div ref={rootRef} className="po" data-play={inView && auto ? "on" : "off"} data-auto={auto ? "on" : "off"}>
      <div ref={railRef} className="po-rail" role="tablist" aria-label="Tool categories" onKeyDown={onKey}>
        {items.map((it, i) => (
          <button
            key={it.id}
            id={`po-tab-${it.id}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="po-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => go(i)}
            className="po-tab"
          >
            {it.chip}
            {i === active && <span className="po-fill" aria-hidden onAnimationEnd={() => go(active + 1, false)} />}
          </button>
        ))}
      </div>

      <div
        className="po-stage"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div ref={dialRef} className="po-dial" aria-hidden>
          <span className="po-ring" />
          <span className="po-ring po-ring--in" />
          <div className="po-spin">
            {item.tools.map((tool, i) => (
              <div key={`${item.id}-${tool.name}`} className="po-arm" style={{ "--a": `${(360 / n) * i}deg`, "--i": i } as CSSProperties}>
                <span className="po-ray">
                  <span className="po-pulse" />
                </span>
                <span className="po-node">
                  <span className="po-upright">
                    <span className="po-tile">
                      {/* eslint-disable-next-line @next/next/no-img-element -- mixed svg/png/jpg logos at intrinsic ratio */}
                      <img src={tool.src} alt="" loading="lazy" draggable={false} />
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>
          <span className="po-hub">{item.icon}</span>
        </div>
        <button type="button" className="po-step po-step--prev" aria-label="Previous category" onClick={() => go(active - 1)}>
          <ChevronLeft size={20} />
        </button>
        <button type="button" className="po-step po-step--next" aria-label="Next category" onClick={() => go(active + 1)}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Autoplay would announce every step, so the panel is only live once
          the visitor is driving. */}
      <div id="po-panel" className="po-read" role="tabpanel" aria-labelledby={`po-tab-${item.id}`} aria-live={auto ? "off" : "polite"}>
        <p className="po-count">
          {pad(shown + 1)} / {pad(len)} <span>·</span> {n} platforms
        </p>
        <h3 className="po-title">{item.title}</h3>
        <ul className="po-tools">
          {item.tools.map((tool) => (
            <li key={tool.name}>{tool.name}</li>
          ))}
        </ul>
        <p className="po-desc">{item.description}</p>
      </div>
    </div>
  );
}
