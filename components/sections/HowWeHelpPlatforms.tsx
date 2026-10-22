import CTA from "@/components/CTA";
import Integrations from "@/components/ui/integrations-5";
import { platforms, solutions } from "@/lib/content/gamcs";

/**
 * The platforms band closing /how-we-help (client, 2026-10-22), on the
 * 21st.dev integrations-5 layout: logo discs on two arcs around the GA mark,
 * heading, line and a button centred under them. ERP and CRM take the outer
 * arc, the FP&A / EPM tools the inner one; each disc names its platform on
 * hover, and the detail page keeps the lists.
 *
 * The platforms are read out of the Transform pillar, not retyped, so one
 * added or renamed there shows up here too: every platform in those groups
 * gets a disc, with a logo when `platforms.logos` has a file for it and its
 * name when it does not.
 */
const groups = solutions
  .flatMap((s) => s.blocks)
  .flatMap((b) => ("items" in b && b.kind === "bullets" ? b.items : []))
  .flatMap((r) => ("subheads" in r ? r.subheads : []))
  .filter((sub) => platforms.groups.includes(sub.lead));

const toLogos = (gs: typeof groups) =>
  gs.flatMap((g) => g.items.map((name) => ({ name, src: platforms.logos[name] })));

/** The EPM group is the last of `platforms.groups`; it takes the inner arc. */
const EPM = platforms.groups[platforms.groups.length - 1];

export default function HowWeHelpPlatforms() {
  if (!groups.length) return null;

  return (
    <section className="section hwh-platforms" aria-labelledby="platforms-h">
      <div className="container">
        <Integrations
          outer={toLogos(groups.filter((g) => g.lead !== EPM))}
          inner={toLogos(groups.filter((g) => g.lead === EPM))}
        >
          <h2 id="platforms-h" className="fin-h2 !mt-0 [text-wrap:balance]">{platforms.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.8889rem] leading-relaxed text-[#5B6067] [text-wrap:balance]">
            {platforms.sub}
          </p>
          <div className="mt-7 flex justify-center">
            <CTA href={platforms.cta.href} tier="secondary" icon="arrow">{platforms.cta.label}</CTA>
          </div>
        </Integrations>
      </div>
    </section>
  );
}
