"use client";

import { useState } from "react";
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from "shaders/react";

/**
 * The hero's WebGL shader stack — the same stack as the standalone build, so
 * the two heroes render identically.
 *
 * Two things this has to get right that the standalone build did not:
 *
 *  - `shaders` is ESM-only with no `require` export, and it touches WebGL at
 *    import time. It must never reach the server renderer, so the only import
 *    of this file is a `next/dynamic` with `ssr: false`.
 *  - The package's own note is that on a GPU it cannot use, the canvas stays
 *    transparent for good and nothing is logged. On a marketing hero that is
 *    a silent blank, so `onUnavailable` swaps in a static approximation of the
 *    same banding.
 */
export default function HeroShader() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="hero-shader-fallback"
        aria-hidden="true"
        style={{
          background:
            "repeating-linear-gradient(115deg, #ffffff 0px, #ffffff 42px, #f4f7fa 74px, #e9eff5 108px, #dbe6f0 132px, #ffffff 176px)",
        }}
      />
    );
  }

  return (
    <Shader className="hero-shader" onUnavailable={() => setFailed(true)}>
      <Swirl colorA="#ffffff" colorB="#eef2f6" detail={1.7} />
      <ChromaFlow
        baseColor="#ffffff"
        downColor="#3D6EA0"
        leftColor="#3D6EA0"
        rightColor="#3D6EA0"
        upColor="#3D6EA0"
        momentum={13}
        radius={3.5}
      />
      <FlutedGlass
        aberration={0.61}
        angle={31}
        frequency={8}
        highlight={0.12}
        highlightSoftness={0}
        lightAngle={-90}
        refraction={4}
        shape="rounded"
        softness={1}
        speed={0.15}
      />
      <FilmGrain strength={0.05} />
    </Shader>
  );
}
