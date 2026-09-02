import Image from "next/image";

/**
 * The photograph behind a `.page-head` band, full bleed, with the scrim that
 * makes white type readable over it.
 *
 * The eight photographs come from eight photographers and arrived anywhere
 * between 0.23 and 0.65 mean luminance. They are normalised on disk to ~0.145
 * and lightly desaturated, so one scrim serves all of them and the set reads as
 * one wall rather than eight stock pictures.
 *
 * A band using this must also carry `page-head--art`, which is what flips the
 * copy to white. The two go together: the class without the picture is white on
 * pale grey, and the picture without the class is dark on dark.
 *
 * `alt` is empty by design — decorative. Each is a building that says nothing
 * the heading beside it does not, so announcing it is noise.
 */
export default function PageHeadArt({ src }: { src: string }) {
  return (
    <div className="page-head-art" aria-hidden="true">
      <Image src={src} alt="" fill sizes="100vw" priority />
    </div>
  );
}
