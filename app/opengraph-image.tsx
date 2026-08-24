import { ImageResponse } from "next/og";
import { site } from "@/lib/content/gamcs";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The social share card, generated at build time by next/og — no design tool
 * round-trip, no binary to keep in sync with the brand, and no extra
 * dependency (next/og ships with Next).
 *
 * Deliberately typeface-agnostic: pulling Montserrat would make every build
 * depend on a network fetch from Google. The palette, the rule and the
 * wordmark carry the brand instead.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0F5E97",
          padding: "72px 80px",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 16,
              height: 56,
              background: "#F2C230",
              borderRadius: 3,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: "0.16em",
            }}
          >
            {site.short}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              maxWidth: 900,
            }}
          >
            {site.tagline}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 34,
              color: "#CFE2F0",
            }}
          >
            {site.subheading}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: "#BFD8EA",
            borderTop: "1px solid rgba(255,255,255,0.25)",
            paddingTop: 26,
          }}
        >
          <span>{site.name}</span>
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    size
  );
}
