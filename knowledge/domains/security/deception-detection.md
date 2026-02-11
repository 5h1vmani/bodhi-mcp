---
domain: security
topic: deception-detection
tags: [honeypots, honeytokens, breadcrumbs, wildcard-dns]
complexity: advanced
last_updated: 2026-02-10
---

# Deception-Based Breach Detection

> Decision framework for using honeypots, honeytokens, and decoy data to detect breaches in multi-tenant SaaS platforms — especially those using wildcard DNS.

## TL;DR

- **Wildcard DNS is a free detection layer** — any request to a non-existent subdomain is attacker reconnaissance; route unknown subdomains to a honeypot handler instead of 404
- **Honeytokens have near-zero false positives** — legitimate users never access them, so every alert is a confirmed incident worth investigating
- **Separate the honeytoken registry from the honeytokens** — if attackers find the registry in the same DB, they'll avoid every trap; store the list of what's fake in a different system
- **Per-tenant honeytokens detect cross-tenant breaches** — insert unique fake records per tenant; if Tenant A's context accesses Tenant B's token, isolation is broken
- **Alert first, block later** — blocking on honeypot trigger reveals your deception; gather intelligence silently, then respond

## Decision Guide

| Scenario                                      | Approach                                                                                                                                   | Why                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Wildcard DNS platform (`*.app.com`)           | Catch-all default server → honeypot handler for unknown subdomains                                                                         | Zero cost; attacker enumeration becomes instant detection                                                          |
| Detecting subdomain brute-forcing             | Log DNS queries for non-existent subdomains; alert on >20 unknown lookups from one IP in 10 min                                            | Catches recon before any HTTP request arrives                                                                      |
| Verifying tenant isolation works              | Insert unique honeytoken record per tenant; monitor for cross-tenant access                                                                | Only way to prove isolation holds under real attack conditions                                                     |
| Detecting credential theft from repos/configs | Plant fake AWS keys, API keys, DB connection strings with monitoring                                                                       | Attackers test stolen credentials immediately; fast signal                                                         |
| Detecting data exfiltration                   | Canary records with unique email addresses in tenant DBs; monitor for email delivery                                                       | If a honeytoken email receives mail, that DB was exfiltrated                                                       |
| Detecting document theft                      | Embed tracking resources (external image loads) in decoy PDFs/Excel files                                                                  | Document open triggers HTTP request revealing opener's IP                                                          |
| Identifying which source leaked               | Watermark decoy data per location (unique fake records per server/backup/export)                                                           | The specific fake record that surfaces traces to exact leak point                                                  |
| SaaS platform with fake internal tools        | Serve realistic login pages on `jenkins.app.com`, `admin.app.com` etc.                                                                     | Attracts attackers probing for internal tooling; captures fingerprints                                             |
| Detecting API path fuzzing                    | Add honeypot routes (`/.env`, `/.git/config`, `/api/v1/admin/users`) to real API                                                           | Legitimate clients never hit these; any request = scanning activity                                                |
| Detecting ransomware / mass file access       | Honeyfiles in S3 buckets and file shares (enticing names like `passwords.xlsx`); alert on any read/modify/delete                           | Ransomware encrypts indiscriminately; honeyfile access = earliest possible detection (pre-encryption of real data) |
| Post-compromise lateral movement              | Breadcrumbs: fake SSH keys, AWS creds (`~/.aws/credentials`), RDP shortcuts, DB connection strings on real endpoints pointing to honeypots | Attacker follows breadcrumbs to instrumented systems; MITRE Engage See→Think→Do chaining                           |
| Wasting attacker time during recon            | SSH tarpit (Endlessh) on honeypot subdomains; HTTP tarpit (1 byte/sec responses) on decoy endpoints                                        | Ties up attacker connections indefinitely; zero cost to defender, high cost to attacker's time budget              |
| Tracking leaked data to its source            | Watermark exports/backups with per-recipient unique synthetic records or zero-width Unicode characters                                     | When leaked data surfaces, unique markers identify exact export/backup/user that was the source                    |
| Choosing honeytoken alerting priority         | Treat all honeytoken alerts as P1/Critical in SIEM; skip triage                                                                            | False positive rate is ~0%; every trigger warrants incident response                                               |

## Wildcard DNS Catch-All Architecture

With `*.mycompany.com → your infrastructure`, the reverse proxy becomes a detection layer:

| Request Target                                                   | Routing          | Action                                       |
| ---------------------------------------------------------------- | ---------------- | -------------------------------------------- |
| Known tenant subdomain                                           | Real app         | Normal request handling                      |
| Known service subdomain                                          | Real service     | Normal request handling                      |
| Decoy subdomain (`jenkins`, `admin`, `staging`, `vpn`, `gitlab`) | Honeypot handler | Log everything, serve fake login page, alert |
| Unknown subdomain (not in any list)                              | Catch-all logger | Log + alert — likely brute-force enumeration |

**Decoy subdomain categories to deploy:**

| Category       | Examples                                          | Attracts                                    |
| -------------- | ------------------------------------------------- | ------------------------------------------- |
| Internal tools | `jenkins`, `gitlab`, `grafana`, `kibana`, `vault` | Attackers looking for CI/CD, source control |
| Admin panels   | `admin`, `console`, `dashboard`, `cpanel`         | Attackers looking for management interfaces |
| Infrastructure | `db`, `redis`, `elasticsearch`, `staging`, `dev`  | Attackers mapping backend services          |
| Common targets | `phpmyadmin`, `wp-admin`, `webmail`, `ftp`        | Automated scanners, commodity attacks       |
| Fake tenants   | `demo`, `test`, `sandbox`, `beta`, `pilot`        | Attackers enumerating tenant list           |

**Implementation:** Nginx default server block catches all unmatched subdomains → proxies to honeypot service with `X-Honeypot-Subdomain` header. Real tenant server blocks (matched from DB) take priority.

## Cross-Tenant Breach Detection with Honeytokens

The highest-value pattern for multi-tenant platforms:

| Layer           | Token Type                                                                   | What It Detects                               | Example                                                                 |
| --------------- | ---------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Database        | Fake record per tenant with unique identifier                                | Cross-tenant query, SQL injection, ORM bypass | Fake exam row in tenant's table; any access = breach                    |
| API             | Honeytoken API key per tenant (generated at provisioning, never distributed) | Key theft, tenant impersonation               | Check honeytoken registry before normal auth; use triggers alert        |
| Application     | Decoy user account per tenant (`admin@{tenant}.com`)                         | Credential stuffing, data breach              | Login attempt or password reset for this account = incident             |
| Tenant registry | Fake tenant entries in metadata tables                                       | Admin compromise, tenant enumeration          | Access to fake tenant scope = compromised admin or attacker             |
| Cache           | Honeytoken cache keys with known values                                      | Cache poisoning, cross-tenant leakage         | Retrieving honeytoken key from wrong tenant context = isolation failure |

**Critical design rule:** The honeytoken registry (which records are fake) must live in a **separate system** — not the same database. If an attacker dumps the DB, they should not be able to distinguish real from fake records.

## DNS Canary Tokens

Embed unique subdomains as canary tokens throughout your infrastructure:

| Planted In              | Token Format                       | Detection Mechanism                                 |
| ----------------------- | ---------------------------------- | --------------------------------------------------- |
| Source code comments    | `canary-{unique-id}.mycompany.com` | DNS resolution logged by authoritative nameserver   |
| Internal documentation  | `docs-{unique-id}.mycompany.com`   | DNS resolution reveals which doc was accessed       |
| Config files on servers | `config-{unique-id}.mycompany.com` | DNS resolution reveals which server was compromised |
| Database seed data      | `data-{unique-id}.mycompany.com`   | DNS resolution reveals DB exfiltration              |

**Why DNS tokens are superior:** They work through firewalls and proxies, are difficult to detect without triggering, and require no HTTP connectivity. The DNS lookup itself is the signal.

## Deception Technique Taxonomy

Which technique at which layer, for what threat:

| Technique                                       | Layer          | Detects                                                 | Effort                                              | False Positive Rate         |
| ----------------------------------------------- | -------------- | ------------------------------------------------------- | --------------------------------------------------- | --------------------------- |
| **Honeypot subdomains**                         | DNS/HTTP       | Reconnaissance, subdomain enumeration                   | Low (catch-all routing)                             | ~0%                         |
| **Honeypot API routes**                         | Application    | Path fuzzing, vulnerability scanning                    | Low (few routes + 1 Lambda)                         | ~0%                         |
| **Honeytokens** (DB records, API keys)          | Data           | Cross-tenant breach, data access violations             | Medium (per-tenant provisioning)                    | ~0%                         |
| **Honeyfiles** (S3 canaries, file share decoys) | Storage        | Ransomware, data theft, unauthorized browsing           | Low (place + monitor)                               | ~0%                         |
| **Breadcrumbs** (fake creds → honeypot)         | Endpoint       | Post-compromise lateral movement, credential theft      | Medium (realistic artifacts + honeypot destination) | Very low                    |
| **Beacon documents** (Word/PDF/Excel)           | Document       | Exfiltration, unauthorized document access              | Low (Canarytokens generates them)                   | Low (employees may trigger) |
| **DNS canary tokens**                           | Infrastructure | Source code/config/doc leakage                          | Trivial (canarytokens.org)                          | ~0%                         |
| **Watermarked data**                            | Data exports   | Leak source identification (which export/backup leaked) | Medium (per-recipient unique markers)               | ~0%                         |
| **Tarpits** (SSH/HTTP)                          | Network        | Reconnaissance, brute-force scanners                    | Low (Endlessh, nginx config)                        | ~0%                         |
| **Decoy tenant** (full fake tenant)             | Platform       | Infrastructure-level breach, admin compromise           | Medium (seed data + monitoring)                     | ~0%                         |

**Key insight from research:** Deception alerts have the lowest false positive rate of any detection category. Ponemon 2024: organizations using deception identify attackers **12x faster** (60+ days → ~5.5 days) with **38% average ROI**.

## Legal Boundaries

| Permissible (Passive Defense)                       | Not Permissible (Active Countermeasures) |
| --------------------------------------------------- | ---------------------------------------- |
| Logging IPs on your own systems                     | Accessing attacker systems               |
| Capturing HTTP headers/user agent on your honeypots | Installing anything on attacker machines |
| DNS query logging on your authoritative nameserver  | DDoS or disruption of attacker infra     |
| Browser fingerprinting on honeypot pages you own    | Any form of "hack back"                  |
| Watermarking your own decoy documents               | Using collected info to attack back      |
| Sharing attacker data with law enforcement          | Vigilante action                         |

**GDPR basis:** Legitimate interest (Article 6(1)(f); Recital 49 explicitly mentions network security). Document your legitimate interest assessment. Retain honeypot data for a defined period (e.g., 90 days).

**ToS disclosure:** State that security monitoring exists without revealing specifics — "We employ intrusion detection systems and threat detection technologies to protect the platform." Never disclose which subdomains are honeypots or which records are tokens.

## Common Mistakes

| Mistake                                                  | Fix                                                                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Honeytoken registry stored in same DB as the honeytokens | Separate system (different DB, config service, or hardcoded in monitoring code); attacker who dumps DB should see normal-looking rows                        |
| Blocking attacker immediately on honeypot trigger        | Alert and observe first; blocking reveals your deception; gather intelligence, then respond after analysis                                                   |
| Honeypot subdomain serves generic 404 or error page      | Serve realistic fake login page matching the expected tool (Jenkins CSS for `jenkins.*`, etc.); cheap 404 tips off attacker                                  |
| No alerting pipeline for honeypot events                 | Route to SIEM as P1/Critical; integrate with Slack/PagerDuty; honeypot without monitoring is useless                                                         |
| `is_honeytoken` column in the database table             | Sophisticated attacker sees this column and avoids those rows; track externally                                                                              |
| Same honeytoken format for all placements                | Unique identifiers per location; otherwise you detect a breach but can't pinpoint the source                                                                 |
| Deploying honeypots but never testing them               | Purple team exercises quarterly; verify the full chain: trigger → log → SIEM → alert → incident response                                                     |
| Honeypot collects excessive data beyond security need    | Minimize to IP, headers, timestamp, path; GDPR data minimization applies even to attackers                                                                   |
| Breadcrumbs with no aging or metadata                    | Red teams detect fresh fake creds instantly (HoneypotBuster checks account age, login history, group memberships); age breadcrumbs and add realistic context |
| Honeyfiles with obvious names like `HONEYPOT.txt`        | Use enticing names: `Server Admin List.xlsx`, `AWS Break-glass credentials.docx`; match real naming conventions and timestamps                               |

## Checklist

- [ ] Wildcard DNS catch-all routes unknown subdomains to honeypot handler (not 404)
- [ ] 5+ decoy subdomains deployed mimicking internal tools (`jenkins`, `admin`, `gitlab`, etc.)
- [ ] DNS query logging enabled; alert on subdomain enumeration patterns
- [ ] Honeytoken record inserted in every tenant's database scope
- [ ] Honeytoken registry stored in separate system from main application database
- [ ] Honeytoken API keys generated per tenant at provisioning (never distributed)
- [ ] Honeypot API routes added to real API (`/.env`, `/.git/config`, `/wp-admin`)
- [ ] All honeypot/honeytoken alerts routed to SIEM as high-priority (P1)
- [ ] DNS canary tokens planted in source code, internal docs, and config files
- [ ] Honeypot login pages serve realistic content (not generic error pages)
- [ ] Legal: ToS discloses security monitoring without revealing specifics
- [ ] Legal: GDPR legitimate interest assessment documented for honeypot data collection
- [ ] Honeyfiles placed in S3 buckets and shared storage (enticing names, realistic content)
- [ ] Breadcrumbs deployed on key endpoints (fake SSH keys, AWS creds, DB connection strings → point to honeypots)
- [ ] Beacon documents (Word/PDF with tracking) placed in file shares and internal wikis
- [ ] Data exports/backups watermarked with per-recipient unique markers
- [ ] Purple team test conducted to verify detection pipeline end-to-end

## References

- [NIST SP 800-53 SC-26 (Decoys)](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final) — Federal standard formally recognizing deception as a security control
- [MITRE Engage Framework](https://engage.mitre.org/) — Adversary engagement planning: See → Think → Do model for deception design
- [Canarytokens Documentation](https://docs.canarytokens.org/guide/) — 20+ token types, free, self-hostable; fastest path to deployment
- [Sokol et al. — Honeypots and Privacy](https://jis-eurasipjournals.springeropen.com/articles/10.1186/s13635-017-0057-4) — Most comprehensive academic treatment of GDPR compliance for honeypots
- [Microsoft Defender XDR Deception](https://learn.microsoft.com/en-us/defender-xdr/deception-overview) — First-party vendor deception built into XDR; reference architecture for enterprise-grade deception
- [SANS CyberLaw 101 — Honeypot Legal Primer](https://www.sans.org/white-papers/1746/) — US legal considerations: CFAA, ECPA, liability
- [Honeyfile Camouflage (arXiv 2024)](https://arxiv.org/html/2405.04758v2) — Making decoy files indistinguishable from real ones; enticement + realism + camouflage metrics
- [SPADE: GenAI-Enhanced Adaptive Deception (arXiv 2025)](https://arxiv.org/html/2501.00940v1) — LLM-generated deceptive content for honeypots and honeyfiles
- [Elastic Security Canary Files](https://www.elastic.co/security-labs/ransomware-in-the-honeypot-how-we-capture-keys) — Ransomware key capture via honeyfile memory dumps
- [Honeybits (GitHub)](https://github.com/0x4D31/honeybits) — Open source breadcrumb automation: fake bash_history, AWS creds, RDP configs

## Related

- [Multi-Tenant Isolation](./multi-tenant-isolation.md) — Prevention: how to stop cross-tenant breaches (this playbook detects them)
- [Multi-Tenant CORS & CSP](./multi-tenant-cors-csp.md) — Perimeter: subdomain takeover prevention complements honeypot subdomains
- [Webapp Security](./webapp-security.md) — OWASP defenses that honeypots sit alongside
- [Dev/Prod Separation](./dev-prod-separation.md) — Environment isolation; honeypots should exist in prod, not dev

---

## Changelog

| Date       | Change                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 2026-02-10 | Initial version                                                                                               |
| 2026-02-10 | Added breadcrumbs, honeyfiles, tarpits, watermarks, beacon docs; technique taxonomy table; effectiveness data |
