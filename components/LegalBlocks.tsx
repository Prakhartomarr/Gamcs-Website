import Rich from "@/components/Rich";
import { GA_ID } from "@/lib/analytics";
import type { LegalBlock } from "@/lib/content/legal";

/** The body of a legal page: headings, paragraphs and lists from lib/content/legal.ts. */
export default function LegalBlocks({
  blocks,
  vars,
}: {
  blocks: readonly LegalBlock[];
  vars: Record<string, string>;
}) {
  return (
    <div className="legal-body">
      {blocks.map((b, i) => {
        if ("h2" in b) return <h2 key={i}>{b.h2}</h2>;
        if ("ul" in b) {
          return (
            <ul key={i}>
              {b.ul.map((parts, j) => (
                <li key={j}>
                  <Rich parts={parts} vars={vars} />
                </li>
              ))}
            </ul>
          );
        }
        if (b.when && (b.when === "ga") !== Boolean(GA_ID)) return null;
        return (
          <p key={i}>
            <Rich parts={b.p} vars={vars} />
          </p>
        );
      })}
    </div>
  );
}
