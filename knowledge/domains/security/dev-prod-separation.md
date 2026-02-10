---
domain: security
topic: dev-prod-separation
tags: [secrets, environment, infrastructure, devops]
complexity: intermediate
last_updated: 2026-02-10
---

# Dev/Prod Environment Separation

> Decision framework for isolating development, staging, and production environments to prevent credential reuse attacks, data leakage, and configuration drift.

## TL;DR

- **Separate secrets per environment** -- credential reuse is the #1 lateral movement attack; compromised dev keys should never grant prod access
- **Network-level isolation** -- dev/staging in separate VPCs; firewall rules prevent dev → prod connections; minimize blast radius
- **Never use production data in non-prod** -- anonymize/synthetic data for dev/staging; GDPR/DPDP violations + security risk
- **Environment-specific configurations are intentional, not accidental** -- dev needs `DEBUG=true` + localhost CORS; prod needs `DEBUG=false` + strict CSP; use config files, not comments
- **Remove dev secrets before production deployment** -- scan commits for leaked keys (GitGuardian, TruffleHog); use .env.local (gitignored) for local development

## Decision Guide

| Scenario | Approach | Why |
| --- | --- | --- |
| Managing API keys/secrets | Separate credentials per environment; use secrets manager (Vault, AWS Secrets Manager, Vercel Env Vars) | Compromised dev key shouldn't grant prod access; lateral movement prevention |
| Database access | Separate databases; dev/staging in isolated networks; prod in private subnet | Data leakage prevention; compliance (GDPR, DPDP) |
| Payment gateway integration | Test mode keys in dev/staging; live keys only in prod | Accidental charges prevention; PCI-DSS compliance |
| CORS allowed origins | `localhost:*` in dev only; specific tenant patterns in prod | Dev convenience vs prod security; never mix |
| CSP policies | `unsafe-eval` + `ws://localhost:*` in dev; nonce + `strict-dynamic` in prod | HMR/hot reload needs eval; XSS prevention in prod |
| Logging verbosity | `DEBUG` level in dev; `INFO`/`WARN` in prod; structured JSON in prod | Debug locally; performance + security in prod (avoid leaking sensitive data) |
| Secret rotation frequency | Monthly in dev/staging; quarterly in prod (or on developer departure) | Balance security vs operational overhead |
| Production access | Developers have NO prod secret access; only ops/SRE team | Least privilege; accidental changes prevention |
| Staging environment purpose | Integration testing + pre-prod validation | NOT a second dev environment; treat with prod-like security |
| DNS/subdomain patterns | `*.dev.myapp.com`, `*.staging.myapp.com`, `*.myapp.com` (separate) | Prevents staging origins being valid in prod CORS |
| Third-party service accounts | Separate accounts (Stripe test/live, SendGrid dev/prod) | Quota isolation; accidental user messaging prevention |
| Feature flags | Enable experimental features in dev/staging only | Test safely before prod rollout |

## Credential Reuse Attack Vector

**From OWASP Secrets Management Cheat Sheet:**
> "By duplicating credentials across environments, attackers exploiting an exposed development credential may find that the compromised secret gives access to staging. If there is excessive duplication, they can even jump laterally to production environments."

**Real-world scenario:**
1. Developer commits `.env` with `DATABASE_URL` to GitHub
2. Attacker finds exposed credentials (Git scraping, public repos)
3. Developer used SAME password for dev and prod databases (different hosts)
4. Attacker accesses production data using dev credentials

**Defense:**
```bash
# ❌ NEVER reuse credentials
# .env (dev)
DATABASE_PASSWORD=MyPassword123
API_KEY=sk_abc123

# .env.production
DATABASE_PASSWORD=MyPassword123  # SAME PASSWORD - VULNERABLE!

# ✅ CORRECT: Unique per environment
# .env.development (gitignored)
DATABASE_PASSWORD=dev_random_xyz789
API_KEY=sk_test_abc123

# .env.production (in secrets manager, not Git)
DATABASE_PASSWORD=prod_random_secure_abc456def
API_KEY=sk_live_xyz789
```

## Environment Configuration Patterns

### Secrets Management

| Environment | Storage | Access | Rotation |
| --- | --- | --- | --- |
| **Development** | `.env.local` (gitignored) + team secrets manager | All developers | Monthly or on leak |
| **Staging** | Secrets manager (AWS Secrets Manager, Vault) | CI/CD pipeline + QA team | Monthly |
| **Production** | Secrets manager with audit logging | CI/CD pipeline + ops team ONLY | Quarterly + on developer departure |

**Critical rules:**
- NEVER commit secrets to Git (use `.gitignore` for `.env*` files)
- Use separate secrets manager instances for prod vs non-prod
- Audit logs for all production secret access
- Immediate rotation on developer offboarding

### Network Isolation

| Component | Development | Staging | Production |
| --- | --- | --- | --- |
| **VPC/Network** | Shared dev VPC | Staging VPC | Production VPC (private subnets) |
| **Database** | Public endpoint (IP-restricted) | Private subnet | Private subnet + bastion host only |
| **Firewall rules** | Allow dev → staging (testing) | Deny dev → prod | Deny all non-prod → prod |
| **API Gateway** | Public | Public (throttled) | Public + WAF + DDoS protection |
| **Monitoring** | Optional | Required | Required + alerting |

**Blast radius minimization:**
- Dev environment compromise should NOT provide network path to prod
- Staging compromise should NOT grant prod access
- Use separate AWS accounts / cloud projects per environment (ultimate isolation)

### Data Isolation

**From Cloud Security Alliance:**
> "Segregation helps minimize the blast radius and potential impact should a data breach occur. An attacker gaining access to a development environment should not be able to use those access rights to compromise production systems."

| Data Type | Development | Staging | Production |
| --- | --- | --- | --- |
| **User data** | Anonymized or synthetic | Anonymized (production snapshot with PII removed) | Real user data |
| **Payment info** | Test card numbers only | Test mode API | Live payment data |
| **PII (names, emails)** | Faker.js generated | Anonymized | Real (encrypted at rest) |
| **Analytics data** | Subset or synthetic | Recent production snapshot (anonymized) | Full dataset |

**Legal compliance:**
- GDPR: production user data in dev/staging is a violation
- DPDP Act (India): children's data NEVER in non-prod
- COPPA: same restrictions as DPDP

**Anonymization techniques:**
```sql
-- Create staging database from prod snapshot
-- 1. Dump production data
pg_dump -U prod_user prod_db > prod_dump.sql

-- 2. Anonymize PII
UPDATE users SET
  email = 'user' || id || '@example.com',
  name = 'Test User ' || id,
  phone = NULL,
  address = NULL;

UPDATE students SET
  parent_email = 'parent' || id || '@example.com',
  parent_phone = NULL;

-- 3. Restore to staging
psql -U staging_user staging_db < anonymized_dump.sql
```

## Environment-Specific Configurations

### Development

**Purpose:** Fast iteration, debugging, local testing

**Configuration:**
```bash
# .env.development
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Allow localhost
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CSP_SCRIPT_SRC='self' 'unsafe-eval' 'unsafe-inline'
CSP_CONNECT_SRC='self' ws://localhost:* http://localhost:*

# Test mode services
DATABASE_URL=postgres://localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379
STRIPE_KEY=sk_test_abc123
SENDGRID_KEY=SG.dev_key_xyz

# No caching for HMR
CACHE_ENABLED=false
```

**Tradeoffs:**
- `unsafe-eval`: Required for HMR; XSS vector if in prod
- `DEBUG=true`: Exposes stack traces; never in prod
- No rate limiting: Fast testing; DoS risk in prod

### Staging

**Purpose:** Pre-production validation, integration testing, client demos

**Configuration:**
```bash
# .env.staging
NODE_ENV=production  # Use prod build settings!
DEBUG=false
LOG_LEVEL=info

# Staging-specific origins
CORS_ORIGINS=https://*.staging.myapp.com
CSP_SCRIPT_SRC='self' 'nonce-{random}'
CSP_CONNECT_SRC='self' https://api.staging.myapp.com

# Separate staging infrastructure
DATABASE_URL=postgres://staging-db.internal:5432/myapp_staging
REDIS_URL=redis://staging-cache.internal:6379
STRIPE_KEY=sk_test_staging_xyz  # Still test mode!
SENDGRID_KEY=SG.staging_key_abc

# Caching enabled (test prod behavior)
CACHE_ENABLED=true
CACHE_TTL=60
```

**Critical:** Treat staging with prod-like security
- From Doppler research: "Staging environments rarely receive the same level of attention when it comes to secrets management."
- Staging is the backdoor to prod if not secured

### Production

**Purpose:** Serve real users, real data, real money

**Configuration:**
```bash
# .env.production (stored in secrets manager, NOT Git)
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn

# Strict security
CORS_ORIGINS=https://*.myapp.com,{custom_domains_from_db}
CSP_SCRIPT_SRC='self' 'nonce-{random}' 'strict-dynamic'
CSP_CONNECT_SRC='self' https://api.myapp.com

# Production infrastructure
DATABASE_URL=postgres://prod-db-replica.internal:5432/myapp_prod
REDIS_URL=redis://prod-cache-cluster.internal:6379
STRIPE_KEY=sk_live_prod_xyz  # LIVE MODE
SENDGRID_KEY=SG.prod_key_abc

# Optimized caching
CACHE_ENABLED=true
CACHE_TTL=3600

# Monitoring
SENTRY_DSN=https://...ingest.sentry.io/...
DATADOG_API_KEY=...
```

## Wildcard DNS and Environment Separation

**Security risk:** Wildcard DNS (`*.myapp.com`) in production + dangling records

**Defense:**
```bash
# ❌ RISKY: Single wildcard pattern for all environments
*.myapp.com → load-balancer.vercel.app

# ✅ SECURE: Separate patterns per environment
*.dev.myapp.com → dev-load-balancer.vercel.app
*.staging.myapp.com → staging-load-balancer.vercel.app
*.myapp.com → prod-load-balancer.vercel.app

# Maintain DNS inventory
# Before deprovisioning tenant/service:
# 1. Remove DNS record FIRST
# 2. Then delete cloud resource
# Prevents subdomain takeover
```

**Related:** See [Multi-Tenant CORS & CSP](./multi-tenant-cors-csp.md) for subdomain takeover prevention

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Reusing same API key across dev/staging/prod | Generate unique credentials per environment; use separate service accounts |
| Developers have production secret access | Restrict prod secrets to ops team + CI/CD; developers use dev/staging only |
| Using production data in dev/staging | Anonymize or use synthetic data; GDPR/DPDP compliance + security |
| Hard-coded secrets in source code | Use environment variables + secrets manager; scan commits with GitGuardian |
| `.env` file committed to Git | Add `.env*` to `.gitignore`; use `.env.example` with dummy values |
| No network isolation between environments | Separate VPCs; firewall rules prevent dev → prod connections |
| Same database password for dev and prod (different hosts) | Unique passwords per environment; credential reuse enables lateral movement |
| Treating staging like "second dev" with lax security | Staging uses prod-like security; it's the last gate before prod |
| `DEBUG=true` in production | `DEBUG=false`; exposes stack traces and internal state |
| Mixing localhost CORS patterns into prod config | Environment-specific config files; never merge dev/prod origins |
| No secret rotation policy | Quarterly rotation for prod; immediate on developer departure |
| Manual secret management (spreadsheets, Slack) | Use secrets manager (Vault, AWS Secrets Manager, Doppler) |
| CDN/WAF same config for staging and prod | Separate configs; staging can be more permissive for testing |
| No monitoring of secret access | Audit logs for prod secret retrieval; alert on anomalous access |

## Checklist

- [ ] Separate credentials for dev, staging, and production (no reuse)
- [ ] Production secrets stored in secrets manager (Vault, AWS Secrets Manager)
- [ ] `.env*` files in `.gitignore`; never committed to Git
- [ ] Developers have NO access to production secrets
- [ ] Database passwords are unique per environment
- [ ] Payment gateway uses test mode in dev/staging, live mode only in prod
- [ ] CORS origins are environment-specific (`localhost` only in dev)
- [ ] CSP policies differ by environment (no `unsafe-eval` in prod)
- [ ] Production data never used in dev/staging (anonymized or synthetic)
- [ ] Network isolation: separate VPCs or cloud accounts per environment
- [ ] Firewall rules prevent dev/staging → prod connections
- [ ] Secret rotation policy in place (quarterly for prod, monthly for dev)
- [ ] Immediate secret rotation on developer offboarding
- [ ] Audit logging enabled for production secret access
- [ ] Staging environment secured with prod-like controls
- [ ] DNS patterns separated per environment (no wildcard reuse)
- [ ] CI/CD pipeline scans for leaked secrets (GitGuardian, TruffleHog)
- [ ] Third-party services use separate accounts per environment
- [ ] `DEBUG=false` in production; structured logging with sanitization

## References

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) -- Authoritative secrets handling guidance
- [Doppler: Securing Staging Environments](https://www.doppler.com/blog/securing-staging-environments-secrets-management) -- Staging as backdoor to prod
- [Cloud Security Alliance: Segregating Environments](https://cloudsecurityalliance.org/blog/2024/01/23/six-tips-for-segregating-and-securing-your-dev-testing-and-production-environments) -- Network isolation strategies
- [Microsoft: Secrets Management Engineering Playbook](https://microsoft.github.io/code-with-engineering-playbook/CI-CD/dev-sec-ops/secrets-management/) -- Enterprise-grade patterns
- [Security Boulevard: Secrets in Staging](https://securityboulevard.com/2025/09/best-practices-for-securing-secrets-in-staging-environments/) -- Blast radius minimization

## Related

- [Multi-Tenant Isolation](./multi-tenant-isolation.md) -- Tenant-level separation strategies
- [Multi-Tenant CORS & CSP](./multi-tenant-cors-csp.md) -- Environment-specific CORS/CSP patterns
- [Webapp Security](./webapp-security.md) -- OWASP 2025 Top 10, DevSecOps integration

---

## Changelog

| Date | Change |
| --- | --- |
| 2026-02-10 | Initial version |
