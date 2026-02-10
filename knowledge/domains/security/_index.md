# Security Domain

> Application security, authentication, and data protection.

## Quick Summary

This domain covers protecting your application and users: authentication, authorization, data security, and defending against common vulnerabilities.

## Files in This Domain

| File                            | When to Use                                                              | Complexity   |
| ------------------------------- | ------------------------------------------------------------------------ | ------------ |
| `serverless-aws-security.md`    | AWS Lambda/API Gateway security at 100K+ CCU scale                       | Advanced     |
| `webapp-security.md`            | OWASP 2025 Top 10 defenses, DevSecOps integration                        | Intermediate |
| `server-actions-security.md`    | Securing Next.js Server Actions, defense-in-depth                        | Advanced     |
| `multi-tenant-isolation.md`     | Cross-tenant data leakage prevention, database/cache/auth isolation      | Advanced     |
| `dev-prod-separation.md`        | Environment isolation, secrets management, credential reuse prevention   | Intermediate |
| `children-data-protection.md`   | COPPA/GDPR/DPDP compliance for educational platforms with minors         | Advanced     |
| `india-dpdp.md`                 | DPDP Act compliance, consent, children's data                            | Advanced     |
| `india-saas-legal.md`           | IT Rules, Consumer Protection, multi-tenant SaaS                         | Advanced     |
| `multi-tenant-cors-csp.md`      | CORS origin validation + CSP for tenant subdomains/custom domains        | Advanced     |
| `deception-detection.md`        | Honeypots, honeytokens, decoy data for breach detection in multi-tenant  | Advanced     |
| `moving-target-defense.md`      | Container rotation, key rotation, ephemeral infra to invalidate recon   | Advanced     |

## Key Principles

1. **Defense in depth** - Multiple layers of security
2. **Least privilege** - Minimum access needed
3. **Never trust input** - Validate and sanitize everything
4. **Fail securely** - Errors shouldn't expose information
5. **Keep secrets secret** - Never in code or logs

## When to Consult This Domain

- Implementing authentication/authorization
- Handling sensitive data
- Reviewing code for security issues
- Preparing for security audits
- Responding to vulnerabilities
- Securing Next.js Server Actions and mutations
- Implementing defense-in-depth for server-rendered apps
- Securing serverless AWS architectures (Lambda, API Gateway)
- DDoS protection and WAF configuration for high-traffic events
- OWASP 2025 Top 10 compliance and DevSecOps pipeline integration
- **Multi-tenant data isolation** (preventing cross-tenant leakage)
- **Tenant impersonation attacks** (validating tenant context)
- **Database-level isolation** (RLS, schema-based, silo vs pool)
- **Dev/prod environment separation** (secrets, networks, data)
- **Credential reuse attacks** (lateral movement prevention)
- **Wildcard DNS security** (subdomain takeover prevention)
- **Deception-based breach detection** (honeypots, honeytokens, decoy data)
- **Wildcard DNS honeypot strategies** (catch-all detection, subdomain enumeration)
- **Cross-tenant breach detection** (honeytoken mesh, per-tenant decoy records)
- **DNS canary tokens** for data leak source identification
- **Moving target defense** (container rotation, key rotation, ephemeral infrastructure)
- **Serverless as natural MTD** (cold starts, immutable deployments, credential rotation)
- **Credential rotation strategies** (JWT signing keys, API keys, DB credentials)
- **Children's data protection** (COPPA, GDPR Article 8, DPDP Act)
- **Parental consent mechanisms** for educational platforms
- Building products for Indian market (DPDP compliance)
- Handling data from users under 18 in India
- Setting up legal documents for SaaS platforms
- Multi-tenant platform compliance (DPA, MSA)
- Cookie consent and analytics compliance
- CORS for multi-tenant subdomain or custom domain platforms
- CSP frame-ancestors for white-label iframe embedding
- Dev vs prod CORS/CSP environment strategy
- Subdomain takeover prevention for wildcard DNS

## Related Domains

- `backend/` - API security implementation
- `architecture/` - Security architecture
- `devops/` - Infrastructure security

## India DPDP Quick Reference

| Requirement         | Standard                              |
| ------------------- | ------------------------------------- |
| Children's age      | Under 18 (stricter than GDPR/COPPA)   |
| Consent model       | Opt-in only; no "legitimate interest" |
| Breach notification | ALL breaches; 72-hour detailed report |
| Max penalty         | INR 250 crore (~$30M) per violation   |
| Language support    | 22 scheduled Indian languages         |

## India SaaS Legal Quick Reference

| Document          | Required By         | Minimum For              |
| ----------------- | ------------------- | ------------------------ |
| Privacy Policy    | DPDP Act            | All platforms            |
| Terms of Service  | IT Rules 2021       | All platforms            |
| Cookie Policy     | DPDP Act            | If using analytics       |
| Refund Policy     | Consumer Protection | If selling to consumers  |
| Grievance Contact | IT Rules + DPDP     | All platforms            |
| DPA               | DPDP Act            | Multi-tenant/white-label |
| MSA               | Contract Law        | B2B relationships        |

## Multi-Tenant Security Quick Reference

| Attack Vector                 | Defense                                               | Playbook                       |
| ----------------------------- | ----------------------------------------------------- | ------------------------------ |
| Cross-tenant data leakage     | `tenant_id` in all queries + RLS                      | `multi-tenant-isolation.md`    |
| Tenant impersonation          | Derive tenant from auth session, never client input   | `multi-tenant-isolation.md`    |
| Shared cache poisoning        | Prefix cache keys: `tenant_{id}:resource_{id}`        | `multi-tenant-isolation.md`    |
| Subdomain takeover            | Validate against active tenant DB; remove DNS first   | `multi-tenant-cors-csp.md`     |
| Credential reuse lateral move | Separate secrets per env; unique passwords            | `dev-prod-separation.md`       |
| Production data in dev/staging | Anonymize or use synthetic data                     | `dev-prod-separation.md`       |
| COPPA violation               | Parental consent <13; separate consent for ads        | `children-data-protection.md`  |
| DPDP violation (India)        | Parental consent <18; no behavioral tracking          | `children-data-protection.md`  |
| Cross-tenant data breach      | Honeytoken records per tenant; alert on cross-access  | `deception-detection.md`       |
| Subdomain enumeration/recon   | Wildcard DNS catch-all → honeypot handler             | `deception-detection.md`       |
| Credential theft from repos   | Fake API keys/AWS keys with monitoring                | `deception-detection.md`       |
| Data exfiltration detection   | Canary records with unique identifiers per location   | `deception-detection.md`       |
| Ransomware early detection    | Honeyfiles in storage; any encrypt/modify = alert     | `deception-detection.md`       |
| Post-compromise lateral move  | Breadcrumbs (fake SSH keys, creds) → honeypots        | `deception-detection.md`       |
| Leaked data source tracing    | Watermarked exports with per-recipient unique markers | `deception-detection.md`       |
| Attacker persistence in containers | Rotate pods on schedule; ephemeral infra | `moving-target-defense.md`     |
| Stolen credential blast radius | Automated key/credential rotation (24-72h cycle) | `moving-target-defense.md`     |
| Recon invalidation             | Shift IPs, ports, containers beneath stable URLs | `moving-target-defense.md`     |

---

Last updated: 2026-02-10
