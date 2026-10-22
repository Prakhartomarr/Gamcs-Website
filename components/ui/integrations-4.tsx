import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 21st.dev "integrations-4", adapted (client, 2026-10-22): text on the left,
 * a scattered grid of logo tiles on the right fading out at the edges.
 *
 * Changes from the original:
 * - Tailwind 3. `size-90`, `size-18`, `shadow-xs` and `mask-[...]` are v4
 *   names that compile to nothing here; these are the v3 equivalents.
 * - The original's geometry, matched to its demo (client, 2026-10-22): a
 *   360px square of 72px tiles that touch, fading hard to the edges. Placed
 *   in percentages of that square (20% = 72/360) rather than px, so below
 *   360px of column it shrinks instead of overflowing a phone.
 * - Logos come in as props. The twelve sit on the odd cells of a 5x5
 *   checkerboard (no corners, which the fade would swallow); five empty
 *   tiles (the edge midpoints and the centre, where the GA mark was until
 *   the client had it removed) keep the scattered texture. A logo with no
 *   `src` shows its name.
 */

export type IntegrationLogo = { name: string; src?: string };

const LOGO_CELLS = [
  [0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1],
  [2, 3], [3, 0], [3, 2], [3, 4], [4, 1], [4, 3],
] as const;
const EMPTY_CELLS = [[0, 2], [2, 0], [2, 2], [2, 4], [4, 2]] as const;
const CELL = 20; // % of the square per grid cell

export function Integrations({
  children,
  logos,
}: {
  children: ReactNode;
  logos: IntegrationLogo[];
}) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
      <div className="max-w-xl">{children}</div>

      <div className="flex justify-center md:justify-end">
        <div className="relative aspect-square w-full max-w-[360px] [mask-image:radial-gradient(ellipse_at_center,black,black,transparent)]">
          {EMPTY_CELLS.map(([row, col]) => (
            <Tile key={`e${row}${col}`} row={row} col={col} empty />
          ))}
          {logos.slice(0, LOGO_CELLS.length).map((logo, i) => {
            const [row, col] = LOGO_CELLS[i];
            return (
              <Tile key={logo.name} row={row} col={col} label={logo.name}>
                {logo.src ? (
                  <span className="relative block h-[40%] w-[72%]">
                    <Image src={logo.src} alt={logo.name} fill sizes="72px"
                      className="pointer-events-none select-none object-contain" />
                  </span>
                ) : (
                  <span className="px-1 text-center text-[11px] font-semibold leading-tight text-[#0D1828]">
                    {logo.name}
                  </span>
                )}
              </Tile>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tile({
  row,
  col,
  empty,
  label,
  children,
}: {
  row: number;
  col: number;
  empty?: boolean;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <div
      title={label}
      className={cn(
        "absolute flex items-center justify-center rounded-md border",
        empty ? "bg-secondary/30" : "bg-card shadow-sm",
      )}
      style={{
        left: `${col * CELL}%`,
        top: `${row * CELL}%`,
        width: `${CELL}%`,
        height: `${CELL}%`,
      }}
    >
      {children}
    </div>
  );
}

export default Integrations;
