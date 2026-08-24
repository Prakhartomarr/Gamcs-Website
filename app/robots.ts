import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Everything public is crawlable — including CSS, JS and images, which
 * Google needs in order to render the page it is ranking.
 *
 * Only Next's internals and the API surface are disallowed. /team-01 was a
 * demo route and has been deleted rather than hidden.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/static/chunks/pages/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
