---
domain: ux
topic: component-api-architecture
tags: [design-system, component-api, headless-ui, shadcn]
complexity: advanced
last_updated: 2026-01-30
---

# Component API Architecture

> Decision framework for choosing component distribution, composition patterns, and styling strategies -- synthesized from Radix, shadcn/ui, M3 Compose, Fluent 2 React v9, and Panda CSS.

## TL;DR

- **Headless + copy-paste is the 2025-2026 winner** -- Radix primitives for behavior/a11y, shadcn-style ownership for styling; traditional npm-install libraries losing ground because they trade customization for convenience
- **`asChild` (slot pattern) > `as` prop > render props** -- Radix's slot pattern produces cleaner DOM, better composition chains, and lower TypeScript complexity; `as` prop (Chakra/Mantine) can't chain; render props only when passing data to children
- **Build-time CSS > runtime CSS-in-JS** -- Emotion/styled-components nearly double render time (27.7ms to 54ms); Panda CSS, Vanilla Extract, Tailwind v4 extract at build; runtime CSS-in-JS is a legacy pattern for new projects
- **Compound components for complex composition, config props for simple variants** -- Tabs/Accordion/Menu need compound (shared state between children); Button/Badge/Avatar use config props (no child state)
- **Brad Frost hierarchy: Components > Recipes > Snowflakes** -- Components are agnostic primitives (Button, Card); Recipes are specific compositions reused across pages (ProductCard); Snowflakes are one-off page layouts; most "components" teams build are actually recipes

## Decision Guide

### Distribution Strategy

| Scenario                                               | Approach                                                                                 | Why                                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Building custom design system; need deep customization | Copy-paste (shadcn pattern): `npx shadcn@latest add button` copies source into your repo | Full ownership; edit anything; no dependency lock-in; zero version conflicts; AI tools can read/modify internals |
| Rapid MVP; team < 5; no DS investment planned          | Traditional package (MUI, Chakra): `npm install @chakra-ui/react`                        | Faster initial setup; centralized security patches; less maintenance burden                                      |
| Multi-app org sharing components                       | Monorepo with package distribution (Turborepo/Nx)                                        | Cross-cutting changes propagate; versioned releases; clear ownership per package                                 |
| White-label / multi-brand SaaS                         | Headless primitives (Radix) + token-based theming per tenant                             | Behavior shared; only brand layer swaps; zero component code changes per tenant                                  |
| Developer tools / code-centric audience                | Geist-style: dark-first, monochrome, minimal color, precision over polish                | Developer audiences value restraint and accuracy; color adds noise to code-centric interfaces                    |

### Composition Pattern Selection

| Scenario                                                                  | Pattern                                                                                         | Why                                                                                                      |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Complex widget with shared state between children (Tabs, Accordion, Menu) | Compound components: `<Tabs><TabList><Tab>...</Tab></TabList><TabPanels>...</TabPanels></Tabs>` | Children need implicit shared context; users need markup flexibility; each child handles own rendering   |
| Simple component with predictable variants (Button, Badge, Avatar)        | Configuration props: `<Button variant="primary" size="lg">`                                     | No state sharing needed; controlled API surface prevents misuse; simpler for consumers                   |
| Need semantic HTML control (link styled as button, button inside tooltip) | Slot pattern (`asChild`): `<Button asChild><a href="/home">Home</a></Button>`                   | Clean DOM; Radix clones child and passes all props/behavior; preserves semantics without wrappers        |
| Polymorphic element (same component renders as different HTML tags)       | `as` prop: `<Box as="section">`                                                                 | Simple polymorphism; but can't chain (Radix `asChild` preferred for composition)                         |
| Need to pass data/render context to children                              | Render props: `<DataTable renderRow={(row) => <CustomRow data={row} />}`                        | Inversion of control; child receives data it needs; useful for list/table patterns                       |
| Building headless library for multiple frameworks                         | Custom hooks: `useDialog()`, `useCombobox()` returning state + handlers                         | Framework-agnostic behavior; consuming team adds their own JSX; Fluent 2 and Radix both use this pattern |

### Styling Strategy

| Scenario                                              | Approach                                                            | Why                                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| New project (2025+); performance matters              | Tailwind v4 + CSS variables for tokens                              | Zero runtime; JIT compilation; `@theme inline` integrates CSS variables as Tailwind utilities; industry default          |
| Need type-safe tokens enforced at TypeScript level    | Panda CSS: build-time extraction with TypeScript token autocomplete | Catches token misuse at compile time; `<Box bg="primary" />` errors if token doesn't exist; recipes for variants         |
| Framework-agnostic design tokens (no build step)      | Open Props: CSS custom properties from CDN or NPM                   | Zero build step; works with any framework; created by Google Chrome DevRel; composable                                   |
| Maintaining legacy styled-components/Emotion codebase | Keep runtime CSS-in-JS; migrate gradually to build-time             | Rewriting costs outweigh runtime penalty; migrate new components to Tailwind/Panda; avoid mixing paradigms               |
| Component variants with complex combinations          | CVA (class-variance-authority) or Panda recipes                     | Type-safe variant definitions; compound variants for edge cases; `cva()` for co-located; Panda config recipes for shared |

## Component Hierarchy (Brad Frost Model)

| Level                 | Definition                                              | Example                                      | Ownership                          |
| --------------------- | ------------------------------------------------------- | -------------------------------------------- | ---------------------------------- |
| Component (primitive) | Agnostic, reusable, context-free                        | Button, Card, Input, Modal, Badge            | Design system team                 |
| Recipe                | Specific composition of primitives, reused across pages | ProductCard, UserProfileHeader, PricingTable | Product team (using DS primitives) |
| Snowflake             | One-off implementation for specific page                | Homepage hero, Custom onboarding wizard      | Page owner                         |

**Key insight:** Most teams think they're building "components" but are actually building recipes. A Card component is just a box with slots (CardHeader, CardBody, CardFooter). Almost every Card _implementation_ is a recipe.

**Decision rule:** Wait for 3+ use cases before promoting a recipe to a component. Premature abstraction creates components nobody uses.

## Headless Architecture Deep Dive

### What Radix Primitives Provide (behavior layer)

| Capability                  | How It Works                                                      | What You Don't Build    |
| --------------------------- | ----------------------------------------------------------------- | ----------------------- |
| Focus management            | Automatic focus trapping in modals, roving tabindex in lists      | Custom focus trap logic |
| Keyboard navigation         | Arrow keys in menus, Escape to close, Enter to select             | keyDown event handlers  |
| ARIA attributes             | Roles, aria-expanded, aria-selected, aria-labelledby auto-applied | Manual ARIA management  |
| Screen reader announcements | State changes announced properly                                  | Live region management  |
| Portal rendering            | Dialogs/Popovers render outside DOM tree, positioned correctly    | z-index management      |
| Dismiss interactions        | Click outside, Escape key, scroll lock                            | Event listener cleanup  |

### Radix Colors: 12-Step Functional Scale

Each step is designed for a specific UI use case (not arbitrary aesthetic progression):

| Step  | Purpose                                         | Example Use                    |
| ----- | ----------------------------------------------- | ------------------------------ |
| 1-2   | App/subtle backgrounds                          | Page background, card surface  |
| 3-5   | UI element backgrounds (normal, hover, active)  | Button states, input fills     |
| 6-8   | Borders and focus rings (subtle, normal, hover) | Card borders, focus indicators |
| 9-10  | Solid backgrounds (normal, hover)               | Primary buttons, badges        |
| 11-12 | Text (low-contrast, high-contrast)              | Secondary text, primary text   |

**Dark mode:** Swap `.dark` class on root; scales auto-invert. No manual color remapping.

**APCA contrast:** Built in. Text colors (steps 11-12) guaranteed to pass target contrast ratios against background steps.

## Slot Pattern vs Polymorphic `as` Prop

| Criterion             | `asChild` (Slot)                                                       | `as` Prop                                                   | Winner |
| --------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| DOM output            | Clean; child element rendered directly                                 | Can create wrapper elements                                 | Slot   |
| Composition chaining  | Unlimited: `<Dialog.Trigger asChild><Tooltip.Trigger asChild><Button>` | Can't chain `as` props                                      | Slot   |
| TypeScript complexity | Lower; child type is explicit                                          | Higher; generic type inference across all possible elements | Slot   |
| Ecosystem             | Radix UI standard                                                      | Chakra UI, Mantine, MUI standard                            | Tie    |
| Learning curve        | Requires understanding `React.forwardRef` + prop spreading             | More intuitive API                                          | `as`   |
| Semantic HTML         | Developer explicitly chooses element                                   | Developer specifies via string/component                    | Tie    |

**Requirements for `asChild` consumers:**

1. Spread `{...props}` to underlying DOM node
2. Use `React.forwardRef()` for ref attachment
3. Don't convert focusable elements to non-focusable (breaks a11y)

## Build-Time vs Runtime CSS Performance

| Metric            | Runtime (Emotion)                   | Build-Time (Panda/Tailwind)       |
| ----------------- | ----------------------------------- | --------------------------------- |
| Render time       | ~54ms (nearly doubled)              | ~27ms (baseline)                  |
| Blocking time     | +300ms                              | Baseline                          |
| JS execution      | +1.3s additional                    | Zero styling JS                   |
| Bundle overhead   | +8-13kB (library)                   | Zero runtime                      |
| Dynamic theming   | Native (JS evaluates)               | CSS variables (no JS)             |
| TypeScript DX     | Good                                | Excellent (Panda); N/A (Tailwind) |
| Server components | Incompatible (needs client context) | Compatible (static CSS)           |

## Modern CSS Features Changing Component Architecture

| Feature                 | Browser Support                                          | Design System Impact                                                                                                |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Container queries       | Baseline 2023; all major browsers                        | Components respond to _container_ size, not viewport; portable across sidebars, grids, modals without media queries |
| CSS `:has()`            | Baseline 2023; most-used CSS feature (State of CSS 2025) | Parent-aware styling without JS: `.card:has(img)` gets grid layout; `.form:has(.error)` shows warning border        |
| View Transitions API    | Chrome, Edge, Safari, Firefox 144+ (85%+ coverage)       | Page-level morph animations with zero JS: `view-transition-name` on element persists identity across navigations    |
| CSS nesting             | Baseline 2023                                            | Reduces need for preprocessors; component styles self-contained                                                     |
| `@layer` cascade layers | Baseline 2022                                            | Design system base styles in low-priority layer; app overrides always win without `!important`                      |
| `@scope`                | Check targets                                            | Component-scoped styles without Shadow DOM; prevents selector leakage                                               |

## Common Mistakes

| Mistake                                                                   | Fix                                                                                                  |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Building all UI as "components" (premature abstraction)                   | Wait for 3+ use cases; most UI is recipes (specific compositions), not reusable primitives           |
| Using runtime CSS-in-JS (Emotion/styled-components) for new projects      | Use build-time extraction (Panda CSS, Tailwind v4, Vanilla Extract); runtime doubles render time     |
| Choosing `as` prop when composition is needed                             | Use `asChild` (slot pattern) for chaining; `as` can't compose: `<Box as="a" as="button">` is invalid |
| Barrel exports in design system packages (`export * from './components'`) | Use direct imports (`@ds/button`); barrel exports destroy dev server startup and tree-shaking        |
| Building accessibility from scratch                                       | Use Radix/React Aria/Ark UI primitives; they handle focus traps, keyboard nav, ARIA, screen readers  |
| Treating headless and styled as either/or                                 | Layer them: Radix (headless behavior) + Tailwind (styling) + shadcn (sensible defaults you own)      |
| Forcing one distribution model for all consumers                          | Offer both: npm package for quick adopters; copy-paste source for teams needing customization        |

## Checklist

### Distribution

- [ ] Distribution strategy chosen (copy-paste vs package vs both)
- [ ] Tree-shaking verified: importing one component doesn't bundle entire library
- [ ] ESM format with `"sideEffects": false` in package.json
- [ ] Direct exports per component (not just barrel `index.ts`)

### Composition

- [ ] Compound components used for widgets with shared child state
- [ ] Config props used for simple variant components
- [ ] `asChild` or equivalent slot pattern available for semantic HTML control
- [ ] `React.forwardRef` on all components accepting refs

### Styling

- [ ] No runtime CSS-in-JS in new components (build-time only)
- [ ] CSS variables used for all themeable values
- [ ] Container queries used for component-level responsiveness (not media queries)
- [ ] `:has()` used for state-driven styling where possible (reduces JS)

### Accessibility

- [ ] Headless primitives (Radix/React Aria) used for complex widgets
- [ ] Keyboard navigation works without mouse
- [ ] ARIA attributes auto-applied (not manually added per instance)
- [ ] Focus management handled (traps in modals, roving in lists)

## References

- [Radix UI Primitives](https://www.radix-ui.com/primitives) -- 32 headless primitives with built-in a11y; asChild composition pattern
- [shadcn/ui](https://ui.shadcn.com/docs) -- Copy-paste component distribution; Radix + Tailwind; "not a library, it's how you build your library"
- [Radix Colors](https://www.radix-ui.com/colors) -- 12-step functional color scale; APCA contrast; P3 gamut; auto dark mode
- [Brad Frost: Components, Recipes, Snowflakes](https://bradfrost.com/blog/post/design-system-components-recipes-and-snowflakes/) -- Component hierarchy model
- [Panda CSS Recipes](https://panda-css.com/docs/concepts/recipes) -- Build-time CSS-in-JS with type-safe tokens and variant recipes
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) -- `@theme inline` for CSS variable integration; zero-runtime
- [Martin Fowler: Headless Component Pattern](https://martinfowler.com/articles/headless-component.html) -- Composing React UIs with behavior hooks
- [Fluent UI React v9 Slots](https://learn.microsoft.com/en-us/shows/fluent-ui-insights/fluent-ui-insights-apis-in-v9-slots-jsx-children-triggers) -- Microsoft's slot-based composition; Griffel atomic CSS
- [M3 Compose Slot API](https://developer.android.com/develop/ui/compose/designsystems/material3) -- Compose lambda slots for component customization layers
- [CSS-in-JS Performance](https://pustelto.com/blog/css-vs-css-in-js-perf/) -- Real-world benchmark: runtime CSS-in-JS nearly doubles render time
- [Container Queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) -- Component-level responsiveness; baseline 2023
- [View Transitions API](https://developer.chrome.com/blog/view-transitions-in-2025) -- Page-level morph animations; 85%+ browser coverage

## Related

- [Design System Foundations](./design-system-foundations.md) -- Grid, type scale, color, token architecture
- [Design System Motion](./design-system-motion.md) -- Spring-based vs duration-based animation; Apple/M3/Fluent motion
- [Design System Testing](./design-system-testing.md) -- Testing pyramid, visual regression, a11y automation
- [Premium Checkout Design](./premium-checkout-design.md) -- Applying component patterns to checkout flows

---

## Changelog

| Date       | Change                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2026-01-30 | Initial version: synthesized from Radix, shadcn, M3 Compose, Fluent 2 v9, Panda CSS, Brad Frost model |
