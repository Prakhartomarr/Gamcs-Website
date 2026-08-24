/**
 * The diagonal brand band plus the two ghost frames that sit inside it —
 * the reference's depth trick: empty outlined panels implying more product
 * surfaces receding behind the real cards.
 */
export default function HeroBand() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="band" />
      <div className="ghost g1">
        <span className="sp">✦</span>
      </div>
      <div className="ghost g2">
        <span className="sp">✦</span>
      </div>
      <span className="hero-sparkle s1">✦</span>
      <span className="hero-sparkle s2">✦</span>
      <span className="hero-sparkle s3">✦</span>
    </div>
  );
}
