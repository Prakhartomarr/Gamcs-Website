import { hasAnalyticsConsent } from "@/lib/consent";

/**
 * Thin wrapper over gtag.
 *
 * Every call is a no-op when analytics is not configured (no measurement ID,
 * server render, a blocker) or when the visitor has not opted in, so callers
 * never need to guard. The ID lives in NEXT_PUBLIC_GA_ID — nothing is
 * hardcoded, and a GA4 measurement ID is public by design, so it is the one
 * class of value that belongs in a NEXT_PUBLIC_ var.
 *
 * The consent check is here rather than only at the script tag because
 * revoking consent cannot unload a script that has already run: gtag stays
 * defined, so this is what actually stops events being sent afterwards.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function track(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;
  window.gtag?.("event", event, params);
}
