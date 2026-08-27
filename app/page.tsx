import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import ClientLogos from "@/components/sections/ClientLogos";
import WhoWeAre from "@/components/sections/WhoWeAre";
import HowWeHelp from "@/components/sections/HowWeHelp";
import MaturityCurve from "@/components/sections/MaturityCurve";
import Solutions from "@/components/sections/Solutions";
import OurPartners from "@/components/sections/OurPartners";
import Achievements from "@/components/sections/Achievements";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/content/gamcs";

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${site.name} | From Reporting to Decision Intelligence`,
    description:
      "GAMCS helps CFOs, CXOs, and PE/VC portfolios move from static reporting to real-time decision intelligence — FP&A, BI & analytics, offshoring, systems implementation, and transaction advisory.",
    path: "/",
  }),
  /* The homepage title already contains the brand, so the layout's
     "| GA Management Consultants" suffix is suppressed here. */
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
        still claimed in `whoWeAre` and on the systems-implementation page.
      */}
      <ClientLogos />
      <WhoWeAre />
      <HowWeHelp />
      <MaturityCurve />
      <Solutions />
      <OurPartners />
      <Achievements />
      <Testimonials />
      <Contact />
    </>
  );
}
