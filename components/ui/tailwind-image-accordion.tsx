"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

/* ----------------------------------------------------------------
 * TailwindImageAccordion
 *
 * Hovering (or focusing) one panel expands it and collapses the rest.
 * Pure CSS — no state, no JS.
 *
 * Two deviations from the reference, both forced:
 *
 * 1. The reference is written for Tailwind v4. `not-[&:hover]:`,
 *    `bg-linear-to-t` and `ring-3` do not exist in 3.4.6 and compile to
 *    nothing, which would leave the panels never collapsing — the whole
 *    point of the component. They are rewritten as the v3 equivalents
 *    (`group-hover:[&:not(:hover)]:`, `bg-gradient-to-t`, `ring-2`).
 *
 * 2. `url` is optional. GAMCS publishes no portraits of its team, and
 *    putting a stock face on a real named person misrepresents them, so
 *    a panel with no image renders the brand gradient + monogram at the
 *    same size. Supply `url` and it becomes a real photo panel with no
 *    other change.
 * ---------------------------------------------------------------- */

export type AccordionItem = {
  id: string;
  /** Person's name — the smaller line */
  title: string;
  /** Role — the larger line */
  description: string;
  /** Portrait URL. Omit to render the monogram panel. */
  url?: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

export function TailwindImageAccordion({
  items,
  className = "",
}: {
  items: AccordionItem[];
  className?: string;
}) {
  return (
    <div
      className={`group flex max-md:flex-col justify-center gap-2 w-full mx-auto ${className}`}
    >
      {items.map((item) => (
        <article
          key={item.id}
          className="group/article relative w-full overflow-hidden rounded-xl transition-all duration-300 ease-panel md:group-hover:[&:not(:hover)]:w-[20%] md:group-focus-within:[&:not(:focus-within):not(:hover)]:w-[20%] before:absolute before:inset-x-0 before:bottom-0 before:h-1/3 before:bg-gradient-to-t before:from-black/60 before:transition-opacity md:before:opacity-0 md:hover:before:opacity-100 focus-within:before:opacity-100 after:absolute after:inset-0 after:rounded-lg after:bg-white/30 after:opacity-0 after:backdrop-blur-sm after:transition-all md:group-hover:[&:not(:hover)]:after:opacity-100 md:group-focus-within:[&:not(:focus-within):not(:hover)]:after:opacity-100 focus-within:ring-2 focus-within:ring-ring"
        >
          <Link
            className="absolute inset-0 z-10 flex flex-col justify-end p-3 text-white"
            href="/team"
            aria-label={`${item.title} — ${item.description}. See the full team.`}
          >
            <span className="text-xl font-medium md:translate-y-2 md:truncate md:whitespace-nowrap md:opacity-0 transition duration-200 ease-label group-hover/article:translate-y-0 group-hover/article:opacity-100 group-hover/article:delay-300 group-focus-within/article:translate-y-0 group-focus-within/article:opacity-100 group-focus-within/article:delay-300">
              {item.title}
            </span>
            <span className="text-xl font-medium leading-snug md:translate-y-2 md:opacity-0 transition duration-200 ease-label group-hover/article:translate-y-0 group-hover/article:opacity-100 group-hover/article:delay-500 group-focus-within/article:translate-y-0 group-focus-within/article:opacity-100 group-focus-within/article:delay-500">
              {item.description}
            </span>
          </Link>

          {item.url ? (
            <Image
              className="h-[420px] w-full object-cover object-center md:h-[620px]"
              src={item.url}
              width={960}
              height={480}
              sizes="(min-width:768px) 50vw, 100vw"
              alt={`Portrait of ${item.title}, ${item.description}`}
            />
          ) : (
            <div
              className="grid h-[420px] w-full place-items-center bg-gradient-to-br from-blue to-blue-dark md:h-[620px]"
              aria-hidden="true"
            >
              <span className="font-heading text-4xl font-bold tracking-tight text-white/90">
                {initials(item.title)}
              </span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export default TailwindImageAccordion;
