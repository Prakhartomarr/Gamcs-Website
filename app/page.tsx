import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import ClientLogos from "@/components/sections/ClientLogos";
import DecisionGap from "@/components/sections/DecisionGap";
import WhoWeAre from "@/components/sections/WhoWeAre";
import MaturityCurve from "@/components/sections/MaturityCurve";
import Solutions from "@/components/sections/Solutions";
import Achievements from "@/components/sections/Achievements";
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
      {/* The How We Help band used to sit here, between the curve and the
          pillars. The client moved it to its own route (/how-we-help) on
          2026-10-20 and chose to close the gap rather than leave a teaser, so
          the curve now runs straight into the pillars that answer it. */}
      <Solutions />
      <Achievements />
      <Testimonials />
      <WhoWeAre />
      <Contact />
    </div>
  );
}
