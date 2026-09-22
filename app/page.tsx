import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import ClientLogos from "@/components/sections/ClientLogos";
import DataToDecision from "@/components/sections/DataToDecision";
import WhoWeAre from "@/components/sections/WhoWeAre";
import HowWeHelpStack from "@/components/sections/HowWeHelpStack";
import MaturityCurve from "@/components/sections/MaturityCurve";
import Solutions from "@/components/sections/Solutions";
import Achievements from "@/components/sections/Achievements";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/content/gamcs";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "From Reporting to Decision Intelligence",
    description:
      "GAMCS helps CFOs and PE/VC portfolios move from reporting to real-time decision intelligence — FP&A, team extension, digital transformation, and deal advisory.",
    path: "/",
  }),
  /* The <title> leads with the brand, so it is set absolute to keep the
     layout's "| GA Management Consultants" suffix off it. pageMetadata gets the
     bare page name, because it appends the brand to og:title itself. */
  title: { absolute: `${site.name} | From Reporting to Decision Intelligence` },
};

export default function HomePage() {
  return (
    <>
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
      <DataToDecision />
      <MaturityCurve />
      {/* After the curve, not before it: once a visitor has placed themselves
          on it, how GAMCS builds each layer, then the pillars that do it. */}
      <HowWeHelpStack />
      <Solutions />
      <Achievements />
      <Testimonials />
      <WhoWeAre />
      <Contact />
    </>
  );
}
