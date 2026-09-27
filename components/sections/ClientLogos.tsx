import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import Image from "next/image";
import type { ClientLogo } from "@/lib/logo-wall";
import LogoCloudSwap, { type LogoEntry } from "@/components/ui/logo-clouds";
import ClientMarquee from "@/components/sections/ClientMarquee";
import { clients } from "@/lib/content/gamcs";
import { cn } from "@/lib/utils";

const LOGO_DIR = path.join(process.cwd(), "public", "logos", "clients");

/**
 * A PNG's real pixel size, straight out of its IHDR header. Each mark is
 * trimmed to its own artwork, so its true aspect ratio is what sizing needs.
 */
function pngSize(file: string) {
  const b = readFileSync(path.join(LOGO_DIR, file));
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

/**
 * The per-mark ceilings come from lib/content/gamcs.ts, where each logo
 * carries its own `h` and `mw`. They were solved rather than chosen: every
 * mark was rendered, its ink area measured, and its height set so that all
 * twenty-one carry the same weight of ink. Area scales with the square of the
 * height, so the correction for each is its current height times the square
 * root of the ratio between the target area and its own.
 *
 * The reference site gives every logo one height, which works there because
 * its marks are all wordmarks of similar proportion. This set runs from a
 * 0.70:1 panda to a 4.69:1 wordmark, and from a solid filled tile to thin line
 * art; one height would have drawn GX at twice the ink of its neighbours and
 * Basilic Fly at half.
 */

/**
 * The client logo wall in the band under the hero: all twenty-one marks at once,
 * fading up out of a blur a tenth of a second apart as the band scrolls in, and
 * then, every few seconds, a wave that wipes across the wall left to right.
 *
 * It scrolled in a loop before this, which put most of the marks off screen at
 * any moment. The grid trades that motion for the whole roster being readable
 * at a glance, and keeps its motion to two things that never move a mark out of
 * reading position: the entrance, and the wave. Visitors who ask for reduced
 * motion get the grid with neither.
 *
 * Each logo keeps its company name as alt text: a screen-reader user should get
 * the client list, which is the point of the section.
 */
export default function ClientLogos() {
  /* A logo whose file has not been added yet is skipped rather than rendered
     as a broken image. This is a server component, so the check is a build-time
     disk read, not a runtime cost — and it means an entry can be added to the
     content before its artwork lands. */
  const byFile = new Map(clients.logos.map((l) => [l.file, { h: l.h, mw: l.mw }]));

  const logos: ClientLogo[] = clients.logos
    .filter((l) => existsSync(path.join(LOGO_DIR, l.file)))
    .map((l) => ({
      name: l.name,
      src: `/logos/clients/${l.file}`,
      /* the file's own pixels: next/image wants them, and they are what the
         browser scales from once the CSS caps bind */
      ...pngSize(l.file),
      /* GX is a filled square; round it the way the old grid's tile did */
      className: l.tile ? "rounded-[6px]" : undefined,
    }));

  /* The wall's own marks. `displaySize` has already given each one the size
     that holds its optical weight, so the image is sized outright rather than
     left to a class. */
  const marks: LogoEntry[] = logos.map((l) => {
    const { h, mw } = byFile.get(l.src.split("/").pop()!)!;
    return {
      id: l.name,
      name: l.name,
      icon: (
        <Image
          src={l.src}
          alt={l.name}
          width={l.width}
          height={l.height}
          /* Two ceilings, no fixed size: the browser honours whichever binds
             first, so nothing overflows its column. Per-mark, so any single
             logo can be nudged by changing only its own two numbers. */
          style={{ "--logo-h": `${h}px`, "--logo-mw": `${mw}px` } as CSSProperties}
          className={cn("cl-mark select-none", l.className)}
        />
      ),
    };
  });

  return (
    <section className="clients" id="clients" aria-labelledby="clients-heading">
      <div className="container">
        <div className="clients-head reveal">
          <h2 id="clients-heading">{clients.heading}</h2>
          <p className="clients-sub">{clients.sub}</p>
        </div>

        {/* The component's own band, heading and mobile layout are dropped:
            this section has its heading above, its white ground comes from
            .clients, and below 768 the grid gives way to the marquee. Its
            padding is overridden on both the base and the `sm:` variant, since
            a bare utility does not beat a variant one. What replaces it is
            18px, the padding the scrolling strip used to carry, which makes the
            gaps above and below the logos 72px (54 on phones) — the same on
            both sides, as the partners block expects. */}
        <LogoCloudSwap
          logos={marks}
          title={null}
          subtitle={null}
          showNames={false}
          entrance
          /* The wave takes twenty-one marks x 0.11s + 0.92s = 3.2s to cross, so
             a 3.2s rest makes it roughly half the time. */
          interval={3200}
          className="clients-wall reveal bg-transparent px-0 py-2 sm:py-2"
          /* Columns, gaps and cell size all live in .cl-grid: the counts
             change at 1200 and 768, which are not Tailwind breakpoints, and
             gap-x-8 is 36px at this root size rather than the 32 wanted. */
          gridClassName="cl-grid grid"
        />

        {/* Phones (<=768): the same roster as two drifting rows of grey tiles.
            display:none above that, where the grid is; the grid is hidden
            at and under 768 (app/globals.css). The grid component and its
            props above are unchanged. */}
        <ClientMarquee logos={logos} />
      </div>
    </section>
  );
}
