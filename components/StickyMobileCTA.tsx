"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryCta, site } from "@/lib/content/gamcs";

/** Routes where a persistent CTA would be redundant or in the way. */
const HIDDEN_ON = ["/contact", "/thank-you"];

/**
 * Mobile-only call to action pinned to the bottom of the viewport.
 *
 * Visibility is driven by two IntersectionObservers, never by a scroll
 * handler — the bar appears once the first block of the page (which already
 * carries its own CTA) has scrolled away, and retreats again when the footer
 * arrives, so it never sits on top of the footer's links or the last line of
 * content. That also means nothing needs to reserve space for it.
 *
 * `env(safe-area-inset-bottom)` keeps it clear of the iOS home indicator, and
 * it sits below the header's z-index so an open nav drawer covers it.
 */
export default function StickyMobileCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    if (HIDDEN_ON.includes(pathname)) return;
    /* Desktop never gets the bar, so don't observe anything there. */
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const top = document.querySelector("main > *:first-child");
    const foot = document.querySelector("footer");
    let topGone = false;
    let footIn = false;
    const sync = () => setShow(topGone && !footIn);

    const observers: IntersectionObserver[] = [];
    if (top) {
      const io = new IntersectionObserver(
        ([e]) => {
          topGone = !e.isIntersecting;
          sync();
        },
        { threshold: 0 }
      );
      io.observe(top);
      observers.push(io);
    }
    if (foot) {
      const io = new IntersectionObserver(
        ([e]) => {
          footIn = e.isIntersecting;
          sync();
        },
        { threshold: 0 }
      );
      io.observe(foot);
      observers.push(io);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [pathname]);

  return (
    <div className="sticky-cta" data-show={show ? "" : undefined} aria-hidden={!show}>
      <a
        className="btn btn-shimmer"
        href={primaryCta.href}
        data-cta="sticky-mobile"
        data-press
        tabIndex={show ? undefined : -1}
      >
        <span className="btn-label">
          {primaryCta.label} <span aria-hidden="true">↗</span>
        </span>
      </a>
      {/* Rendered only if the business has stated a real reply time. */}
      {site.responseTime ? (
        <p className="sticky-cta-note">{site.responseTime}</p>
      ) : null}
    </div>
  );
}
