---
domain: marketing
topic: brand-production-pipeline
tags: [branding, brand-assets, design-tokens, brand-production]
complexity: intermediate
last_updated: 2026-03-24
confidence: 0.8
source_refs:
  [
    "Pentagram/Wolff Olins/Collins agency workflows",
    "Interbrand brand deliverables framework",
    "Vercel/Linear/Stripe brand asset pages",
    "WCAG 2.1 contrast guidelines + APCA",
    "W3C Design Tokens Community Group spec",
  ]
status: validated
review_by: 2026-09-24
author: opus-4.6 (synthesis from agency research + implementation)
version: 1
---

# Brand Production Pipeline

> How to turn brand strategy decisions into production-ready assets. The bridge between "we know what the brand is" and "here are the files to build with." Covers what agencies like Pentagram and Wolff Olins deliver, what AI agents can generate, and what needs a human.

## TL;DR

- **~60% of agency deliverables are systematic transforms of strategy decisions.** Tokens, color files, favicon packages, voice guides, README templates, meta tags. AI agents can produce these directly.
- **~40% needs human craft.** Final logo refinement (optical balance, kerning), photography, illustration, motion design, print production.
- **The assets/ folder is the deliverable.** tokens/, logo/, favicon/, guidelines/, templates/, seo/. A developer should clone it and build a branded site without asking questions.
- **Accessibility audit before production, not after.** Check every color combination against WCAG AA (4.5:1). Fix failing light-mode accents before generating assets. Retrofitting is 3x more expensive.
- **Brand guidelines fail when they describe. They work when they decide.** "Our brand is warm and professional" fails. "Use JetBrains Mono 600 for headings, never use exclamation marks, 2px radius everywhere" works.

## Decision Guide

| Scenario                                        | Approach                                                                                                            | Why                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Brand strategy complete, need assets            | Run the production pipeline: tokens, logos, favicons, guidelines, templates, SEO files                              | Systematic transform. AI agents handle 60%+.                                                    |
| Geometric/monolinear logo (devtools, infra)     | Generate SVG directly in code. All variants (dark/light/mono).                                                      | Code-generated SVGs are precise, scalable, consistent. Perfect for technical brands.            |
| Complex illustrative logo (consumer, lifestyle) | AI generates 3-5 SVG explorations. Hand to designer for refinement.                                                 | Complex marks need optical balance a designer provides.                                         |
| Light mode palette failing contrast             | Darken accent colors via HSL lightness reduction until 4.5:1 on lightest bg. Keep hue + saturation.                 | Same color family, just darker. Visual shift is minimal, accessibility gain is critical.        |
| Need design tokens for engineering              | Export to W3C DTCG JSON + CSS custom properties. Include dark/light mode, semantic mappings.                        | JSON for tooling (Style Dictionary, Figma), CSS for direct use. Both from same source of truth. |
| Voice guide needed for team/contractors         | Consolidate strategy into: we are/aren't table + banned words + context examples (README, error, changelog, social) | Examples teach. Adjective lists don't. Include good/bad comparisons per context.                |
| Website copy direction needed                   | Create website blueprint: site map + per-section copy spec + StoryBrand narrative thread                            | Developers need "what goes in section 3" not "create compelling content."                       |

## The Asset Folder Structure

```
assets/
├── tokens/
│   ├── design-tokens.json       (W3C DTCG format: colors, type, spacing, shape)
│   └── colors.css               (CSS custom properties, dark + light mode)
├── logo/
│   ├── icon-only.svg
│   ├── logo-horizontal.svg
│   ├── logo-stacked.svg
│   ├── wordmark-only.svg
│   └── variants/
│       ├── icon-dark-bg.svg     (primary color on dark)
│       ├── icon-light-bg.svg    (dark primary on light)
│       ├── icon-mono-dark.svg   (white, for dark surfaces)
│       └── icon-mono-light.svg  (dark, for light surfaces)
├── favicon/
│   ├── favicon.svg              (SVG source, thick strokes)
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── apple-touch-icon-180.png (branded bg + icon)
│   ├── icon-512.png             (PWA/Android)
│   └── og-image-1200x630.png   (default social card)
├── guidelines/
│   ├── brand-guidelines.md      (full brand book)
│   ├── dos-and-donts.md         (misuse examples)
│   └── quick-reference.md       (one-pager for contractors)
├── templates/
│   ├── readme-template.md
│   ├── og-image-template.html   (editable, render via Satori)
│   └── meta-tags.html           (copy-paste HTML head)
├── seo/
│   ├── llms.txt
│   └── structured-data.json     (JSON-LD)
└── website-blueprint.md         (site map + section-by-section spec)
```

## AI vs Human: What Each Produces

| Asset                    | AI agent           | Human designer      | Notes                                                          |
| ------------------------ | ------------------ | ------------------- | -------------------------------------------------------------- |
| Design tokens (JSON/CSS) | Fully automated    | Review only         | Deterministic transform of palette decisions                   |
| SVG logos (geometric)    | Generates well     | Refines proportions | For monolinear/geometric marks, AI output is production-usable |
| SVG logos (illustrative) | Rough explorations | Essential           | Complex marks need optical balance                             |
| Favicon PNGs             | Fully automated    | Not needed          | `cairosvg` or `sharp` from SVG source                          |
| Voice/tone guide         | Excels             | Review tone         | AI is strong at consolidation + example generation             |
| Brand guidelines         | Good first draft   | Adds misuse visuals | AI writes rules; human adds visual do/don't examples           |
| Website blueprint        | Excels             | Not needed          | Structural/copy decisions are AI-native                        |
| OG image template        | Generates HTML     | Not needed          | Render via Satori or Puppeteer                                 |
| Photography direction    | Describes style    | Shoots/selects      | AI specs the look; humans produce the images                   |
| Motion/animation         | Specs principles   | Produces files      | AI defines timing/easing; humans create Lottie/AE              |
| Print production         | Not feasible       | Essential           | Bleed, CMYK, paper stock need production expertise             |

## Accessibility Audit (Required Before Production)

### Contrast Targets by Text Role

| Text role                                  | Target     | Why                                       |
| ------------------------------------------ | ---------- | ----------------------------------------- |
| Body text (docs, guides, long reading)     | AAA (7:1)  | Extended reading demands highest contrast |
| Headings, links, accent text               | AA (4.5:1) | Large or short text, adequate at AA       |
| Labels, captions, nav                      | AA (4.5:1) | Short text, functional                    |
| Decorative (borders, disabled, watermarks) | No minimum | Not meant to be read                      |

### How to Fix Failing Colors

1. Convert hex to HSL
2. Keep H (hue) and S (saturation) identical
3. Reduce L (lightness) until contrast ratio hits target on the lightest background
4. Binary search: check ratio, adjust, check again
5. Verify the fixed color on ALL backgrounds (void, base, surface, card/white)

**Tool:** `python3 -c "import cairosvg"` confirms cairosvg is available. For contrast calculation, use the WCAG relative luminance formula.

### What Top Companies Target

| Level | Normal Text | Large Text | Who Targets                                                 |
| ----- | ----------- | ---------- | ----------------------------------------------------------- |
| AA    | 4.5:1       | 3:1        | Google, Apple, Microsoft, most enterprises (legal standard) |
| AAA   | 7:1         | 4.5:1      | Government, healthcare; aspirational for docs/long-form     |

**Recommendation:** AA minimum across the board. AAA for body text on primary reading surfaces (docs, guides, blog).

## Common Mistakes

| Mistake                                          | Fix                                                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Generating assets before accessibility audit     | Audit palette first. Fix failing colors. Then generate tokens and all downstream assets. Retrofitting costs 3x.                      |
| Brand guidelines that describe instead of decide | Replace "warm and professional" with "JetBrains Mono 600 for headings, 2px radius, no exclamation marks." Decisions, not adjectives. |
| Logo only in one variant (amber on transparent)  | Generate all 4: dark-bg, light-bg, mono-dark, mono-light. Every context needs a variant.                                             |
| Favicon too detailed at 16px                     | Use thicker strokes (3-4px) for 16px/32px variants. Thin 1px strokes disappear at small sizes.                                       |
| Voice guide with rules but no examples           | Every voice rule needs a GOOD and BAD example per context (README, error, changelog, social, community).                             |
| No llms.txt                                      | AI crawlers are a growing discovery channel. Add /llms.txt from day one. See `seo-aio-discoverability.md`.                           |
| Skipping the website blueprint                   | Without section-by-section spec, every developer/designer asks "what goes here?" The blueprint eliminates 90% of those questions.    |

## Checklist

- [ ] Palette passes WCAG AA (4.5:1) on all intended bg/fg combinations
- [ ] Body text colors pass AAA (7:1) on primary reading surface
- [ ] Design tokens exported as JSON (W3C DTCG) and CSS custom properties
- [ ] Logo SVGs in 4+ variants (dark-bg, light-bg, mono-dark, mono-light)
- [ ] Favicon package includes SVG, 16px, 32px, 180px (apple-touch), 512px
- [ ] OG image at 1200x630 with brand identity
- [ ] Voice guide includes context-specific examples (not just rules)
- [ ] Brand guidelines include do's and don'ts with misuse examples
- [ ] Quick-reference card exists for contractors/partners
- [ ] README template follows the voice guide
- [ ] meta-tags.html is copy-paste ready
- [ ] llms.txt at site root
- [ ] structured-data.json (JSON-LD) for homepage
- [ ] Website blueprint covers every page and section

## References

- [Ramotion: Top Branding Agencies Workflow](https://www.ramotion.com/blog/top-branding-agencies/)
- [D2 Creative: Branding Deliverables](https://www.d2creative.com/digital-glossary/branding-deliverables/)
- [Vercel: Brand Assets](https://vercel.com/changelog/easily-access-vercel-brand-assets-and-guidelines)
- [Linear: Brand Guidelines](https://developers.linear.app/docs/brand/brand-guidelines)
- [W3C WCAG 2.1 Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
