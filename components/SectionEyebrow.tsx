/**
 * Section eyebrow: an outlined label pill.
 *
 * It used to lead with a filled counter chip numbering the page's argument,
 * but only five sections ever adopted it while the rest used .fin-eyebrow, so
 * the homepage counted 1, 5, 6, 7 — a sequence that advertised gaps rather
 * than structure. The wrapper stays because it carries the rhythm below the
 * pill, which the sections rely on.
 */
export default function SectionEyebrow({ label, index }: { label: string; index?: string }) {
  return (
    <div className="eyebrow-row">
      {/* Phones only: the homepage numbers its sections ("05 —— OUR
          ACHIEVEMENTS") instead of showing the pill. Decorative, so hidden from
          the accessibility tree; display:none above 768px. */}
      {index ? (
        <span className="eyebrow-num" aria-hidden="true">
          {index}
        </span>
      ) : null}
      <span className="eyebrow-pill">{label}</span>
    </div>
  );
}
