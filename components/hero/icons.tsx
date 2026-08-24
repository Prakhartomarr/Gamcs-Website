import type { ReactNode } from "react";

export const Spark = () => <span className="spark">✦</span>;

/** Navy tile with a white sparkle — the card-title marker. */
export const CardIcon = () => (
  <span className="card-icon" aria-hidden="true">
    ✦
  </span>
);

export type CardId = "recon" | "journal" | "flux";

/**
 * Real finance/data tools GAMCS works with, each mapped to the product card it
 * feeds. Positions live in CSS (.chipwrap.c1 … .c7).
 */
export const toolLogos: {
  cls: string;
  label: string;
  link: CardId;
  svg: ReactNode;
}[] = [
  {
    cls: "c1",
    label: "Microsoft Excel",
    link: "recon",
    svg: (
      <svg viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#217346" />
        <text x="12" y="17" fontSize="13" fill="#fff" textAnchor="middle" fontFamily="Arial" fontWeight="700">
          X
        </text>
      </svg>
    ),
  },
  {
    cls: "c2",
    label: "Power BI",
    link: "flux",
    svg: (
      <svg viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#F2C811" />
        <g fill="#4d3d00">
          <rect x="5.5" y="14" width="3.2" height="6" rx="1" />
          <rect x="10.4" y="10" width="3.2" height="10" rx="1" />
          <rect x="15.3" y="6" width="3.2" height="14" rx="1" />
        </g>
      </svg>
    ),
  },
  {
    cls: "c3",
    label: "Google Sheets",
    link: "journal",
    svg: (
      <svg viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#0F9D58" />
        <path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    cls: "c4",
    label: "SAP",
    link: "journal",
    svg: (
      <svg viewBox="0 0 34 24">
        <rect width="34" height="24" rx="4" fill="#1A76D2" />
        <text x="17" y="16.5" fontSize="10" fill="#fff" textAnchor="middle" fontFamily="Arial" fontWeight="800">
          SAP
        </text>
      </svg>
    ),
  },
  {
    cls: "c5",
    label: "Oracle",
    link: "flux",
    svg: (
      <svg viewBox="0 0 34 10">
        <text
          x="17"
          y="8"
          fontSize="7.6"
          fill="#C74634"
          textAnchor="middle"
          fontFamily="Arial"
          fontWeight="800"
          letterSpacing="0.6"
        >
          ORACLE
        </text>
      </svg>
    ),
  },
  {
    cls: "c6",
    label: "Salesforce",
    link: "flux",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M15 8a5 5 0 00-9.2 1.2A4 4 0 006.5 17H15a4.5 4.5 0 000-9z" fill="#00A1E0" />
      </svg>
    ),
  },
  {
    cls: "c7",
    label: "SQL data warehouse",
    link: "flux",
    svg: (
      <svg viewBox="0 0 24 24">
        <ellipse cx="12" cy="7" rx="6.5" ry="3.4" fill="none" stroke="#336791" strokeWidth="1.6" />
        <path
          d="M5.5 7v6c0 1.9 2.9 3.4 6.5 3.4s6.5-1.5 6.5-3.4V7M5.5 12.5V16c0 1.9 2.9 3.4 6.5 3.4s6.5-1.5 6.5-3.4v-3.5"
          fill="none"
          stroke="#336791"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
];
