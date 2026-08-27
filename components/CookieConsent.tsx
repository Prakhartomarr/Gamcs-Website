"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CTA from "@/components/CTA";
import {
  CONSENT_CHANGED,
  OPEN_PREFERENCES,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * Cookie consent banner plus the preferences panel behind it.
 *
 * Two deliberate structural choices:
 *
 *  - The banner is a non-modal region. It asks for a decision but must not
 *    trap focus, or a visitor could not read the privacy policy it links to
 *    before deciding.
 *  - The preferences panel is a native <dialog> opened with showModal(). That
 *    is where modality is correct, and the platform then provides the focus
 *    trap, Escape-to-close, inert background and backdrop for free — none of
 *    which is worth hand-rolling.
 *
 * Nothing renders on the server: the decision lives in localStorage, so the
 * first client effect is the earliest point at which the answer is known.
 * That also means no hydration mismatch and no flash of a banner for someone
 * who already chose.
 */
export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* Decide once, on mount, whether a choice is still outstanding. */
  useEffect(() => {
    const stored = readConsent();
    if (stored) setAnalytics(stored.analytics);
    else setShowBanner(true);
  }, []);

  /*
   * The banner and the sticky mobile CTA both live at the bottom of the
   * viewport. Flagging the root lets CSS stand the CTA down while a decision
   * is pending, rather than stacking two bars on a phone.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (showBanner) root.dataset.cookieBanner = "";
    else delete root.dataset.cookieBanner;
    return () => {
      delete root.dataset.cookieBanner;
    };
  }, [showBanner]);

  const openPanel = useCallback(() => {
    /* Always open showing what is actually stored, not stale local state. */
    setAnalytics(readConsent()?.analytics ?? false);
    dialogRef.current?.showModal();
  }, []);

  /* The footer and the privacy policy reopen the panel through this event. */
  useEffect(() => {
    window.addEventListener(OPEN_PREFERENCES, openPanel);
    return () => window.removeEventListener(OPEN_PREFERENCES, openPanel);
  }, [openPanel]);

  /* Keep the switch honest if the choice changes from anywhere else. */
  useEffect(() => {
    const sync = () => setAnalytics(readConsent()?.analytics ?? false);
    window.addEventListener(CONSENT_CHANGED, sync);
    return () => window.removeEventListener(CONSENT_CHANGED, sync);
  }, []);

  /** Record a decision. Accept, reject and save all land here. */
  const decide = (value: boolean) => {
    writeConsent(value);
    setAnalytics(value);
    setShowBanner(false);
    dialogRef.current?.close();
  };

  return (
    <>
      {showBanner && (
        <div
          className="cookie-banner"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-body"
        >
          <div className="cookie-banner-inner">
            <div className="cookie-banner-copy">
              <h2 id="cookie-banner-title">We use cookies</h2>
              <p id="cookie-banner-body">
                We use essential cookies to run this site, and — only if you
                agree — analytics cookies to understand how visitors use it. You
                can change your mind anytime from the link in our footer.
              </p>
            </div>

            <div className="cookie-banner-actions">
              <CTA type="button" onClick={() => decide(true)}>
                Accept all
              </CTA>
              <CTA tier="secondary" type="button" onClick={() => decide(false)}>
                Reject non-essential
              </CTA>
              <button type="button" className="cookie-link" onClick={openPanel}>
                Manage preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <dialog
        className="cookie-panel"
        ref={dialogRef}
        aria-labelledby="cookie-panel-title"
      >
        <div className="cookie-panel-inner">
          <h2 id="cookie-panel-title">Manage preferences</h2>

          <ul className="cookie-cats">
            <li>
              <div className="cookie-cat-head">
                <span className="cookie-cat-name">Essential</span>
                <span className="cookie-cat-locked">Always on</span>
              </div>
              <p>Required for the site to function. Cannot be turned off.</p>
            </li>

            <li>
              <div className="cookie-cat-head">
                <label className="cookie-cat-name" htmlFor="cookie-analytics">
                  Analytics (GA4)
                </label>
                {/* A real checkbox with role="switch": keyboard operable and
                    announced as on/off, with no custom key handling. */}
                <input
                  id="cookie-analytics"
                  className="cookie-switch"
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.currentTarget.checked)}
                />
              </div>
              <p>
                Helps us understand which pages are useful, using Google
                Analytics. No data is sold or used for advertising.
              </p>
            </li>
          </ul>

          <div className="cookie-panel-actions">
            <CTA type="button" onClick={() => decide(analytics)}>
              Save preferences
            </CTA>
            {/* Cancel leaves the banner up if no choice has been made yet —
                closing the panel is not itself a decision. */}
            <button
              type="button"
              className="cookie-link"
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
          </div>

          <p className="cookie-panel-note">
            Full detail in our{" "}
            <Link
              href="/privacy-policy"
              onClick={() => dialogRef.current?.close()}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </dialog>
    </>
  );
}
