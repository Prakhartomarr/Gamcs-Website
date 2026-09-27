/**
 * One mark on the client wall.
 *
 * The shape used to live in components/ui/cinematic-logo-cloud.tsx, the
 * component that rendered the wall before logo-clouds.tsx did. That component
 * is gone; the type outlived it because both halves of the wall still pass
 * marks to each other — ClientLogos builds the array, ClientMarquee renders it
 * on phones — so it sits here rather than in either of them.
 *
 * Trimmed on the way: the old type also carried `slug`, `text`, `nameClassName`
 * and `invertDark`, which only the deleted component's other rendering modes
 * read. `src` is required now, because ClientLogos always sets it, which
 * retires the two non-null assertions its consumers were carrying.
 */
export type ClientLogo = {
  name: string;
  /** artwork served by this site, e.g. /logos/clients/wwf.png */
  src: string;
  /** display size in px — both set, so the aspect ratio holds */
  width: number;
  height: number;
  className?: string;
};
