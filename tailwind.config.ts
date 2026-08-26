import type { Config } from "tailwindcss";

// The GAMCS design system lives in app/globals.css (semantic classes, ported
// from the original HTML). These tokens expose the same brand palette to
// Tailwind utilities, plus the shadcn/Kokonut token names those imported
// components expect — all mapped to GAMCS brand values.
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Arbitrary `ease-[cubic-bezier(...)]` classes are reported "ambiguous"
      // by Tailwind 3.4 and compile to nothing, so the easings are named.
      transitionTimingFunction: {
        reel: "cubic-bezier(0.22,1,0.36,1)",
        panel: "cubic-bezier(.5,.85,.25,1.15)",
        label: "cubic-bezier(.5,.85,.25,1.8)",
      },
      colors: {
        // GAMCS brand
        blue: "#0F5E97",
        "blue-dark": "#0A4169",
        yellow: "#F2C230",
        charcoal: "#464646",
        ink: "#202020",
        paper: "#FEFEFE",
        soft: "#F1F3F4",
        line: "#D9DEE1",
        dark: "#232323",
        // shadcn/Kokonut token names -> CSS vars declared in globals.css
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted-bg))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Tailwind v3 stops at 3xl; the footer section asks for 4xl/6xl.
        "4xl": "2rem",
        "6xl": "3rem",
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      keyframes: {
        /* Base UI, not Radix: this project has no @radix-ui packages, and
           --radix-accordion-content-height is never set, so these keyframes
           animated 0 -> 0 and the panel appeared to snap. Base UI's
           collapsible exposes --accordion-panel-height. */
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--accordion-panel-height)" },
        },
        "accordion-up": {
          from: { height: "var(--accordion-panel-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
