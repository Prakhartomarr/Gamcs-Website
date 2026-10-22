import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { toolCloud } from "@/lib/content/gamcs";

/**
 * The tools logo cloud, directly above "Our Impact" on the homepage (client,
 * 2026-10-22): a kicker and one marquee of platform and tool marks. Each mark
 * is fitted into the same 140x40 box, so square icons and wide wordmarks sit
 * on one optical line.
 */
export default function ToolLogos() {
  return (
    <section className="tool-logos" aria-labelledby="tool-logos-h">
      <div className="container">
        <p id="tool-logos-h" className="section-kicker text-center uppercase">
          {toolCloud.kicker}
        </p>
        <Marquee className="mt-8" duration="45s">
          {toolCloud.logos.map((l) => (
            <span key={l.name} className="relative mx-6 block h-10 w-[140px] shrink-0 sm:mx-9">
              <Image src={l.src} alt={l.name} fill sizes="140px"
                className="pointer-events-none select-none object-contain" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
