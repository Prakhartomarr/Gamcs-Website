import Link from "next/link";
import { site } from "@/lib/content/gamcs";

/**
 * The GA mark, defined once as an SVG <symbol> and reused via <use>.
 *
 * Traced from GAMCS Logo.svg with two changes:
 *  - the 328x281 white background rect (#FDFDFD) is stripped, so the mark sits
 *    on any colour instead of punching a white card into the header;
 *  - the viewBox is cropped to the artwork's tight bounds (72 82 183 116.5)
 *    rather than the original canvas, which was mostly padding.
 *
 * Rendered once, at the top of <body>, so every <use href="#ga-mark"> on the
 * page resolves — a <symbol> per instance would duplicate ~7KB of path data.
 */
/* The two shapes that carry the mark. Held as consts so the light variant
   below reuses them — CSS cannot reach into a <use> shadow tree, so a
   white-on-dark rendering needs its own symbol, not a restyled one. */
export const GA_BODY = "M0 0 C0.76183594 0.35191406 1.52367187 0.70382813 2.30859375 1.06640625 C12.39108547 6.21816846 19.55242045 13.43077583 23.8125 24.01953125 C24.91303989 27.52750216 25 30.25276428 25 34 C17.74 34 10.48 34 3 34 C2.278125 32.4325 1.55625 30.865 0.8125 29.25 C-2.23465728 23.17285253 -5.53640526 20.1575407 -12 18 C-19.85630745 17.15571357 -27.3883609 16.90548297 -34.14453125 21.46875 C-41.32651884 27.39577976 -46.14468338 34.97808018 -47.29101562 44.38916016 C-48.2565909 57.36834496 -47.34888158 69.23903321 -39.3125 80 C-33.74060959 85.67088339 -27.40305099 88.28324025 -19.5 88.5625 C-11.92589435 88.23202605 -5.9413284 86.49373495 -0.125 81.5625 C3.67561023 76.31468232 6 68.42486115 6 62 C-6.95757351 58.83608851 -19.70450147 56.18143024 -33 55 C-27.05395657 49.05395657 -15.44714481 49.73657074 -7.54296875 49.70703125 C-3.75671303 49.7113826 0.02606207 49.76264555 3.8125 49.8125 C10.474375 49.874375 17.13625 49.93625 24 50 C30.27 33.17 36.54 16.34 43 -1 C51.25 -1 59.5 -1 68 -1 C69.56234375 3.34091797 69.56234375 3.34091797 71.15625 7.76953125 C79.19949183 30.09056779 87.31628694 52.38046943 95.64453125 74.59692383 C99.54927832 85.02426597 103.33612203 95.48552622 107 106 C103.1672557 106.17577261 99.33556007 106.28134097 95.5 106.375 C94.42234375 106.42527344 93.3446875 106.47554688 92.234375 106.52734375 C85.73203909 106.64628892 81.72691814 106.10423048 76.77270508 101.76391602 C74.43443638 99.43724045 72.11563257 97.09375161 69.81787109 94.72705078 C66.62110491 91.6899941 62.99560851 89.34091135 59.3125 86.9375 C58.58611328 86.44701172 57.85972656 85.95652344 57.11132812 85.45117188 C50.89959531 81.34419649 44.78453053 78.39226526 38 75 C34.37 85.23 30.74 95.46 27 106 C19.41 106 11.82 106 4 106 C4.33 104.02 4.66 102.04 5 100 C4.030625 100.763125 3.06125 101.52625 2.0625 102.3125 C-4.40835705 107.40657895 -12.31337791 108.54192933 -20.3125 108.4375 C-21.14136719 108.42920166 -21.97023437 108.42090332 -22.82421875 108.41235352 C-36.61564737 108.03507631 -48.22364903 102.25247859 -57.8125 92.375 C-62.5375513 86.80468013 -65.40748451 80.78873448 -68 74 C-68.3403125 73.16339844 -68.680625 72.32679688 -69.03125 71.46484375 C-74.10721147 56.63645631 -71.89787162 39.05643802 -65.6796875 25.01953125 C-59.27216836 12.32704116 -49.73734334 3.87703483 -36.5625 -1.4375 C-25.49443056 -4.79409099 -10.59784932 -4.93245698 0 0 Z ";
/* The A's counter. In the colour symbol it is painted over the body as a
   near-white triangle rather than cut out of it, so anything that samples
   GA_BODY alone gets a solid A. The preloader punches it back out. */
export const GA_A_COUNTER = "M0 0 C1.63901276 2.45851914 2.49998116 4.1126895 3.42041016 6.82885742 C3.68052887 7.5894194 3.94064758 8.34998138 4.20864868 9.1335907 C4.48268524 9.94931046 4.7567218 10.76503021 5.0390625 11.60546875 C5.32478119 12.44467361 5.61049988 13.28387848 5.90487671 14.14851379 C6.81568735 16.82680315 7.72041123 19.5071036 8.625 22.1875 C9.24178748 24.00469312 9.85897024 25.82175212 10.4765625 27.63867188 C11.98896464 32.09090518 13.49591143 36.54495161 15 41 C14.01 41.495 14.01 41.495 13 42 C11.00048828 41.3190918 11.00048828 41.3190918 8.5703125 40.19921875 C7.69246094 39.79896484 6.81460938 39.39871094 5.91015625 38.98632812 C4.53150391 38.3434082 4.53150391 38.3434082 3.125 37.6875 C2.21363281 37.27048828 1.30226562 36.85347656 0.36328125 36.42382812 C-3.45425576 34.67156187 -7.25092359 32.89491945 -11 31 C-9.59796923 26.7445805 -8.19205222 22.49047144 -6.7824707 18.23754883 C-6.30320101 16.78966355 -5.82500743 15.34142162 -5.34790039 13.89282227 C-4.66312716 11.81432575 -3.97453228 9.73712997 -3.28515625 7.66015625 C-2.87144775 6.40855713 -2.45773926 5.15695801 -2.03149414 3.86743164 C-1 1 -1 1 0 0 Z ";
export const GA_SWOOSH = "M0 0 C6.74520698 0.91813651 13.39816922 2.19820765 20.07080078 3.52905273 C22.12570139 3.93763946 24.18193153 4.33901334 26.23828125 4.74023438 C27.55737948 5.0021623 28.87639297 5.26451746 30.1953125 5.52734375 C31.38141113 5.76187256 32.56750977 5.99640137 33.78955078 6.23803711 C36.68898368 6.92618388 39.27530711 7.80758615 42 9 C42 9.33 42 9.66 42 10 C25.19385251 10.70188087 25.19385251 10.70188087 17.55859375 6.95703125 C12.31159528 4.9944135 6.55044459 5.15995518 1 5 C1 4.34 1 3.68 1 3 C0.34 3 -0.32 3 -1 3 C-0.67 2.01 -0.34 1.02 0 0 Z ";

export function GaLogoSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute" }}
    >
      <symbol id="ga-mark" viewBox="72 82 183 116.5">
      <path d={GA_BODY} fill="#175E8F" transform="translate(146,88)" />
      <path d={GA_A_COUNTER} fill="#F1F8FA" transform="translate(201,114)" />
      <path d={GA_SWOOSH} fill="#F7E43A" transform="translate(109,143)" />
      <path d="M0 0 C7.54835154 -0.30257105 14.37409393 0.82857917 21.75 2.375 C22.85988281 2.59671875 23.96976563 2.8184375 25.11328125 3.046875 C29.95336003 4.03702349 34.4447837 5.04968797 39 7 C38.67 9.31 38.34 11.62 38 14 C37.67 14 37.34 14 37 14 C37 12.35 37 10.7 37 9 C36.30551758 8.86424561 35.61103516 8.72849121 34.89550781 8.58862305 C31.679703 7.95810971 28.46485738 7.32282572 25.25 6.6875 C23.61224609 6.36749023 23.61224609 6.36749023 21.94140625 6.04101562 C14.56593172 4.57901328 7.27664736 2.89321185 0 1 C0 0.67 0 0.34 0 0 Z " fill="#EEF3C7" transform="translate(114,143)" />
      <path d="M0 0 C3.92020496 0.40835468 6.73749705 0.88333202 10.375 2.5 C17.06685494 5.23272961 24.87539211 4.76521179 32 5 C32 5.33 32 5.66 32 6 C29.10391407 6.05413245 26.20884805 6.09373641 23.3125 6.125 C22.49587891 6.14175781 21.67925781 6.15851563 20.83789062 6.17578125 C16.38612909 6.2118279 13.0713401 5.99865787 9 4 C7.783125 3.67 6.56625 3.34 5.3125 3 C2 2 2 2 0 0 Z " fill="#FEFDC4" transform="translate(119,148)" />
      <path d="M0 0 C4.34464536 0.60825035 8.67551867 1.26167392 13 2 C11.09598862 3.90401138 9.66574314 4.93520439 6.953125 5.19921875 C4.96766727 5.1886578 2.9830086 5.09915043 1 5 C1 4.34 1 3.68 1 3 C0.34 3 -0.32 3 -1 3 C-0.67 2.01 -0.34 1.02 0 0 Z " fill="#FAF59C" transform="translate(109,143)" />
      <path d="M0 0 C6.93302093 -0.22731216 13.2168636 0.57997892 20 2 C20 2.33 20 2.66 20 3 C12.95559921 3.21133202 6.75887425 3.07965362 0 1 C0 0.67 0 0.34 0 0 Z " fill="#D4E6DF" transform="translate(114,143)" />
      <path d="M0 0 C0 0.33 0 0.66 0 1 C-4.455 1.495 -4.455 1.495 -9 2 C-9 2.66 -9 3.32 -9 4 C-12.3 4 -15.6 4 -19 4 C-14.31184445 -0.68815555 -6.24859684 -0.2272217 0 0 Z " fill="#326587" transform="translate(132,139)" />
      <path d="M0 0 C0.66 0 1.32 0 2 0 C0.34908222 4.29238623 -2.73754566 6.8793915 -6 10 C-6.66 9.67 -7.32 9.34 -8 9 C-6.71520959 7.49410612 -5.42195918 5.99542625 -4.125 4.5 C-3.04605469 3.24703125 -3.04605469 3.24703125 -1.9453125 1.96875 C-1.30335937 1.3190625 -0.66140625 0.669375 0 0 Z " fill="#E6F4FA" transform="translate(111,109)" />
      <path d="M0 0 C2.31 0.66 4.62 1.32 7 2 C6.67 4.31 6.34 6.62 6 9 C5.67 9 5.34 9 5 9 C5 7.35 5 5.7 5 4 C3.35 3.67 1.7 3.34 0 3 C0 2.01 0 1.02 0 0 Z " fill="#DAEBE4" transform="translate(146,148)" />
      <path d="M0 0 C1.32 0 2.64 0 4 0 C4.33 0.99 4.66 1.98 5 3 C1.25 4.125 1.25 4.125 -1 3 C-0.67 2.01 -0.34 1.02 0 0 Z " fill="#F4E443" transform="translate(109,143)" />
      <path d="M0 0 C2.31 0 4.62 0 7 0 C6.0409375 0.433125 6.0409375 0.433125 5.0625 0.875 C2.84793921 1.82823451 2.84793921 1.82823451 2 4 C1.01 4 0.02 4 -1 4 C-0.67 2.68 -0.34 1.36 0 0 Z " fill="#FCF9BC" transform="translate(106,142)" />
      </symbol>

      {/* Same artwork for dark grounds: the body takes currentColor so a
          caller can set it, and the swoosh keeps the brand yellow. */}
      <symbol id="ga-mark-light" viewBox="72 82 183 116.5">
        <path d={GA_BODY} fill="currentColor" transform="translate(146,88)" />
        <path d={GA_SWOOSH} fill="#F7E43A" transform="translate(109,143)" />
      </symbol>
    </svg>
  );
}

/**
 * Header logo: the mark is always visible; "Management Consultants" grows out
 * to its right on hover or keyboard focus.
 *
 * The reveal animates a CSS grid track from 0fr to 1fr, so it expands to the
 * text's own natural width — no magic pixel value to keep in sync with the
 * font. The text is clipped by overflow:hidden on the inner span and fades in
 * with a small translateX, which is why the mark itself never shifts.
 *
 * Size, colour, duration and easing are CSS variables on `.ga-logo`, so the
 * nav and any display use differ by one custom property.
 */
export default function GaLogo({
  className = "",
  display = false,
}: {
  /** Extra classes; use for per-context overrides. */
  className?: string;
  /** Larger mark, for hero/display placements. */
  display?: boolean;
}) {
  /* Derived from site.name so the wordmark can never drift from the brand.
     One word per line: "MANAGEMENT" over "CONSULTANTS". The uppercasing is
     CSS, not content, so the accessible name on the link is unaffected. */
  const words = site.name.replace(/^GA\s+/, "").split(/\s+/);

  return (
    <Link
      href="/"
      className={`ga-logo${display ? " is-display" : ""} ${className}`}
      aria-label={`${site.name} — home`}
    >
      <svg className="ga-logo-mark" aria-hidden="true" focusable="false">
        <use href="#ga-mark" />
      </svg>
      {/* Decorative duplicate of the accessible name already on the link. */}
      <span className="ga-logo-reveal" aria-hidden="true">
        <span className="ga-logo-reveal-inner">
          {words.map((word) => (
            <span key={word} className="ga-logo-word">
              {word}
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
