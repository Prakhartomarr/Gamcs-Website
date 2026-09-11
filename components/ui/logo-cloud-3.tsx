import Image from "next/image";
import type { ComponentProps } from "react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

/**
 * One row of logos scrolling in a loop, faded out at both ends.
 *
 * From 21st.dev's logo-cloud-3, adapted: next/image instead of <img>. This
 * project lints <img>, and next/image serves each logo resized and in a modern
 * format. So every logo declares a width and height, and renders at exactly
 * that size — which is how a caller balances marks of very different shapes.
 * `className` per logo is for the odd mark that needs its own treatment.
 */
export type Logo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

type LogoCloudProps = ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={42} reverse speed={80} speedOnHover={25}>
        {logos.map((logo) => (
          <Image
            key={`logo-${logo.alt}`}
            src={logo.src}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            /* Size set outright. Left at width/height auto, each image took the
               natural size of whichever srcset file loaded, and the flex row then
               stretched every logo to the tallest of them. */
            style={{ width: logo.width, height: logo.height }}
            className={cn(
              "pointer-events-none max-w-none shrink-0 select-none dark:brightness-0 dark:invert",
              logo.className
            )}
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}
