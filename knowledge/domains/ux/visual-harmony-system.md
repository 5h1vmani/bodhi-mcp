---
domain: ux
topic: visual harmony — measuring and enforcing shared order across surfaces
tags: [design-system, harmony, tokens, conformance, quality-gate]
complexity: advanced
last_updated: 2026-07-04
confidence: 0.8
source_refs:
  - "OKLCH perceptual uniformity; APCA Lc contrast model"
  - "Design-token conformance linting; Figma Check designs (Oct 2025)"
  - "Value-cardinality / on-scale conformance auditing; visual regression"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku researchers
version: 1
---

# Visual Harmony System

> Harmony is the felt sense that everything belongs to one system — governed by one order. You cannot measure whether the order is beautiful, but you can measure conformance to it, and you can make disharmony structurally impossible. This is how to check it and gate it from component to app.

## TL;DR

- **Consistency ≠ harmony.** Consistency is "the radius is always 8px." Harmony is whether radius, spacing, type steps, color steps, and elevation all derive from one shared order. You can be perfectly consistent and still disharmonious.
- **The checkable part is conformance, not beauty.** You can measure drift from a defined order objectively; you cannot compute whether the order itself is well-chosen. State that split or you will over-trust a green dashboard.
- **Prevent by construction; detect as backstop.** The strongest enforcement makes an off-system value impossible to reference (tokens only), not a value you catch after. Same meta-principle as PII-by-projection and docs-from-source.
- **The core metric is value cardinality.** A harmonious surface uses a small, discrete set of values (the scale); a disharmonious one shows a smear. "14 distinct grays; the system defines 6" is computable and damning.
- **Author in OKLCH, gate on APCA.** Perceptually-even color steps come from OKLCH; contrast clarity is an APCA Lc target, not a WCAG ratio.

## Decision Guide

| Question                                | Answer                                                        | Why                                             |
| --------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| Check harmony, or prevent disharmony?   | Prevent first (tokens-only), check for leaks                  | A value you can't reference can't drift         |
| The single highest-leverage metric      | Value cardinality — distinct values used vs defined           | Cheap, objective, catches the most drift        |
| Even color steps                        | Author in OKLCH; measure ΔL/ΔE evenness                       | Lightness stays perceptually even across hues   |
| Contrast target                         | APCA Lc (90 body / 75 medium / 60 large), not WCAG ratio      | Perceptual; accounts for weight and size        |
| Enforce hard-coded values               | Token-lint (stylelint / Figma Check designs) — fail the build | Machine gate scales where human review can't    |
| Catch unintended visual change          | Visual regression as a harmony gate                           | Diffs the rendered result, not the source       |
| Judge "does this feel like one system?" | AI-vision critique against a written rubric                   | The soft, new layer — flags what metrics miss   |
| Where to enforce                        | Every altitude: component → kit → page → cross-surface        | Harmony is only as strong as the leakiest layer |

## What is checkable — and what is not

**Objectively measurable (conformance to a defined order):**

- **Value cardinality** — render the surface, count distinct spacing values, font sizes, grays, radii, shadows actually used. Compare to what the system defines. Excess = drift.
- **On-scale conformance** — is every value on the modular/spacing/radius scale, or hand-set? Off-scale is a defect, lintable from CSS or the rendered DOM.
- **Perceptual color evenness** — in OKLCH, are the steps in a ramp evenly spaced in lightness (ΔL) and does hue hold across the scale? Computable.
- **Contrast consistency** — do text levels hit their APCA Lc targets on their surfaces? (See [[text-color-hierarchy]].)
- **Grid / alignment conformance** — detect element edges that don't snap to the grid.

**Not computable (whether the order is good):** the beauty of the chosen ratio, the rightness of the palette, the taste of the spacing. That still needs a trained eye. A harmony system measures drift from an order; it cannot originate the order.

## The harmony gate (CI, per altitude)

| Altitude          | Gate                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Component**     | Token-lint: no hard-coded color/space/size/radius; every value references a token                                          |
| **Kit / page**    | Value-cardinality budget; on-scale conformance; APCA Lc per text level; OKLCH step evenness                                |
| **Cross-surface** | Same token source compiles to web/iOS/Android — harmony is structural, not policed (see [[multi-platform-design-systems]]) |
| **Design tool**   | Figma variables synced from the same tokens; Figma↔code token parity; Figma Check designs                                  |
| **Review**        | AI-vision pass: score rendered screens against a harmony rubric; flag "belongs to one system?"                             |

**The harmony budget.** Treat harmony like a performance budget: cap the distinct-value count per surface, require spacing 100% on-scale, require text levels to hit Lc targets, require color steps within a ΔL tolerance. A PR that exceeds the budget fails — the doc-drift and security-gate pattern, applied to pixels.

## The AI-vision critique layer

The genuinely new, 2025-2026 capability: a multimodal model scores a screenshot against a written rubric (spacing rhythm, one type scale, one gray ramp, one radius, one elevation logic) and flags what metrics can't phrase — "this card's vertical rhythm breaks the scale," "this screen uses two competing shadow languages." It is the [[docs-as-code-ai]] docs-as-evals and [[agentic-security-review]] find-then-verify pattern turned on visual design. Soft and fallible — use it to surface candidates for a human, not as a pass/fail gate.

## Common Mistakes

| Mistake                                | Fix                                                             |
| -------------------------------------- | --------------------------------------------------------------- |
| Equating consistency with harmony      | Check that values derive from one shared order, not just repeat |
| Trusting a green conformance dashboard | It measures drift, not whether the order is well-chosen         |
| Policing hard-coded values by review   | Token-lint them out; make off-system values un-referenceable    |
| Measuring color in sRGB/HSL            | Author and measure in OKLCH for perceptual evenness             |
| Gating contrast on WCAG ratio          | APCA Lc target per text size/weight                             |
| Enforcing only at the component layer  | Leaks appear at page and cross-surface; gate every altitude     |
| Using the vision critique as pass/fail | It surfaces candidates; a human adjudicates                     |

## Checklist

- [ ] Every color/space/size/radius/shadow references a token; hard-coded values fail lint
- [ ] Value-cardinality budget defined and enforced per surface
- [ ] Type/spacing/radius values 100% on-scale
- [ ] Color ramps authored in OKLCH; steps within a ΔL tolerance
- [ ] Text levels hit APCA Lc targets on their surfaces ([[text-color-hierarchy]])
- [ ] One token source compiles to every platform ([[multi-platform-design-systems]])
- [ ] Figma variables synced from the same source; token parity checked
- [ ] Visual regression gate on rendered output
- [ ] AI-vision rubric pass surfaces harmony candidates for human review

## References

- [OKLCH color (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch) · [OKLCH picker](https://oklch.com/)
- [APCA contrast](https://apcacontrast.com/) · [Enforcing design tokens (linting in CI)](https://medium.com/@barshaya97_76274/design-tokens-enforcement-977310b2788e)
- [Radix Colors — 12-step scale, Lc-guaranteed text steps](https://www.radix-ui.com/colors)

Related: [[design-system-foundations]] (the scales this measures conformance to), [[multi-platform-design-systems]] (one source → every surface), [[design-system-testing]] (visual regression), [[text-color-hierarchy]] and [[card-system]] (harmony applied), [[sub-perceptual-craft]] (the defaults that break harmony), [[docs-as-code-ai]] (the drift-gate parallel).
