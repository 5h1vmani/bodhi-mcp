---
domain: security
topic: multi-tenant-isolation
tags: [multi-tenant, saas, isolation, white-label]
complexity: advanced
last_updated: 2026-02-10
---

# Multi-Tenant Isolation

> Decision framework for preventing cross-tenant data leakage in SaaS platforms through database, authentication, and cache isolation strategies, with attack pattern defense.

## TL;DR

- **Database-level isolation is non-negotiable** -- every query must include `tenant_id`; use Row-Level Security (RLS) as defense-in-depth, not replacement
- **Never trust tenant ID from client** -- derive from authenticated session/subdomain; client-supplied tenant IDs enable tenant impersonation
- **Cache keys must be tenant-scoped** -- shared cache without tenant prefix leaks data across tenants; affects Redis, CDN, application caches
- **Authentication isolation failures are critical** -- bugs in auth expose trust boundaries; tenant context must be set before any data access
- **Three isolation models** -- silo (dedicated infra), pool (shared with logical separation), bridge (hybrid); choice depends on compliance and cost

## Decision Guide

| Scenario | Approach | Why |
| --- | --- | --- |
| Building new multi-tenant SaaS | Pool model with RLS + tenant_id in all queries | Most cost-efficient at scale; RLS provides safety net |
| High-compliance tenant (HIPAA, finance) | Silo model (dedicated DB/infra per tenant) | Regulatory requirements often mandate physical isolation |
| Scaling from single to multi-tenant | Bridge model (new tenants pooled, legacy siloed) | Gradual migration; don't force big-bang refactor |
| Caching tenant data (Redis, CDN) | Prefix all keys with `tenant_{id}:` pattern | Prevents cache poisoning across tenants |
| Resolving tenant context | Derive from subdomain (`tenant.app.com`) or JWT claim | Never from request header/body; client can forge |
| Sequential resource IDs | Use UUIDs for all tenant-scoped resources | Sequential IDs enable enumeration attacks |
| Shared application cache | Separate cache instance per tenant OR namespaced keys | Cache invalidation bugs become cross-tenant attacks |
| Rate limiting API endpoints | Per-tenant quotas, not global | Prevents noisy neighbor; ensures fairness |
| Multi-tenant analytics dashboard | Tenant filter enforced at database view layer | Application logic alone is insufficient |
| Free tier + paid tier tenants | Pool free (strict quotas), silo paid (dedicated) | Cost optimization while meeting SLA needs |

## Tenant Isolation Attack Patterns

### Attack #1: Cross-Tenant Data Leakage

**How it happens:**
- Missing `tenant_id` in WHERE clause
- Bugs in ORM query builders
- Direct SQL queries bypass application logic

**Example vulnerable code:**
```typescript
// ❌ VULNERABLE
const getExams = (examId: string) => {
  return db.query('SELECT * FROM exams WHERE id = ?', [examId]);
  // Missing tenant_id check!
}
```

**Defense:**
```typescript
// ✅ SECURE: Application layer
const getExams = (examId: string, tenantId: string) => {
  return db.query(
    'SELECT * FROM exams WHERE id = ? AND tenant_id = ?',
    [examId, tenantId]
  );
}

// ✅ DEFENSE-IN-DEPTH: Database RLS (PostgreSQL)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON exams
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

// Set tenant context per connection
await db.query("SET app.tenant_id = $1", [tenantId]);
```

### Attack #2: Tenant Impersonation

**How it happens:**
- Trusting `tenantId` from request headers/cookies
- Guessable tenant identifiers (sequential integers)
- URL parameter manipulation

**Defense:**
```typescript
// ❌ NEVER trust client input
const tenantId = req.headers['x-tenant-id']; // VULNERABLE
const tenantId = req.body.tenantId; // VULNERABLE

// ✅ Derive from authenticated context
const tenantId = await getTenantFromSubdomain(req.hostname);
// OR from verified JWT claim
const tenantId = req.user.tenantId; // After auth middleware

// ✅ Use UUIDs, not sequential IDs
// Instead of: tenant_1, tenant_2
// Use: f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### Attack #3: Shared Cache Poisoning

**How it happens:**
- Cache keys without tenant prefix
- CDN caching across tenants
- Application-level caching bugs

**Defense:**
```typescript
// ❌ VULNERABLE
const cacheKey = `exam_${examId}`;
const data = await redis.get(cacheKey); // Returns ANY tenant's data!

// ✅ SECURE: Tenant-prefixed keys
const cacheKey = `tenant_${tenantId}:exam_${examId}`;
const data = await redis.get(cacheKey);

// ✅ CDN configuration
// Set Vary: X-Tenant-ID header
// OR configure CDN cache key to include tenant identifier
```

### Attack #4: Authentication System Isolation Failure

**Critical insight from research:**
> "Authentication is the entry point to everything else. While isolation bugs in application logic might expose data, in authentication, isolation bugs expose trust."

**Defense:**
- Establish tenant context BEFORE any data access
- Validate tenant membership in auth middleware
- Session tokens must include verified tenant claim
- SSO/OAuth must map user → tenant before issuing session

```typescript
// ✅ Auth middleware pattern
const authMiddleware = async (req, res, next) => {
  // 1. Verify token
  const user = await verifyToken(req.headers.authorization);

  // 2. Resolve tenant (from subdomain or claim)
  const tenant = await resolveTenant(req.hostname);

  // 3. Verify user belongs to this tenant
  if (user.tenantId !== tenant.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 4. Set tenant context
  req.tenantId = tenant.id;
  await db.query("SET app.tenant_id = $1", [tenant.id]);

  next();
};
```

## Isolation Models: Silo vs Pool vs Bridge

| Model | Architecture | Cost | Isolation | Use Case |
| --- | --- | --- | --- | --- |
| **Silo** | Dedicated DB/infra per tenant | High (linear scaling) | Complete (physical) | HIPAA, financial services, enterprise contracts |
| **Pool** | Shared DB with logical separation (tenant_id) | Low (economies of scale) | Logical (app + RLS) | SaaS startups, SMB customers, free tiers |
| **Bridge** | Mix: some tenants siloed, others pooled | Medium | Hybrid | Migrating single → multi-tenant; tiered SLAs |

**Decision criteria:**

| Factor | Silo | Pool | Bridge |
| --- | --- | --- | --- |
| Compliance requirements (HIPAA, SOC2 Type II) | Required | Acceptable with strong controls | Silo for regulated tenants |
| Cost sensitivity | Prohibitive at scale | Optimal | Balanced |
| Customer size | Enterprise (willing to pay) | SMB / free tier | Mixed |
| Performance isolation needs | Guaranteed | Shared (noisy neighbor risk) | Tiered SLAs |
| Operational complexity | High (N databases to manage) | Low (single schema) | Medium |

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Missing `tenant_id` in database queries | Code review checklist; ORM hooks to auto-inject; RLS as safety net |
| Trusting client-supplied tenant identifier | Derive from authenticated session or subdomain; never from headers/body |
| Shared cache keys without tenant namespace | Prefix all keys: `tenant_{id}:resource_{id}`; enforce via wrapper functions |
| No Row-Level Security despite pooled model | Enable RLS on all tenant-scoped tables; set session context per request |
| Sequential/guessable tenant or resource IDs | Use UUIDs; prevents enumeration attacks |
| Tenant context set after data access begins | Auth middleware must set `tenant_id` BEFORE any queries |
| Same rate limits for all tenants | Per-tenant quotas prevent noisy neighbor and ensure fairness |
| No monitoring for cross-tenant access attempts | Log all authorization failures; alert on anomalous patterns |
| Single failure in app logic exposes all tenants | Defense-in-depth: app logic + RLS + network isolation |
| No tenant validation in background jobs | Workers must resolve and validate tenant context from job payload |

## Checklist

- [ ] Every database query includes `tenant_id` in WHERE clause (or RLS enforces it)
- [ ] Row-Level Security (RLS) enabled on all multi-tenant tables
- [ ] Tenant context derived from authenticated session/subdomain, never client input
- [ ] All cache keys prefixed with tenant identifier (Redis, CDN, app cache)
- [ ] Resource IDs are UUIDs, not sequential integers
- [ ] Rate limiting implemented per-tenant, not globally
- [ ] Authorization failures logged with tenant context for monitoring
- [ ] Auth middleware establishes tenant context before data access
- [ ] Background jobs/workers validate tenant context from job payload
- [ ] CDN cache key includes tenant identifier (or Vary header set)
- [ ] Tenant membership verified during SSO/OAuth flows
- [ ] ORM/query builder hooks auto-inject `tenant_id` (if feasible)
- [ ] Database connection pools isolated per tenant (for silo model)
- [ ] Monitoring alerts configured for cross-tenant access attempts

## Database Isolation Strategies

### Row-Level Security (PostgreSQL)

**Advantages:**
- Enforced at database layer (survives app bugs)
- Works with any query tool/ORM
- Transparent to application code

**Implementation:**
```sql
-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Policy: only return rows matching session tenant_id
CREATE POLICY tenant_isolation ON exams
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

-- Set tenant context per request
SET app.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
```

**Tradeoff:**
- Adds query planning overhead (~5-10%)
- Requires session variable management
- Doesn't replace application logic (use both)

### Schema-Based Isolation (PostgreSQL)

**Advantages:**
- Complete separation (logical partitioning)
- Easier to silo individual tenants later
- Clearer audit boundaries

**Implementation:**
```sql
-- Create schema per tenant
CREATE SCHEMA tenant_apollo;
CREATE SCHEMA tenant_mypinaka;

-- Tenant tables
CREATE TABLE tenant_apollo.exams (...);
CREATE TABLE tenant_mypinaka.exams (...);

-- Set search path per request
SET search_path = tenant_apollo;
```

**Tradeoff:**
- Schema limit (PostgreSQL: ~250K schemas practical)
- Cross-tenant analytics harder (UNION ALL across schemas)
- Migration scripts must run per schema

### Database-Per-Tenant (Silo)

**When required:**
- Compliance mandates (HIPAA, PCI-DSS)
- Customer data residency (GDPR)
- Performance isolation SLAs

**Tradeoff:**
- Connection pool per tenant (resource intensive)
- Migration complexity (N databases to update)
- Backup/restore overhead
- Cost: linear with tenant count

## References

- [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html) -- Authoritative isolation patterns
- [AWS Multi-Tenant SaaS Security](https://aws.amazon.com/blogs/security/security-practices-in-aws-multi-tenant-saas-environments/) -- Cloud architecture patterns
- [Architecting Secure Multi-Tenant Data Isolation](https://medium.com/@justhamade/architecting-secure-multi-tenant-data-isolation-d8f36cb0d25e) -- Design tradeoffs
- [Tenant Isolation in Multi-Tenant Systems](https://securityboulevard.com/2025/12/tenant-isolation-in-multi-tenant-systems-architecture-identity-and-security/) -- Authentication boundaries
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) -- Official RLS documentation

## Related

- [Multi-Tenant CORS & CSP](./multi-tenant-cors-csp.md) -- Origin validation and CSP for tenant subdomains
- [Webapp Security](./webapp-security.md) -- OWASP 2025 Top 10 defenses
- [Dev/Prod Separation](./dev-prod-separation.md) -- Environment isolation for secrets and infrastructure

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-02-10 | Initial version |
