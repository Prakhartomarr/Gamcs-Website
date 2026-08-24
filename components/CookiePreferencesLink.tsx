"use client";

import { openCookiePreferences } from "@/lib/consent";

/**
 * Reopens the consent panel. A button rather than a link, because it changes
 * state instead of navigating — used in the footer and in the privacy policy,
 * which is what makes the choice revocable at any time.
 */
export default function CookiePreferencesLink({
  className,
  label = "Cookie Preferences",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button type="button" className={className} onClick={openCookiePreferences}>
      {label}
    </button>
  );
}
