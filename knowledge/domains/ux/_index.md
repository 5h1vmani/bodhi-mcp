# UX Domain

> User experience patterns, design systems, and interaction best practices.

## Quick Summary

This domain covers understanding users, designing for their needs, and implementing polished, accessible interfaces.

## Files in This Domain

| File                               | When to Use                                                                       | Complexity   |
| ---------------------------------- | --------------------------------------------------------------------------------- | ------------ |
| `loading-states.md`                | Skeleton screens, progress indicators, labor illusion                             | Intermediate |
| `form-design.md`                   | Building forms, validation, progressive disclosure                                | Intermediate |
| `conversion.md`                    | Checkout flows, trust signals, reducing abandonment                               | Intermediate |
| `mobile.md`                        | Touch targets, responsive design, mobile optimization                             | Intermediate |
| `micro-interactions.md`            | Animations, button states, success celebrations                                   | Intermediate |
| `data-display.md`                  | Dashboards, metrics, data-dense interfaces                                        | Intermediate |
| `gamification.md`                  | Points, badges, streaks, leaderboards, progress systems                           | Intermediate |
| `gen-z-loyalty.md`                 | Gen Z engagement, values-driven loyalty, mobile-first                             | Intermediate |
| `ethical-persuasion.md`            | Dark patterns, manipulation vs persuasion, compliance                             | Advanced     |
| `neurochemistry-engagement.md`     | Dopamine, habit formation, behavioral design models                               | Advanced     |
| `student-feedback-psychology.md`   | Wise feedback, growth mindset, SDT for learners                                   | Intermediate |
| `cognitive-load-dashboards.md`     | 4-chunk limit, F-pattern, dashboard overwhelm reduction                           | Intermediate |
| `progressive-disclosure.md`        | When/how to hide complexity, expand-on-demand patterns                            | Beginner     |
| `edtech-community.md`              | Study groups, leaderboards, parent dashboards, student communities                | Advanced     |
| `exam-anxiety-ux.md`               | Timer design, pre-exam flows, high-stakes testing UX                              | Advanced     |
| `exam-diagram-design.md`           | NEET/JEE diagram structure, cognitive load, NCERT conventions                     | Advanced     |
| `typography-brand-perception.md`   | Font psychology, brand archetypes, color-type combinations                        | Intermediate |
| `premium-checkout-design.md`       | Premium checkout feel: spacing, color ratio, badge limits, form widths            | Advanced     |
| `india-checkout-patterns.md`       | India-specific: UPI-first, DPDP age-gate, INR formatting, failure UX              | Advanced     |
| `design-system-foundations.md`     | Grid science, type scales, APCA contrast, design tokens, premium feel, governance | Intermediate |
| `component-api-architecture.md`    | Headless vs styled, slot vs as prop, shadcn pattern, distribution strategy        | Advanced     |
| `design-system-testing.md`         | Testing pyramid, visual regression tools, a11y automation gaps, DS metrics        | Advanced     |
| `multi-platform-design-systems.md` | Cross-platform tokens, multi-brand architecture, white-label patterns             | Advanced     |
| `design-system-motion.md`          | Spring vs duration animation, Apple/M3/Fluent motion, View Transitions API        | Advanced     |

## Key Principles

1. **400ms rule** - Acknowledge user actions within 400ms
2. **Trust near payment** - Security badges beside card fields
3. **Skeleton > Spinner** - For known content structures
4. **Reduced motion** - Always respect user preferences
5. **5-9 visuals max** - Cognitive load limit for dashboards
6. **Tabular numbers** - Use `tabular-nums` for data alignment

## Quick Reference

### Loading States

| Duration | Pattern                         |
| -------- | ------------------------------- |
| < 1s     | Spinner or optimistic update    |
| 1-3s     | Skeleton screen                 |
| 3-5s     | Labor illusion (progress steps) |
| > 5s     | Progress bar with messaging     |

### Animation Timing

| Type           | Duration  |
| -------------- | --------- |
| Micro-feedback | 100-150ms |
| UI transitions | 200-300ms |
| Emphasis       | 300-500ms |

## When to Consult This Domain

- Building checkout or signup flows
- Adding loading states to async operations
- Optimizing mobile experience
- Adding animations and polish
- Improving conversion rates
- Designing for Gen Z audiences
- Implementing ethical engagement patterns
- Building habit-forming products responsibly
- Showing student/learner performance feedback
- Reducing dashboard cognitive overload
- Hiding complexity behind progressive disclosure
- Designing study groups and peer learning features
- Building student communities for competitive exams
- Reducing exam anxiety through UI/UX patterns
- Parent dashboard design for edtech platforms
- Creating diagrams for NEET/JEE exam questions
- Optimizing diagram labels, sizing, and rendering for digital exams
- Choosing fonts/colors to match brand personality (premium, friendly, expert)
- Typography decisions for EdTech or exam interfaces
- Making checkout pages feel premium (Stripe-quality vs template-quality)
- India-specific checkout: UPI ordering, DPDP age-gating, INR formatting
- Payment failure handling for Indian banks (reconciliation notices)
- Choosing grid system (8px vs 4px), type scale ratios, or spacing scales
- APCA vs WCAG 2 contrast decisions
- Setting up design tokens (W3C DTCG spec, semantic vs primitive)
- Achieving premium design feel (Stripe/Linear/Vercel patterns)
- Design system governance, ownership, and ROI metrics
- Choosing component API patterns (headless vs styled, slot vs as prop, compound vs config)
- Design system distribution (shadcn copy-paste vs npm package vs monorepo)
- Build-time vs runtime CSS-in-JS decisions
- Visual regression testing tool selection (Chromatic vs Percy vs Playwright)
- Accessibility testing automation and coverage gaps
- Design system metrics and adoption tracking
- Cross-platform token pipelines (iOS, Android, Web, Flutter)
- Multi-brand / white-label token architecture
- Spring-based vs duration-based animation decisions
- View Transitions API for page-level animations
- M3 adaptive layouts and canonical layout selection

## Related Domains

- `frontend/` - Implementing designs
- `testing/` - Usability testing
- `marketing/` - Landing pages, copy

## Gen Z & Ethical Design Quick Reference

### Gen Z Trust Signals

| Signal                | Impact      |
| --------------------- | ----------- |
| Real customers in ads | 84% trust ↑ |
| Values alignment      | 63% require |
| Community involvement | 92% impact  |

### Ethical Engagement Principles

| Do                            | Don't                       |
| ----------------------------- | --------------------------- |
| Tie rewards to real progress  | Arbitrary dopamine triggers |
| User-controlled notifications | Interrupt-driven engagement |
| Streaks with freeze options   | Pure loss aversion          |
| Transparent variable rewards  | Slot machine mechanics      |

---

Last updated: 2026-01-30
