---
domain: data
topic: multi-tenant-rls-schema-design
tags: [postgres, rls, multi-tenant, schema]
complexity: advanced
last_updated: 2026-06-25
confidence: 0.85
source_refs:
  - "PostgreSQL docs — Row Security Policies (postgresql.org/docs/current/ddl-rowsecurity.html)"
  - "AWS Prescriptive Guidance — RLS for SaaS on managed PostgreSQL"
  - "AWS RDS Proxy pinning docs; Bytebase RLS footguns; pgEdge session variables; Citus PgBouncer 1.20"

status: draft
review_by: 2026-12-31
author: ai
version: 1
---

# Multi-Tenant Schema Design (Postgres RLS)

> How to lay out a shared-database, pooled multi-tenant schema so a single missed `WHERE` can never cross tenants — and so PII, shared data, and history survive contact with a connection pooler.

## TL;DR

- **Connect as a dedicated non-owner role AND use `FORCE ROW LEVEL SECURITY`** — table owners, superusers, and `BYPASSRLS` roles silently skip every policy. `ENABLE` alone is not enough.
- **Set tenant with `SET LOCAL` inside a transaction** — a bare `SET` persists on a pooled connection and leaks the prior tenant's context to the next request. Silent, no error.
- **Make the policy fail closed** — `current_setting('app.tenant', true)::uuid` returns NULL when unset, and `tenant_id = NULL` matches zero rows. Default-deny on bugs.
- **Isolate PII into its own table** behind a pseudonymous id, a restricted role, and a dedicated key — so engine/reporting roles and logs never see it.
- **Cross-tenant shared rows (global content) need an explicit `scope` column + permissive policy** — never a tenant table with a null `tenant_id`; that makes it invisible, not shared.

## Decision Guide

| Scenario                                            | Approach                                                                                                       | Why                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| New tenant-owned table                              | `tenant_id uuid NOT NULL` + index + RLS policy + `FORCE ROW LEVEL SECURITY`; app connects as non-owner role    | Owner/superuser bypass `ENABLE`; the index keeps the filter cheap    |
| Setting tenant context on Lambda + pooler           | `BEGIN; SET LOCAL app.tenant = $1; ...; COMMIT;`                                                               | `SET LOCAL` auto-reverts on commit/rollback; bare `SET` leaks        |
| Tenant variable might be unset                      | `current_setting('app.tenant', true)::uuid` in the policy                                                      | `missing_ok=true` → NULL → zero rows = fail closed, not an error     |
| Globally shared reference data (content, taxonomy)  | Own table or a `scope` enum (`global`/`tenant`) + permissive policy `scope='global' OR tenant_id = app.tenant` | A null `tenant_id` under a restrictive policy is invisible to all    |
| Sensitive PII (name, DOB, phone, guardian contact)  | Separate `*_pii` table keyed by pseudonymous id; restricted role; column or key-level encryption               | Keeps PII out of the engine/reporting roles, logs, and analytics     |
| State that must be recomputable (mastery, balances) | Append-only event/attempt log + a projected state table                                                        | When the algorithm changes you replay history; projection is a cache |
| Idempotent mutations                                | `idempotency_keys(key, tenant_id, fingerprint, response, created_at)` with TTL                                 | Safe retries; a unique key turns a double-submit into a no-op        |
| Large tenant tables                                 | Index `tenant_id`; partition by `tenant_id` or time only once scans hurt                                       | Planner pushes the tenant predicate to an index/partition scan       |
| Any view over tenant tables                         | `WITH (security_invoker = true)` (PG15+)                                                                       | Default views run as owner and bypass RLS                            |

## Common Mistakes

| Mistake                                                       | Fix                                                                                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ENABLE ROW LEVEL SECURITY` only — owner still reads all rows | Add `FORCE ROW LEVEL SECURITY` and connect as a non-owner, non-`BYPASSRLS` role                                        |
| Bare `SET app.tenant` on a pooled connection                  | `SET LOCAL` inside an explicit transaction; never autocommit a session-scope SET                                       |
| `current_setting('app.tenant')` without `missing_ok`          | Use the 2-arg form `(…, true)`; an exception can be caught and retried context-free                                    |
| RDS Proxy used for multiplexing with per-request `SET`        | On PostgreSQL any `SET`/`set_config` pins the connection; use PgBouncer transaction mode or accept pinning and monitor |
| Materialized view built over a tenant table                   | The snapshot ignores RLS — filter/pseudonymize explicitly, or build it on derived data                                 |
| Global unique constraint on a tenant column                   | Scope uniqueness by `(tenant_id, …)`; a global unique leaks existence across tenants                                   |
| Shared content shoved into a tenant table with null tenant_id | Give it a `scope` column + permissive policy; a restrictive policy hides it from everyone                              |
| PII columns inline on the main row                            | Split into a `*_pii` table behind a restricted role; the hot path joins only when needed                               |

## Checklist

- [ ] App connects as a non-owner role without `BYPASSRLS`; `FORCE ROW LEVEL SECURITY` on every tenant table
- [ ] Every tenant table has `tenant_id` NOT NULL, indexed, with an RLS policy
- [ ] Tenant context set via `SET LOCAL` inside a transaction, never a bare `SET`
- [ ] Policies use `current_setting('app.tenant', true)` so an unset tenant returns zero rows
- [ ] PII isolated to a `*_pii` table behind a restricted role and a dedicated key
- [ ] Cross-tenant/global rows use a `scope` column + permissive policy, not a tenant table
- [ ] An append-only log backs any state that must be recomputable
- [ ] `idempotency_keys` backs every mutation
- [ ] Views use `security_invoker`; no materialized view exposes unfiltered tenant rows
- [ ] Uniqueness constraints scoped by `tenant_id`

## Guidance

### Tenant context (pooled connections)

**Do:**

```sql
BEGIN;
SET LOCAL app.tenant = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
-- queries here are RLS-scoped; context clears on COMMIT
COMMIT;
```

**Don't:**

```sql
SET app.tenant = '...';   -- persists on the pooled connection → leaks to the next request
```

**Policy (fail closed):**

```sql
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON attendance
  USING (tenant_id = current_setting('app.tenant', true)::uuid);
```

**Why:** `SET LOCAL` is transaction-scoped, so a recycled connection cannot carry one tenant's id into another's request. `FORCE` + a non-owner role means even a privileged connection is subject to the policy. The `missing_ok` form turns "forgot to set the tenant" into zero rows instead of all rows or a catchable error.

### Connection pooler note

On PostgreSQL, RDS Proxy pins the connection on any `SET`/`set_config`, losing multiplexing for that invocation. For short-lived Lambda invocations this is usually tolerable — watch `DatabaseConnectionsCurrentlySessionPinned`. If multiplexing matters, run PgBouncer in **transaction** mode (never statement mode) with `SET LOCAL`.

## References

- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — owner/superuser/BYPASSRLS bypass, FORCE semantics
- [AWS Prescriptive Guidance — RLS for SaaS on PostgreSQL](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-managed-postgresql/rls.html)
- [AWS RDS Proxy pinning](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy-pinning.html) — `SET` pins PostgreSQL connections
- [Bytebase — Postgres RLS footguns](https://www.bytebase.com/blog/postgres-row-level-security-footguns/)

## Related

- [Multi-Tenant Isolation](../security/multi-tenant-isolation.md) — auth, cache, and attack-pattern side of isolation
- [India DPDP](../security/india-dpdp.md) — why PII isolation, audit logs, and erasure are mandatory here
- [Backend](../backend/_index.md) — serverless cost and integration patterns

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-06-25 | Initial version |
