import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { toolCloud } from "@/lib/content/gamcs";
import { cn } from "@/lib/utils";

/**
 * The tools logo cloud, directly above "Our Impact" on the homepage (client,
 * 2026-10-22), and under the /solutions head (client, same day; the same
 * component, so the two cannot drift): the kicker on the left behind a hairline, the marquee of
 * platform and tool marks beside it; stacked and centred on a phone. Each mark
 * is fitted into the same 140x40 box, so square icons and wide wordmarks sit
 * on one optical line.
 */
export default function ToolLogos({ className }: { className?: string } = {}) {
  return (
    <section className={cn("tool-logos", className)} aria-labelledby="tool-logos-h">
      <div className="container">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-0">
          <p
            id="tool-logos-h"
            className="section-kicker m-0 text-center uppercase leading-relaxed [text-wrap:balance] md:mr-10 md:w-[270px] md:shrink-0 md:border-r md:border-[#E3E7EB] md:py-2 md:pr-10 md:text-left"
          >
            {toolCloud.kicker}
          </p>
          <Marquee className="min-w-0 flex-1" duration="45s">
          {toolCloud.logos.map((l) => (
            <span key={l.name} className="relative mx-6 block h-10 w-[140px] shrink-0 sm:mx-9">
              <Image src={l.src} alt={l.name} fill sizes="140px"
                className="pointer-events-none select-none object-contain" />
            </span>
          ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
