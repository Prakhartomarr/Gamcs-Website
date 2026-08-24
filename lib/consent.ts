/**
 * Cookie-consent store.
 *
 * The choice lives in localStorage rather than a cookie so it is inspectable,
 * survives a reload, and does not itself get swept up by a cookie blocker.
 * Everything that depends on it (currently only GA4) reads through here, and
 * a window event lets consent be granted or withdrawn without a page reload.
 */
export type ConsentChoice = {
  analytics: boolean;
  /** ISO 8601. Evidence of when consent was given, if it is ever queried. */
  timestamp: string;
};

export const CONSENT_KEY = "gamcs_cookie_consent";

/** Fired on `window` whenever the stored choice changes. */
export const CONSENT_CHANGED = "gamcs:consent-change";

/** Fired on `window` to reopen the preferences panel from anywhere. */
export const OPEN_PREFERENCES = "gamcs:open-cookie-preferences";

/*
 * In-memory mirror of the stored value.
 *
 * `undefined` means "not read yet"; `null` means "read, and there is no
 * choice". Keeping the mirror means the decision still holds for the rest of
 * the session when localStorage throws — Safari private browsing and
 * locked-down enterprise profiles both do — instead of the banner reappearing
 * on every navigation.
 */
let cache: ConsentChoice | null | undefined;

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  if (cache !== undefined) return cache;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cache =
      parsed !== null &&
      typeof parsed === "object" &&
      typeof (parsed as ConsentChoice).analytics === "boolean"
        ? (parsed as ConsentChoice)
        : null;
  } catch {
    /* unreadable or corrupt — treat as no choice, and ask again */
    cache = null;
  }
  return cache;
}

export function writeConsent(analytics: boolean): ConsentChoice {
  const choice: ConsentChoice = {
    analytics,
    timestamp: new Date().toISOString(),
  };
  cache = choice;
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(choice));
  } catch {
    /* storage unavailable; the mirror above still holds it for this session */
  }
  window.dispatchEvent(
    new CustomEvent<ConsentChoice>(CONSENT_CHANGED, { detail: choice })
  );
  return choice;
}

/** True only on an explicit opt-in. No stored choice means no consent. */
export const hasAnalyticsConsent = (): boolean =>
  readConsent()?.analytics === true;

export const openCookiePreferences = (): void => {
  window.dispatchEvent(new Event(OPEN_PREFERENCES));
};
