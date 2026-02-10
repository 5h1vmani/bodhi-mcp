---
domain: frontend
topic: ai-document-generation
tags:
  [
    pdf,
    tailwind,
    puppeteer,
    react-pdf,
    typst,
    marp,
    ai-agents,
    document-generation,
  ]
complexity: advanced
last_updated: 2026-01-30
---

# AI-Agent Document Generation

> Decision frameworks for AI agents generating professional PDFs and presentations with minimal human intervention.

## TL;DR

- **HTML + Tailwind + Playwright/Puppeteer = best general pipeline** — full CSS support, predictable output, scales to 10K PDFs/day on Lambda for <$8/month
- **Match tool to document type** — Marp for pitch decks (Markdown native, PPTX export), Typst for technical/reports (best typography), HTML+Playwright for branded visuals (maximum design control)
- **Design constraints > design freedom for AI** — explicit color codes, 8px spacing grid, and typography scales produce 40-60% better output than vague instructions (NN/G, Figma research)
- **Avoid jsPDF (rasterizes text) and wkhtmltopdf (archived 2024)** — both produce unprofessional output; React-PDF if you need vector PDFs without a browser dependency
- **5-step agent pipeline** — content structure → design system select → component generate → render to PDF → quality validate; skip steps = inconsistent output

## Decision Guide

### Tool Selection by Document Type

| Document Type        | Primary Tool      | Why                                                | Quality Ceiling |
| -------------------- | ----------------- | -------------------------------------------------- | --------------- |
| Pitch deck (slides)  | Marp (Markdown)   | LLM-native Markdown, PPTX fallback, instant render | ~85% designer   |
| Pitch deck (premium) | HTML + Playwright | Full CSS control, gradients, custom layouts        | ~95% designer   |
| Technical report     | Typst via Pandoc  | Best typography (Knuth algo), millisecond compile  | ~95%+ print     |
| Business report      | HTML + Playwright | Tailwind styling, chart embedding, brand control   | ~90-95%         |
| Invoice / structured | React-PDF         | Vector output, no browser, deterministic layout    | ~90%            |
| Branded comms        | HTML + Playwright | Design token control, print CSS, full CSS Grid     | ~90-95%         |

### Rendering Engine Selection

| Scenario                                          | Use                        | Avoid                       | Why                             |
| ------------------------------------------------- | -------------------------- | --------------------------- | ------------------------------- |
| Need full modern CSS (Grid, Flexbox, shadows)     | Puppeteer/Playwright       | React-PDF, WeasyPrint       | Chrome engine = complete CSS    |
| Need vector PDF (searchable, small file)          | React-PDF                  | jsPDF + html2canvas         | jsPDF rasterizes = blurry text  |
| Need professional typography (ligatures, kerning) | Prince XML or Typst        | Headless browsers           | Specialized typesetting engines |
| Python-only environment                           | WeasyPrint                 | wkhtmltopdf                 | wkhtmltopdf archived July 2024  |
| Budget-constrained, high volume                   | Puppeteer on Lambda        | Prince XML ($5-15K license) | Free + $7.68/mo at 10K/day      |
| Need PPTX + PDF from same source                  | Marp or Slidev             | Puppeteer                   | Native multi-format export      |
| LLM generating markup directly                    | Markdown (via Marp/Pandoc) | Typst (training data gap)   | LLMs trained extensively on MD  |

## Common Mistakes

| Mistake                                         | Fix                                                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Using jsPDF for professional docs               | Switch to Puppeteer or React-PDF; jsPDF rasterizes text into images (non-searchable, blurry on zoom) |
| Generating Typst directly from LLM              | Route through Markdown → Pandoc → Typst; LLMs lack Typst training data, confuse it with LaTeX/MD     |
| Vague design prompts ("make it professional")   | Provide explicit hex codes, px values, font specs; "Use #2C3E50 for headers, 8px spacing grid"       |
| Skipping `printBackground: true`                | Always set in Puppeteer/Playwright; without it, background colors/gradients disappear in PDF         |
| Not setting `-webkit-print-color-adjust: exact` | Add to CSS root; browsers strip colors in print mode by default                                      |
| Using wkhtmltopdf for new projects              | Archived July 2024, Qt WebKit from 2016; no Grid/Flexbox support; migrate to Puppeteer               |
| One-step generation (prompt → PDF)              | Use 5-step pipeline: structure → design → generate → render → validate; single-step = inconsistent   |
| Embedding images via URL in PDF                 | Use base64 data URIs; Chromium doesn't cache data URIs but avoids network failures during generation |

## Checklist

- [ ] Tool selected based on document type (see Decision Guide)
- [ ] Design constraints defined: color palette (hex codes), typography scale (px), spacing grid (8px multiples)
- [ ] Print CSS configured: `printBackground: true`, `print-color-adjust: exact`, `break-inside: avoid`
- [ ] Page break strategy: `break-inside: avoid` on sections, explicit `break-before` for new pages
- [ ] Charts generated as SVG/Canvas then embedded (not external image URLs)
- [ ] Output validated: text searchable, colors preserved, images render, page breaks correct
- [ ] Pipeline handles errors: timeouts, malformed HTML recovery, retry logic

## Agent Pipeline Architecture

The 5-step pattern for zero-touch document generation:

| Step                    | Agent Role      | Input               | Output                                 | Tools                 |
| ----------------------- | --------------- | ------------------- | -------------------------------------- | --------------------- |
| 1. Content Structure    | Content planner | Raw data, brief     | Structured outline (JSON/MD)           | LLM                   |
| 2. Design System        | Design selector | Content type, brand | Design tokens (colors, fonts, spacing) | Token library         |
| 3. Component Generation | Code generator  | Outline + tokens    | HTML/React per section                 | LLM + v0.dev          |
| 4. Render to PDF        | Assembler       | All components      | Final PDF                              | Playwright/Typst/Marp |
| 5. Quality Validation   | QA checker      | PDF output          | Pass/fail + issues                     | Vision API or rules   |

**Automation levels:**

- **Full zero-touch**: Steps 1-5 automated. Use for: internal reports, standardized templates
- **One checkpoint**: Human reviews after Step 3. Use for: client-facing, brand-sensitive
- **Human-in-loop**: Human reviews after Steps 3 and 5. Use for: investor decks, marketing

## Design Constraints That Improve AI Output

Synthesized from NN/G research, Figma "Cooking with Constraints," and production patterns:

| Constraint Type | Bad (Vague)                       | Good (Explicit)                                                             | Impact       |
| --------------- | --------------------------------- | --------------------------------------------------------------------------- | ------------ |
| Color           | "Use professional colors"         | "Primary: #2C3E50, Accent: #3498DB, Background: #F8F9FA"                    | 50%+ quality |
| Typography      | "Use nice fonts"                  | "H1: Inter 28px/700, Body: Inter 14px/400, line-height: 1.6"                | 40%+ quality |
| Spacing         | "Make it balanced"                | "All margins: multiples of 8px. Section gap: 48px, component padding: 16px" | 30%+ quality |
| Layout          | "Make it look good"               | "12-column CSS Grid, 24px gap, max-width: 960px"                            | 40%+ quality |
| Hierarchy       | "Make important things stand out" | "CTA: 18px bold, Secondary: 16px regular, Caption: 12px #6B7280"            | 35%+ quality |

## Print CSS Essentials

Critical CSS rules that AI agents must include when generating HTML-to-PDF:

```css
/* Required: Force color output in print mode */
* {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Prevent content splitting across pages */
.section,
.card,
.chart-container {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Force page breaks where needed */
.new-page {
  break-before: page;
}

/* Typography for PDF readability */
body {
  font-size: 14px;
  line-height: 1.6;
  color: #1a1a1a;
}

/* Hide screen-only elements */
.no-print,
nav,
.sidebar {
  display: none !important;
}
```

**Playwright/Puppeteer PDF config:**

```javascript
const pdf = await page.pdf({
  format: "A4",
  printBackground: true, // CRITICAL: enables background colors
  preferCSSPageSize: true, // Let CSS @page rules control size
  margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
  displayHeaderFooter: true,
  footerTemplate:
    '<div style="width:100%;text-align:center;font-size:10px"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
});
```

## Marp Advanced CSS: Gotchas and Workarounds

Marp uses Chromium via Puppeteer for PDF — so glassmorphism, gradients, and modern CSS all work. The gotchas are Marp-specific, not CSS-specific:

| Issue                              | What Happens                                                          | Workaround                                                                          |
| ---------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Slides default to `display: flex`  | CSS columns, `float`, and some Grid layouts break                     | Add `section { display: block; }` in theme CSS (native fix coming in Marp Core v4)  |
| Multiple background images         | Only the last `![bg](image)` renders                                  | Use inline SVG or `<div>` with CSS `background` for layered backgrounds             |
| `@import` skips Marp preprocessing | Imported CSS won't get `rem` → relative transforms or scoping         | Use `@font-face` imports only (Google Fonts); put all other CSS in `<style scoped>` |
| `<style scoped>` ≠ HTML `scoped`   | Marp's `scoped` is its own implementation (HTML scoped is deprecated) | Use it freely — it targets the current slide's `<section>` only                     |
| CSS animations in PDF              | Puppeteer captures a single static frame — no animation               | Design for static; use animations only in HTML export mode                          |
| Heavy glassmorphism on every slide | `<style scoped>` per slide gets repetitive; you're fighting Markdown  | Switch to HTML+Playwright for decks where >50% slides need complex visual effects   |

**Decision: Marp vs HTML+Playwright for visual decks:**

| Visual Complexity                        | Use                                       | Quality       |
| ---------------------------------------- | ----------------------------------------- | ------------- |
| Clean + a few glass/gradient accents     | Marp with `<style scoped>`                | ~85% designer |
| Mixed — some visual, some text-heavy     | Marp → export HTML → enhance → Playwright | ~90% designer |
| Every slide = layered visual composition | HTML + Tailwind + Playwright              | ~95% designer |

**The hybrid approach** (Marp generates structure from Markdown → export HTML → AI agent enhances with advanced CSS → Playwright renders final PDF) gives Markdown speed for content with full CSS freedom for visuals.

## Presentation Pipeline (Pitch Decks)

| Tool              | Input Format    | Outputs         | LLM Friendliness         | Best For                 |
| ----------------- | --------------- | --------------- | ------------------------ | ------------------------ |
| Marp              | Markdown + YAML | PDF, PPTX, HTML | Excellent (native MD)    | Quick professional decks |
| Slidev            | Vue + Markdown  | PDF, PNG, HTML  | Good (MD + components)   | Developer-audience decks |
| reveal.js         | HTML + MD       | PDF (via print) | Good                     | Highly customized        |
| HTML + Playwright | HTML + CSS      | PDF             | Excellent (HTML trained) | Premium branded decks    |
| Gamma API         | API calls       | PDF, web        | N/A (API-driven)         | Fastest automated decks  |

**For pitch decks, Marp gives best effort-to-quality ratio** — LLM generates Markdown slides naturally, and the PPTX export lets humans edit if needed.

## References

- [Puppeteer PDF API](https://pptr.dev/api/puppeteer.page.pdf) — Official page.pdf() options
- [Playwright PDF Guide](https://playwright.dev/docs/api/class-page#page-pdf) — Cross-browser PDF generation
- [React-PDF](https://react-pdf.org/) — Vector PDF from React components
- [Typst](https://typst.app/) — Modern typesetting (millisecond compilation)
- [Marp](https://marp.app/) — Markdown to presentation ecosystem
- [Slidev](https://sli.dev/) — Vue-powered developer presentations
- [Paged.js](https://pagedjs.org/) — W3C Paged Media polyfill (experimental)
- [Gotenberg](https://gotenberg.dev/) — Containerized PDF API wrapping Chrome + LibreOffice
- [Figma: Cooking with Constraints](https://www.figma.com/blog/designer-framework-for-better-ai-prompts/) — Design constraint framework for AI

## Related

- [pitch-deck-strategy.md](../marketing/pitch-deck-strategy.md) — Deck structure, investor psychology, content frameworks
- [design-system-foundations.md](../ux/design-system-foundations.md) — Design tokens, type scale, spacing systems
- [component-api-architecture.md](../ux/component-api-architecture.md) — Component distribution, CSS strategy
- [server-components.md](./server-components.md) — Server-side rendering patterns
- [agent-workflows.md](../ai-development/agent-workflows.md) — Multi-agent orchestration, cost optimization

---

## Changelog

| Date       | Change                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-30 | Initial version — synthesized from Puppeteer, Playwright, React-PDF, Typst, Marp, Prince XML, WeasyPrint, Paged.js research + AI doc generation workflow patterns |
| 2026-01-30 | Added Marp advanced CSS gotchas — flex default, @import preprocessing, multi-bg, scoped styles, hybrid pipeline                                                   |
