import type { SVGProps } from "react";

/**
 * The platform trust bar, exactly the ten named in the copy doc's hero
 * "Trust bar (logos)" line.
 *
 * These are simplified geometric glyphs drawn in each platform's brand colour,
 * not the official trademark files. The name label under each one does the
 * identifying work, so nothing here passes an approximation off as an official
 * asset. Each glyph paints with `currentColor`, so the colour comes from the
 * entry below and one prop restyles the whole row.
 */
type IconProps = SVGProps<SVGSVGElement>;

const S = (p: IconProps) => ({
  viewBox: "0 0 32 32",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  ...p,
});

const PowerBI = (p: IconProps) => (
  <svg {...S(p)}>
    <rect x="4" y="17" width="6" height="11" rx="1.5" fill="currentColor" />
    <rect x="13" y="11" width="6" height="17" rx="1.5" fill="currentColor" opacity=".78" />
    <rect x="22" y="4" width="6" height="24" rx="1.5" fill="currentColor" opacity=".55" />
  </svg>
);

const Tableau = (p: IconProps) => (
  <svg {...S(p)}>
    <rect x="14.6" y="4" width="2.8" height="24" rx="1.4" fill="currentColor" />
    <rect x="4" y="14.6" width="24" height="2.8" rx="1.4" fill="currentColor" />
    <rect x="8.4" y="8.4" width="2" height="15.2" rx="1" fill="currentColor" opacity=".55" />
    <rect x="21.6" y="8.4" width="2" height="15.2" rx="1" fill="currentColor" opacity=".55" />
  </svg>
);

const SAP = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M2 8h22l6 8-6 8H2V8Z" fill="currentColor" opacity=".9" />
    <path d="M8 13h5.5a2.5 2.5 0 0 1 0 5H11v3H8v-8Z" fill="#fff" />
  </svg>
);

const NetSuite = (p: IconProps) => (
  <svg {...S(p)}>
    <rect x="3" y="6" width="26" height="20" rx="5" fill="currentColor" opacity=".14" />
    <path d="M10 22V10l12 12V10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Salesforce = (p: IconProps) => (
  <svg {...S(p)}>
    <path
      d="M11 23a5 5 0 0 1-.6-9.96A6 6 0 0 1 21.6 11.6 4.6 4.6 0 1 1 22.5 23H11Z"
      fill="currentColor"
    />
  </svg>
);

const QuickBooks = (p: IconProps) => (
  <svg {...S(p)}>
    <circle cx="16" cy="16" r="12" fill="currentColor" />
    <path d="M13.4 11.6a5.2 5.2 0 0 0 0 8.8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M18.6 20.4a5.2 5.2 0 0 0 0-8.8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const Unit4 = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M7 6v11a9 9 0 0 0 18 0V6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);

const Azure = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M13 4 4 24h6l3-20Z" fill="currentColor" opacity=".62" />
    <path d="M15 8 6.5 26H28L22 15h-6l3-3-4-4Z" fill="currentColor" />
  </svg>
);

const AWS = (p: IconProps) => (
  <svg {...S(p)}>
    <path d="M6 13.5c0-2 1.7-3.5 4-3.5s4 1.5 4 3.5V19h-2.4v-1a3.4 3.4 0 0 1-2.7 1.2C6.9 19.2 6 18 6 16.6c0-1.6 1.2-2.6 3.4-2.6h2.2v-.5c0-1-.7-1.6-1.7-1.6s-1.6.5-1.7 1.2L6 13.5Z" fill="currentColor" />
    <path d="M4 23.5c5.5 3.2 14.5 3.2 20-.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="m24.6 22.4 3.4-.6-1.2 3.2" fill="currentColor" />
  </svg>
);

const GoogleCloud = (p: IconProps) => (
  <svg {...S(p)}>
    <path
      d="M11 24a6 6 0 0 1-.7-11.96A7 7 0 0 1 23.4 13.2 5.4 5.4 0 0 1 22.6 24H11Z"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const LOGOS: {
  name: string;
  color: string;
  Icon: (p: IconProps) => JSX.Element;
}[] = [
  { name: "Power BI", color: "#E8A200", Icon: PowerBI },
  { name: "Tableau", color: "#E97627", Icon: Tableau },
  { name: "SAP", color: "#0AA1E2", Icon: SAP },
  { name: "NetSuite", color: "#1F3D8C", Icon: NetSuite },
  { name: "Salesforce", color: "#00A1E0", Icon: Salesforce },
  { name: "QuickBooks", color: "#2CA01C", Icon: QuickBooks },
  { name: "Unit4", color: "#0F5E97", Icon: Unit4 },
  { name: "Azure", color: "#0078D4", Icon: Azure },
  { name: "AWS", color: "#E8891A", Icon: AWS },
  { name: "Google Cloud", color: "#4285F4", Icon: GoogleCloud },
];
