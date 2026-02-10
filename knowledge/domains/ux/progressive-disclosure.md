---
domain: ux
topic: progressive-disclosure
tags: [progressive-disclosure, complexity, mobile, information-architecture]
complexity: beginner
last_updated: 2026-01-27
---

# Progressive Disclosure

> Show essentials first; reveal complexity on demand.

## TL;DR

- **Initial screen = importance signal** — if it's visible, users assume it matters
- **Defer, don't delete** — secondary features exist, just behind a click
- **Reduces errors** — fewer visible options = fewer wrong choices
- **Mobile essential** — limited screen real estate demands progressive disclosure
- **Validate assumptions** — test which features users actually need first

## Decision Guide

| Scenario            | Approach                                          | Why                                                 |
| ------------------- | ------------------------------------------------- | --------------------------------------------------- |
| Complex form        | Show required fields; reveal optional on request  | Completion rate increases with perceived simplicity |
| Settings page       | Categories collapsed; expand on selection         | Users find specific setting faster                  |
| Dashboard           | Summary visible; detail in drill-down             | Reduces cognitive load; supports scanning           |
| Onboarding          | One concept per screen; advance on completion     | Prevents overwhelm; builds confidence               |
| Power user features | Behind "Advanced" toggle or menu                  | Novices not confused; experts can access            |
| Mobile app          | Primary action visible; secondary in bottom sheet | Touch targets stay usable; no cramming              |
| Results/analytics   | Top 3 insights visible; full data expandable      | Users get value fast; curious can explore           |
| Error states        | Summary error + "Show details" toggle             | Most users need fix, not stack trace                |

## UI Patterns

| Pattern              | Best For                            | Implementation                  |
| -------------------- | ----------------------------------- | ------------------------------- |
| **Accordion**        | FAQ, settings, grouped content      | Click header → expand section   |
| **Tabs**             | Parallel categories of equal weight | Click tab → switch view         |
| **Dropdown**         | Long lists, selections              | Click trigger → show options    |
| **Modal/Drawer**     | Focused detail, forms               | Click trigger → overlay appears |
| **"Show more" link** | Lists, text content                 | Click → reveal additional items |
| **Hamburger menu**   | Navigation, mobile                  | Click icon → show nav options   |
| **Tooltip**          | Contextual help, definitions        | Hover/tap → show explanation    |
| **Stepper/Wizard**   | Multi-step processes                | Complete step → reveal next     |

## When NOT to Use

| Situation                   | Why Disclosure Hurts                  |
| --------------------------- | ------------------------------------- |
| Critical safety information | Users must see it; hiding = liability |
| Primary user task           | If most users need it, show it        |
| Legal/compliance notices    | Required visibility; can't be hidden  |
| Single-step processes       | Overhead of expanding > benefit       |
| Frequently used features    | Extra clicks frustrate power users    |

## Common Mistakes

| Mistake                       | Fix                                       |
| ----------------------------- | ----------------------------------------- |
| Hiding what most users need   | Research first; hide only edge cases      |
| Too many levels of disclosure | Max 2 levels; deeper = navigation problem |
| No indication more exists     | Always signal: "Show more", arrow, count  |
| Inconsistent patterns         | Same disclosure type = same UI pattern    |
| Assuming you know priorities  | Test with real users; you're not typical  |
| Mobile = desktop but smaller  | Redesign for mobile; don't just collapse  |

## Disclosure Hierarchy

| Level    | Visibility         | Example                            |
| -------- | ------------------ | ---------------------------------- |
| Level 0  | Always visible     | Primary CTA, key metric, main nav  |
| Level 1  | One click/tap away | Settings panel, secondary features |
| Level 2  | Two interactions   | Advanced settings, debug info      |
| Level 3+ | Avoid              | If needed, reconsider architecture |

## Signaling Hidden Content

| Signal Type           | When to Use                        | Example                   |
| --------------------- | ---------------------------------- | ------------------------- |
| Text link             | Sufficient space, clear action     | "Show all 24 topics"      |
| Icon + text           | Compact, needs clarity             | "▼ More options"          |
| Icon only             | Space-constrained, learned pattern | Hamburger ☰, chevron ▼   |
| Badge/count           | Quantity matters                   | "Comments (12)"           |
| Truncation + ellipsis | Text content                       | "This is a long descr..." |

## Checklist

- [ ] Primary user tasks visible without expansion
- [ ] Maximum 2 levels of disclosure depth
- [ ] Every collapsed section has visible trigger/signal
- [ ] Expansion triggers sized for touch (44px min)
- [ ] Consistent disclosure pattern across similar content
- [ ] Mobile layout designed, not just collapsed
- [ ] User research validates what's hidden vs shown

## References

- [Progressive Disclosure - Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/) — Original pattern definition
- [Progressive Disclosure for Mobile Apps - UX Planet](https://uxplanet.org/design-patterns-progressive-disclosure-for-mobile-apps-f41001a293ba) — Mobile-specific patterns
- [Progressive Disclosure Types and Use Cases - LogRocket](https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/) — Implementation patterns

## Related

- [Form Design](./form-design.md) — Progressive disclosure in forms
- [Mobile](./mobile.md) — Mobile-specific considerations
- [Cognitive Load Dashboards](./cognitive-load-dashboards.md) — Disclosure in analytics

---

## Changelog

| Date       | Change                                              |
| ---------- | --------------------------------------------------- |
| 2026-01-27 | Initial version from results page redesign research |
