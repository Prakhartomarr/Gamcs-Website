import type { MetadataRoute } from "next";
import { intro, site } from "@/lib/content/gamcs";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.short,
    description: intro,
    start_url: "/",
    display: "standalone",
    background_color: "#FEFEFE",
    theme_color: "#0F5E97",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
