---
domain: ux
topic: sub-perceptual craft — killing the platform defaults that feel cheap
tags: [polish, premium-perception, css, defaults, craft]
complexity: intermediate
last_updated: 2026-07-02
confidence: 0.85
source_refs:
  - "MDN / web.dev / Chrome dev docs (per-property references)"
  - "Josh Comeau custom CSS reset (2025); Fontaine metric matching"
  - "WCAG 2.4.7/2.4.13 focus indicators; Sara Soueidan"
  - "CSS-Tricks FART (theme flash); WebKit text-wrap: pretty"

status: validated
review_by: 2026-12-31
author: Claude Fable 5 + Haiku researchers
version: 1
---

# Sub-Perceptual Craft

> Premium is experienced as the absence of tiny insults. No user names the gray tap flash, the font swap, the scrollbar layout jump, or the white flash before dark mode — but every user feels them. This is the audit list of platform defaults to kill, each with its correct fix and its trap.

## TL;DR

- **These defects are felt before they are seen.** Each one individually is sub-perceptual; together they are the difference between "polished" and "shipped fast." Fix them once, globally, in the design system — not per feature.
- **A modern CSS reset covers roughly half.** Comeau's reset handles box-sizing, font smoothing, media blocks, text-wrap, form font inheritance. The rest — focus rings, tap states, selection, scrollbars, autofill, theme flash — are brand decisions you must make explicitly.
- **Never fix an insult by amputating the feature.** `outline: none`, hidden scrollbars, and `maximum-scale=1` all remove the symptom by breaking accessibility. The premium move is restyle, not remove.
- **Safari is the asterisk on everything.** `overscroll-behavior`, font metric overrides, and several fixes are WebKit-gapped or WebKit-only — test the audit list on iOS Safari specifically.

## Decision Guide

| Insult                         | Symptom users feel                    | Fix                                                                                                       | Trap                                                   |
| ------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Font-swap flash (FOUT/FOIT)    | Text blinks or reflows on load        | `font-display: block` for brand type, `swap` for body; metric-match the fallback (size-adjust / Fontaine) | Metric overrides not in Safari                         |
| Gray tap flash (mobile)        | Gray rectangle on every tap           | `-webkit-tap-highlight-color: transparent` **+ your own `:active`**                                       | Removing without replacing kills touch feedback        |
| Default blue selection         | Generic OS blue breaks brand          | `::selection` brand-tinted                                                                                | Keep 4.5:1 contrast on selected text                   |
| Scrollbar layout jump          | Content shifts when scrollbar appears | `scrollbar-gutter: stable`                                                                                | No-op on macOS/iOS overlay scrollbars                  |
| Ugly OS scrollbar              | Thick gray bar in a dark UI           | `scrollbar-width/color` + `::-webkit-scrollbar`                                                           | Never hide entirely — users lose the scroll affordance |
| Default focus ring             | Blue ring clashes; or worse, removed  | Restyle `:focus-visible` (≥2px, 3:1 contrast, offset)                                                     | `outline: none` violates WCAG 2.4.7                    |
| Scroll chaining                | Page behind a modal bounces           | `overscroll-behavior: contain`                                                                            | Safari ignores it — JS fallback for iOS                |
| iOS input auto-zoom            | Viewport lurches on field tap         | `font-size: 16px` minimum on inputs                                                                       | `maximum-scale=1` "fix" disables accessibility zoom    |
| Autofill yellow                | Chrome paints inputs yellow           | `0 0 0 1000px` inset box-shadow + `-webkit-text-fill-color`                                               | Only reliable override; needs `!important`             |
| Dark-mode flash (FART)         | White flash before theme applies      | Blocking inline script sets theme pre-render + `color-scheme`                                             | `prefers-color-scheme` CSS alone can't stop the flash  |
| Number jitter                  | Timers/scores shift layout per digit  | `font-variant-numeric: tabular-nums`                                                                      | Silently no-ops if the font lacks `tnum`               |
| Orphan words / ragged headings | One word alone on the last line       | `text-wrap: balance` (headings), `pretty` (body)                                                          | `balance` capped ~6 lines; `pretty` costs layout perf  |
| Invisible caret                | "Where am I typing?"                  | `caret-color` in brand, ≥3:1 contrast                                                                     | —                                                      |
| iOS long-press callout         | System menu on custom UI              | `-webkit-touch-callout: none` on UI chrome only                                                           | Blanket `user-select: none` breaks copying content     |
| Image drag ghost               | Dragging leaves a translucent ghost   | `-webkit-user-drag: none` on decorative images                                                            | `pointer-events: none` only if truly non-interactive   |
| Double-tap zoom on controls    | Buttons zoom the page                 | `touch-action: manipulation` on interactive elements                                                      | Keep pinch-zoom alive                                  |
| Layout shift from media        | Page bounces as images arrive         | `aspect-ratio` / explicit dimensions; skeletons sized to true content ([[loading-states]])                | Mis-sized skeletons still shift                        |
| Wrong cursor                   | "Is this clickable?"                  | `cursor: pointer` on true clickables; `grab/grabbing`; `not-allowed`                                      | Pointer on non-clickables trains distrust              |
| Motion for vestibular users    | Animation causes discomfort           | `@media (prefers-reduced-motion: reduce)` — mandatory, ~15% of users                                      | Not optional for WCAG AA; see [[design-system-motion]] |
| iOS text inflation             | Font sizes mutate on rotation         | `text-size-adjust: 100%`                                                                                  | Use `100%`, not `none` (keeps manual zoom)             |
| Blurry macOS text              | Heavy, fuzzy rendering                | `-webkit-font-smoothing: antialiased`                                                                     | Settled since macOS killed subpixel (2018)             |

## The three non-obvious tricks

Most fixes are one property. Three require the trick nobody guesses:

- **Autofill:** browsers lock `background-color` on autofilled inputs for security. The only reliable override is a giant inset shadow: `-webkit-box-shadow: 0 0 0 1000px <your-bg> inset` plus `-webkit-text-fill-color`.
- **Theme flash:** CSS cannot fix it — the flash happens before CSS applies user choice. A tiny **blocking inline `<script>` in `<head>`** reads the stored theme and sets `data-theme` on `<html>` before first paint. `color-scheme: light dark` additionally keeps native UI (scrollbars, form controls) in the right scheme. Smooth switches: View Transitions. Extends [[devtool-dark-mode]].
- **Font fallback metrics:** `font-display: swap` trades the blink for a reflow unless the fallback is metric-matched — `size-adjust`, `ascent-override`, `descent-override` on the `@font-face` fallback (Fontaine automates it) make the swap nearly invisible.

## What the reset covers vs what's yours

A modern reset (Comeau 2025) gives you: `box-sizing: border-box`, margin zeroing, `line-height: 1.5`, font smoothing, block media with `max-width: 100%`, `font: inherit` on form controls, `overflow-wrap: break-word`, `text-wrap` polish, root `isolation`. **It cannot decide brand questions:** focus-ring style, tap `:active` states, `::selection` color, scrollbar treatment, autofill colors, theme-flash script, caret color. Ship the reset, then make those seven decisions explicitly in the design system — they are where the brand lives at the sub-perceptual layer.

## Common Mistakes

| Mistake                                           | Fix                                                          |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `outline: none` to kill the "ugly" focus ring     | Restyle `:focus-visible`; removal violates WCAG 2.4.7        |
| Hiding scrollbars for a "clean" look              | Style them; hidden scrollbars erase the scrolling affordance |
| `maximum-scale=1` to stop iOS input zoom          | 16px input font; the meta hack disables accessibility zoom   |
| Removing tap highlight without an `:active` state | Touch feedback must be replaced, not deleted                 |
| Blanket `user-select: none`                       | UI chrome only; content must stay selectable                 |
| Fixing insults per-page                           | One pass in the design-system base layer; enforce in review  |
| Testing only in Chrome desktop                    | Safari/iOS is where half the fixes gap or apply              |
| Treating the CSS reset as the whole job           | The reset covers ~half; the brand-decision seven remain      |

## Checklist

- [ ] Fonts: `font-display` chosen per role; fallback metric-matched; no visible swap or reflow
- [ ] Touch: tap highlight replaced with a designed `:active`; `touch-action: manipulation`; no long-press callout on UI chrome
- [ ] Selection + caret branded, both meeting contrast
- [ ] Scrollbars styled (never hidden); `scrollbar-gutter: stable` where scrollbars overlay content shifts
- [ ] `:focus-visible` restyled ≥2px, 3:1, offset — zero `outline: none` without replacement
- [ ] `overscroll-behavior: contain` on modals/drawers (+ iOS fallback)
- [ ] Inputs ≥16px on mobile; autofill styled via the inset-shadow trick
- [ ] Theme set by blocking inline script + `color-scheme`; zero flash on reload in dark mode
- [ ] `tabular-nums` on all changing digits; `text-wrap: balance/pretty` on headings/body
- [ ] Media has `aspect-ratio`; CLS < 0.1; skeletons sized to true content
- [ ] `prefers-reduced-motion` honored globally
- [ ] Full audit run on iOS Safari, not just Chrome

## References

- [Josh Comeau — custom CSS reset](https://www.joshwcomeau.com/css/custom-css-reset/) · [Fontaine — fallback metric matching](https://github.com/unjs/fontaine)
- [CSS-Tricks — flash of inaccurate color theme](https://css-tricks.com/flash-of-inaccurate-color-theme-fart/) · [WebKit — text-wrap: pretty](https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/)
- [Sara Soueidan — focus indicators](https://www.sarasoueidan.com/blog/focus-indicators/) · [web.dev — optimize CLS](https://web.dev/articles/optimize-cls)

Related: [[devtool-premium-perception]] (why absence-of-insult reads as premium), [[micro-interactions]] (the designed feedback that replaces removed defaults), [[design-system-motion]] (reduced-motion), [[devtool-dark-mode]] (theme system), [[loading-states]] (skeleton sizing), [[accessibility-build-rules]] (the WCAG floor these fixes must not break), [[typography-brand-perception]] (font choice upstream of font loading).
