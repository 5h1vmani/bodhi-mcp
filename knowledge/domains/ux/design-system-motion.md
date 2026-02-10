---
domain: ux
topic: design-system-motion
tags: [design-system, animation, spring-physics, motion-tokens]
complexity: advanced
last_updated: 2026-01-30
---

# Design System Motion

> Decision framework for choosing spring-based vs duration-based animation, parameterizing motion across Apple/M3/Fluent systems, and implementing motion tokens -- synthesized from Apple WWDC 2023-2025, M3 Expressive, Fluent 2, and CSS animation standards.

## TL;DR

- **Springs are the default, not an enhancement** -- Apple uses springs for ALL animations across UIKit/SwiftUI/Core Animation; M3 Expressive replaces duration-based curves with spring physics; springs handle interruptions gracefully because they preserve velocity (bezier curves can't)
- **Duration + bounce (Apple) > mass/stiffness/damping** -- Apple's iOS 17+ perceptual parameterization uses duration (how long it feels) and bounce (-1.0 to 1.0, overshoot behavior); internally converts to physics constants; M3 uses stiffness + damping directly; Fluent 2 uses bezier curves (least expressive)
- **Two spring types: spatial and effects** -- M3 Expressive distinguishes spatial springs (position -- CAN overshoot target) from effect springs (opacity -- must NOT overshoot, clamp 0-1); mixing these up creates visual artifacts
- **`prefers-reduced-motion` is non-negotiable** -- all 5 top companies implement it; Fluent 2 uses `duration-scalar` token (0 = instant); Apple kills ALL animations via `!important`; never hardcode durations that bypass this
- **View Transitions API (85%+ browser support) replaces JS animation libraries for page-level transitions** -- `view-transition-name` on elements preserves identity across navigations; browser handles morph animation natively; works with React Canary

## Decision Guide

### Motion System Selection

| Scenario                                       | Approach                                                                                                            | Why                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Consumer app; playful feel; gesture-driven UI  | Spring-based (Apple-style): `duration: 0.6, bounce: 0.2`                                                            | Springs preserve gesture velocity; interruptions feel natural; bounce adds personality            |
| Enterprise/productivity app; professional feel | Duration-based with easing: `200ms ease-out` or Fluent 2 bezier curves                                              | Predictable timing; professional aesthetic; no playful overshoot                                  |
| M3-aligned Android/web product                 | M3 Expressive springs: stiffness + damping ratio per component                                                      | Opt-in expressiveness on top of standard M3; spatial vs effect spring distinction                 |
| Web-only; minimal JS; page transitions         | View Transitions API + CSS `transition`                                                                             | Zero JS animation libraries; browser-native morph; 85%+ support; React Canary compatible          |
| Mixed: some playful, some utilitarian          | Spring for interactive elements (buttons, toggles, gestures); duration for system transitions (page loads, reveals) | Match motion personality to interaction type; don't spring-animate a loading bar                  |
| Reduced motion required                        | `prefers-reduced-motion: reduce` -> crossfade or instant; Fluent 2 `duration-scalar: 0`                             | Non-negotiable a11y; affects 1 in 3 people with motion sensitivity; replace slides with dissolves |

### Spring Parameterization

| Feel                              | Apple (duration/bounce)       | M3 (stiffness/damping)      | CSS Approximation                         | Use Case                                  |
| --------------------------------- | ----------------------------- | --------------------------- | ----------------------------------------- | ----------------------------------------- |
| Smooth, general-purpose (default) | `duration: 0.5, bounce: 0`    | Stiffness: 400, Damping: 30 | `cubic-bezier(0.2, 0.8, 0.2, 1)`          | Default for most UI transitions           |
| Brisk with slight bounce          | `duration: 0.4, bounce: 0.15` | Stiffness: 600, Damping: 25 | `cubic-bezier(0.34, 1.56, 0.64, 1)`       | Toggle switches, checkboxes               |
| Noticeably bouncy                 | `duration: 0.5, bounce: 0.30` | Stiffness: 300, Damping: 15 | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Playful micro-interactions, celebrations  |
| Flattened / deceleration          | `duration: 0.6, bounce: -0.2` | Stiffness: 400, Damping: 40 | `cubic-bezier(0.0, 0.0, 0.2, 1)`          | Scroll deceleration, settling             |
| Avoid: extreme bounce             | `bounce > 0.40`               | Damping < 10                | N/A                                       | Feels exaggerated; breaks professional UI |

### Animation Type Selection

| Animation Target       | Spring Type (M3)                      | Reasoning                                                                   |
| ---------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| Position / translation | Spatial spring (CAN overshoot)        | Objects in motion naturally overshoot destination; feels physically correct |
| Scale / size           | Spatial spring (CAN overshoot)        | Growing/shrinking can slightly exceed target size; feels elastic            |
| Opacity / fade         | Effect spring (must NOT overshoot)    | Opacity cannot exceed 1.0 or go below 0.0; clamped spring or duration-based |
| Color transition       | Effect spring (must NOT overshoot)    | Color values shouldn't oscillate past target; smooth interpolation only     |
| Rotation               | Linear or spring depending on context | UI indicators: linear; physical objects: spring                             |

### Duration Tokens (When Not Using Springs)

| Element Type                               | Duration            | Easing                      | Example                       |
| ------------------------------------------ | ------------------- | --------------------------- | ----------------------------- |
| Micro-feedback (button press, checkbox)    | 100-150ms           | ease-out                    | Ripple effect, state change   |
| UI transition (panel open, tab switch)     | 200-300ms           | ease-in-out                 | Sidebar expand, modal enter   |
| Emphasis / attention (toast, notification) | 300-500ms           | ease-out                    | Slide-in notification         |
| Page-level transition                      | 150-300ms           | ease-out or View Transition | Route change, page navigation |
| Stagger per item (list animation)          | 50ms delay per item | ease-out with stagger       | List load, search results     |

## Apple vs M3 vs Fluent 2: Motion Philosophy Comparison

| Aspect                 | Apple                                                      | M3 Expressive                                                                      | Fluent 2                                                  |
| ---------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Default animation type | Spring (always)                                            | Duration-based; springs opt-in via Expressive                                      | Duration + bezier curves                                  |
| Parameterization       | Duration + bounce (perceptual)                             | Stiffness + damping ratio (physics)                                                | Duration + easing function (CSS)                          |
| Interruption handling  | Automatic velocity preservation; retargeting mid-animation | Spring carries momentum; duration-based snaps                                      | Bezier curves restart on interruption                     |
| Spring types           | Single spring model with bounce range -1.0 to 1.0          | Two types: spatial (position, can overshoot) and effects (opacity, clamped)        | No springs; inertia/gravity/weight metaphors              |
| Reduced motion         | Kills ALL animations via `!important` override             | Duration tokens can be set to 0                                                    | `duration-scalar` token = 0 when `prefers-reduced-motion` |
| Research basis         | Decades of UIKit/Core Animation; WWDC sessions             | 46 studies, 18,000+ participants; 4x faster element location in expressive layouts | Enterprise user research; productivity focus              |
| Philosophy             | Physics-based naturalism; springs everywhere               | Expressive personality layer on functional base                                    | Predictable professionalism                               |

### Apple's Duration/Bounce to Physics Conversion

Internally, Apple converts perceptual parameters to spring physics:

| Parameter             | Formula                         |
| --------------------- | ------------------------------- |
| mass                  | Always 1                        |
| stiffness             | `(2π / duration)^2`             |
| damping (bounce >= 0) | `1 - 4π × bounce / duration`    |
| damping (bounce < 0)  | `4π / (duration + 4π × bounce)` |

**Pre-iOS 17 starting values:** mass: 1.0, stiffness: 170, damping: 15 (bouncy); damping: 25 (smooth).

### M3 Expressive Shape Morphing

M3 Expressive introduces shape as an animation target:

| Feature                 | How It Works                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------ |
| 35 new preset shapes    | Figma + Compose; can be assigned to any component                                    |
| Shape morphing          | Components transition between shapes on state change (square -> circle on selection) |
| Shape as state signal   | Different states have different shapes; shape communicates interaction state         |
| Corner radius animation | `RoundedCornerShape` -> `CircleShape` animated via spring                            |

## View Transitions API (Web-Native Page Animations)

| Feature              | Status (2025)                                      | How It Works                                                                       |
| -------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| SPA view transitions | Chrome, Edge, Safari, Firefox 144+ (85%+ coverage) | `document.startViewTransition()` wraps DOM update; browser snapshots old/new state |
| MPA view transitions | Chrome, Edge; Safari/Firefox recent                | `@view-transition { navigation: auto; }` in CSS; works across page loads           |
| Element persistence  | Baseline                                           | Same `view-transition-name` on element before/after update = browser morphs it     |
| React integration    | React Canary                                       | `useViewTransition()` hook; wraps state updates in view transitions                |

**CSS customization:**

| Pseudo-element                  | Purpose                 |
| ------------------------------- | ----------------------- |
| `::view-transition-old(name)`   | Animate departing state |
| `::view-transition-new(name)`   | Animate entering state  |
| `::view-transition-group(name)` | Container for both      |

**Impact on design systems:** View Transitions replace JS animation libraries (Framer Motion, GSAP) for page-level and element-persistence animations. Keep JS libraries for complex gesture-driven or physics-based component animations.

## Motion Tokens Architecture

| Token Category        | Examples                                                           | Purpose                                          |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------ |
| Duration              | `--motion-duration-fast: 150ms`, `--motion-duration-normal: 300ms` | Non-spring animations; UI transitions            |
| Easing                | `--motion-ease-out: cubic-bezier(0.0, 0.0, 0.2, 1)`                | Standard curves for CSS transitions              |
| Spring                | `--motion-spring-bounce: 0.15`, `--motion-spring-duration: 0.5s`   | Spring parameter tokens (Apple-style)            |
| Stagger               | `--motion-stagger-delay: 50ms`                                     | Per-item delay in list animations                |
| Reduced motion scalar | `--motion-duration-scalar: 1` (or `0` when reduced)                | Multiply ALL durations by this; Fluent 2 pattern |

**Reduced motion implementation:**

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-scalar: 0;
    --motion-spring-bounce: 0;
  }
}
```

**Critical rule:** Never hardcode animation durations. Always multiply by `--motion-duration-scalar`. Hardcoded durations bypass accessibility.

## Common Mistakes

| Mistake                                         | Fix                                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Using bezier curves for gesture-driven UI       | Use springs; bezier curves can't preserve gesture velocity on interruption; springs carry momentum naturally   |
| Overshooting opacity/color with springs         | Use M3's "effect spring" concept: clamp to valid range; or use duration-based for opacity/color transitions    |
| Hardcoding animation durations in CSS           | Multiply by `--motion-duration-scalar` (Fluent 2 pattern); scalar = 0 when `prefers-reduced-motion` is active  |
| Same motion curve for all animation types       | Match motion to target: spatial spring for position/scale; clamped/linear for opacity/color; stagger for lists |
| Using Framer Motion / GSAP for page transitions | Use View Transitions API (85%+ browser support); reserve JS animation libraries for complex physics/gestures   |
| Bounce > 0.4 on production UI elements          | Extreme bounce feels exaggerated; 0.15-0.30 is the usable range; >0.4 only for celebrations/games              |
| Not distinguishing enter vs exit animation      | Enter: spring or ease-out (arrives with energy); Exit: ease-in or fast fade (disappears quickly, out of focus) |
| `prefers-reduced-motion` not implemented        | Non-negotiable; affects 1 in 3 people; replace motion with crossfade/dissolve, not nothing                     |

## Checklist

### Motion Foundation

- [ ] Motion system chosen: spring-based (consumer/playful) or duration-based (enterprise/professional)
- [ ] Spring parameters defined (default: `duration: 0.5, bounce: 0` for smooth; `bounce: 0.15` for brisk)
- [ ] Duration tokens defined for non-spring animations (fast: 150ms, normal: 300ms, slow: 500ms)
- [ ] Easing tokens defined (ease-out for enters, ease-in for exits, ease-in-out for transitions)

### Animation Types

- [ ] Spatial animations (position, scale) use springs that CAN overshoot
- [ ] Effect animations (opacity, color) use clamped springs or duration-based (NO overshoot)
- [ ] List animations use stagger delay (50ms per item)
- [ ] Page transitions use View Transitions API (not JS libraries)

### Accessibility

- [ ] `prefers-reduced-motion: reduce` implemented
- [ ] `--motion-duration-scalar` token used; all durations multiplied by it
- [ ] Reduced motion replaces motion with crossfade/dissolve (not removal)
- [ ] No animation conveys meaning without a non-motion alternative

### Tokens

- [ ] Motion tokens in CSS custom properties (duration, easing, spring params, stagger)
- [ ] Reduced motion scalar integrated into token system
- [ ] Enter/exit asymmetry defined (enter: energetic; exit: fast/subtle)

## References

- [Apple: Animate with Springs (WWDC 2023)](https://developer.apple.com/videos/play/wwdc2023/10158/) -- Duration+bounce parameterization; perceptual parameters; velocity preservation
- [M3 Expressive Motion](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs) -- Spring physics; spatial vs effect springs; stiffness + damping model
- [M3 Expressive Overview](https://supercharge.design/blog/material-3-expressive) -- 46 studies, 18K+ participants; 4x faster element location; 35 new shapes
- [Fluent 2 Motion](https://fluent2.microsoft.design/motion) -- Inertia/gravity/weight; bezier curves; duration-scalar for reduced motion
- [View Transitions API (Chrome 2025)](https://developer.chrome.com/blog/view-transitions-in-2025) -- MPA support; `view-transition-class`; `match-element`; React Canary integration
- [View Transitions API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) -- Specification; browser compatibility; pseudo-elements
- [SwiftUI Spring Animations](https://github.com/GetStream/swiftui-spring-animations) -- Visual catalog of spring parameters; bounce range examples
- [Apple Liquid Glass Motion (WWDC 2025)](https://developer.apple.com/videos/play/wwdc2025/219/) -- Lensing-based materialization; gel-like interaction response; glow propagation

## Related

- [Design System Foundations](./design-system-foundations.md) -- Token architecture, industry convergence (where motion fits in the system)
- [Micro-Interactions](./micro-interactions.md) -- Animation timing for specific component states (button press, loading)
- [Component API Architecture](./component-api-architecture.md) -- How motion tokens integrate with component APIs

---

## Changelog

| Date       | Change                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2026-01-30 | Initial version: synthesized from Apple WWDC 2023-2025, M3 Expressive, Fluent 2, View Transitions API |
