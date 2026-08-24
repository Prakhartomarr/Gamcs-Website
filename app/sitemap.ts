import type { MetadataRoute } from "next";
import { SITE_URL, absolute } from "@/lib/seo";

/** Every public route. Add a page here the same commit you add the route. */
const routes = [
  { path: "/", priority: 1, changeFrequency: "monthly" as const },
  { path: "/case-study", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/team", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/contact", priority: 0.9, changeFrequency: "yearly" as const },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cookie-policy", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  /* Build time, not request time — a static export needs a fixed value. */
  const lastModified = new Date();
  return routes.map((r) => ({
    url: r.path === "/" ? SITE_URL : absolute(r.path),
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
