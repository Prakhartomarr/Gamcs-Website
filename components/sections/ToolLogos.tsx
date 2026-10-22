import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";
import { platforms, toolCloud } from "@/lib/content/gamcs";
import { cn } from "@/lib/utils";

/**
 * The tools logo cloud, directly above "Our Impact" on the homepage (client,
 * 2026-10-22), and under the /solutions head (client, same day; the same
 * component, so the two cannot drift): the kicker on the left behind a hairline, the marquee of
 * platform and tool marks beside it; stacked and centred on a phone.
 *
 * The marks are every tool in the integration carousel (client, 2026-10-23).
 * Below 640px they shrink (112px boxes, 12px gutters) to keep the row in
 * proportion with a phone; with reduced motion there the row swipes instead
 * of scrolling itself (see components/ui/marquee.tsx).
 * Wordmarks are fitted into the same 140x40 box, so they sit on one optical
 * line; a mark with no wordmark (`labelled`) is a 32px icon with the tool's
 * name beside it, since an unlabelled Excel or SQL glyph reads as nothing.
 */
const marks = platforms.categories.flatMap((c) => c.tools);

/* 45s carried 15 marks; scaled so the pace stays the same with more. */
const duration = `${Math.round((45 / 15) * marks.length)}s`;

export default function ToolLogos({ className }: { className?: string } = {}) {
  return (
    <section className={cn("tool-logos", className)} aria-labelledby="tool-logos-h">
      <div className="container">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-0">
          <p
            id="tool-logos-h"
            className="section-kicker m-0 text-center !tracking-normal leading-relaxed [text-wrap:balance] md:mr-10 md:w-[185px] md:[text-wrap:wrap] md:shrink-0 md:border-r md:border-[#E3E7EB] md:py-2 md:pr-10 md:text-left"
          >
            {toolCloud.kicker}
          </p>
          <Marquee className="min-w-0 flex-1" duration={duration}>
          {marks.map((t) =>
            t.labelled ? (
              <span key={t.name} className="mx-3 flex h-9 shrink-0 items-center gap-2 sm:mx-9 sm:h-10 sm:gap-2.5">
                <span className="relative block h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                  <Image src={t.src} alt="" fill sizes="32px"
                    className="pointer-events-none select-none object-contain" />
                </span>
                <span className="whitespace-nowrap text-sm font-semibold text-charcoal sm:text-[15px]">{t.name}</span>
              </span>
            ) : (
              <span key={t.name} className="relative mx-3 block h-9 w-[112px] shrink-0 sm:mx-9 sm:h-10 sm:w-[140px]">
                {/* multiply drops the white box the Jedox JPG carries */}
                <Image src={t.strip ?? t.src} alt={t.name} fill sizes="140px"
                  className="pointer-events-none select-none object-contain mix-blend-multiply" />
              </span>
            ),
          )}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
