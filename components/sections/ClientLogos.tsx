import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { LogoCloud, type Logo } from "@/components/ui/logo-cloud-3";
import { clients } from "@/lib/content/gamcs";

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
 * Display size: every mark gets the same visual weight, not the same height.
 *
 * A logo's AREA is held constant, so a flat wordmark (CoreStack, 4.7:1) comes
 * out shorter and wider than a compact mark (GX, 1:1), and nothing grows past
 * the 76px the old grid capped at. Equal heights would have made the long
 * wordmarks four times the width of everything else. The grid got the same
 * balance for free from its narrow cells; a free-running strip has none.
 */
const MAX_H = 76;
const AREA = MAX_H * MAX_H;
function displaySize({ width, height }: { width: number; height: number }) {
  const ratio = width / height;
  const h = Math.min(MAX_H, Math.sqrt(AREA / ratio));
  return { width: Math.round(h * ratio), height: Math.round(h) };
}

/**
 * The client logo wall in the band under the hero: one row of marks scrolling
 * in a loop, slowing while the pointer is over it.
 *
 * This used to be a static grid, kept still on purpose so every mark could be
 * read at a glance. It moves now by choice, and the trade is that at any moment
 * most of the twenty are off screen. Visitors who ask for reduced motion get
 * the still version back: InfiniteSlider renders the logos once, wrapped.
 *
 * Each logo keeps its company name as alt text — a screen-reader user should
 * get the client list, which is the point of the section. The loop's second
 * copy is aria-hidden, so they hear the list once.
 */
export default function ClientLogos() {
  /* A logo whose file has not been added yet is skipped rather than rendered
     as a broken image. This is a server component, so the check is a build-time
     disk read, not a runtime cost — and it means an entry can be added to the
     content before its artwork lands. */
  const logos: Logo[] = clients.logos
    .filter((l) => existsSync(path.join(LOGO_DIR, l.file)))
    .map((l) => ({
      src: `/logos/clients/${l.file}`,
      alt: l.name,
      ...displaySize(pngSize(l.file)),
      /* GX is a filled square; round it the way the grid's tile did */
      className: l.tile ? "rounded-[6px]" : undefined,
    }));

  return (
    <section className="clients" id="clients" aria-labelledby="clients-heading">
      <div className="container">
        <div className="clients-head reveal">
          <h2 id="clients-heading">{clients.heading}</h2>
        </div>

        {/* A shorter fade than the component's default, which runs all the way
            to the centre — across a 1280px band that left most marks
            half-transparent at any moment. */}
        <LogoCloud
          logos={logos}
          className="reveal [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        />
      </div>
    </section>
  );
}
