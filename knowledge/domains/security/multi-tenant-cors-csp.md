---
domain: security
topic: multi-tenant-cors-csp
tags: [cors, csp, multi-tenant, white-label]
complexity: advanced
last_updated: 2026-02-10
---

# Multi-Tenant CORS & CSP

> Decision framework for CORS origin validation and CSP policies when tenants use subdomains (`tenant.mycompany.com`) or custom domains (`app.clientbrand.com`), with environment-specific strategies.

## TL;DR

- **CORS spec forbids `*.mycompany.com`** in `Access-Control-Allow-Origin` -- dynamically validate origin against regex + database, echo back the exact match, always set `Vary: Origin`
- **Validate subdomain exists in DB, not just regex** -- dangling DNS records enable subdomain takeover; regex-only validation is a CORS bypass vector
- **CSP `frame-ancestors` must be per-tenant** -- white-label tenants embedding your app need their domains in the policy; store in tenant config, build CSP dynamically
- **Dev/prod CSP diverge intentionally** -- dev needs `unsafe-eval` (HMR), `ws://localhost:*` (WebSocket); prod needs nonce + `strict-dynamic`; use environment config, not comments

## Decision Guide

| Scenario | Approach | Why |
| --- | --- | --- |
| Tenants on subdomains (`tenant.mycompany.com`) | Regex `^https:\/\/([a-z0-9-]+)\.mycompany\.com$` + DB lookup to confirm tenant exists | Regex alone allows subdomain takeover bypass; DB check confirms active tenant |
| Tenants with custom domains (`app.clientbrand.com`) | DB/Redis lookup of `Origin` header hostname against tenant `customDomains` field | No regex pattern possible; must be data-driven; cache in Redis (TTL 1h) |
| White-label tenant embeds your app in iframe | Dynamic `frame-ancestors 'self' {tenant.allowedEmbedDomains}` in CSP per request | Static `frame-ancestors 'none'` blocks legitimate embedding; static `*` allows clickjacking |
| Local development CORS | Separate origin pattern list: `/^http:\/\/localhost:\d+$/` | Never mix dev patterns into prod config; use environment-keyed config object |
| Local development CSP | Allow `'unsafe-eval'` + `ws://localhost:*` in dev only | Webpack/Vite HMR requires eval and WebSocket; strip in prod build |
| Staging environment | Staging subdomain pattern: `/^https:\/\/([a-z0-9-]+)\.staging\.mycompany\.com$/` | Separate pattern prevents staging origins from being valid in prod |
| CORS with credentials (cookies/auth) | Echo validated origin exactly + `credentials: true`; never `*` | Spec forbids `*` with credentials; dynamic echo is the only option |
| Preflight caching for tenant APIs | `Access-Control-Max-Age: 86400` (24h) for stable policies; `3600` (1h) if policies change | Reduces preflight overhead; shorter cache for dynamic tenant configs |
| New tenant onboarded | Invalidate Redis CORS cache for that origin; no restart needed | DB-driven validation + cache invalidation = zero-downtime onboarding |

## Origin Validation Security

Regex patterns for subdomain CORS are the #1 source of CORS bypass vulnerabilities. Every pattern must be tested against these attack vectors:

| Attack Vector | Vulnerable Pattern | Secure Pattern |
| --- | --- | --- |
| Suffix match (`evil-mycompany.com`) | `/mycompany\.com$/` | `/^https:\/\/([a-z0-9-]+)\.mycompany\.com$/` |
| Subdomain of attacker (`mycompany.com.evil.com`) | `/.*\.mycompany\.com/` | Anchored regex with `^` and `$` |
| `.includes()` bypass | `origin.includes('mycompany.com')` | Use `RegExp.test()` or `URL` parser |
| Null origin (sandboxed iframe) | `if (!origin) allow` | Reject `null` origin; only skip for non-browser clients if needed |
| Port injection (`mycompany.com:8080`) | No port validation | Parse with `new URL(origin)` and validate port |
| Protocol downgrade (`http://` in prod) | No protocol check | Enforce `https://` in prod regex |

### Subdomain Takeover Prevention

Regex-only CORS validation is insufficient. If `old-feature.mycompany.com` has a dangling DNS CNAME pointing to a deleted S3 bucket or Heroku app, an attacker can claim that subdomain and bypass CORS.

**How subdomain takeover works:**

1. You create DNS record: `demo.mycompany.com` → CNAME → `demo-instance.vercel.app`
2. You decommission the Vercel instance but **forget to remove DNS record**
3. Attacker claims `demo-instance.vercel.app` on Vercel
4. Attacker now controls `demo.mycompany.com` - can phish users, steal sessions!

**Impact:**
- CORS bypass (attacker subdomain passes your regex validation)
- Session/cookie theft (if cookies set to `.mycompany.com`)
- Phishing attacks impersonating legitimate service
- Brand damage and trust erosion

| Defense | Implementation |
| --- | --- |
| Validate against active tenants | DB/Redis lookup after regex match; reject unknown subdomains |
| Proper decommissioning order | Remove DNS records FIRST, then delete cloud resources |
| Audit DNS records monthly | Remove CNAMEs before deleting cloud resources; maintain DNS inventory |
| Monitor for dangling records | `dig` or DNS monitoring tools for NXDOMAIN targets; alert on dangling CNAMEs |
| Reserved subdomain list | Block `www`, `api`, `admin`, `mail`, `staging` from tenant registration |
| Domain verification | Require ownership proof before custom domains can be added (Microsoft/Azure pattern) |
| Avoid wildcard DNS | Replace `*.mycompany.com` with explicit subdomain entries where possible |

### Wildcard DNS Security

**Risk of wildcard records (`*.mycompany.com`):**
- Allows ANY subdomain to resolve (including attacker-controlled)
- Expands attack surface for subdomain takeover
- Makes DNS auditing harder (can't enumerate all subdomains)

**From security research:**
> "Misconfigured wildcard DNS records can be exploited for phishing attacks or subdomain takeover vulnerabilities, with attackers able to create arbitrary subdomains potentially leading to impersonation of legitimate services."

**Mitigation strategies:**

```bash
# ❌ RISKY: Single wildcard for production
*.mycompany.com → load-balancer.vercel.app
# Attacker can takeover ANY unused subdomain

# ✅ BETTER: Explicit tenant subdomains
apollo.mycompany.com → apollo-prod.vercel.app
neet.mycompany.com → neet-prod.vercel.app
commerce.mycompany.com → commerce-prod.vercel.app
# Maintain inventory; remove DNS when tenant deprovisioned

# ✅ BEST: Environment-specific patterns
*.dev.mycompany.com → dev-balancer.vercel.app
*.staging.mycompany.com → staging-balancer.vercel.app
# Production uses explicit entries only (no wildcard)
```

**If wildcard DNS is unavoidable:**
- Validate subdomain against database of active tenants (not just regex)
- Monitor for NXDOMAIN responses (dangling records)
- Implement automated DNS auditing (weekly scans)
- Use short TTL (300s) to enable faster response to takeover
- Set up alerting for new CNAME additions

## Environment Configuration Pattern

```
Environment     CORS Origins                         CSP script-src                              CSP connect-src
-----------     ------------------------------------ ------------------------------------------- ---------------------------------
development     /^http://localhost:\d+$/              'self' 'unsafe-eval' 'unsafe-inline'        'self' ws://localhost:* http://localhost:*
                /^http://127.0.0.1:\d+$/
staging         /^https://[a-z0-9-]+\.staging\.X$/   'self' 'nonce-{n}' 'strict-dynamic'         'self' https://api.staging.X
production      /^https://[a-z0-9-]+\.X$/            'self' 'nonce-{n}' 'strict-dynamic'         'self' https://api.X
                + custom domain DB lookup
```

Key tradeoffs:

| Decision | Dev | Prod | Why they differ |
| --- | --- | --- | --- |
| `unsafe-eval` | Required | Forbidden | HMR/hot reload needs eval; XSS vector in prod |
| Nonce-based CSP | Skip (static pages work) | Required | Nonces force dynamic rendering; acceptable in prod, annoying in dev |
| Preflight max-age | 600s (10 min) | 86400s (24h) | Fast iteration in dev; reduced latency in prod |
| Origin validation | Pattern-only (no DB) | Pattern + DB + Redis cache | Speed in dev; security in prod |
| CSP report-only | Off | Start with report-only, then enforce | Catch violations before they break prod users |

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Reflecting `req.headers.origin` without validation + `credentials: true` | Always validate against allowlist/DB; this is the most exploited CORS misconfiguration |
| Using `.includes('mycompany.com')` or `.endsWith()` for origin check | Use anchored regex with `^https://` prefix and `$` suffix; parse with `URL` constructor |
| Regex-only subdomain validation without DB check | Add DB/Redis lookup to confirm tenant is active; prevents subdomain takeover bypass |
| Static `frame-ancestors 'none'` blocking legitimate tenant embedding | Store `allowedEmbedDomains` per tenant; build CSP dynamically per request |
| Same CORS/CSP config for dev and prod | Environment-keyed config; dev needs `unsafe-eval` + localhost; prod needs nonce + strict-dynamic |
| No `Vary: Origin` header when echoing dynamic origins | Always set `Vary: Origin`; CDNs and browsers cache responses per origin incorrectly without it |
| Caching CORS-validated responses at CDN without origin key | Configure CDN to include `Origin` in cache key; otherwise tenant A gets tenant B's CORS headers |
| Adding `unsafe-inline` to CSP as quick fix for React/CSS-in-JS | Use nonces for SSR; use hashes for SPA; `unsafe-inline` defeats CSP's XSS protection entirely |
| No Redis cache for custom domain CORS lookups | DB query per request at scale is expensive; cache with 1h TTL; invalidate on tenant domain change |

## Checklist

- [ ] Origin validation uses anchored regex (`^https://...$/`) not `.includes()` or `.endsWith()`
- [ ] Subdomain origins verified against active tenant records (DB/Redis), not regex alone
- [ ] Custom domain origins looked up from tenant database with Redis cache (TTL ~1h)
- [ ] `Vary: Origin` set on every response with dynamic `Access-Control-Allow-Origin`
- [ ] `frame-ancestors` built dynamically per tenant from stored `allowedEmbedDomains`
- [ ] Dev/staging/prod use separate CORS origin patterns (no localhost in prod config)
- [ ] Production CSP uses nonce + `strict-dynamic`; no `unsafe-eval` or `unsafe-inline`
- [ ] Dev CSP allows `unsafe-eval` and `ws://localhost:*` for HMR
- [ ] CDN cache key includes `Origin` header for CORS-sensitive endpoints
- [ ] Reserved subdomains (`www`, `api`, `admin`, `mail`) blocked from tenant registration
- [ ] DNS audit process exists to remove dangling CNAME records before resource deletion
- [ ] Wildcard DNS avoided where possible; production uses explicit subdomain entries
- [ ] If wildcard DNS used: automated monitoring for NXDOMAIN (dangling records)
- [ ] DNS decommissioning order: remove DNS record FIRST, then delete cloud resource
- [ ] CSP deployed in `report-only` mode first; violations monitored before enforcement
- [ ] Redis CORS cache invalidated when tenant custom domain is added/changed/removed

## References

Single-source topics that didn't pass the value test for their own playbook -- link instead of duplicate:

| Topic | Source | When to use |
| --- | --- | --- |
| CORS spec & headers | [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | Setting up CORS from scratch; header reference |
| CSP directives reference | [MDN CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy) | Looking up specific directive syntax |
| CSP nonce vs hash | [web.dev Strict CSP](https://web.dev/articles/strict-csp) | Choosing nonce-based vs hash-based CSP |
| Next.js CSP setup | [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) | Nonce middleware + App Router integration |
| Express CSP (Helmet) | [Helmet.js docs](https://helmetjs.github.io/) | Quick Express security headers setup |
| Actix-web CORS (Rust) | [actix-cors docs](https://docs.rs/actix-cors/latest/actix_cors/struct.Cors.html) | Rust CORS with `allowed_origin_fn` for dynamic validation |
| Axum CORS (Rust) | [tower-http CORS](https://docs.rs/tower-http/latest/tower_http/cors/index.html) | Rust CORS with tower middleware |
| CSP reporting | [MDN report-to](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to) | Setting up violation monitoring |
| CSP Evaluator | [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/) | Validating and scoring your CSP policy |
| CORS exploit patterns | [PortSwigger CORS](https://portswigger.net/web-security/cors) | Understanding CORS misconfiguration attacks |

## Related

- [Webapp Security](./webapp-security.md) -- OWASP 2025 Top 10, DevSecOps pipeline
- [Server Actions Security](./server-actions-security.md) -- Next.js-specific security patterns
- [India DPDP](./india-dpdp.md) -- Data protection affects cookie/consent CSP decisions
- [Multi-Platform Design Systems](../ux/multi-platform-design-systems.md) -- White-label token architecture

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-02-10 | Added wildcard DNS security section and subdomain takeover attack details |
| 2026-02-09 | Initial version |
