import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CinematicLogoCloud,
  type LogoCloudClient,
} from "@/components/ui/cinematic-logo-cloud";
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
 * the cap. Equal heights would have made the long wordmarks four times the
 * width of everything else.
 *
 * The cap is 56px. At that size the widest mark is CoreStack at 121x26, which
 * still clears the narrowest desktop column (151px at 640-767, 169px at 1280).
 * Phones are the exception: three columns of 94px at 390 cannot hold 121px, so
 * .clients-wall caps the marks at 40px there instead (app/globals.css).
 */
const MAX_H = 56;
const AREA = MAX_H * MAX_H;
function displaySize({ width, height }: { width: number; height: number }) {
  const ratio = width / height;
  const h = Math.min(MAX_H, Math.sqrt(AREA / ratio));
  return { width: Math.round(h * ratio), height: Math.round(h) };
}

/**
 * The client logo wall in the band under the hero: all twenty marks at once,
 * fading up out of a blur a tenth of a second apart as the band scrolls in.
 *
 * It scrolled in a loop before this, which put most of the twenty off screen at
 * any moment. The grid trades that motion for the whole roster being readable
 * at a glance, and keeps the motion where it costs nothing — the entrance.
 * Visitors who ask for reduced motion get the grid with no entrance at all.
 *
 * Each logo keeps its company name as alt text: a screen-reader user should get
 * the client list, which is the point of the section.
 */
export default function ClientLogos() {
  /* A logo whose file has not been added yet is skipped rather than rendered
     as a broken image. This is a server component, so the check is a build-time
     disk read, not a runtime cost — and it means an entry can be added to the
     content before its artwork lands. */
  const logos: LogoCloudClient[] = clients.logos
    .filter((l) => existsSync(path.join(LOGO_DIR, l.file)))
    .map((l) => ({
      name: l.name,
      src: `/logos/clients/${l.file}`,
      ...displaySize(pngSize(l.file)),
      /* GX is a filled square; round it the way the old grid's tile did */
      className: l.tile ? "rounded-[6px]" : undefined,
    }));

  return (
    <section className="clients" id="clients" aria-labelledby="clients-heading">
      <div className="container">
        <div className="clients-head reveal">
          <h2 id="clients-heading">{clients.heading}</h2>
        </div>

        {/* The component's own band and label are dropped: this section already
            has its heading above, and its white ground comes from .clients. Its
            padding needs BOTH py-0 and md:py-0 to go — the component sets
            py-12 md:py-16, and a bare utility does not beat a `md:` one. What
            replaces it is 18px, the padding the scrolling strip used to carry,
            which is what makes the gaps above and below the logos 72px (54 on
            phones) — the same on both sides, as the partners block expects. */}
        <CinematicLogoCloud
          clients={logos}
          variant="grid"
          eyebrow={null}
          description={null}
          className="clients-wall reveal bg-transparent py-4 md:py-4 dark:bg-transparent"
          /* Real columns rather than the component's centred wrap, which left
             the short last row floating in the middle of the band. Named
             breakpoints, not arbitrary min-[..] ones: two arbitrary variants
             setting the same property have no guaranteed order in this build.
             7 columns at 1280 (169px each), 5 at 1024 (184), 4 at 768 (192),
             3 on phones (118 at 390). */
          gridClassName="cl-grid grid grid-cols-3 place-items-center gap-x-8 gap-y-9 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
          /* The section's .container already sets the measure and the gutters.
             The component's own max-w-7xl and px-4/6/8 inset the grid inside
             them, which put its columns 32px off the partner row below. */
          innerClassName="w-full"
        />
      </div>
    </section>
  );
}
