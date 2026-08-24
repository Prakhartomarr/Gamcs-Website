/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Lets a production build run without stomping on the .next directory a
     live `next dev` is holding: NEXT_DIST_DIR=.next-build npm run build */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  /* Don't advertise the framework version to anyone scanning for it. */
  poweredByHeader: false,
  images: {
    /* Modern formats first; Next falls back to the original for old clients. */
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
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
