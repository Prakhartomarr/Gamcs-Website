"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import SectionEyebrow from "@/components/SectionEyebrow";
import { careers, team } from "@/lib/content/gamcs";

/* Founders first, then every adviser with a portrait. The role is the first
   half of the content file's title ("Founder | FP&A & …" reads as "Founder"). */
const people = team.members.filter((m) => m.photo);

const Arrow = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/** Life at GAMCS: a sideways strip of the real team, ending in the /team link. */
export default function PeopleStrip() {
  const strip = useRef<HTMLUListElement>(null);
  const move = (dir: number) => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.current?.scrollBy({ left: dir * 384, behavior: calm ? "auto" : "smooth" });
  };

  return (
    <section className="cr-wide cr-life" aria-labelledby="cr-life-h">
      <div className="container reveal">
        <div className="cr-life-head">
          <div>
            <SectionEyebrow label={careers.life.eyebrow} />
            <h2 id="cr-life-h">{careers.life.heading}</h2>
          </div>
          <div className="cr-life-nav">
            <button type="button" aria-label="Previous people" onClick={() => move(-1)}><Arrow d="M19 12H5M11 6l-6 6 6 6" /></button>
            <button type="button" aria-label="Next people" onClick={() => move(1)}><Arrow d="M5 12h14M13 6l6 6-6 6" /></button>
          </div>
        </div>
        {/* tabIndex: a scroll container has to be reachable for keyboard scrolling */}
        <ul className="cr-strip" ref={strip} tabIndex={0} aria-label="The GAMCS team, scrolls sideways">
          {people.map((m) => (
            <li key={m.name}>
              <Image src={m.photo} alt={`Portrait of ${m.name}`} width={176} height={240} sizes="190px" />
              <div className="cr-name">{m.name}</div>
              <div className="cr-role">{m.title.split(" | ")[0]}</div>
            </li>
          ))}
          <li>
            <Link className="cr-strip-link" href={careers.life.link.href}>
              {careers.life.link.label} <span aria-hidden="true">→</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
