import FluteShader from "@/components/ui/flute-shader";
import CTA from "@/components/CTA";
import { primaryCta } from "@/lib/content/gamcs";

/**
 * The dark closing band — a line on the left, "Schedule a Call" on the
 * right, over the flute shader. Written for /team; since 2026-10-23 it also
 * closes /how-we-help and /solutions (client), each with its own line.
 * `dataCta` tags the button for analytics, per page.
 */
export default function CtaBand({ heading, dataCta }: { heading: string; dataCta: string }) {
  return (
    <section className="section cta-band-section">
      <div className="container">
        <div className="case-cta">
          <FluteShader />
          <h2>{heading}</h2>
          <CTA href={primaryCta.href} tier="secondary" data-cta={dataCta} icon="diagonal">
            {primaryCta.label}
          </CTA>
        </div>
      </div>
    </section>
  );
}
