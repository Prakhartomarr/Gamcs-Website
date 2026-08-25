import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import LogoCloudSwap from "@/components/ui/logo-clouds";
import WhoWeAre from "@/components/sections/WhoWeAre";
import MaturityCurve from "@/components/sections/MaturityCurve";
import Solutions from "@/components/sections/Solutions";
import OurPartners from "@/components/sections/OurPartners";
import Achievements from "@/components/sections/Achievements";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
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
        The platform trust bar from the copy doc's hero section, given its own
        band directly under the fold. Titled for what these actually are —
        the platforms GAMCS implements and works in — rather than "trusted by",
        which would read as a client list. SAP and AWS are not GAMCS clients.
      */}
      <LogoCloudSwap
        title="The platforms your finance stack already runs on"
        subtitle="Platform-agnostic by design — we implement and optimise whichever tools are right for your business, not the ones we're incentivised to sell."
      />
      <WhoWeAre />
      <MaturityCurve />
      <Solutions />
      <OurPartners />
      <Achievements />
      <Team />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
