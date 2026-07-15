---
domain: ux
topic: text color hierarchy — decide the shades once, fix them everywhere
tags: [typography, color, tokens, contrast, apca]
complexity: intermediate
last_updated: 2026-07-04
confidence: 0.85
source_refs:
  - "Apple HIG label/secondaryLabel/tertiaryLabel/quaternaryLabel opacity ladder"
  - "Material 3 on-surface/on-surface-variant; IBM Carbon text-* tokens; GitHub Primer fg.*"
  - "Radix 12-step scale (steps 11/12 = Lc 60/90); APCA Lc targets; OKLCH authoring"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku researchers
version: 1
---

# Text Color Hierarchy

> Text shades should be decided once, as a semantic ramp, and referenced everywhere. Every text element points at `text.primary` … `text.disabled` — never a raw hex or a raw opacity. Change the ramp, and every screen moves at once.

## TL;DR

- **Four levels, decided once:** primary (body/headings), secondary (captions/metadata), tertiary (placeholders/timestamps), disabled. Every top system converges on this.
- **Reference tokens, never raw values.** The indirection is the whole point — it is how you "fix them all at once."
- **Anchor each level to an APCA Lc target**, not a WCAG ratio: primary Lc ≥ 90, secondary ≥ 75, tertiary ≥ 60, disabled < 60 by intent.
- **Prefer solid tokens over an opacity ladder.** Opacity is elegant but collapses over colored/photo backgrounds — the known legibility trap. Solid colors per surface guarantee contrast.
- **Author in OKLCH so light/dark/high-contrast is one lightness flip**, not three hand-tuned palettes.

## Decision Guide

| Decision                       | Choice                                             | Why                                                     |
| ------------------------------ | -------------------------------------------------- | ------------------------------------------------------- |
| How many levels                | 4: primary / secondary / tertiary / disabled       | The convergent industry pattern; more is noise          |
| Opacity ladder or solid tokens | Solid tokens per surface                           | Opacity over a colored background loses contrast        |
| Contrast target                | APCA Lc (90 / 75 / 60 / <60), not WCAG 7:1         | Perceptual; accounts for weight and size                |
| Authoring space                | OKLCH                                              | Light/dark/high-contrast = a lightness flip of one ramp |
| Primary text color             | Near-black on light, near-white (not pure) on dark | Pure `#000`/`#fff` causes halation and eye strain       |
| Text over brand/photo          | A dedicated `on-color` set, contrast-checked       | The default ramp is tuned for neutral surfaces only     |

## The convergent pattern (what top companies actually ship)

| Level         | Use                      | Apple                    | Material 3           | IBM Carbon                  | GitHub Primer | Radix       |
| ------------- | ------------------------ | ------------------------ | -------------------- | --------------------------- | ------------- | ----------- |
| **Primary**   | body, headings           | `label` (~100%)          | `on-surface`         | `text-primary`              | `fg.default`  | step **12** |
| **Secondary** | captions, metadata       | `secondaryLabel` (~60%)  | `on-surface-variant` | `text-secondary`            | `fg.muted`    | step **11** |
| **Tertiary**  | placeholders, timestamps | `tertiaryLabel` (~30%)   | (on-surface @ ~60%)  | `text-placeholder`/`helper` | `fg.subtle`   | (custom)    |
| **Disabled**  | disabled, watermark      | `quaternaryLabel` (~18%) | `on-surface` @ 38%   | `text-disabled`             | —             | step 11 dim |

The naming differs; the structure is identical. **Radix is the most engineered:** steps 11 and 12 are guaranteed **Lc 60 and Lc 90** on a step-2 background, so the contrast is provable, not eyeballed.

## Opacity ladder vs solid tokens

- **Opacity ladder (Apple).** One ink at descending alpha (~100 / 60 / 30 / 18 in light; different alphas in dark). Elegant: composites over any background, flips light/dark for free. **Trap:** over a colored or photo surface the alpha picks up the background tint and contrast collapses — quaternary on a translucent material is explicitly discouraged even by Apple. Good for a single-vendor OS with controlled backgrounds.
- **Solid tokens (Material / Carbon / Radix).** Each level is a pre-computed solid color that hits an Lc target on its surface. Guaranteed contrast, no tint surprise. Costs more tokens — you define the ramp per surface (on-light, on-dark, on-brand, on-color) — but for a multi-app product that is the safer trade.

## The ideal to fix once

A **4-level solid ramp, anchored to APCA Lc targets, authored in OKLCH:**

- `text.primary` — Lc ≥ 90 (body & headings), near-black / near-white, never pure
- `text.secondary` — Lc ≥ 75 (supporting text)
- `text.tertiary` — Lc ≥ 60 (placeholders, low-emphasis)
- `text.disabled` — < Lc 60, intentionally not meant to be read as content

Define these once per surface set (light, dark, on-color) in the token source; light↔dark is a lightness flip of the same OKLCH ramp. Every component, card, kit, site, and app references the token. That is the whole answer to "can we decide the shades once and fix them all at once": yes — through the semantic-token indirection.

## Common Mistakes

| Mistake                                          | Fix                                                            |
| ------------------------------------------------ | -------------------------------------------------------------- |
| Raw hex or inline opacity on text                | Reference `text.*` tokens only                                 |
| An opacity ladder over colored/photo backgrounds | Solid tokens per surface; reserve opacity for neutral surfaces |
| Pure `#000` on `#fff` (or `#fff` on `#000`)      | Near-black/near-white tuned to an Lc target; avoid halation    |
| Gating on WCAG 7:1 and calling it done           | APCA Lc target per level, size, and weight                     |
| Five-plus text levels                            | Four; more grays read as inconsistency, not hierarchy          |
| One ramp reused on brand/photo surfaces          | A dedicated contrast-checked `on-color` set                    |
| Hand-tuning separate light and dark palettes     | One OKLCH ramp; flip lightness for dark                        |

## Checklist

- [ ] Exactly four semantic text tokens: primary / secondary / tertiary / disabled
- [ ] Every text element references a token; zero raw hex or inline opacity
- [ ] Each level hits its APCA Lc target (90 / 75 / 60 / intentional-below)
- [ ] Solid tokens (not an opacity ladder) wherever text sits over color or media
- [ ] Ramp authored in OKLCH; dark mode is a lightness flip, not a separate palette
- [ ] Primary is near-black/near-white, not pure, to avoid halation
- [ ] A dedicated `on-color` set for brand/photo surfaces, contrast-checked

## References

- [Material 3 — color roles (on-surface / on-surface-variant)](https://m3.material.io/styles/color/roles)
- [Radix Colors — understanding the 12-step scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) · [GitHub Primer — color usage](https://primer.style/product/getting-started/foundations/color-usage/)
- [APCA contrast](https://apcacontrast.com/) · [Color contrast with OKLCH](https://medium.com/@vyakymenko/color-contrast-with-oklch-prefers-reduced-motion-and-motion-design-ethics-089c0c8897d0)

Related: [[design-system-foundations]] (color contrast / APCA basics), [[visual-harmony-system]] (how these targets get enforced), [[card-system]] (cards consume this ramp), [[sub-perceptual-craft]] (caret/selection colors from the same palette), [[multi-platform-design-systems]] (distributing the ramp to every surface).
