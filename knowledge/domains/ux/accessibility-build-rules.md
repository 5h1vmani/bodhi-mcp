---
domain: ux
topic: accessibility-build-rules
tags: [wcag-2.2, accessibility, touch-targets, focus-management]
complexity: intermediate
last_updated: 2026-06-25
status: validated
version: 1
---

# WCAG 2.2 AA Accessibility Build Rules

> The five WCAG 2.2 AA success criteria that require code changes — not just design decisions — with exact implementation constraints per SC.

## TL;DR

- **WCAG 2.2 AA is the compliance target** — APCA is a reported quality aid for contrast; it never substitutes for WCAG 2.2 AA legal compliance
- **24px CSS floor, 44px for primary/touch** — SC 2.5.8; inline text and third-party exceptions apply; offset math counts, not rendered box alone
- **Focus must not be fully hidden under sticky chrome** — SC 2.4.11; `scrollIntoView({block:'nearest'})` + `z-index` discipline on sticky bars is the fix
- **Every draggable action needs a single-pointer path** — SC 2.5.7; a button or menu that achieves the same result without drag
- **No CAPTCHA-only or cognitive-puzzle-only auth** — SC 3.3.8; copy-paste must work in auth fields; SC 3.3.7 blocks re-asking data already entered in the same session

## Decision Guide

| Scenario                                           | Approach                                                                                                                                         | Why                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Small icon button (16–20px visual)                 | Wrap in `<button>` with `min-width/height: 44px`; center icon with flex                                                                          | Offset spacing counts toward 2.5.8 target size; visual size ≠ interactive size                          |
| Touch-only tertiary action (e.g., dismiss chip)    | `min-width/height: 24px`; space sibling targets ≥ 24px apart (CSS gap)                                                                           | SC 2.5.8 floor is 24px; primary CTAs stay at 44px                                                       |
| Sticky header / fixed bottom nav + keyboard focus  | `scrollIntoView({block:'nearest'})` on `focus` for all focusable elements inside scroll containers; set `z-index` on sticky header > all content | SC 2.4.11: partial obscuring is allowed if user can reveal; full cover fails                            |
| Drag-to-reorder list                               | Add a "Move" button per item opening a position-select menu as the pointer alternative                                                           | SC 2.5.7 requires single-pointer equivalent; keyboard alternative alone is insufficient                 |
| Drag-resize panel                                  | Add a size input or step-increment buttons as alternative                                                                                        | Same rule; drag can co-exist with the alternative                                                       |
| Multi-step form asking for previously entered data | Populate fields from session state; if re-entry is necessary, pre-fill and let user confirm                                                      | SC 3.3.7 Redundant Entry; exception: security re-confirmation (password confirm)                        |
| Login / registration form with CAPTCHA             | Offer at least one alternative: copy-paste allowed in password fields, magic link, passkey, or image CAPTCHA + audio alternative                 | SC 3.3.8: cognitive-only (no copy-paste, no alternative) fails; CAPTCHA alone without alternative fails |
| Password field                                     | Never block `paste`; allow password manager autofill                                                                                             | SC 3.3.8 explicit requirement; `onpaste` prevention is a direct violation                               |

## Common Mistakes

| Mistake                                                               | Fix                                                                                                                                                       |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Setting `min-width/height` on the icon, not the button                | Apply size constraints to the interactive element (`<button>`, `<a>`), not the `<svg>` or `<img>` inside                                                  |
| Relying on `scroll-margin-top` alone for sticky header focus          | `scroll-margin-top` moves scroll position but doesn't fire on every focus; pair with a `focus` event listener calling `scrollIntoView({block:'nearest'})` |
| Treating `z-index: 1` as sufficient sticky header stacking            | Map out stacking contexts; sticky bars need `z-index` higher than any positioned child in the scroll container                                            |
| Providing only keyboard shortcut as drag alternative                  | SC 2.5.7 requires a _pointer_ alternative (single pointer, no path-dependent gesture); keyboard shortcuts are additional, not sufficient                  |
| Blocking clipboard paste in auth fields with `onpaste="return false"` | Remove all paste prevention; SC 3.3.8 explicitly disallows it                                                                                             |
| Re-asking email on confirmation page after checkout                   | Pre-fill from session; SC 3.3.7 exception only for security confirmation and intentional re-entry tests                                                   |
| Using APCA numbers to justify contrast that fails WCAG 2.2 AA ratio   | APCA is a quality aid for design decisions; WCAG 2.2 AA (4.5:1 body, 3:1 large text) is the legal compliance floor — never substitute                     |
| Touch target spacing below 24px between adjacent small targets        | CSS `gap` or `margin` must ensure ≥ 24px spacing when each target is at the 24px floor                                                                    |

## Checklist

- [ ] All interactive elements: `min-width` and `min-height` ≥ 44px for primary/touch, ≥ 24px for secondary with ≥ 24px spacing to neighbors
- [ ] Sticky/fixed headers have `z-index` that exceeds all content in the scroll container
- [ ] `focus` event on interactive elements inside scroll containers calls `scrollIntoView({block:'nearest'})`
- [ ] Every drag interaction (reorder, resize, draw) has a visible single-pointer alternative (button, menu, or input)
- [ ] Auth and sensitive input fields: `paste` is never blocked; password manager autofill attributes set (`autocomplete="current-password"` / `"new-password"`)
- [ ] CAPTCHA: at least one non-cognitive alternative provided (audio CAPTCHA, magic link, passkey)
- [ ] Multi-step forms: data entered earlier in the same session is pre-filled or carried forward; no re-entry required unless security-justified
- [ ] WCAG 2.2 AA contrast ratios validated (4.5:1 body, 3:1 large text / UI components); APCA scores reported separately as quality signal

## References

- [WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — 24px floor, offset calculation rules, inline text exception
- [WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) — partial obscure allowed; full cover fails; AA level
- [WCAG 2.2 SC 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — single-pointer alternative required; path-independent
- [WCAG 2.2 SC 3.3.7 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) — pre-fill or auto-populate within session; security exception
- [WCAG 2.2 SC 3.3.8 Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) — no cognitive-only auth; paste must be allowed
- [MDN: scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) — `{block:'nearest'}` avoids over-scrolling when element is already partially visible
