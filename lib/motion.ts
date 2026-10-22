/**
 * The motion scale for GSAP, mirroring the CSS tokens in globals.css
 * (--ease-out, --ease-in-out, --dur-press, --dur-panel, --dur-reveal) so a
 * tween and a CSS transition on the same page move in one vocabulary.
 * `power4.out` is the GSAP curve the codebase already uses for --ease-out's
 * cubic-bezier(0.23, 1, 0.32, 1).
 *
 * Durations are seconds, GSAP's unit.
 */
export const ease = {
  /** Things arriving or settling: --ease-out. */
  out: "power4.out",
  /** Things travelling between two resting places: --ease-in-out. */
  inOut: "power3.inOut",
  /** A release after a drag: fast off the finger, long soft landing. */
  snap: "expo.out",
} as const;

export const dur = {
  /** --dur-press: a tap's own feedback. */
  press: 0.16,
  /** --dur-panel, rounded down: content answering a pick. */
  swap: 0.22,
  /** A snap to the nearest stop after a drag or tap. */
  snap: 0.7,
  /** --dur-reveal: an entrance. */
  reveal: 0.56,
} as const;

/** Stagger between siblings in one entrance. */
export const stagger = 0.07;

/** Read the reduced-motion preference outside React (tweens, observers). */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
