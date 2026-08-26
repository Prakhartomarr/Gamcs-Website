import SolutionCards from "@/components/sections/SolutionCards";
import { services } from "@/lib/content/gamcs";

/**
 * Homepage services section: tall gradient cards with a soft-focus glyph.
 *
 * The cards themselves live in SolutionCards so this section and the
 * /solutions hub cannot drift apart again.
 *
 * This was a client component only to drive the icons' draw-on-scroll effect
 * (stroke-dashoffset tweened from each path's measured length). That effect is
 * gone: the glyph is now blurred by ~8px, and a stroke drawing itself is
 * invisible through that much blur. Dropping it also drops the GSAP import and
 * the IntersectionObserver, so this is a server component again.
 */
export default function Solutions() {
  return (
    <section className="section services fin-sec" id="solutions">
      <div className="container">
        <div className="fin-center reveal">
          <span className="fin-eyebrow">
            <i aria-hidden="true" />
            Services
          </span>
          <h2 className="fin-h2">
            A variety of{" "}
            <span className="accent uline">{services.introAccent}</span> tailored
            to client needs.
          </h2>
          <p className="fin-lead">
            From forward-looking planning to deal-ready diligence — engaged
            individually, or as one embedded team.
          </p>
        </div>

        <SolutionCards />
      </div>
    </section>
  );
}
