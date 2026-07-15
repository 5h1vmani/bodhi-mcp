---
domain: ux
topic: card system — one composable card, consistent across every app
tags: [components, cards, design-system, slots, cross-platform]
complexity: intermediate
last_updated: 2026-07-04
confidence: 0.85
source_refs:
  - "Nathan Curtis / EightShapes — cards and composability (slots vs style)"
  - "Component slots + nested variants (Webflow, Penpot, Adobe Spectrum)"
  - "Cross-platform token distribution for structural consistency"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku researchers
version: 1
---

# Card System

> Cards drift because teams build N bespoke cards. The fix is to make Card one composable primitive — a container with named slots, every property a token — so all cards move together and stay consistent across web, mobile, and dashboard. Consistent, not identical: shared DNA, different density.

## TL;DR

- **One card, not many.** Card = container + named slots (media / header / body / actions / footer). Content varies by slot; the shell is fixed.
- **Separate structure from style.** Slots carry content; a small variant set carries visual style (elevated / outlined / filled × interactive / static × density). Nest variants so the total count stays small.
- **Every card property is a token** — padding, radius, gap, elevation, and text via the [[text-color-hierarchy]] ramp. Change the token, every card everywhere moves.
- **Cross-surface by construction.** The same token source compiles to each platform; the card is re-implemented per platform but consumes identical tokens — structurally consistent, not policed ([[multi-platform-design-systems]]).
- **Consistency ≠ identical.** A mobile card and a dashboard card differ in density but must share radius, elevation ramp, spacing rhythm, and text shades. That shared order is the harmony ([[visual-harmony-system]]).

## Decision Guide

| Decision                     | Choice                                                  | Why                                                    |
| ---------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Many card components or one? | One composable Card with slots                          | N bespoke cards is the source of drift                 |
| Content flexibility          | Named slots (media/header/body/actions/footer)          | Structure varies without new components                |
| Visual variation             | A small, nested variant set — not a variant per use     | Keeps the matrix from exploding                        |
| Styling values               | Tokens for padding, radius, gap, elevation, text        | One change moves every card                            |
| Cross-platform               | Re-implement per platform, consume identical tokens     | Structural consistency beats manual matching           |
| "Consistent" definition      | Shared DNA, density may differ                          | Identical everywhere is neither possible nor desirable |
| Governing drift              | A card inventory audit — count distinct implementations | Convergence is the metric, not a one-time cleanup      |

## Anatomy: container + slots

A card is a **container** plus optional, ordered **slots**:

- **media** — image/thumbnail/chart, with a fixed aspect-ratio token (no layout shift)
- **header** — title + optional overline/eyebrow, optional leading icon/avatar
- **body** — supporting text, using the text ramp (primary title, secondary body)
- **actions** — buttons/links, aligned to one edge
- **footer** — metadata, timestamps (tertiary text)

Adding a new card layout = filling different slots, **not** a new component. This is the EightShapes "cards and composability" separation: content structure (slots) is orthogonal to visual style (variant).

## Variants: keep the matrix small

Three axes cover almost everything; nest them rather than multiplying:

- **Elevation style:** elevated (shadow) / outlined (border) / filled (tonal)
- **Interaction:** static / interactive (hover, press, focus-visible, whole-card link)
- **Density:** comfortable / compact

Nine looks from three small axes. Resist a variant-per-feature; that is how a design system ends up with forty cards that don't match. Every variant's values come from tokens, so variants stay in the same family.

## Consistency across apps

The mechanism, top to bottom:

1. **Token the card.** `card.padding`, `card.radius`, `card.gap`, `card.elevation.{1,2}`, and text via [[text-color-hierarchy]]. No raw values in the card.
2. **One source → every platform.** Web/iOS/Android each re-implement Card but read the same compiled tokens ([[multi-platform-design-systems]]). Consistency is structural — you cannot accidentally use a radius the token doesn't define.
3. **Gate it.** Token-lint (no hard-coded values in cards), visual regression, and a **card inventory audit**: how many distinct card implementations exist across the codebase, and are they converging toward one? Rising count = drift ([[visual-harmony-system]]).
4. **Motion + craft consistency.** Card hover/press uses the one motion physics ([[design-system-motion]]); media has `aspect-ratio`, focus-visible is styled, tap highlight replaced ([[sub-perceptual-craft]]).

**Consistent, not identical.** A notification card, a product card, and a dashboard KPI card legitimately differ in density and which slots they fill — but they share the same radius, elevation ramp, spacing scale, and text shades. Enforce the DNA, allow the density.

## Common Mistakes

| Mistake                                    | Fix                                                   |
| ------------------------------------------ | ----------------------------------------------------- |
| A new card component per use case          | One Card; fill different slots                        |
| A variant for every visual tweak           | Three nested axes (elevation × interaction × density) |
| Raw padding/radius/shadow inside the card  | Tokens only; the card inherits the system             |
| Matching cards across platforms by hand    | One token source; each platform consumes it           |
| Media without a fixed aspect-ratio         | Aspect-ratio token — no layout shift as images load   |
| Treating "consistent" as "pixel-identical" | Share the DNA; let density and slot usage vary        |
| No card inventory                          | Audit distinct implementations; drive the count down  |

## Checklist

- [ ] One composable Card: container + named slots (media/header/body/actions/footer)
- [ ] Visual variation via a small nested variant set, not a component per use
- [ ] All card values are tokens (padding, radius, gap, elevation, text)
- [ ] Card re-implemented per platform from one token source
- [ ] Media slot uses an aspect-ratio token; no layout shift
- [ ] Interaction states use the one motion physics; focus-visible styled
- [ ] Card inventory audit runs; distinct implementations converging, not growing
- [ ] Text uses the [[text-color-hierarchy]] ramp, not raw values

## References

- [Nathan Curtis — Cards and composability in design systems](https://medium.com/eightshapes-llc/cards-and-composability-in-design-systems-8845ecbee50e)
- [Adobe Spectrum — Cards](https://spectrum.adobe.com/page/cards/) · [Component slots (Webflow)](https://webflow.com/blog/component-slots)
- [Penpot — component variants at scale](https://penpot.app/blog/how-to-use-component-variants-to-scale-your-design-system/)

Related: [[component-api-architecture]] (slots and composition patterns), [[visual-harmony-system]] (the inventory audit and gate), [[text-color-hierarchy]] (card text shades), [[design-system-motion]] (card interaction), [[multi-platform-design-systems]] (one card, every surface), [[sub-perceptual-craft]] (card media and focus defaults).
