"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import type { COBEOptions, Marker } from "cobe";
import CTA from "@/components/CTA";

/* ----------------------------------------------------------------
 * GlobeFeatureSection
 *
 * A rotating dotted globe beside a two-tone lead paragraph and a CTA.
 *
 * The 21st.dev original is behind a paywalled registry (HTTP 403), so
 * this is an equivalent built directly on `cobe` — the same library the
 * reference uses — in the site's light palette.
 *
 * Three things the naive version gets wrong, handled here:
 *  - cobe drives its own rAF loop forever. It is stopped whenever the
 *    section is off-screen, so it costs nothing while you read the page.
 *  - prefers-reduced-motion gets one static frame, not a frozen loop.
 *  - devicePixelRatio is capped at 2; a 3x phone would otherwise render
 *    nine times the pixels for no visible gain.
 * ---------------------------------------------------------------- */

export type GlobeFeatureSectionProps = {
  /** First clause, set in near-black — the hook. */
  lead: string;
  /** Continuation, set in grey. */
  body: string;
  ctaLabel: string;
  ctaHref: string;
  /** Places to pin. Defaults to none. */
  markers?: Marker[];
};

/** GAMCS blue, normalised to 0–1 for WebGL. */
const BRAND: [number, number, number] = [15 / 255, 94 / 255, 151 / 255];

export function GlobeFeatureSection({
  lead,
  body,
  ctaLabel,
  ctaHref,
  markers = [],
}: GlobeFeatureSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* phi lives outside the globe instance so rotation resumes where it left
       off after the globe is torn down and rebuilt. */
    let phi = 4.2; // over the Atlantic, so both markers are in view
    let globe: ReturnType<typeof createGlobe> | null = null;
    let width = canvas.offsetWidth;
    let staticTimer = 0;
    let lastWidth = width;

    const onResize = () => {
      width = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);

    /* cobe's own marker pass clobbers the sphere's map texture in this
       environment (blank globe, dots gone), so pins are DOM nodes projected
       onto the sphere by hand. Sphere radius is 0.8 of the half-width, which
       is the same constant cobe's marker vertex shader uses. */
    const pins = Array.from(
      root.querySelectorAll<HTMLElement>("[data-pin]")
    );
    const placePins = (currentPhi: number) => {
      /* Mirrors cobe's own marker maths exactly:
           o = lng - PI;  p = [-cos(lat)cos(o), sin(lat), cos(lat)sin(o)]
         then the same phi/theta rotation its marker vertex shader applies. */
      const r = (width / 2) * 0.8;
      const c = width / 2;
      const theta = 0.25;
      const cp = Math.cos(currentPhi);
      const sp = Math.sin(currentPhi);
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      for (const pin of pins) {
        const lat = (Number(pin.dataset.lat) * Math.PI) / 180;
        const o = (Number(pin.dataset.lng) * Math.PI) / 180 - Math.PI;
        const ca = Math.cos(lat);
        const px = -ca * Math.cos(o);
        const py = Math.sin(lat);
        const pz = ca * Math.sin(o);

        const X = cp * px + sp * pz;
        const Y = sp * st * px + ct * py - cp * st * pz;
        const Z = -sp * ct * px + st * py + cp * ct * pz;

        if (Z <= 0.02) {
          pin.style.opacity = "0";
          continue;
        }
        pin.style.opacity = String(Math.min(1, Z * 4));
        pin.style.transform = `translate3d(${c + X * r}px, ${c - Y * r}px, 0) translate(-50%, -50%)`;
      }
    };

    const create = () => {
      if (globe) return;
      width = canvas.offsetWidth;
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio, 2),
        width: width * 2,
        height: width * 2,
        phi,
        theta: 0.25,
        dark: 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [1, 1, 1],
        markerColor: BRAND,
        glowColor: [1, 1, 1],
        markers: [],
        onRender: (state: Record<string, unknown>) => {
          /* Only push a size when it actually changed. Setting width/height
             every frame makes cobe reallocate the canvas backing store on
             each tick, which blows away the bound map texture — the globe
             renders as a blank sphere with no dots. */
          if (width !== lastWidth) {
            lastWidth = width;
            state.width = width * 2;
            state.height = width * 2;
          }
          if (!reduce) phi += 0.0032;
          state.phi = phi;
          placePins(phi);
        },
      } as COBEOptions);
      canvas.style.opacity = "1";

      /* Reduced motion: let it paint one frame, then tear the loop down.
         The painted frame stays on the canvas at zero ongoing cost. */
      if (reduce) {
        staticTimer = window.setTimeout(() => {
          globe?.destroy();
          globe = null;
        }, 100);
      }
    };

    /* cobe owns its own requestAnimationFrame loop with no pause API, so the
       only way to stop burning GPU off-screen is to destroy and rebuild. */
    const destroy = () => {
      window.clearTimeout(staticTimer);
      globe?.destroy();
      globe = null;
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? create() : destroy()),
      { threshold: 0 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [markers]);

  return (
    <div className="globe-feature" ref={rootRef}>
      <div className="globe-feature-copy">
        <p className="globe-feature-lead">
          {lead} <span>{body}</span>
        </p>
        <CTA icon="arrow" href={ctaHref} data-cta="globe">
          {ctaLabel}
        </CTA>
      </div>

      <div className="globe-feature-stage" aria-hidden="true">
        <canvas ref={canvasRef} className="globe-feature-canvas" />
        {markers.map((m) => (
          <span
            key={`${m.location[0]},${m.location[1]}`}
            className="globe-pin"
            data-pin=""
            data-lat={m.location[0]}
            data-lng={m.location[1]}
          />
        ))}
      </div>
    </div>
  );
}

export default GlobeFeatureSection;
