---
domain: frontend
topic: nextjs-data-patterns
tags: [next-js, caching, data-fetching, revalidation]
complexity: advanced
last_updated: 2026-01-29
---

# Next.js Data Fetching and Caching

> Decision framework for the 4-layer caching model, revalidation strategies, and when to use Server Actions vs Route Handlers.

## TL;DR

- **4 caching layers exist** -- Request Memoization, Data Cache, Full Route Cache, Router Cache; misunderstanding any one causes stale data bugs
- **GET Route Handlers are cached by default** -- Pages Router muscle memory breaks here; explicitly opt out if you need fresh data
- **Server Actions for mutations, Route Handlers for external APIs** -- Server Actions handle forms/mutations; Route Handlers for webhooks and third-party consumers
- **`revalidatePath` / `revalidateTag` are free on Vercel** -- no limits, no extra charges; use them aggressively after mutations
- **Next.js 16 introduces `use cache`** -- Cache Components with Partial Pre-Rendering (PPR) replace manual `revalidate` config for many cases

## Decision Guide

| Scenario                                          | Approach                                                      | Why                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| Form submission / data mutation                   | Server Action with `revalidatePath`/`revalidateTag`           | Direct server execution; built-in CSRF protection; auto-revalidation |
| Webhook endpoint (Stripe, GitHub)                 | Route Handler (POST)                                          | External systems need a stable URL to call                           |
| Public API consumed by third parties              | Route Handler                                                 | Needs its own URL, auth, and response format                         |
| Fetching data in a Server Component               | `fetch()` with `next: { revalidate: N }` or `React.cache()`   | Leverages Data Cache + Request Memoization automatically             |
| Data that never changes (legal text, config)      | `fetch()` with default caching (or `force-cache`)             | Cached indefinitely; rebuilt only on deploy                          |
| User-specific data (profile, settings)            | `fetch()` with `cache: 'no-store'` or `cookies()`/`headers()` | Dynamic per-request; cannot be statically cached                     |
| Sidebar/nav showing latest content                | `revalidateTag` on mutation + short `revalidate`              | ISR ensures freshness without full rebuild                           |
| High-load project with CDN concerns               | Avoid RSC payload for navigation; use `revalidateTag`         | RSC `_rsc` payloads can cause CDN cache misses at scale              |
| Data needed by multiple components in one request | `React.cache()` wrapping the fetch function                   | Request Memoization deduplicates; fetched once, shared across tree   |
| Development debugging (stale data)                | Delete `.next` directory and restart                          | Dev mode caching can mask issues; clean slate resolves most          |

## The 4 Caching Layers

| Layer               | What It Caches                             | Duration                            | Opt Out                                                      |
| ------------------- | ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------ |
| Request Memoization | Duplicate `fetch` calls in a single render | Single request                      | Automatic; no opt-out needed                                 |
| Data Cache          | `fetch` responses across requests          | Until revalidated                   | `cache: 'no-store'` or `revalidate: 0`                       |
| Full Route Cache    | Static HTML + RSC payload at build time    | Until revalidated                   | `dynamic = 'force-dynamic'` or using `cookies()`/`headers()` |
| Router Cache        | Client-side RSC payload for navigation     | Session (30s static / 5min dynamic) | `router.refresh()` or `revalidatePath`                       |

## Common Mistakes

| Mistake                                                                       | Fix                                                                  |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Forgetting to revalidate after Server Action mutation                         | Always call `revalidatePath()` or `revalidateTag()` at end of action |
| Calling `fetch('/api/...')` from Server Component                             | Call the logic function directly; both are server-side               |
| Assuming Route Handler GET is dynamic (like Pages Router API Routes)          | It's cached by default; add `dynamic = 'force-dynamic'` if needed    |
| Setting `revalidate = 0` but still seeing stale data                          | Router Cache may serve stale client-side; call `router.refresh()`    |
| Using `fetchCache: 'force-no-store'` globally                                 | Too aggressive; set per-route or per-fetch for granular control      |
| Not understanding that `cookies()`/`headers()` opts entire route into dynamic | Even one `cookies()` call makes the whole route dynamic              |
| Caching user-specific data                                                    | Use `cache: 'no-store'` for any data tied to a user session          |
| Ignoring CDN behavior with RSC payloads at scale                              | RSC `_rsc` requests bypass CDN if not configured; test under load    |

## Checklist

- [ ] Every mutation (Server Action) calls `revalidatePath` or `revalidateTag`
- [ ] No `fetch('/api/...')` from Server Components (call functions directly)
- [ ] GET Route Handlers explicitly set caching behavior if dynamic data expected
- [ ] User-specific fetches use `cache: 'no-store'` or access `cookies()`/`headers()`
- [ ] Shared data fetches wrapped in `React.cache()` for request deduplication
- [ ] `.next` cleared after caching config changes during development
- [ ] CDN behavior tested under realistic load for RSC navigation payloads

## References

- [GitHub: Deep Dive Caching & Revalidating Discussion #54075](https://github.com/vercel/next.js/discussions/54075) -- Vercel team's caching explainer
- [Vercel: Common App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) -- Route Handler caching, revalidation
- [GitHub: RSC + CDN Cache Discussion #59167](https://github.com/vercel/next.js/discussions/59167) -- High-load CDN concerns
- [Next.js Docs: Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching) -- Official caching reference
- [Vercel: React Best Practices (40+ Rules)](https://vercel.com/blog/introducing-react-best-practices) -- Performance-ordered rule set

## Related

- [Server Components](./server-components.md) -- Server vs Client component decisions
- [Server Actions Security](../security/server-actions-security.md) -- Securing mutations

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
