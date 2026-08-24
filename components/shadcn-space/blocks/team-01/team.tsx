"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { motion } from "motion/react";
import { site, team } from "@/lib/content/gamcs";

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip-linkedin-team01)">
      <path d="M13.633 13.633h-2.37V9.92c0-.885-.017-2.025-1.234-2.025-1.235 0-1.424.965-1.424 1.96v3.778h-2.37V5.998H8.51v1.043h.031a2.5 2.5 0 0 1 2.246-1.233c2.403 0 2.846 1.58 2.846 3.637zM3.56 4.954a1.376 1.376 0 1 1 0-2.751 1.376 1.376 0 0 1 0 2.751m1.185 8.679H2.372V5.998h2.373zM14.815.001H1.18A1.17 1.17 0 0 0 0 1.154v13.691A1.17 1.17 0 0 0 1.18 16h13.635A1.17 1.17 0 0 0 16 14.845V1.153A1.17 1.17 0 0 0 14.815 0" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip-linkedin-team01">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

type Member = { name: string; role: string; linkedin?: boolean; photo?: string };

/*
 * The upstream block ships four stock people (Logan Dang, Ana Belić, …) with
 * photos from images.shadcnspace.com. Those are replaced by the real team from
 * lib/content/gamcs.ts. The live site publishes names and titles but no
 * biographies and no downloadable portraits, so each card renders the initials
 * mark used elsewhere on the site in place of the photo. Add a `photo` to a
 * member in lib/content/gamcs.ts and the portrait replaces the monogram with
 * no layout change — the square box is reserved either way.
 */
const teamData: Member[] = [
  ...team.leadership.map((m) => ({ name: m.name, role: m.title, linkedin: true, photo: m.photo })),
  ...team.advisory.map((m) => ({ name: m.name, role: m.title })),
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

const Team = () => {
  return (
    <section id="people">
      <div className="lg:py-20 sm:py-16 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16 flex flex-col items-center justify-center gap-8 md:gap-16">
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="max-w-xl mx-auto flex flex-col items-center justify-center text-center gap-4"
          >
            <Badge variant={"outline"} className="px-3 py-1 h-auto text-sm">
              Team
            </Badge>
            <h2 className="text-3xl md:text-5xl font-medium text-foreground">
              {team.headingLines[0]} {team.headingLines[1]}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamData?.map((value, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="group flex flex-col items-center justify-start gap-6"
                >
                  {/* photo slot — real portrait where we have one, monogram otherwise */}
                  {value.photo ? (
                    /* Square box reserved by aspect-square, so the row never
                       reflows as portraits load. next/image serves AVIF/WebP
                       at the column width instead of the full-size JPEG. */
                    <div className="relative w-full aspect-square overflow-hidden rounded-md">
                      <Image
                        src={value.photo}
                        alt={`Portrait of ${value.name}, ${value.role}`}
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                        className="object-cover object-top transition-all duration-300 group-hover:grayscale"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full aspect-square grid place-items-center rounded-md bg-muted text-primary transition-all duration-300 group-hover:grayscale"
                      aria-hidden="true"
                    >
                      <span className="text-4xl font-medium tracking-tight">{initials(value.name)}</span>
                    </div>
                  )}
                  <div className="w-full flex flex-col gap-4 items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <h3 className="text-2xl font-medium text-foreground text-center">
                        {value.name}
                      </h3>
                      <p className="text-sm font-normal text-muted-foreground text-center">
                        {value.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={site.url}
                        className="p-2 hover:bg-accent/80 rounded-full"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${value.name} — website`}
                      >
                        <Globe size={16} />
                      </a>
                      {value.linkedin && (
                        <a
                          href={site.linkedin}
                          className="p-2 hover:bg-accent/80 rounded-full"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${value.name} — LinkedIn`}
                        >
                          <LinkedinIcon size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
