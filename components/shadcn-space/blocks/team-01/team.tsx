"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { motion } from "motion/react";
import { team } from "@/lib/content/gamcs";

type Member = {
  name: string;
  role: string;
  photo?: string;
  experience?: string;
  location?: string;
  email?: string;
};

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
  ...team.leadership.map((m) => ({
    name: m.name, role: m.title, photo: m.photo,
    experience: m.experience, location: m.location, email: m.email,
  })),
  ...team.advisory.map((m) => ({
    name: m.name, role: m.title,
    experience: m.experience,
    location: "location" in m ? m.location : undefined,
  })),
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
                        className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full aspect-square grid place-items-center rounded-md bg-muted text-primary transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
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
                    {/* Experience and location are always visible: real
                        information must not sit behind a hover. */}
                    {(value.experience || value.location) && (
                      <p className="text-xs text-muted-foreground text-center">
                        {[value.experience, value.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {value.email && (
                      <div className="flex gap-2">
                        {/* A real personal address. The previous Globe and
                            LinkedIn icons both pointed at company-wide URLs
                            while being labelled as this person's. */}
                        <a
                          href={`mailto:${value.email}`}
                          className="p-2 hover:bg-accent/80 rounded-full"
                          aria-label={`Email ${value.name}`}
                        >
                          <Mail size={16} />
                        </a>
                      </div>
                    )}
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
