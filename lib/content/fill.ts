/**
 * Fills `{name}` slots in a content string: fill("Step {n} of 3", { n: 2 }).
 * Unknown slots are left as written, so a typo in the copy shows up on the
 * page instead of disappearing.
 */
export const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/**
 * One piece of a paragraph that mixes plain text with links or emphasis.
 * A bare string is plain text; an object adds one treatment. `{name}` slots
 * in `text` and `href` are filled by the renderer (components/Rich.tsx).
 */
export type Part =
  | string
  | {
      text: string;
      href?: string;
      /** open in a new tab */
      external?: boolean;
      strong?: boolean;
      em?: boolean;
      /** a visible "to be confirmed" placeholder on the legal pages */
      tbc?: boolean;
      /** a button that reopens the cookie preferences panel */
      action?: "cookie-prefs";
    };
