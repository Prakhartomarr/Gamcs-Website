import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const shadersVersion = JSON.parse(
  readFileSync(new URL("./node_modules/shaders/package.json", import.meta.url), "utf8")
).version;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Lets a production build run without stomping on the .next directory a
     live `next dev` is holding: NEXT_DIST_DIR=.next-build npm run build */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* The hero shader's chunk was 1.8MB, and most of it was effects the hero
     never draws: `shaders`' core statically imports a registry of all ~200,
     so tree-shaking cannot drop any of them (2026-10-23). The renderer's one
     use of that registry is a texture-size lookup only the image, video and
     webcam textures answer, so it is swapped for an empty one. The export
     names it fills in are minified per release, so the swap only happens on
     the version it was checked against; any other version builds untouched
     and simply ships the full chunk again. */
  webpack(config, { webpack }) {
    if (shadersVersion === "3.1.459") {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /[\\/]shaders[\\/]dist[\\/]core[\\/]shaderRegistry-[\w-]+\.js$/,
          fileURLToPath(new URL("./lib/shaders/registry-stub.js", import.meta.url))
        )
      );
    }
    return config;
  },
  /* Don't advertise the framework version to anyone scanning for it. */
  poweredByHeader: false,
  images: {
    /* Modern formats first; Next falls back to the original for old clients. */
    formats: ["image/avif", "image/webp"],
  },
  /* The six original pillar URLs, retired when the solutions were regrouped
     into five (GAMCS_Web_View_1.html, 2026-09-15). The two pillars that merged
     into Digital Transformation each land on their own arm. */
  async redirects() {
    return [
      { source: "/solutions/fpa-strategic-finance", destination: "/solutions/fpa-cfo-advisory", permanent: true },
      { source: "/solutions/offshoring-centers-of-excellence", destination: "/solutions/finance-team-extension", permanent: true },
      { source: "/solutions/bi-decision-intelligence", destination: "/solutions/digital-transformation#analytics", permanent: true },
      { source: "/solutions/technology-systems-implementation", destination: "/solutions/digital-transformation#tools", permanent: true },
      { source: "/solutions/transaction-advisory-due-diligence", destination: "/solutions/deal-advisory", permanent: true },
      { source: "/solutions/finance-capability-building", destination: "/solutions/training-enablement", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          /* A Vercel build is a preview copy, never the live site (that is
             AWS Amplify): keep every response out of search indexes. Mirrors
             INDEXABLE in lib/seo.ts. */
          ...(process.env.VERCEL === "1" ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /* No third party has a reason to frame this site. */
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
