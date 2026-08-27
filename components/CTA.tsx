import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * The one way a call to action is rendered in GAMCS-authored code.
 *
 * There used to be two button systems: the hand-written `.btn` pill and
 * shadcn's `buttonVariants`, which drew the same "Schedule a Call" two
 * different ways on the same screen — 44px vs 41px, a 999px pill vs a 13.5px
 * radius, 14px/700 vs 15.75px/500. This component removes the second one.
 *
 * It deliberately introduces no new visual. Each tier maps onto a treatment
 * that already exists in globals.css, so unifying the call sites is not also a
 * restyle:
 *
 *   primary   -> .btn.btn-shimmer   filled pill, the one conversion action
 *   secondary -> .btn.btn-light     outlined pill
 *   tertiary  -> .fsvc-link         the lighter in-card link treatment
 *
 * Renders a `<Link>` when given `href`, otherwise a `<button>`, so form
 * submits and dialog actions use the same component as navigation.
 *
 * `data-press` is applied to primary and secondary here rather than at each
 * call site. MotionLayer binds the press micro-interaction to `[data-press]`,
 * and previously three cookie-banner buttons carried `.btn` without it and so
 * sat still when pressed.
 */
export type CtaTier = "primary" | "secondary" | "tertiary";

/** Trailing glyph. `diagonal` marks a conversion, `arrow` marks navigation. */
export type CtaIcon = "arrow" | "diagonal" | "none";

const TIER_CLASS: Record<CtaTier, string> = {
  primary: "btn btn-shimmer",
  secondary: "btn btn-light",
  tertiary: "fsvc-link",
};

const GLYPH: Record<Exclude<CtaIcon, "none">, string> = {
  arrow: "→",
  diagonal: "↗",
};

type Common = {
  tier?: CtaTier;
  icon?: CtaIcon;
  className?: string;
  children: ReactNode;
  /** Announced instead of the visible label where the label alone is vague. */
  srSuffix?: string;
};

type AsLink = Common & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >;
type AsButton = Common & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export default function CTA(props: AsLink | AsButton) {
  const {
    tier = "primary",
    icon = "none",
    className,
    children,
    srSuffix,
    ...rest
  } = props as Common & { href?: string } & Record<string, unknown>;

  const classes = [TIER_CLASS[tier], className].filter(Boolean).join(" ");
  const glyph = icon === "none" ? null : <span aria-hidden="true">{GLYPH[icon]}</span>;

  /* The pill tiers wrap their content: .btn-shimmer paints a sheen sweep in a
     pseudo-element under the label, so the label needs its own stacking
     context. .fsvc-link has no such layer and takes its children directly. */
  const content =
    tier === "tertiary" ? (
      <>
        {children}
        {srSuffix ? <span className="sr-only"> {srSuffix}</span> : null}
        {glyph ? <> {glyph}</> : null}
      </>
    ) : (
      <span className="btn-label">
        {children}
        {srSuffix ? <span className="sr-only"> {srSuffix}</span> : null}
        {glyph ? <> {glyph}</> : null}
      </span>
    );

  const press = tier === "tertiary" ? {} : { "data-press": "" };

  if (typeof props.href === "string") {
    const { href, ...linkRest } = rest as { href: string } & Record<string, unknown>;
    return (
      <Link className={classes} href={href} {...press} {...linkRest}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...press} {...(rest as ComponentPropsWithoutRef<"button">)}>
      {content}
    </button>
  );
}
