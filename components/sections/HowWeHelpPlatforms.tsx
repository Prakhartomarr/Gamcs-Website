import Integrations from "@/components/ui/integrations-4";
import { platforms, solutions } from "@/lib/content/gamcs";

/**
 * The platforms band closing /how-we-help (client, 2026-10-22): heading and
 * one line beside a grid of logos, matched to the 21st.dev demo. The ERP /
 * CRM / EPM lists that sat under the line were dropped to match it; each tile
 * still names its platform on hover, and the detail page keeps the lists.
 *
 * The platforms are read out of the Transform pillar, not retyped, so one
 * added or renamed there shows up here too: every platform in those groups
 * gets a tile, with a logo when `platforms.logos` has a file for it and its
 * name when it does not.
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
        </Integrations>
      </div>
    </section>
  );
}
