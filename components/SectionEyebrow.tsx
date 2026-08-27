/**
 * Section eyebrow: an outlined label pill.
 *
 * It used to lead with a filled counter chip numbering the page's argument,
 * but only five sections ever adopted it while the rest used .fin-eyebrow, so
 * the homepage counted 1, 5, 6, 7 — a sequence that advertised gaps rather
 * than structure. The wrapper stays because it carries the rhythm below the
 * pill, which the sections rely on.
 */
export default function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="eyebrow-row">
      <span className="eyebrow-pill">{label}</span>
    </div>
  );
}
