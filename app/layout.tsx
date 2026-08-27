import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/ui/header-2";
import { SiteFooter } from "@/components/ui/site-footer";
import MotionLayer from "@/components/motion/MotionLayer";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import HeaderHeight from "@/components/HeaderHeight";
import Preloader from "@/components/Preloader";
import { GaLogoSprite } from "@/components/ui/GaLogo";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import { OG_IMAGE, SITE_URL, absolute } from "@/lib/seo";
import { intro, site } from "@/lib/content/gamcs";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /* Pages supply their own name; the brand suffix is added here exactly once,
     so no page can ship a duplicate or a doubled-up title. */
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: intro,
  applicationName: site.name,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  publisher: site.legalName,
  alternates: { canonical: absolute("/") },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: intro,
    url: absolute("/"),
    siteName: site.name,
    locale: "en_IN",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: intro,
    images: [OG_IMAGE.url],
  },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: "#0F5E97",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  /* Not capping maximum-scale: pinch-zoom is an accessibility requirement. */
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GaLogoSprite />
        <Preloader />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="shell">
          <Header />
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
        <HeaderHeight />
        <MotionLayer />
        <StickyMobileCTA />
        <CookieConsent />
        <Analytics />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
      </body>
    </html>
  );
}
