---
domain: ux
topic: multi-platform-design-systems
tags: [design-system, cross-platform, multi-brand, design-tokens]
complexity: advanced
last_updated: 2026-01-30
---

# Multi-Platform & Multi-Brand Design Systems

> Decision frameworks for cross-platform token strategies, white-label architecture, and when to share code vs tokens vs nothing -- synthesized from Fluent 2, M3, Apple HIG, Shopify Polaris, and Atlassian patterns.

## TL;DR

- **Start with tokens-first, not code-first** -- most teams start "share code" and regress to "share tokens" as platform-specific needs emerge; token sharing provides brand consistency without constraining implementation; Style Dictionary transforms one JSON to CSS/Swift/Kotlin/Dart
- **Three-layer architecture: Component + Product + Brand** -- behavior is shared (component layer), product patterns are semi-shared (product layer), visual identity swaps via tokens (brand layer); Shopify Polaris, Fluent 2, and Atlassian all converge on this
- **Git is the source of truth, not Figma** -- Tokens Studio exports to Git, Style Dictionary generates platform code; reversing this (Figma as source) creates drift between design and engineering within weeks
- **Runtime themes for user-facing switching, build-time themes for performance** -- CSS variables enable instant theme switching (SaaS multi-tenant); build-time compilation gives smaller bundles per brand (white-label products shipped to different customers)
- **Fluent 2's global color token removal is intentional** -- they removed global color tokens from React v9 themes because direct use led to bugs where colors wouldn't adapt across light/dark/high-contrast modes; only semantic (alias) tokens are safe to consume

## Decision Guide

### Cross-Platform Sharing Strategy

| Scenario                                                               | Approach                                                               | Why                                                                                                              |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Same UI framework across web + mobile (React ecosystem)                | Share code: React Native Web or Tamagui for component + token sharing  | Maximum consistency; one component renders on web and mobile; tradeoff: limited platform optimization            |
| Different platforms, unified brand (iOS native + Android native + Web) | Share tokens only: Style Dictionary transforms JSON to UIColor/XML/CSS | Most flexible; each platform builds native components; tokens enforce brand consistency without code constraints |
| Pixel-perfect consistency across all platforms                         | Flutter: renders own UI via Impeller engine                            | Single codebase; no native component differences; tradeoff: larger bundle, Dart learning curve, less native feel |
| Web + Mobile with some shared components                               | Hybrid: share tokens + select shared components (Tamagui, NativeWind)  | Balanced; tokens always shared; complex components go platform-native; simple ones shared                        |
| Platform-specific experiences are critical (games, media, AR)          | Share nothing: SwiftUI + Jetpack Compose + React separately            | Best performance; full platform API access; tradeoff: 3x development effort                                      |

### Multi-Brand Architecture

| Scenario                                                 | Approach                                                                         | Why                                                                                                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| SaaS with tenant-specific branding (colors, logo, fonts) | Runtime CSS variable theming: swap `--brand-*` variables per tenant              | Instant theme switching; single deployment; CMS-controlled; no rebuild per tenant                                                                |
| White-label product shipped to different customers       | Build-time themes: separate CI/CD pipelines per brand                            | Smaller bundle per brand; no runtime overhead; maximum optimization; tradeoff: more CI/CD complexity                                             |
| Single brand, light/dark mode                            | Semantic token layer unchanged; swap primitive layer per mode                    | `color.surface.default` maps to `gray.100` (light) or `gray.900` (dark); components unaware of mode                                              |
| Brand needs 90% consistency, 10% tenant customization    | Fixed semantic signals (success=green, error=red) + swappable brand accent       | Pinaka's 90/10 rule: lock semantic meanings; only accent/brand varies per tenant; Microsoft and Google confirm this via alias token architecture |
| Multiple distinct product brands under one company       | Component + product + brand layer separation; shared behavior, distinct identity | Each product gets own brand layer; shared component library reduces duplicate code; Atlassian uses this across Jira/Confluence/Trello            |

### Token Transformation Pipeline

| Scenario                                               | Tool                                                                                                      | Why                                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Engineering-led; maximum customization; many platforms | Style Dictionary (free, open-source)                                                                      | Most extensible; custom transforms; supports iOS/Android/Web/Flutter/Unity; industry standard |
| Figma-first workflow; designer self-service            | Tokens Studio ($10/seat/month) + Git sync                                                                 | Two-way Figma-to-Git sync; designers update tokens without engineering; automatic PR creation |
| Documentation + token management combined              | Supernova ($35/seat/month)                                                                                | Approval workflows; multi-brand; auto-generated docs; enterprise features                     |
| Need all three (design sync + transform + docs)        | Tokens Studio (Figma sync) -> Git (source of truth) -> Style Dictionary (transform) -> CI/CD (distribute) | This is the 2025 winning pipeline; each tool does what it's best at                           |

## Three-Layer Architecture

### How Top Design Systems Structure Multi-Brand

| Layer           | Purpose                                              | Changes Per Brand? | Example                                                             |
| --------------- | ---------------------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| Component layer | Shared behavior, accessibility, interaction patterns | No                 | Button handles focus, keyboard, ARIA regardless of brand            |
| Product layer   | Product-specific compositions, layouts, workflows    | Sometimes          | Checkout flow uses same components but different layout per product |
| Brand layer     | Tokens: colors, fonts, spacing, shadows, motion      | Yes                | `--brand-primary` resolves to different hex per tenant              |

### Token Architecture for Multi-Brand

```
Primitive tokens (raw values)        -> CHANGES per brand
  color.blue.500: #3b82f6
  color.red.500: #ef4444

Semantic tokens (purpose-based)      -> SAME across brands
  color.text.primary: {ref: color.gray.900}
  color.background.surface: {ref: color.white}
  color.brand.accent: {ref: color.blue.500}  <- This ref changes per brand

Component tokens (component-specific) -> SAME across brands
  button.background: {ref: color.brand.accent}
  button.text: {ref: color.text.inverse}
```

**Swap only the primitive layer.** Semantic and component layers remain identical. Zero component code changes per brand.

## Cross-Platform Token Distribution

### Single Source of Truth Architecture (2025 Standard)

| Stage           | Tool                         | Output                                            |
| --------------- | ---------------------------- | ------------------------------------------------- |
| Visual design   | Figma + Tokens Studio plugin | Export tokens to Git                              |
| Source of truth | Git repository (JSON/YAML)   | Single canonical format                           |
| Transformation  | Style Dictionary             | Platform-specific code                            |
| iOS output      | UIColor / SwiftUI Color      | `UIColor(hex: 0x0066CC)`                          |
| Android output  | XML color resources          | `<color name="colorBrandPrimary">#0066CC</color>` |
| Web output      | CSS custom properties        | `--color-brand-primary: #0066CC;`                 |
| Flutter output  | Dart constants               | `const colorBrandPrimary = Color(0xFF0066CC);`    |

### W3C Design Tokens Format (Stable Oct 2025)

| Feature         | Specification                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| Format          | JSON with `$type`, `$value`, `$description`                                                                      |
| Supported by    | Figma, Sketch, Penpot, Tokens Studio, Style Dictionary, Supernova (10+ tools)                                    |
| Theming         | `$extensions` for multi-brand; swap token sets                                                                   |
| Types supported | Color, dimension, font family, font weight, duration, cubic bezier, number, shadow, border, transition, gradient |

## How Top Systems Handle Multi-Platform

### Fluent 2 (Microsoft): Cross-Platform Token Pipeline

| Platform       | Token Format           | Implementation                       |
| -------------- | ---------------------- | ------------------------------------ |
| React Web (v9) | camelCase JS variables | `colorBlue60` via Griffel atomic CSS |
| iOS/macOS      | Swift tokens           | Platform-specific compilation        |
| Android        | XML resources (dp)     | Platform-specific compilation        |
| Windows        | XAML resources         | Platform-specific compilation        |
| Web Components | CSS custom properties  | FAST Foundation                      |

**Key decision:** Fluent 2 intentionally removed global color tokens from v9 React themes. Using global tokens led to colors not adapting across light/dark/high-contrast. Only alias (semantic) tokens are exposed.

**Density as token (not breakpoint):** `baseHeightMultiplier` × `designUnit(4px)` × density modifier (-1/0/+1). Different from responsive design -- density is user preference at ANY screen size.

### Apple HIG: Semantic Colors Without Formal Tokens

| Apple Approach                      | Equivalent Token Concept     |
| ----------------------------------- | ---------------------------- |
| `UIColor.systemBackground`          | `color.background.primary`   |
| `UIColor.label`                     | `color.text.primary`         |
| `UIColor.secondarySystemBackground` | `color.background.secondary` |
| `UIColor.separator`                 | `color.border.subtle`        |

**Key insight:** Apple collapses three-tier token hierarchy into single-tier semantic naming. OS handles adaptation (dark mode, accessibility, vibrancy). No explicit token files -- conventions enforced by framework.

### M3 (Google): HCT Color Algorithm

| Property           | How It Works                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| HCT color space    | Hue (CAM16), Chroma (CAM16), Tone (CIELAB lightness)                                                       |
| Contrast guarantee | Tone difference of 50 = automatic WCAG AA 4.5:1 compliance                                                 |
| Palette generation | 1 seed color -> 5 tonal palettes (primary, secondary, tertiary, neutral, neutral-variant) -> 13 tones each |
| Dynamic Color      | Extract seed from wallpaper -> generate full theme algorithmically                                         |

**vs OKLCH:** HCT guarantees contrast via tone math (built-in accessibility); OKLCH is more computationally efficient and has no purple-shift in blues. HCT is better for design systems with accessibility guarantees; OKLCH is better for general-purpose perceptually uniform palettes.

## Platform-Specific Navigation Patterns

Cross-platform design systems must handle different navigation conventions:

| Platform | Primary Navigation                           | Rationale                                  |
| -------- | -------------------------------------------- | ------------------------------------------ |
| iOS      | Tab bar (bottom, 3-5 items)                  | One-handed thumb reach                     |
| iPadOS   | Sidebar (content-rich) or tab bar (top, <=8) | Larger screen efficiency                   |
| macOS    | Sidebar (always)                             | Desktop productivity; large item counts    |
| Android  | Bottom navigation or navigation drawer       | Material Design conventions                |
| watchOS  | Vertical scrolling                           | Small screen; glanceable                   |
| visionOS | Vertical tab bar (left, <=6 items)           | Spatial ergonomics; eyes+hands interaction |
| Web      | Top nav or sidebar                           | Keyboard/mouse first                       |

**Decision rule:** Define navigation semantically (sections, hierarchy) in the shared component layer. Express visually per platform capabilities.

## Common Mistakes

| Mistake                                            | Fix                                                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Starting with "share code" across platforms        | Start with tokens-first architecture; add shared code only where proven valuable; most teams regress to "share tokens" anyway        |
| Figma as source of truth (not Git)                 | Figma exports to Git via Tokens Studio; Git is canonical; Style Dictionary generates code; reversing this creates drift within weeks |
| Using global/primitive tokens in components        | Only semantic (alias) tokens in component code; Fluent 2 intentionally removed global tokens from v9 to prevent this                 |
| Same navigation pattern on all platforms           | Define navigation semantically; express per platform (tab bar on mobile, sidebar on desktop, vertical tabs in spatial)               |
| Building multi-brand by duplicating components     | Separate brand (tokens) from behavior (components); swap primitive token layer per brand; zero component code changes                |
| Runtime themes when build-time would suffice       | Runtime (CSS variables) adds overhead; use build-time themes if tenants don't switch brands dynamically                              |
| Forcing pixel-perfect consistency across platforms | Each platform has native conventions; share design language and tokens, not pixel-identical implementations                          |

## Checklist

### Token Architecture

- [ ] W3C DTCG JSON format adopted for token source files
- [ ] Three-tier hierarchy: primitive (brand-specific) -> semantic (shared) -> component (shared)
- [ ] Git repository is the single source of truth (not Figma)
- [ ] Style Dictionary (or equivalent) generates platform-specific outputs
- [ ] Global/primitive tokens never referenced directly in component code

### Multi-Brand

- [ ] Brand layer is isolated (swapping primitives changes entire brand)
- [ ] Semantic signals locked (success=green, error=red, warning=amber across all brands)
- [ ] Theme switching strategy chosen (runtime CSS variables vs build-time compilation)
- [ ] CI/CD pipeline supports per-brand builds (if build-time themes)

### Cross-Platform

- [ ] Navigation pattern defined semantically, expressed per platform
- [ ] Platform-specific token outputs generated (CSS, Swift, Kotlin, Dart as needed)
- [ ] Density handled as token preference, not breakpoint
- [ ] Accessibility adaptations handled per-platform (Dynamic Type on Apple, talkback on Android)

## References

- [Fluent 2 Design Tokens](https://fluent2.microsoft.design/design-tokens) -- Two-layer token system (global + alias); density modifier; cross-platform pipeline
- [M3 Dynamic Color](https://m3.material.io/styles/color/system/how-the-system-works) -- HCT color space; 5 tonal palettes from seed; algorithmic theme generation
- [W3C Design Tokens Format (Oct 2025)](https://tr.designtokens.org/format/) -- First stable spec; JSON format; 10+ tools support; `$extends` for theming
- [Style Dictionary](https://amzn.github.io/style-dictionary/) -- Open-source token transformation; custom platforms; industry standard pipeline tool
- [Tokens Studio](https://tokens.studio/) -- Figma plugin with Git sync; two-way design-to-code; $10/seat/month
- [Shopify Polaris 2025](https://polaris.shopify.com/) -- Web components; unified across Admin/Checkout; merchant brand inheritance; CSS locked
- [Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color) -- Semantic color system; automatic adaptation; no formal token files
- [Martin Fowler: Design Token-Based Architecture](https://martinfowler.com/articles/design-token-based-ui-architecture.html) -- Token architecture patterns and transformation pipelines
- [Atlassian Design System](https://atlassian.design/) -- 35 reusable components across 20+ products; JSON-based brand configuration

## Related

- [Design System Foundations](./design-system-foundations.md) -- Token hierarchy, color contrast, grid (single-platform foundations)
- [Component API Architecture](./component-api-architecture.md) -- Headless primitives, composition patterns (what gets shared)
- [Design System Testing](./design-system-testing.md) -- Cross-platform visual regression strategies

---

## Changelog

| Date       | Change                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 2026-01-30 | Initial version: synthesized from Fluent 2, M3, Apple HIG, Shopify Polaris, Atlassian, W3C DTCG |
