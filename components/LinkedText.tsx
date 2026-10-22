import { itemLinks } from "@/lib/content/gamcs";

/**
 * A capability-list item with any phrase in `itemLinks` turned into an
 * outbound link (client, 2026-10-22: "FinSensor AI" -> finsensor.ai). Text
 * with no such phrase renders as itself.
 */
export default function LinkedText({ text }: { text: string }) {
  const phrase = Object.keys(itemLinks).find((p) => text.includes(p));
  if (!phrase) return <>{text}</>;
  const at = text.indexOf(phrase);
  return (
    <>
      {text.slice(0, at)}
      <a className="cap-link" href={itemLinks[phrase]} target="_blank" rel="noopener">
        {phrase}
      </a>
      {text.slice(at + phrase.length)}
    </>
  );
}
