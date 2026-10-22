import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import ClientLogos from "@/components/sections/ClientLogos";
import DecisionGap from "@/components/sections/DecisionGap";
import WhoWeAre from "@/components/sections/WhoWeAre";
import MaturityCurve from "@/components/sections/MaturityCurve";
import HowWeHelpFilm from "@/components/sections/HowWeHelpFilm";
import Solutions from "@/components/sections/Solutions";
import Achievements from "@/components/sections/Achievements";
import ToolLogos from "@/components/sections/ToolLogos";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/content/gamcs";
import { pages } from "@/lib/content/pages";

export const metadata: Metadata = {
  ...pageMetadata({
    title: pages.home.title,
    description: pages.home.description,
    path: "/",
  }),
  /* The <title> leads with the brand, so it is set absolute to keep the
     layout's "| GA Management Consultants" suffix off it. pageMetadata gets the
     bare page name, because it appends the brand to og:title itself. */
  title: { absolute: `${site.name} | ${pages.home.title}` },
};

export default function HomePage() {
  return (
    /* `home-tight` halves the vertical rhythm between these sections. It is a
       wrapper rather than an edit to .section, which nine other pages use. */
    <div className="home-tight">
      <Hero />
      {/*
        Client logo wall. This band used to hold the platform trust bar (Power
        BI, SAP, AWS); those are tools GAMCS implements, not customers, so the
        "trusted by" framing that would have been wrong for them is accurate
        for the real client list that replaced it. Platform-agnosticism is
        still claimed in `whyUs` and on the Digital Transformation page.
      */}
      <ClientLogos />
      {/* The gap: straight after the proof, the problem — the distance between
          the number and the decision — before anything about how GAMCS works. */}
      <DecisionGap />
      <MaturityCurve />
      {/* How we help, the short version: the heading, the sub and the
          explainer film. The long version — the four-phase stack and the six
          principles — is /how-we-help, which this sits ALONGSIDE rather than
          replacing (client, 2026-10-20): the route keeps everything it has,
          the navbar still points there, and this band is only what a reader
          scrolling past the curve meets on the way to the pillars. The two
          share one heading, from `howWeHelp`, rendered once on each page. */}
      <HowWeHelpFilm />
      <Solutions />
      {/* The tools logo cloud, above the impact figures (client, 2026-10-22). */}
      <ToolLogos />
      <Achievements />
      <Testimonials />
      <WhoWeAre />
      <Contact />
    </div>
  );
}
