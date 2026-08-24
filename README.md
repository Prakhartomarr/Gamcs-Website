# GA Management Consultants — Integrated Finance

Next.js 14 (App Router) + TypeScript + Tailwind rebuild of the single-file GAMCS
redesign. The visual design is ported **verbatim** into `app/globals.css`; the
page is split into components so it can be edited section by section.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

```
app/
  layout.tsx        # <html>/<body>, .shell wrapper, Header + Footer, metadata
  page.tsx          # composes the home page from section components
  globals.css       # full design system (ported from the original HTML)
components/
  layout/           # Header (mobile nav), Footer
  sections/         # Hero, TrustStrip, Model, Services, Metrics, TechSystem,
                    # CaseStudy, People, Quote, Contact
  ContactForm.tsx   # enquiry form → mailto (client)
  ui/ScrollReveal   # IntersectionObserver that reveals `.reveal` elements
lib/
  content/site.ts   # name, tagline, description, url, email
  utils.ts          # cn() classname helper
public/brand/       # logo.jpg (extracted from the original inline base64)
```

## Notes

- Styling is the original CSS, not Tailwind utilities. Tailwind is wired up
  (`tailwind.config.ts` exposes the brand palette/fonts) so new work can use it,
  but existing markup keeps the original class names.
- Fonts (Montserrat, Open Sans) load via a Google Fonts `@import` at the top of
  `globals.css`.
