import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import WhoWeAre from "@/components/sections/WhoWeAre";
import Solutions from "@/components/sections/Solutions";
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
      <WhoWeAre />
      <Solutions />
      <Achievements />
      <Team />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
