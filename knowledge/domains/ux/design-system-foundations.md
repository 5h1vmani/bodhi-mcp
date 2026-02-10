---
domain: ux
topic: design-system-foundations
tags: [design-system, design-tokens, spacing, color-contrast]
complexity: intermediate
last_updated: 2026-01-30
---

# Design System Foundations

> Science-backed decisions for grid, type scale, color contrast, tokens, and consistency -- what top companies actually ship vs what frameworks recommend.

## TL;DR

- **8px grid wins A/B tests (72% preference)** -- Material Design, Carbon, Polaris all adopt it; 4px grid increases decision load without measurable benefit; use 4px for micro-adjustments only
- **Type scale ratio depends on context** -- Major Third (1.25) for web apps/SaaS; Perfect Fourth (1.333) for marketing/editorial; Minor Third (1.2) for dense data UIs; responsive strategy uses different ratios per breakpoint
- **APCA replaces WCAG 2 for real usability, but keep WCAG 2 for legal** -- WCAG 2 has 86% website failure rate; APCA is perceptually uniform and font-weight-aware; use both (APCA for design, WCAG 2 AA for compliance)
- **Design tokens are the enforcement layer** -- W3C DTCG spec stable Oct 2025; semantic tokens > primitive tokens; tokens enforce consistency where guidelines fail; 10+ tools support the spec
- **Premium feel = constrained tokens + systematic spacing + unified motion** -- Linear, Stripe, Vercel prove that fewer choices executed perfectly beats more features; McKinsey: design systems save 20-30% annual costs
- **Industry convergence (Jan 2026):** 5/5 top companies (Anthropic, Apple, Microsoft, Google, Pinaka) converge on: CSS custom properties as runtime tokens, two-font-family strategy, context-specific typography, neutral-first palettes, and `prefers-reduced-motion` respect; spring-based easing and `clamp()` fluid typography are emerging standards

## Decision Guide

### Grid & Spacing

| Scenario                                       | Approach                                        | Why                                                                                                                                    |
| ---------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| General UI layout (SaaS, dashboards, apps)     | 8px base grid; scale: 8, 16, 24, 32, 40, 48, 64 | A/B tested at 72% preference (100% at 95% statistical significance); divides evenly into 1920, 1440, 1024; Gestalt proximity principle |
| Micro-adjustments (icon padding, badge insets) | 4px half-grid within 8px system                 | 4px provides fine-tuning without abandoning 8px harmony; Material Design uses 4px for component internals                              |
| Dense data UIs (tables, dashboards, admin)     | Tighter scale: 4, 8, 12, 16, 24, 32             | Data density requires smaller increments; IBM Carbon uses this for data-heavy interfaces                                               |
| Marketing/landing pages                        | Generous scale: 16, 24, 32, 48, 64, 80, 96, 128 | Whitespace signals premium; eye-tracking shows 20%+ scan rate improvement with generous spacing                                        |
| Mobile layouts                                 | 8px grid, max container 4px padding reduction   | Constrained viewport needs tighter outer spacing; inner spacing stays at 8px multiples                                                 |

**Internal vs External Spacing Rule:** Component internal spacing < external margin. A card with 16px internal padding should have 24px+ margin between sibling cards. Gestalt proximity: items spaced closer are perceived as grouped.

### Type Scale Selection

| Context               | Ratio                                      | Scale (from 16px base)  | Why                                                                                                       |
| --------------------- | ------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Web app / SaaS        | Major Third (1.25)                         | 16, 20, 25, 31, 39      | Moderate contrast; readable body with clear hierarchy; eye-tracking: 47% scanability boost from hierarchy |
| Marketing / editorial | Perfect Fourth (1.333)                     | 16, 21, 28, 37, 50      | Dramatic hierarchy; draws attention to headlines; ideal for long-form content                             |
| Dense data / admin    | Minor Third (1.2)                          | 16, 19, 23, 28, 33      | Subtle steps; more sizes fit in constrained space; maintains readability without shouting                 |
| Mobile-first          | Minor Second (1.125) to Minor Third (1.2)  | 16, 18, 20, 23, 26      | Smaller viewport needs gentler steps; prevents giant headlines on small screens                           |
| Developer tools       | Perfect Fourth (1.333) with monospace body | 14 mono, 16, 21, 28, 37 | Code needs monospace; surrounding UI needs clear hierarchy to contrast                                    |

**Responsive Strategy:** Use different ratios per breakpoint. Desktop: Major Third (1.25); Tablet: Minor Third (1.2); Mobile: Major Second (1.125). CSS `clamp()` bridges transitions.

### Color Contrast

| Scenario                                      | Approach                                      | Why                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Body text on backgrounds                      | APCA Lc 90+ target; WCAG 2 AA (4.5:1) minimum | APCA is perceptually uniform (accounts for spatial frequency, font weight); WCAG 2 fails 86% of websites; maintain WCAG 2 for legal compliance |
| Large text / headings (24px+ or 18.5px+ bold) | APCA Lc 60+; WCAG 2 AA (3:1) minimum          | Larger text is more legible; lower contrast acceptable; APCA handles this more accurately than WCAG 2                                          |
| UI controls / interactive elements            | APCA Lc 60+; WCAG 2 AA (3:1) minimum          | Buttons, inputs, icons need clear contrast against backgrounds; APCA accounts for element size                                                 |
| Decorative / non-essential elements           | No minimum, but test for dark mode            | Borders, dividers, background patterns don't carry information; still test for accessibility                                                   |
| Dark mode                                     | Design dark-first; APCA handles natively      | APCA is polarity-aware (light-on-dark vs dark-on-light differ perceptually); WCAG 2 treats both the same, which is wrong                       |

**Dual Compliance Strategy:** Design with APCA for actual usability. Test with WCAG 2 AA for legal/procurement compliance. Where they conflict (WCAG 2 passes but APCA fails), trust APCA -- the text is actually hard to read.

**60-30-10 Color Rule (general UI):** 60% dominant (background/structure), 30% secondary (content areas), 10% accent (CTAs/highlights). For checkout/transactional pages, use the tighter 80/15/5 ratio (see [premium-checkout-design.md](./premium-checkout-design.md)) -- more neutral = more trust in payment contexts.

### Design Tokens Architecture

| Decision              | Approach                                                 | Why                                                                                                                                    |
| --------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Token format          | W3C DTCG JSON spec (stable Oct 2025)                     | Industry standard; supported by Style Dictionary, Token Studio, Supernova, Figma, Penpot; $extends for multi-brand                     |
| Token hierarchy       | Primitive → Semantic → Component                         | Primitive: `color.blue.500`; Semantic: `color.text.primary`; Component: `button.background`; teams reference semantic, never primitive |
| Multi-brand / theming | Swap primitive layer, keep semantic and component layers | Semantic token `color.text.primary` resolves to different primitives per brand; zero component code changes                            |
| Dark mode             | Separate primitive set; semantic layer unchanged         | `color.surface.default` maps to `gray.100` in light, `gray.900` in dark; components don't know which mode they're in                   |
| Token enforcement     | Lint rules blocking raw values in code                   | ESLint plugin / Stylelint plugin that forbids hex values, px values outside scale; CI fails if raw values used                         |

### Premium Feel Decisions

| Scenario                            | Approach                                                                                                                    | Why                                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Want Stripe-level polish            | Constrained TypeScript design tokens; 8px grid strict; custom font for headings; Inter/system for body                      | Stripe's premium feel comes from constraint: every spacing value is deliberate; tokens enforced in CI      |
| Want Linear-level speed perception  | LCH color space (perceptually uniform); 3 CSS variables for entire theme; dark-first; keyboard-first; sub-200ms transitions | Linear uses `lch()` for colors (perceptually uniform lightness); minimal color palette; speed > decoration |
| Want Vercel developer-cred feel     | Geist font (custom geometric sans); monospace accents for code; 50 shades of gray; dark-first                               | Vercel's design identity is restraint: almost no color, monochrome palette, typography does all the work   |
| Want Material Design broad adoption | Material 3 dynamic color; 4px base grid; tone-based dark mode; elevation via color+opacity                                  | M3 is the most adopted system globally; safe default for consumer products; weaker brand differentiation   |

## Industry Pattern Convergence

Patterns verified across Anthropic, Apple, Microsoft Fluent 2, Google M3, and Pinaka exam-app (Jan 2026):

### Universal (5/5 companies)

| Pattern                              | Implementation                                                                                                                                                                                                    | Evidence                                                                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS custom properties as token layer | All 5 use CSS variables as the runtime token interface; Anthropic: `--_theme---*`; Fluent: global + alias layers; M3: W3C DTCG; Pinaka: `--brand-*`                                                               | This is the settled answer for runtime theming -- no build step needed for theme switching                                                                                          |
| Two-font-family strategy             | Anthropic: Copernicus (serif display) + sans (UI); Apple: SF Pro Display + SF Pro Text (optical sizes); Google: Google Sans (display) + Google Sans Text (body); Pinaka: IBM Plex Sans (dashboard) + Inter (exam) | Display fonts optimize for impact at large sizes; text fonts optimize for readability at small sizes; context-specific fonts (Pinaka's meta/focus layers) are a valid third pattern |
| Context-specific typography          | Every company uses different type treatments per product context (marketing vs product, display vs data, dashboard vs focus task)                                                                                 | Not just font pairing — whole typographic postures shift by context; Pinaka's `data-layer` attribute approach is a clean implementation                                             |
| Reduced motion respect               | All 5 implement `prefers-reduced-motion: reduce`; Pinaka kills ALL animations via `!important` override                                                                                                           | Non-negotiable accessibility requirement; implementation varies from graceful degradation to full disable                                                                           |
| Neutral-first palette                | Anthropic: slate/cloud swatches; Apple: pure white/black; M3: surface/on-surface; Fluent: neutral tokens; Pinaka: Zinc-50 to 950                                                                                  | Background and structure colors are always neutral; brand/accent is the minority (<10-30%)                                                                                          |

### Near-Universal (4/5 companies)

| Pattern                     | Implementation                                                                                                     | Evidence                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Fixed signals + brand split | Semantic signals (success=green, error=red, warning=amber) are never tenant-customizable; only brand accent varies | Pinaka's 90/10 rule (90% locked, 10% brand) is the clearest formulation; Microsoft and Google confirm via alias token architecture |
| 4px base grid               | Fluent: explicit 4px `designUnit`; M3: 4dp grid; Apple: even spacing; Pinaka: Tailwind 4px base                    | Industry standard; 8px layout grid is built on 4px atoms; use 4px for component internals, 8px for layout                          |
| Stagger animation on lists  | Anthropic: page-load stagger; Apple: iOS list reveals; M3: stagger delays; Pinaka: `--stagger-index * 50ms`        | 50ms per-item delay is the sweet spot; Pinaka's CSS custom property approach is clean and performant                               |
| Tabular numbers for data    | Apple SF, Google Sans, Fluent, Pinaka all enable `font-feature-settings: "tnum" 1` for numeric data                | Prevents layout shift in counters, tables, metrics; specify in CSS, not just font selection                                        |

### Emerging (2-3/5 but trending)

| Pattern                           | Implementation                                                                                                                                                 | Evidence                                                                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spring-based easing               | M3 Expressive: physics engine (stiffness + damping ratio); Apple Liquid Glass: spring animations; Pinaka: `cubic-bezier(0.2, 0.8, 0.2, 1)` approximates spring | M3 Expressive replaces duration-based motion entirely with spring physics; two spring types: spatial (position — can overshoot) and effects (opacity — no overshoot)              |
| `clamp()` fluid typography        | Anthropic: `clamp(2.5rem, 2.04rem + 1.96vw, 4rem)` for display text; web.dev 2025: recommended baseline                                                        | Eliminates breakpoint-based font switching; WCAG safe if max ≤ 2.5× min; formula: `clamp(min, preferred + vw, max)`                                                               |
| Density as token (not breakpoint) | Fluent: numeric modifier (-1/0/+1) × 4px designUnit; M3: compact/medium/expanded density                                                                       | Different from responsive design — density is user preference for information compactness at ANY screen size; Fluent's continuous scale is more flexible than M3's discrete modes |

## Design System Governance

| Aspect             | What Works                                                                      | What Fails                                                                       |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Ownership          | Dedicated team of 3-5 (design + engineering)                                    | "Everyone owns it" (nobody owns it); single designer without engineering support |
| Change process     | RFC (Request for Comments) with 2-week comment period                           | No process (chaos) or heavy approval (nobody contributes)                        |
| Adoption tracking  | Package telemetry (npm downloads, import analysis); component coverage %        | No metrics; or only tracking "teams using the system" (too coarse)               |
| Versioning         | Semantic versioning with breaking change warnings; automated migration codemods | Unversioned changes that break consumers; or never breaking (system stagnates)   |
| Documentation      | Storybook/Docusaurus with live examples + do/don't side-by-side                 | Figma-only docs (developers can't use); code-only docs (designers can't use)     |
| Contribution model | Inner-source: any team proposes, core team reviews, contributor maintains       | Closed: only core team contributes (bottleneck); open: no quality control        |

## Design System ROI

| Metric                              | Data                                                                                          | Source                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| Annual cost savings                 | 20-30%                                                                                        | McKinsey                 |
| Developer velocity improvement      | 25-40%                                                                                        | McKinsey                 |
| Development cost reduction          | Up to 50%                                                                                     | Industry composite       |
| Engineering hours saved per quarter | 100+                                                                                          | SoFi case study          |
| Design system team size at scale    | 50 (Airbnb DLS)                                                                               | Airbnb Design            |
| Consistency improvement             | Shopify Polaris unified web components; automatic updates; visual diffing catches regressions | Shopify Engineering 2025 |
| Onboarding speed                    | New developers productive in 1-2 weeks vs 4-6 weeks without system                            | Industry average         |

## Where Top Companies Break "Rules"

| Company | "Rule" Broken                             | What They Do Instead                                 | Why It Works                                                                                                    |
| ------- | ----------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Linear  | "Use established color spaces (sRGB/HSL)" | LCH color space with 3 variables per theme           | LCH is perceptually uniform; same lightness step looks identical across hues; sRGB/HSL can't guarantee this     |
| Stripe  | "System fonts for performance"            | Custom heading font + constrained token set          | Brand differentiation via typography; performance cost offset by caching + subsetting; tokens prevent chaos     |
| Vercel  | "Color adds meaning"                      | Near-monochrome; 50 shades of gray; minimal accent   | For developer audience, restraint signals competence; color would add noise to code-centric interfaces          |
| Apple   | "44px minimum touch targets"              | Smaller targets on Watch, dynamic sizing via haptics | Haptic feedback provides confirmation that touch-size can't; context-specific optimization over universal rules |
| Netflix | "80/20 light/dark ratio"                  | Dark-dominant interface; content is the color        | Media consumption: dark reduces glare, makes content pop; their product IS the imagery                          |
| Airbnb  | "One design system for all"               | DLS with 50-person team; context-specific overrides  | Scale (50+ product teams) requires investment; consistency ROI proven at their volume                           |

## Common Mistakes

| Mistake                                             | Fix                                                                                                         |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Using WCAG 2 contrast as only measure; failing APCA | Test with both; APCA for usability, WCAG 2 AA for compliance; when they conflict, trust APCA                |
| Choosing type scale ratio arbitrarily               | Map ratio to context: 1.25 for apps, 1.333 for marketing, 1.2 for dense data; test with real content        |
| Building tokens without enforcement                 | Add ESLint/Stylelint rules blocking raw values; CI must fail on `color: #hex` or `padding: 12px`            |
| Copying another company's design system wholesale   | Their system reflects their constraints; extract principles (token architecture, grid, scale) not specifics |
| Over-investing in governance before adoption        | Get 3 teams using the system first, then formalize governance; premature process kills adoption             |
| No dark mode token architecture from day one        | Retrofitting dark mode into a system without semantic tokens is a rewrite; plan token layers from start     |
| Treating design system as a Figma library only      | System must live in code with 1:1 parity to design; Figma-only systems drift within months                  |
| Using sRGB/HSL for color system                     | LCH or OKLCH for perceptually uniform palettes; HSL lightness is not perceptually consistent across hues    |

## Checklist

### Grid & Spacing

- [ ] 8px base grid adopted for layout
- [ ] 4px half-grid available for micro-adjustments
- [ ] Spacing scale documented (e.g., 4, 8, 12, 16, 24, 32, 48, 64)
- [ ] Internal spacing < external margin rule enforced

### Typography

- [ ] Type scale ratio chosen for primary context (1.25 app / 1.333 marketing / 1.2 data)
- [ ] Responsive type scale using different ratios per breakpoint
- [ ] `clamp()` used for fluid typography between breakpoints
- [ ] Tabular figures enabled for data (`font-variant-numeric: tabular-nums`)

### Color & Contrast

- [ ] APCA tested for usability (Lc 90+ body, Lc 60+ large text)
- [ ] WCAG 2 AA tested for legal compliance (4.5:1 body, 3:1 large)
- [ ] 60-30-10 color ratio applied (dominant/secondary/accent)
- [ ] LCH or OKLCH used for perceptually uniform palette generation
- [ ] Dark mode designed first (not inverted from light)

### Design Tokens

- [ ] W3C DTCG JSON format adopted
- [ ] Three-tier hierarchy: primitive → semantic → component
- [ ] Semantic tokens used in all component code (never primitive)
- [ ] Lint rules block raw color/spacing values in codebase
- [ ] Multi-brand supported via primitive layer swap
- [ ] Dark mode implemented via separate primitive set

### Governance

- [ ] Dedicated design system team (3-5 minimum)
- [ ] RFC process for breaking changes
- [ ] Adoption metrics tracked (package telemetry, component coverage)
- [ ] Storybook or equivalent with live examples
- [ ] Inner-source contribution model documented

## References

- [Material Design Grid System](https://m3.material.io/foundations/layout/understanding-layout) -- 8px grid, 4px for component internals; A/B data from Spec.fm community research
- [APCA Contrast Algorithm](https://git.apcacontrast.com/) -- Myndex; WCAG 3.0 candidate; perceptual uniformity, polarity-aware
- [WebAIM Million Report](https://webaim.org/projects/million/) -- 86% of websites fail WCAG 2 contrast requirements
- [W3C Design Tokens Format Module](https://tr.designtokens.org/format/) -- Stable spec Oct 2025; JSON format; $extends for theming
- [Tim Brown: Modular Scale](https://alistapart.com/article/more-meaningful-typography/) -- Type scale theory; ratio selection methodology
- [McKinsey: Design System ROI](https://www.mckinsey.com/capabilities/mckinsey-design/our-insights) -- 20-30% annual cost savings; 25-40% velocity improvement
- [Airbnb DLS](https://airbnb.design/building-a-visual-language/) -- 50-person team; multi-platform parity; governance model
- [Shopify Polaris 2025](https://polaris.shopify.com/) -- Web components; automatic updates; visual diffing; multi-brand tokens
- [Linear Design Philosophy](https://linear.app/method) -- LCH color; 3-variable theming; keyboard-first; speed as premium signal
- [OKLCH Color Space](https://oklch.com/) -- Perceptually uniform successor to HSL; CSS Color Level 4 support

- [Fluent 2 Design Tokens](https://fluent2.microsoft.design/design-tokens) -- Two-layer token system (global + alias); 4px designUnit; numeric density modifier
- [M3 Motion: Easing and Duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs) -- M3 Expressive spring physics; spatial vs effect springs; stiffness + damping model
- [Anthropic Brand Identity (Geist Agency)](https://geist.co/work/anthropic) -- Terra cotta accent; Copernicus serif + Styrene/Tiempos type palette; warmth-first brand system
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) -- San Francisco dynamic type; 11pt minimum; spring-based Liquid Glass motion
- [web.dev: Fluid Typography with CSS clamp()](https://web.dev/articles/baseline-in-action-fluid-type) -- `clamp()` formula; WCAG 2.5x safety rule; 91.4% browser support

## M3 Adaptive Layout System

M3's canonical layouts solve a problem that breakpoint-based responsive design doesn't: **adaptive pane management** based on window size classes.

### Window Size Classes (Width)

| Class    | Width     | Example Devices               |
| -------- | --------- | ----------------------------- |
| Compact  | < 600dp   | Phones (portrait)             |
| Medium   | 600-839dp | Tablets (portrait), foldables |
| Expanded | >= 840dp  | Tablets (landscape)           |
| Large    | >= 1200dp | Desktop, connected displays   |

**Key insight:** Width and height are classified **independently**. Your app always has TWO size classes simultaneously (e.g., Medium Width + Compact Height in landscape phone).

### Canonical Layout Selection

| Layout Pattern  | Use When                                                                           | Compact Behavior                  | Expanded Behavior                                |
| --------------- | ---------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| List-Detail     | Items have standalone value (email content meaningful without inbox list)          | List view -> detail as new screen | Side-by-side panes with synchronized selection   |
| Supporting Pane | Secondary content only meaningful in primary context (tool palette without canvas) | Secondary hidden or in drawer     | Side-by-side; secondary pane is contextual tools |
| Feed            | Homogeneous content stream                                                         | Single column                     | Multi-column grid                                |

**Critical distinction:** Supporting Pane != List-Detail. Supporting pane tools are **context-dependent** (meaningless alone). List-detail items have **standalone value**. Misusing this breaks user mental models.

### Navigation Component Auto-Selection

| Window Width | Navigation Component                  | Rationale                    |
| ------------ | ------------------------------------- | ---------------------------- |
| Compact      | Bottom Navigation Bar                 | Thumb reachability on phones |
| Medium       | Navigation Rail (vertical side)       | Balanced space usage         |
| Expanded     | Navigation Drawer (permanent sidebar) | Content-heavy navigation     |

M3's `NavigationSuiteScaffold` handles this automatically via `currentWindowAdaptiveInfo()`.

## M3 HCT Color System vs OKLCH

| Property             | HCT (M3)                                       | OKLCH                                         |
| -------------------- | ---------------------------------------------- | --------------------------------------------- |
| Contrast guarantee   | Tone difference 50 = automatic WCAG AA (4.5:1) | No built-in contrast math                     |
| Computational cost   | Expensive (CAM16 transforms)                   | Cheaper                                       |
| Blue region accuracy | Purple-shift artifact in blue hues             | No purple shift                               |
| Palette generation   | 1 seed -> 5 palettes -> 13 tones each          | Manual palette construction                   |
| Best for             | Design systems with guaranteed accessibility   | General-purpose perceptually uniform palettes |

**Decision:** Use HCT when you need mathematical accessibility guarantees (design systems, theming). Use OKLCH when you need efficient, perceptually uniform color manipulation (custom palettes, artistic applications).

## Related

- [Typography & Brand Perception](./typography-brand-perception.md) -- Font psychology, archetype-to-font mapping, color-type combinations
- [Premium Checkout Design](./premium-checkout-design.md) -- Applying these foundations to checkout specifically
- [Cognitive Load Dashboards](./cognitive-load-dashboards.md) -- Data density decisions that interact with type scale and spacing
- [Component API Architecture](./component-api-architecture.md) -- Headless primitives, composition patterns, styling strategies for design system components
- [Design System Testing](./design-system-testing.md) -- Testing pyramid, visual regression, a11y automation, metrics
- [Multi-Platform Design Systems](./multi-platform-design-systems.md) -- Cross-platform tokens, multi-brand architecture, white-label patterns
- [Design System Motion](./design-system-motion.md) -- Spring-based vs duration-based animation, Apple/M3/Fluent motion comparison

---

## Changelog

| Date       | Change                                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-30 | Add: M3 Adaptive Layout System (canonical layouts, window size classes, navigation auto-selection); HCT vs OKLCH decision framework; Related links to 4 new companion playbooks                    |
| 2026-01-30 | Add: Industry Pattern Convergence section (Anthropic, Apple, Microsoft Fluent 2, Google M3, Pinaka exam-app cross-reference); 5 universal patterns, 4 near-universal, 3 emerging; 5 new references |
| 2026-01-30 | Initial version                                                                                                                                                                                    |
