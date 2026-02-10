---
domain: security
topic: webapp-security
tags: [owasp, webapp, devsecops, supply-chain]
complexity: intermediate
last_updated: 2026-01-29
---

# Webapp Security (OWASP 2025)

> Decision framework mapping OWASP 2025 Top 10 changes to actionable defenses, with focus on the two new categories and rank shifts developers must act on.

## TL;DR

- **Broken Access Control is still #1** -- SSRF (previously standalone) merged into it; 40 CWEs; server-side enforcement is non-negotiable
- **Supply Chain Failures is now #3** -- expanded from "Vulnerable Components" to cover dependencies, build systems, and distribution; SBOM is mandatory by EU CRA 2026
- **Mishandling Exceptional Conditions is new at #10** -- secure error handling is now an explicit OWASP category, not just good practice
- **Security Misconfiguration rose to #2** -- cloud/serverless complexity drives this; default-deny everything
- **Operationalize OWASP in CI/CD, not annual audits** -- DAST in CI (ZAP), SCA in pipelines (npm audit, Snyk), SAST on every PR

## Decision Guide

| Scenario                            | Approach                                                                                     | Why                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Building auth for a new webapp      | RBAC/ABAC with server-side checks; deny by default; never trust client-side hidden fields    | A01: Broken Access Control is #1 with 40 CWEs                                          |
| Adding third-party npm packages     | Lockfile + `npm audit` in CI + SBOM generation + pin versions                                | A03: Supply Chain is now #3; covers full dependency ecosystem                          |
| Error handling in API responses     | Generic error messages to client; detailed logs server-side; structured error codes          | A10: Mishandling Exceptional Conditions is new; info leakage aids attackers            |
| Configuring cloud resources         | Default-deny; review all defaults; automated config scanning (AWS Config, tfsec)             | A02: Security Misconfiguration is #2; cloud complexity multiplies risk                 |
| Handling user passwords             | Argon2id or bcrypt; never MD5/SHA1; enforce MFA; support WebAuthn/passkeys                   | A07: Identification & Auth Failures; passwordless reduces attack surface               |
| Processing user input (forms, APIs) | Parameterized queries; allowlist validation; output encoding per context                     | A05: Injection dropped to #5 but still present; practices are working, keep using them |
| Managing sessions                   | Short-lived access tokens; HttpOnly + Secure + SameSite cookies; rotate refresh tokens       | A07: Session fixation and token theft remain common                                    |
| Deploying to production             | DAST scan (ZAP) + SCA scan + SBOM check as CI gate; block deploy on critical findings        | OWASP 2025 recommends operationalizing across SDLC                                     |
| Logging security events             | Structured logs; monitor for anomalies; alert on access control failures                     | A09: Security Logging & Monitoring Failures; you can't respond to what you can't see   |
| Handling file uploads               | Validate MIME type server-side; scan for malware; store outside webroot; randomize filenames | Injection + misconfiguration + SSRF vectors all converge on uploads                    |

## OWASP 2025 Top 10 Quick Reference

| Rank | Category                           | Key Change from 2021                     | Primary Defense                                                   |
| ---- | ---------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| A01  | Broken Access Control              | SSRF merged in (was standalone A10:2021) | Server-side enforcement; deny by default; RBAC/ABAC               |
| A02  | Security Misconfiguration          | Rose from #5; cloud complexity           | Default-deny; automated config scanning; no default creds         |
| A03  | Supply Chain Failures              | Expanded from "Vulnerable Components"    | SBOM; lockfiles; SCA in CI; verify package integrity              |
| A04  | Cryptographic Failures             | Dropped from #2                          | TLS everywhere; AES-256/Argon2id; no homebrew crypto              |
| A05  | Injection                          | Dropped from #1 (2017) to #5             | Parameterized queries; allowlist input validation                 |
| A06  | Insecure Design                    | Unchanged                                | Threat modeling; secure design patterns; abuse cases              |
| A07  | ID & Auth Failures                 | Unchanged                                | MFA/WebAuthn; OAuth 2.1 + PKCE; short-lived tokens                |
| A08  | Software & Data Integrity          | Unchanged                                | CI/CD pipeline security; signed artifacts; integrity checks       |
| A09  | Logging & Monitoring Failures      | Unchanged                                | Structured logging; anomaly alerting; incident response           |
| A10  | Mishandling Exceptional Conditions | **NEW**                                  | Secure error handling; generic client errors; resilience patterns |

## DevSecOps Integration Pattern

| SDLC Phase | Security Activity                                    | Tool Examples                         |
| ---------- | ---------------------------------------------------- | ------------------------------------- |
| Code / PR  | SAST scan + secret detection                         | Semgrep, CodeQL, Gitleaks, trufflehog |
| Build      | SCA + dependency audit + SBOM generation             | npm audit, Snyk, CycloneDX, Syft      |
| Test       | DAST against staging + API fuzzing                   | OWASP ZAP, Burp Suite, schemathesis   |
| Deploy     | Security gate (block on critical) + signed artifacts | GitHub Actions gate, AWS CodePipeline |
| Runtime    | WAF + logging + anomaly detection                    | AWS WAF, CloudWatch, Datadog, Sentry  |

## Common Mistakes

| Mistake                                              | Fix                                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Access control only on the frontend (hiding buttons) | Enforce on server; never trust client-side checks                                       |
| Annual security audit as only security practice      | Integrate DAST/SAST/SCA into CI; continuous is the only speed                           |
| Detailed error messages in production API responses  | Return generic codes (`{"error": "forbidden"}`); log details server-side                |
| No SBOM or dependency tracking                       | Generate SBOM per build; audit with SCA; pin versions in lockfile                       |
| Using MD5/SHA1 for password hashing                  | Use Argon2id (preferred) or bcrypt; never roll your own                                 |
| Default cloud configs in production                  | Review every default; use infrastructure-as-code with security linting (tfsec, checkov) |
| No logging of auth failures                          | Log all auth events; alert on anomalous patterns (brute force, credential stuffing)     |
| Treating injection as solved because rank dropped    | Injection is #5, not gone; keep using parameterized queries and input validation        |
| No CI security gate                                  | Add `npm audit --audit-level=critical` and ZAP scan as blocking CI steps                |
| Ignoring EU CRA / SBOM requirements                  | SBOM provision mandatory by EU CRA from late 2026; start generating now                 |

## Checklist

- [ ] Server-side access control enforced on every endpoint (deny by default)
- [ ] SBOM generated per build; dependencies audited in CI (npm audit / Snyk)
- [ ] Error responses are generic to clients; detailed errors logged server-side only
- [ ] DAST scan (ZAP) runs against staging in CI pipeline
- [ ] SAST + secret detection runs on every PR
- [ ] Passwords hashed with Argon2id or bcrypt (not MD5/SHA1)
- [ ] MFA or WebAuthn/passkeys supported for user auth
- [ ] Sessions use HttpOnly + Secure + SameSite cookies; short-lived access tokens
- [ ] Cloud/infra configs reviewed with IaC linting (tfsec, checkov)
- [ ] Security logging captures auth events with anomaly alerting
- [ ] CI pipeline has a security gate that blocks on critical findings
- [ ] File uploads validated server-side (MIME, size, scan) and stored outside webroot

## References

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/) -- Official 2025 list with new categories
- [OWASP: Establishing a Modern AppSec Program](https://owasp.org/Top10/2025/0x03_2025-Establishing_a_Modern_Application_Security_Program/) -- Operationalizing OWASP across SDLC
- [OWASP: Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) -- Testing methodology
- [OWASP: Serverless Top 10](https://owasp.org/www-project-serverless-top-10/) -- Serverless-specific risks mapping
- [eSecurity Planet: OWASP 2025 Analysis](https://www.esecurityplanet.com/threats/news-owasp-top-10-2025/) -- Category changes breakdown
- [Aikido: OWASP 2025 Developer Guide](https://www.aikido.dev/blog/owasp-top-10-2025-changes-for-developers) -- Developer-focused change summary

## Related

- [Serverless AWS Security](./serverless-aws-security.md) -- AWS Lambda/API Gateway security at scale
- [Server Actions Security](./server-actions-security.md) -- Next.js-specific security patterns

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
