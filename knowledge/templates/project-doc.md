---
project: [project-name]
type: [overview|architecture|api|runbook|decision]
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
owner: [team-or-person]
status: [draft|active|deprecated]
nucleus_refs:
  - domains/backend/payment-integration.md
  - domains/security/webapp-security.md
---

# [Project Name] - [Document Type]

> One-line description of this document's purpose.

## Overview

<!-- Brief description of the project/component this documents -->

## Standards Compliance

<!-- Reference Nucleus playbooks this project follows -->

This project follows these Nucleus playbooks:

| Domain   | Standard                                                                    | Compliance | Notes                      |
| -------- | --------------------------------------------------------------------------- | ---------- | -------------------------- |
| Backend  | [Payment Integration](../../nucleus/domains/backend/payment-integration.md) | Full       |                            |
| Security | [Web App Security](../../nucleus/domains/security/webapp-security.md)       | Partial    | Using OAuth instead of JWT |

### Deviations from Standards

<!-- Document any intentional deviations and WHY -->

| Standard     | Deviation       | Rationale               |
| ------------ | --------------- | ----------------------- |
| [Standard X] | We do Y instead | Because of Z constraint |

## [Main Content Section]

<!-- Content specific to this document type -->

### Subsection 1

### Subsection 2

## Architecture / Design

<!-- If applicable - diagrams, component relationships -->

```
[Diagram or ASCII art if helpful]
```

## Key Decisions

<!-- Important decisions made, link to ADRs if they exist -->

| Decision | Choice     | Date       | ADR                               |
| -------- | ---------- | ---------- | --------------------------------- |
| Database | PostgreSQL | 2025-01-15 | [ADR-001](./decisions/adr-001.md) |

## Runbook / Operations

<!-- If applicable - how to deploy, monitor, troubleshoot -->

### Deployment

### Monitoring

### Troubleshooting

## Dependencies

<!-- External services, libraries, other internal projects -->

| Dependency | Version | Purpose |
| ---------- | ------- | ------- |
|            |         |         |

## Team / Ownership

| Role    | Contact |
| ------- | ------- |
| Owner   |         |
| On-call |         |

## Changelog

| Date       | Change          | Author |
| ---------- | --------------- | ------ |
| YYYY-MM-DD | Initial version |        |
