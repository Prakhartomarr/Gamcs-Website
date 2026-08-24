/**
 * Numbered section eyebrow: a filled counter chip beside an outlined label
 * pill. The reference uses it to number the page's argument, which also gives
 * every section a consistent entry point.
 */
export default function SectionEyebrow({
  n,
  label,
}: {
  n: number;
  label: string;
}) {
  return (
    <div className="eyebrow-row">
      <span className="eyebrow-n" aria-hidden="true">
        {n}
      </span>
      <span className="eyebrow-pill">{label}</span>
    </div>
  );
}
