---
domain: security
topic: server-actions-security
tags: [next-js, server-actions, auth, defense-in-depth]
complexity: advanced
last_updated: 2026-01-29
---

# Server Actions Security

> Decision framework for securing Next.js Server Actions -- they're public endpoints, not private functions.

## TL;DR

- **Every Server Action is a public HTTP endpoint** -- even unexported ones are callable; authenticate and authorize every single one
- **Never rely solely on middleware for auth** -- CVE-2025-29927 proved middleware can be bypassed; verify at the data access layer
- **Defense-in-depth: 4 layers** -- middleware (edge), page-level, Server Action, Data Access Layer; auth must pass at each
- **Validate all inputs server-side with Zod** -- client validation is UX; server validation is security
- **Secrets in env vars at runtime, never hardcoded** -- Dec 2025 vulnerability can expose compiled source code of Server Functions

## Decision Guide

| Scenario                                 | Approach                                                       | Why                                                                             |
| ---------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Any Server Action with data mutation     | Authenticate + authorize inside the action body                | Actions are public endpoints; middleware alone is insufficient (CVE-2025-29927) |
| Form input handling                      | Validate with Zod/Valibot before processing                    | Client-side validation is bypassable; server must re-validate                   |
| Returning data to client                 | Use DTOs; strip internal fields                                | Full objects may expose internal IDs, timestamps, or relations                  |
| Multiple actions needing same auth logic | Use `next-safe-action` middleware pipeline                     | Centralizes auth/rate-limiting without repeating boilerplate                    |
| Accessing database from action           | Route through a Data Access Layer (DAL)                        | Centralizes auth checks; prevents direct DB access from action body             |
| Sensitive business logic                 | Keep in DAL, not in action body                                | Dec 2025 vuln can expose Server Function source code                            |
| Rate-limiting auth endpoints             | Implement at action level or via `next-safe-action`            | Prevents brute-force attacks on login/signup actions                            |
| Storing API keys and secrets             | Environment variables accessed at runtime only                 | Hardcoded secrets in source are exposed by source code disclosure vulns         |
| Error responses from actions             | Return generic errors; log detailed errors server-side         | Stack traces and internal details aid attackers                                 |
| CSRF protection                          | Rely on built-in (POST-only + Origin check) + SameSite cookies | Next.js handles this automatically; don't weaken by allowing GET mutations      |

## Defense-in-Depth Model

| Layer             | What to Check                              | How                                                        |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------- |
| Middleware (Edge) | Rate limiting, geoblocking, basic redirect | `middleware.ts` -- but never as sole auth gate             |
| Page / Layout     | Session existence for protected routes     | `cookies()` or auth library check in Server Component      |
| Server Action     | Full authentication + authorization        | Verify session, check user roles/permissions inside action |
| Data Access Layer | Row-level access control                   | DAL functions verify user can access specific resource     |

## Critical Vulnerabilities to Address

| CVE / Issue                       | Impact                                                        | Fix                                                                                      |
| --------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| CVE-2025-29927                    | Middleware auth bypass                                        | Upgrade to Next.js 15.2.3+ / 14.2.25+ / 13.5.9+; never rely on middleware alone for auth |
| Dec 2025 source code exposure     | Server Function source code returned via crafted HTTP request | Upgrade to latest patch; keep secrets in env vars, not source code                       |
| Dec 2025 DoS via Server Functions | Infinite loop from crafted deserialization request            | Upgrade to latest patch; monitor CPU usage on server                                     |

## Common Mistakes

| Mistake                                             | Fix                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| Auth check only in middleware, not in Server Action | Add auth verification inside every Server Action body                       |
| Returning full database objects to client           | Create DTOs that expose only needed fields                                  |
| Hardcoding API keys in Server Action files          | Use `process.env.SECRET_KEY` accessed at runtime                            |
| No input validation on Server Action params         | Add Zod schema validation as first line of every action                     |
| Trusting that unexported Server Actions are private | They still create public HTTP endpoints; authenticate regardless            |
| Logging full request bodies in production           | Redact sensitive fields; log only what's needed for debugging               |
| No rate limiting on auth-related actions            | Use `next-safe-action` or custom rate limiter                               |
| Using GET for state-changing operations             | Server Actions use POST only; don't create GET Route Handlers for mutations |

## Checklist

- [ ] Next.js version is 15.2.3+ / 14.2.25+ / 13.5.9+ / 12.3.5+ (CVE-2025-29927 patched)
- [ ] Every Server Action verifies authentication inside its body
- [ ] Every Server Action verifies authorization (user can do this specific operation)
- [ ] All Server Action inputs validated with Zod/Valibot before processing
- [ ] No full database objects returned to client (DTOs used)
- [ ] All secrets accessed via `process.env` at runtime (not hardcoded)
- [ ] Data Access Layer exists and contains all DB queries with access checks
- [ ] Rate limiting implemented on auth-related actions
- [ ] Error responses are generic (no stack traces, internal details)
- [ ] Middleware is NOT the sole authentication layer

## References

- [Next.js: Security with Server Components & Actions](https://nextjs.org/blog/security-nextjs-server-components-actions) -- Official security model
- [Next.js: Data Security Guide](https://nextjs.org/docs/app/guides/data-security) -- DAL and DTO patterns
- [Next.js: Security Update Dec 2025](https://nextjs.org/blog/security-update-2025-12-11) -- Source code exposure and DoS fixes
- [React: RSC Vulnerability Disclosure](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components) -- React team advisory
- [next-safe-action](https://next-safe-action.dev/) -- Type-safe Server Action middleware pipelines
- [TurboStarter: Complete Next.js Security Guide 2025](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices) -- Multi-layered security patterns

## Related

- [Server Components](../frontend/server-components.md) -- Server vs Client component decisions
- [Next.js Data Patterns](../frontend/nextjs-data-patterns.md) -- Caching and data fetching decisions

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
