---
domain: frontend
topic: server-components
tags: [react, rsc, next-js, hydration]
complexity: intermediate
last_updated: 2026-01-29
---

# Server vs Client Component Boundaries

> Decision framework for where to draw the server/client line in React 19+ apps.

## TL;DR

- **Default to Server Components** -- only add `'use client'` when you need interactivity, browser APIs, or state hooks
- **Push `'use client'` to leaf nodes** -- one high-level Client Component makes all children client too, killing RSC benefits
- **Never call Route Handlers from Server Components** -- both run server-side; skip the network hop, call the logic directly
- **Hydration errors are boundary problems** -- most come from date formatting, browser extensions, or `typeof window` branching
- **RSC streaming + Suspense = perceived performance** -- high-priority content arrives first; heavy content loads in background

## Decision Guide

| Scenario                                                  | Approach                                                     | Why                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Data fetching component                                   | Server Component (default)                                   | Zero client JS; data fetched closer to source; streaming-ready  |
| Interactive form with validation                          | Client Component at the form level, not the page level       | Only the form needs state; keep parent as Server Component      |
| Component uses `useState`/`useEffect`                     | Client Component                                             | These hooks require browser runtime                             |
| Component uses `window`/`localStorage`                    | Client Component wrapped in `useEffect`                      | Browser APIs unavailable during SSR                             |
| Layout with static nav + interactive search               | Server Component layout; Client Component search widget only | Minimizes client bundle; nav ships zero JS                      |
| Third-party library needing DOM                           | Wrap in a thin Client Component                              | Isolate the client boundary; don't let it bubble up             |
| Context provider (theme, auth)                            | Separate Client Component that takes `children` prop         | Children can still be Server Components if provider is isolated |
| Heavy computation (markdown parsing, syntax highlighting) | Server Component                                             | CPU work happens on server, not user's phone                    |
| Real-time data (WebSocket, polling)                       | Client Component                                             | Requires persistent browser connection                          |
| SEO-critical content                                      | Server Component with streaming                              | HTML arrives fully rendered for crawlers                        |

## Common Mistakes

| Mistake                                                                   | Fix                                                                                                                           |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Adding `'use client'` to page or layout level                             | Move it to the smallest interactive leaf component                                                                            |
| Calling Route Handler via `fetch('/api/...')` from a Server Component     | Call the function directly -- both are server-side                                                                            |
| Passing non-serializable props (functions, classes) from Server to Client | Only pass JSON-serializable data; move callbacks into the Client Component                                                    |
| Using `typeof window !== 'undefined'` to branch rendering                 | Causes hydration mismatch; use `useEffect` for client-only logic instead                                                      |
| Date formatting without timezone pinning                                  | Server (UTC) and client (local) produce different strings; pin timezone or format on one side only                            |
| Assuming `React.memo` works on Server Components                          | It doesn't -- memo is Client Component only                                                                                   |
| Wrapping entire app in `'use client'` for incremental migration           | Kills all RSC benefits; migrate bottom-up from leaves instead                                                                 |
| Ignoring browser extension DOM injection                                  | Extensions add attributes like `data-lt-installed` before React hydrates; use `suppressHydrationWarning` on `<html>`/`<body>` |

## Hydration Error Quick Reference

| Cause                                     | Symptoms                       | Fix                                                 |
| ----------------------------------------- | ------------------------------ | --------------------------------------------------- |
| `Date.now()` / `Math.random()` in render  | Content mismatch warning       | Move to `useEffect` or pass as prop from server     |
| Timezone-dependent date formatting        | Dates differ server vs client  | Use UTC on both sides or format only on one side    |
| Browser extension modifies DOM            | Random attribute mismatches    | `suppressHydrationWarning` on root elements         |
| Invalid HTML nesting (`<p>` inside `<p>`) | Tree structure mismatch        | Fix HTML structure                                  |
| Third-party library + Turbopack           | Hydration failure in dev only  | Test with Webpack; file issue if Turbopack-specific |
| `useId()` mismatch (Next.js 15.4.2+)      | Different IDs server vs client | Pin Next.js version or check canary fixes           |

## Checklist

- [ ] Components are Server Components unless they need interactivity
- [ ] `'use client'` appears at leaf level, not page/layout level
- [ ] No `fetch('/api/...')` calls from Server Components (call functions directly)
- [ ] All Server-to-Client props are JSON-serializable
- [ ] No `typeof window` branching in render path (use `useEffect`)
- [ ] Date/time formatting is timezone-consistent between server and client
- [ ] Context providers are isolated Client Components accepting `children`
- [ ] `suppressHydrationWarning` on `<html>` or `<body>` for extension resilience

## References

- [Vercel: Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) -- Official mistake catalog from the Next.js team
- [Vercel: Understanding RSC](https://vercel.com/blog/understanding-react-server-components) -- Architecture deep-dive
- [React: Server Components Reference](https://react.dev/reference/rsc/server-components) -- Official API surface
- [GitHub: Hydration Discussion #35773](https://github.com/vercel/next.js/discussions/35773) -- Community-sourced hydration fixes
- [RSC Performance (Web Perf Calendar)](https://calendar.perfplanet.com/2025/intro-to-performance-of-react-server-components/) -- Performance measurements

## Related

- [Next.js Data Patterns](./nextjs-data-patterns.md) -- Caching and data fetching decisions
- [Server Actions Security](../security/server-actions-security.md) -- Securing server-side mutations

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
