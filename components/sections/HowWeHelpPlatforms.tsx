import { BarChart3, Boxes, Users, TrendingUp, Code2, Database, Sparkles, type LucideIcon } from "lucide-react";
import FeatureCarousel from "@/components/ui/feature-carousel";
import PlatformsOrbit from "@/components/ui/platforms-orbit";
import { platforms } from "@/lib/content/gamcs";

/**
 * The platforms band closing /how-we-help. Since 2026-10-23 it runs on the
 * 21st.dev feature-carousel (it replaced the integrations-5 logo arcs): a
 * rail of seven tool categories on the left, a card of that category's
 * logos on the right. Heading and line sit centred above it; the page's
 * closing CTA band follows (the "Talk to us" button went, 2026-10-23).
 *
 * Below lg the carousel gives way to the platforms orbit (client,
 * 2026-10-23: on phones its rail stacked into a pill picker). Both are in
 * the markup and CSS shows one; the hidden one does no work, as each only
 * animates while on screen.
 *
 * Categories and logos come from `platforms.categories`; the icons are keyed
 * by category id here so the content file stays plain data.
 */
const ICONS: Record<string, LucideIcon> = {
  reporting: BarChart3,
  erp: Boxes,
  crm: Users,
  epm: TrendingUp,
  analytics: Code2,
  warehousing: Database,
  ai: Sparkles,
};

export default function HowWeHelpPlatforms() {
  const items = platforms.categories.map((c) => {
    const Icon = ICONS[c.id] ?? Boxes;
    return { ...c, icon: <Icon size={18} /> };
  });

  return (
    <section className="section hwh-platforms" aria-labelledby="platforms-h">
      <div className="container">
        <div className="text-center">
          <h2 id="platforms-h" className="fin-h2 !mt-0 [text-wrap:balance]">{platforms.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.8889rem] leading-relaxed text-[#5B6067] [text-wrap:balance]">
            {platforms.sub}
          </p>
        </div>
        <div className="mt-10 hidden md:mt-14 lg:block">
          <FeatureCarousel items={items} />
        </div>
        <div className="mt-8 md:mt-12 lg:hidden">
          <PlatformsOrbit items={items} />
        </div>
      </div>
    </section>
  );
}
