/**
 * Abstract brand panels that stand in for photography.
 *
 * Inline SVG rather than image files: no request, no layout shift, crisp at
 * any size, and — the reason it exists — nothing here depicts people or places
 * that are not GAMCS. Each variant is a different composition so a pair of
 * panels does not read as the same tile twice.
 */
export default function AbstractPanel({
  variant,
  className = "",
  ratio = "438 / 346",
}: {
  variant: "rings" | "ribbons";
  className?: string;
  /** CSS aspect-ratio, matched to the slot it fills. */
  ratio?: string;
}) {
  return (
    <div
      className={`abstract-panel ${className}`}
      style={{ aspectRatio: ratio }}
      aria-hidden="true"
    >
      {variant === "rings" ? <Rings /> : <Ribbons />}
    </div>
  );
}

function Rings() {
  return (
    <svg viewBox="0 0 438 346" preserveAspectRatio="xMidYMid slice" role="presentation">
      <defs>
        <linearGradient id="ap-ground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4F8FB" />
          <stop offset="100%" stopColor="#DCE8F2" />
        </linearGradient>
        <linearGradient id="ap-arc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3E8CC4" />
          <stop offset="100%" stopColor="#0F5E97" />
        </linearGradient>
      </defs>
      <rect width="438" height="346" fill="url(#ap-ground)" />
      {/* concentric arcs, weight increasing inward */}
      {[150, 122, 94, 66].map((r, i) => (
        <circle
          key={r}
          cx="300"
          cy="250"
          r={r}
          fill="none"
          stroke="url(#ap-arc)"
          strokeWidth={1 + i * 0.9}
          strokeOpacity={0.22 + i * 0.16}
        />
      ))}
      <circle cx="300" cy="250" r="30" fill="#0F5E97" fillOpacity="0.9" />
      <rect x="42" y="52" width="54" height="4" rx="2" fill="#0F5E97" fillOpacity=".85" />
      <rect x="42" y="70" width="96" height="4" rx="2" fill="#0F5E97" fillOpacity=".38" />
      <rect x="42" y="88" width="72" height="4" rx="2" fill="#F2C230" fillOpacity=".85" />
    </svg>
  );
}

function Ribbons() {
  return (
    <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" role="presentation">
      <defs>
        <linearGradient id="ap-bg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E6EFF7" />
        </linearGradient>
        <linearGradient id="ap-band" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0F5E97" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#0F5E97" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3E8CC4" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <rect width="900" height="600" fill="url(#ap-bg2)" />
      {/* the hero's diagonal ribbon motif, restated as flat geometry */}
      {[-160, -40, 80, 200, 320, 440, 560].map((x, i) => (
        <polygon
          key={x}
          points={`${x},600 ${x + 46 + (i % 3) * 18},600 ${x + 386 + (i % 3) * 18},0 ${x + 340},0`}
          fill="url(#ap-band)"
          opacity={i % 2 === 0 ? 0.5 : 0.22}
        />
      ))}
      <rect x="0" y="0" width="900" height="600" fill="#FFFFFF" fillOpacity="0.22" />
    </svg>
  );
}
