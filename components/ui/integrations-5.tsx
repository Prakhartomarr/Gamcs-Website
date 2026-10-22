import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 21st.dev "integrations-5", adapted (client, 2026-10-22): two concentric
 * arcs of logo discs over a hub, the copy centred under them.
 *
 * THE LOOP (client: "keep 6 on the screen and make a circular loop"). Each
 * ring carries its six discs evenly round the WHOLE circle and turns slowly,
 * so about three per ring are above the horizon at a time and the lower half
 * fades out under it: ~6 on screen, all 12 over one turn. Each disc
 * counter-turns at the same rate, so the logos stay upright.
 *
 * THE HOVER (client: the screen recording of the original). Over the
 * section, a tinted sweep spins round each circle every 3.5s — lime on the
 * outer, blue on the inner — exactly the original's `group-hover` rings.
 *
 * Tailwind 3: the original's `bg-linear-to-b`, `aspect-16/10` and
 * `-translate-x-1/6` are v4 names that compile to nothing here. Reduced
 * motion stops both the loop and the sweep; the discs then sit still.
 */

export type IntegrationLogo = { name: string; src?: string };

/** One full turn of the loop. */
const LOOP = "48s";

/** % position of a point on a circle that fills its square, at `deg`. */
const at = (deg: number): CSSProperties => {
  const r = (deg * Math.PI) / 180;
  return { left: `${50 + 50 * Math.cos(r)}%`, top: `${50 - 50 * Math.sin(r)}%` };
};

export default function Integrations({
  outer,
  inner,
  children,
  fadeFrom = "#FEFEFE",
}: {
  outer: IntegrationLogo[];
  inner: IntegrationLogo[];
  children: ReactNode;
  fadeFrom?: string;
}) {
  return (
    <div className="group mx-auto max-w-5xl">
      {/* 84% wide on a phone so the discs at the circle's edge stay on screen. */}
      <div className="relative mx-auto aspect-[16/10] w-[84%] max-w-[34rem] sm:w-full">
        {/* The rings and their discs, masked so the lower half of each circle
            fades out at the horizon. The layer runs 4rem past the box above
            and to the sides so the top discs are not clipped by the mask. */}
        <div className="absolute -inset-x-16 -top-16 bottom-0 [mask-image:linear-gradient(to_bottom,black,black_calc(100%-5rem),transparent)]">
          <div className="absolute inset-x-16 top-16 aspect-square">
            <Ring logos={outer} offset={90} sweep="from-lime-500/15" />
            {/* Concentric: 17% of the WIDTH in from each side and the top. */}
            <div className="absolute left-[17%] right-[17%] top-[17%] aspect-square">
              {/* Tailwind's blue-500 by value: `blue` is the brand blue in this config,
                  so `from-blue-500/15` matches nothing. */}
              <Ring logos={inner} offset={60} sweep="from-[rgba(59,130,246,.15)]" />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 mx-auto my-2 w-fit rounded-full border bg-secondary p-1">
          <Disc hub>
            <svg className="h-[46%] w-[70%] text-blue" aria-hidden="true" focusable="false">
              <use href="#ga-mark" />
            </svg>
          </Disc>
        </div>
      </div>
      <div
        className="relative z-20 mx-auto mt-10 max-w-2xl text-center"
        style={{ backgroundImage: `linear-gradient(to top, ${fadeFrom} 55%, transparent)` }}
      >
        {children}
      </div>
    </div>
  );
}

function Ring({ logos, offset, sweep }: { logos: IntegrationLogo[]; offset: number; sweep: string }) {
  const step = 360 / Math.max(logos.length, 1);
  return (
    <div className="absolute inset-0">
      {/* The static arc: a hairline on top, a soft tint fading down. */}
      <div className="absolute inset-0 rounded-full border-t border-[#E3E7EB] bg-gradient-to-b from-[rgba(13,24,40,.06)] to-transparent to-25%" />
      {/* The original's hover sweep: the same tint, turned, shown on hover. */}
      <div
        role="presentation"
        className={cn(
          "absolute inset-0 rounded-full border-t border-black/5 bg-gradient-to-b to-transparent to-25%",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "[animation:spin_3.5s_linear_infinite] motion-reduce:[animation:none]",
          sweep,
        )}
      />
      {/* The loop. Discs sit evenly round the whole circle; the layer turns. */}
      <div className="absolute inset-0 [animation:spin_var(--loop)_linear_infinite] motion-reduce:[animation:none]"
        style={{ "--loop": LOOP } as CSSProperties}>
        {logos.map((logo, i) => (
          <div
            key={logo.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={at(offset + i * step)}
          >
            <div className="[animation:spin_var(--loop)_linear_infinite_reverse] motion-reduce:[animation:none]">
              <Disc label={logo.name}>
                {logo.src ? (
                  <span className="relative block h-[38%] w-[70%]">
                    <Image src={logo.src} alt={logo.name} fill sizes="64px"
                      className="pointer-events-none select-none object-contain" />
                  </span>
                ) : (
                  <span className="px-0.5 text-center text-[7px] font-semibold leading-tight text-[#0D1828] sm:text-[10px]">
                    {logo.name}
                  </span>
                )}
              </Disc>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Disc({ children, label, hub }: { children: ReactNode; label?: string; hub?: boolean }) {
  return (
    <div
      title={label}
      className={cn(
        "relative z-30 flex items-center justify-center rounded-full border bg-white shadow-sm",
        /* ~40px on a phone (h-9 at the 18px root); 64px from 640 up. */
        hub ? "h-11 w-11 border-black/20 shadow-xl sm:h-16 sm:w-16" : "h-9 w-9 sm:h-16 sm:w-16",
      )}
    >
      {children}
    </div>
  );
}
