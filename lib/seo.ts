import type { Metadata } from "next";
import { site } from "@/lib/content/gamcs";

/**
 * One place that knows the site's absolute origin.
 *
 * Falls back to the published domain, so a build with no env vars still emits
 * production URLs in canonicals and OG tags rather than localhost. Set
 * NEXT_PUBLIC_SITE_URL on preview deployments to point them at themselves.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || site.url
).replace(/\/$/, "");

export const absolute = (path: string) =>
  new URL(path, SITE_URL + "/").toString();

/**
 * The share card, as an absolute URL.
 *
 * Next only attaches the file-convention opengraph-image automatically to a
 * segment that does not declare its own `openGraph` object — every page here
 * does, so each one was shipping an OG card with no image. Declaring it
 * explicitly also pins the origin: the file convention resolves against the
 * request host in dev, which put localhost into the tags.
 */
export const OG_IMAGE = {
  url: absolute("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

/**
 * Per-page metadata. Every public route calls this, so no page can ship with
 * a duplicated title, a missing canonical or an OG card that points at the
 * wrong URL.
 *
 * `title` is the page's own name — the "| GA Management Consultants" suffix
 * comes from the template in the root layout, so it is never typed twice.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = absolute(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      locale: "en_IN",
      type,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
