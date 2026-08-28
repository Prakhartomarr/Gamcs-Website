"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { GA_ID, track } from "@/lib/analytics";
import { CONSENT_CHANGED, hasAnalyticsConsent } from "@/lib/consent";

/**
 * Google Analytics 4, gated on consent, plus conversion tracking for the two
 * actions that matter: clicking a call to action and submitting the contact
 * form.
 *
 * Nothing is requested from Google until the visitor opts in — the <Script>
 * tags are not rendered at all until then, so a first-time visitor loads zero
 * third-party JavaScript and no cookie is set. Granting consent later mounts
 * them without a reload; withdrawing it unmounts them and tells gtag to stop
 * writing storage, because a script that has already executed cannot be
 * recalled (`track` refuses to send events either way).
 *
 * Mounted exactly once, in the root layout, so gtag can never initialise
 * twice. When NEXT_PUBLIC_GA_ID is unset the whole thing is inert.
 *
 * CTA clicks are caught by a single delegated listener rather than by editing
 * every button. Clicks are rare enough that delegation costs nothing, and it
 * means a new CTA is tracked the moment it is added.
 */
export default function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const sync = () => setAllowed(hasAnalyticsConsent());
    sync();
    window.addEventListener(CONSENT_CHANGED, sync);
    return () => window.removeEventListener(CONSENT_CHANGED, sync);
  }, []);

  /* Consent Mode: the one thing that stops GA's own automatic collection
     after the script is already in the page. Only meaningful once gtag
     exists, which is why it is keyed on `allowed` rather than run on mount. */
  useEffect(() => {
    if (!GA_ID) return;
    window.gtag?.("consent", "update", {
      analytics_storage: allowed ? "granted" : "denied",
    });
  }, [allowed]);

  /* Attached whenever GA is configured; `track` applies the consent check, so
     there is no listener to add and remove as the choice changes. */
  useEffect(() => {
    if (!GA_ID) return;

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const link = el?.closest<HTMLAnchorElement | HTMLButtonElement>(
        "a.btn, [data-cta]"
      );
      if (!link) return;
      track("cta_click", {
        cta_text: link.textContent?.trim().slice(0, 80) ?? "",
        cta_location: link.getAttribute("data-cta") ?? "body",
        link_url: link.getAttribute("href") ?? "",
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('consent','default',{analytics_storage:'granted'});
gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
