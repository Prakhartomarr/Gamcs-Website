import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import CookiePreferencesLink from "@/components/CookiePreferencesLink";
import { fill, type Part } from "@/lib/content/fill";
import { legal } from "@/lib/content/legal";

/**
 * Renders a paragraph written as parts in the content modules, so every piece
 * of text stays a plain string there (see lib/content/fill.ts). `vars` fills
 * the `{name}` slots — usually the site's email, legal name or URL.
 */
export default function Rich({
  parts,
  vars = {},
}: {
  parts: readonly Part[];
  vars?: Record<string, string>;
}) {
  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === "string") return <Fragment key={i}>{fill(p, vars)}</Fragment>;
        const text = fill(p.text, vars);
        if (p.tbc) {
          return (
            <mark key={i} className="tbc">
              {legal.tbcPrefix}
              {text}
            </mark>
          );
        }
        if (p.action === "cookie-prefs") {
          return <CookiePreferencesLink key={i} className="legal-inline-button" label={text} />;
        }
        let node: ReactNode = text;
        if (p.href) {
          const href = fill(p.href, vars);
          const ext = p.external ? { target: "_blank", rel: "noopener" } : {};
          node = href.startsWith("/") ? (
            <Link href={href} {...ext}>{text}</Link>
          ) : (
            <a href={href} {...ext}>{text}</a>
          );
        }
        if (p.em) node = <em>{node}</em>;
        if (p.strong) node = <strong>{node}</strong>;
        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}
