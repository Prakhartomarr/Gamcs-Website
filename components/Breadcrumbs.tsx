import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export type Crumb = { label: string; href: string };

/**
 * Breadcrumb trail for nested routes. Never rendered on the homepage — a
 * single "Home" crumb is noise, and Google ignores one-item trails.
 *
 * The last crumb is the current page: it is plain text with aria-current,
 * not a link to itself. The separators are decorative and hidden from
 * assistive tech, which reads the ordered list instead.
 */
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const full: Crumb[] = [{ label: "Home", href: "/" }, ...trail];
  if (full.length < 2) return null;

  return (
    <>
      <nav aria-label="Breadcrumb" className="crumbs">
        <ol>
          {full.map((c, i) => {
            const last = i === full.length - 1;
            return (
              <li key={c.href}>
                {last ? (
                  <span aria-current="page">{c.label}</span>
                ) : (
                  <Link href={c.href}>{c.label}</Link>
                )}
                {!last && (
                  <span className="crumbs-sep" aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(full)} />
    </>
  );
}
