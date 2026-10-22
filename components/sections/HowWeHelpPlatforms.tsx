import Integrations from "@/components/ui/integrations-4";
import { platforms, solutions } from "@/lib/content/gamcs";

/**
 * The platforms band closing /how-we-help (client, 2026-10-22): heading,
 * one line, and the ERP / CRM / EPM lists beside a grid of their logos.
 *
 * The lists are read out of the Transform pillar, not retyped, so a platform
 * added or renamed there shows up here too. Same source for the tiles: every
 * platform in those groups gets one, with a logo when `platforms.logos` has
 * a file for it and its name when it does not.
 */
const groups = solutions
  .flatMap((s) => s.blocks)
  .flatMap((b) => ("items" in b && b.kind === "bullets" ? b.items : []))
  .flatMap((r) => ("subheads" in r ? r.subheads : []))
  .filter((sub) => platforms.groups.includes(sub.lead));

export default function HowWeHelpPlatforms() {
  if (!groups.length) return null;
  const logos = groups.flatMap((g) =>
    g.items.map((name) => ({ name, src: platforms.logos[name] })),
  );

  return (
    <section className="section hwh-platforms" aria-labelledby="platforms-h">
      <div className="container">
        <Integrations logos={logos}>
          <h2 id="platforms-h" className="fin-h2 !mt-0">{platforms.heading}</h2>
          <p className="mt-5 text-[0.8889rem] leading-relaxed text-[#5B6067]">{platforms.sub}</p>
          <div className="mt-8 space-y-6">
            {groups.map((g) => (
              <div key={g.lead}>
                <h3 className="text-[0.8333rem] font-semibold text-[#0D1828]">{g.lead}</h3>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.7778rem] text-[#5B6067]">
                  {g.items.map((name) => (
                    <li key={name} className="flex items-center gap-2 before:size-1 before:rounded-full before:bg-blue before:content-['']">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Integrations>
      </div>
    </section>
  );
}
