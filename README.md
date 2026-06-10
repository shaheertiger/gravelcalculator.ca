# GravelCalculator.ca

Free, fast, mobile-friendly **gravel calculator** for Canada. Estimates the volume,
weight (tonnage), cubic yards/metres and cost of gravel for driveways, patios, paths,
gardens and drainage. Pure static HTML/CSS/JS — no build step, no dependencies.

## Features

- **Three input modes:** total area, rectangle (length × width), or circle (diameter)
- **Metric & imperial** units for area, length, depth and price
- Outputs **m³, yd³, ft³, tonnes, kg and lb**, plus an optional **cost in CAD**
- Multiple **gravel density presets** (pea gravel, crushed stone, river rock…) + custom density
- Calculation runs entirely client-side; nothing is sent to a server

## SEO / LLM / AdSense optimization

- Semantic HTML5, descriptive `<title>`/meta description, canonical URL, Open Graph & Twitter cards
- JSON-LD structured data: `WebApplication`, `BreadcrumbList`, `HowTo`, `FAQPage`
- `sitemap.xml`, `robots.txt` (LLM crawlers explicitly allowed), `llms.txt`
- Long-form content: how-to guide, coverage chart, depth table, gravel types, FAQ
- Google AdSense slots, `ads.txt`, plus Privacy and Terms pages for ad-network approval

## Setup

1. Replace every `ca-pub-XXXXXXXXXXXXXXXX` placeholder (in `index.html`) and
   `pub-XXXXXXXXXXXXXXXX` (in `ads.txt`) with your real Google AdSense publisher ID,
   and set each `data-ad-slot` to your ad unit IDs.
2. Add an `og-image.png` (1200×630) to the root for social sharing.
3. Deploy the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages, etc.).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Calculator + content |
| `style.css` | Styles |
| `script.js` | Calculator logic |
| `privacy.html`, `terms.html` | Legal pages (AdSense) |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Crawler/SEO files |
| `ads.txt`, `site.webmanifest`, `favicon.svg`, `404.html` | Ads, PWA, icon, error page |
