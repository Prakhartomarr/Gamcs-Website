"use client";

import Velaris, { VELARIS_MOTION } from "@/components/ui/velaris";

/**
 * The fluted navy ground, alive.
 *
 * One component for all three surfaces that carry `--flute-ground` — the
 * homepage contact panel, the solutions accordion card and the closing CTA
 * band on the inner pages — so the palette and the pace are defined once
 * rather than three times with room to drift.
 *
 * IT SITS BEHIND, NOT INSTEAD OF. The panel keeps `background:
 * var(--flute-ground)`; this is a `z-index:-1` layer inside an
 * `isolation:isolate` panel, which paints it above the panel's own background
 * and below every one of its children without a single child needing a
 * z-index of its own. Everything that can go wrong with WebGL — absent,
 * blacklisted, a failed compile — leaves the canvas never drawn and therefore
 * transparent, so the photograph shows and the panel is exactly what shipped
 * before it. Reduce Motion gets one still frame rather than nothing.
 *
 * Velaris is the same component the solution cards already use; `layer` was
 * added to it for this, and nothing else about it changed.
 *
 * THE PALETTE IS NOT THE DEMO'S. The supplied greens are replaced by the
 * brand's own navies, and the ORDER matters rather than just the values:
 * the shader adds `u_colors[1] * glow` at the centre, so whatever sits in
 * slot 1 is the only colour that gets added rather than mixed. It is
 * --blue-dark (#0A4169, 10.6:1 against white) for that reason — the brighter
 * --blue sits in slot 0 where it is only ever mixed toward. White body text
 * and the white CTA pill both sit on these panels.
 */

/* Module constants: a literal here would be a new array every render. */
const BG = "#081A2C";
const COLORS = ["#0F5E97", "#0A4169", "#14568A", "#05182B"];

export default function FluteShader() {
  return (
    <Velaris
      layer
      bg={BG}
      colors={COLORS}
      /* Speed, grain and dpr come from the one shared constant, so these
         panels and the solution cards move at the same rate by construction
         rather than by two numbers happening to agree. */
      {...VELARIS_MOTION}
      className="flute-shader"
    />
  );
}
