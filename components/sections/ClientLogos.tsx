import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { clients } from "@/lib/content/gamcs";

const LOGO_DIR = path.join(process.cwd(), "public", "logos", "clients");

/**
 * A PNG's real pixel size, straight out of its IHDR header.
 *
 * next/image needs a width and a height, and passing one fixed pair for every
 * logo is what made them all render at the same box: the declared aspect won,
 * so a tall mark and a flat wordmark were scaled identically and the CSS
 * max-height never got to bind. Each mark is trimmed to its own artwork now,
 * so it has to declare its own size for that trim to mean anything.
 */
function pngSize(file: string) {
  const b = readFileSync(path.join(LOGO_DIR, file));
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

/**
 * The client logo wall that sits in the band under the hero, replacing the
 * platform trust bar that used to occupy this slot.
 *
 * A static five-across grid, no marquee: with 25 marks a loop would mean most
 * of the list is off screen at any moment, and this row is the page's social
 * proof — it should be readable at a glance, not waited for.
 *
 * Logos are plain `next/image` at their processed 2x size. They are decorative
 * in the sense that the section works without any single one of them, but each
 * carries its company name as alt text: a screen-reader user should get the
 * client list, which is the whole point of the section.
 */
export default function ClientLogos() {
  /* A logo whose file has not been added yet is skipped rather than rendered
     as a broken image. This is a server component, so the check is a build-time
     disk read, not a runtime cost — and it means an entry can be added to the
     content before its artwork lands. A tile that never appears means the file
     is missing or the name does not match. */
  const logos = clients.logos
    .filter((l) => existsSync(path.join(LOGO_DIR, l.file)))
    .map((l) => ({ ...l, ...pngSize(l.file) }));

  return (
    <section className="clients" id="clients" aria-labelledby="clients-heading">
      <div className="container">
        <div className="clients-head reveal">
          <h2 id="clients-heading">{clients.heading}</h2>
          <p>{clients.subtitle}</p>
        </div>

        <ul className="clients-grid reveal">
          {logos.map((logo) => (
            <li key={logo.file} className={logo.tile ? "is-tile" : undefined}>
              <Image
                src={`/logos/clients/${logo.file}`}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
