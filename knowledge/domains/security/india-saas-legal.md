---
domain: security
topic: india-saas-legal
tags: [india, legal, saas, compliance, it-rules, consumer-protection]
complexity: advanced
last_updated: 2026-01-27
related:
  - security/india-dpdp.md
  - marketing/trust-building.md
---

# India SaaS Legal Compliance

> Decision framework for Indian legal documents required for SaaS/multi-tenant platforms.

## TL;DR

- **3 core laws apply** — DPDP Act 2023 (data), IT Rules 2021 (intermediary), Consumer Protection Act 2019 (commerce)
- **Multi-tenant = Data Processor** — Platform provider processes on behalf of tenant (Data Fiduciary)
- **Grievance Officer mandatory** — IT Rules require acknowledgment in 24 hours, resolution in 15 days
- **5 documents minimum** — Privacy Policy, Terms, Cookie Policy, Refund Policy, Grievance Contact
- **Analytics needs consent before loading** — PostHog/GA cannot run until user opts in

## Decision Guide

| Scenario                            | Required Documents                                                                  | Why                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| B2C SaaS launching in India         | Privacy Policy, Terms of Service, Cookie Policy, Refund Policy, Grievance Redressal | Core 5 required by DPDP + IT Rules + Consumer Protection |
| Multi-tenant platform (white-label) | Above + DPA + MSA per tenant                                                        | Platform = Processor; Tenant = Fiduciary                 |
| Processing children's data (<18)    | Above + Parental Consent Notice                                                     | DPDP Section 9 requires verifiable parental consent      |
| Using analytics (PostHog, GA)       | Cookie Policy with opt-in consent                                                   | DPDP consent required before any tracking                |
| SaaS with paid plans                | Refund Policy mandatory                                                             | Consumer Protection Act 2019                             |
| User-generated content platform     | Above + Acceptable Use Policy                                                       | IT Rules intermediary safe harbor                        |
| B2B SaaS (no direct consumers)      | MSA, DPA, IP Notice                                                                 | Consumer Protection may not apply; DPDP still does       |

## Required Documents by Law

| Document                  | DPDP Act 2023 | IT Rules 2021 | Consumer Protection Act | When Required              |
| ------------------------- | ------------- | ------------- | ----------------------- | -------------------------- |
| Privacy Policy            | **Required**  | Recommended   | Recommended             | Always                     |
| Terms of Service          | Implied       | **Required**  | Recommended             | Always                     |
| Cookie Policy             | **Required**  | N/A           | N/A                     | If using cookies/analytics |
| Refund Policy             | N/A           | N/A           | **Required**            | If selling to consumers    |
| Grievance Redressal       | **Required**  | **Required**  | **Required**            | Always                     |
| Parental Consent Notice   | **Required**  | N/A           | N/A                     | If users under 18          |
| Data Processing Agreement | **Required**  | N/A           | N/A                     | If processing for others   |
| Acceptable Use Policy     | Recommended   | **Required**  | N/A                     | If user-generated content  |

## IT Rules 2021 (Intermediary Guidelines)

### Grievance Officer Requirements

| Requirement       | Specification                    |
| ----------------- | -------------------------------- |
| Appointment       | Mandatory for all intermediaries |
| Residence         | Must be resident in India        |
| Publication       | Name + contact on website/app    |
| Acknowledgment    | Within 24 hours of complaint     |
| Resolution        | Within 15 days of receipt        |
| Monthly reporting | Publish complaint statistics     |

### Intermediary Safe Harbor

To maintain safe harbor protection (not liable for user content):

| Obligation                | Implementation                           |
| ------------------------- | ---------------------------------------- |
| Publish rules prominently | Terms of Service with prohibited content |
| Not initiate transmission | Don't modify user content                |
| Not select receiver       | Content goes where user directs          |
| Not modify content        | No editorial changes                     |
| Due diligence             | Follow takedown procedures               |

### Content Removal Timelines

| Content Type                     | Timeline |
| -------------------------------- | -------- |
| Court order                      | 36 hours |
| Government order                 | 36 hours |
| Intimate images (non-consensual) | 24 hours |
| Impersonation complaint          | 24 hours |
| User grievance (other)           | 15 days  |

## Consumer Protection Act 2019

### E-commerce Requirements

| Requirement         | Implementation                     |
| ------------------- | ---------------------------------- |
| Refund policy       | Clear terms before purchase        |
| Cancellation rights | 14-day cooling period (some goods) |
| Delivery timeline   | Commit and honor                   |
| Price disclosure    | Total price including taxes        |
| Complaint mechanism | Functional grievance redressal     |

### Grievance Timeline

| Stage                        | Deadline      |
| ---------------------------- | ------------- |
| Acknowledgment               | 48 hours      |
| Resolution                   | 30 days       |
| Escalation to Consumer Forum | After 30 days |

### Unfair Trade Practices (Prohibited)

- False claims about quality/features
- Bait-and-switch pricing
- Hidden charges
- Refusing reasonable refunds
- Unfair contract terms

## Multi-Tenant (White-Label) Structure

### Legal Relationships

```
┌─────────────────────┐
│   End User (Student)│
│   = Data Principal  │
└──────────┬──────────┘
           │ Consent
           ▼
┌─────────────────────┐
│   Tenant (Coach)    │
│   = Data Fiduciary  │ ◄── Controls purposes & means
│   (Controller)      │
└──────────┬──────────┘
           │ DPA Contract
           ▼
┌─────────────────────┐
│   Platform Provider │
│   = Data Processor  │ ◄── Processes on behalf of Fiduciary
│   (You)             │
└──────────┬──────────┘
           │ Sub-processor Agreements
           ▼
┌─────────────────────┐
│   Sub-processors    │
│   (AWS, PostHog,    │
│   Payment Gateway)  │
└─────────────────────┘
```

### Document Flow for Multi-Tenant

| Document                  | Between                | Purpose                               |
| ------------------------- | ---------------------- | ------------------------------------- |
| Master Services Agreement | Platform ↔ Tenant      | Commercial terms, SLA, liability      |
| Data Processing Agreement | Platform ↔ Tenant      | DPDP compliance, security obligations |
| Privacy Policy            | Tenant ↔ End User      | Tenant's data practices disclosure    |
| Sub-processor DPA         | Platform ↔ AWS/PostHog | Chain of responsibility               |

### Processor Obligations (Platform Provider)

| Obligation                   | Implementation                      |
| ---------------------------- | ----------------------------------- |
| Process only on instructions | Log all data operations             |
| Security safeguards          | Encryption, access controls, audits |
| Sub-processor management     | DPAs with all sub-processors        |
| Breach notification          | Inform tenant immediately           |
| Audit cooperation            | Allow tenant audits                 |
| Deletion on termination      | Purge tenant data on request        |

## Cookie Consent Implementation

### Consent Before Loading Rule

**Critical:** Under DPDP, consent must be obtained BEFORE tracking begins.

```javascript
// ❌ WRONG: Load PostHog then ask consent
posthog.init("key");
showCookieBanner();

// ✅ CORRECT: Wait for consent before loading
if (hasConsent("analytics")) {
  posthog.init("key");
}
```

### Cookie Categories

| Category           | Examples                 | Consent Required? |
| ------------------ | ------------------------ | ----------------- |
| Strictly Necessary | Session, CSRF, auth      | No (but disclose) |
| Functional         | Language, preferences    | Yes               |
| Analytics          | PostHog, GA, Mixpanel    | Yes               |
| Marketing          | Ad tracking, retargeting | Yes               |

### PostHog Specific Compliance

| Requirement                | Implementation               |
| -------------------------- | ---------------------------- |
| Load after consent         | Use consent manager          |
| Cross-border disclosure    | PostHog Cloud = US servers   |
| Data Processing Agreement  | Sign via posthog.com/dpa     |
| Feature flags consent      | Include in analytics consent |
| Session recordings consent | Separate explicit consent    |
| Self-hosted option         | Avoids cross-border issues   |

## Penalty Comparison

| Violation       | DPDP Act              | IT Rules         | Consumer Protection |
| --------------- | --------------------- | ---------------- | ------------------- |
| Maximum penalty | ₹250 crore            | Lose safe harbor | ₹10 lakh + damages  |
| Regulator       | Data Protection Board | Ministry of IT   | Consumer Forum      |
| Private action  | No                    | Limited          | Yes                 |

## Common Mistakes

| Mistake                              | Fix                                                |
| ------------------------------------ | -------------------------------------------------- |
| One Privacy Policy for all tenants   | Each tenant needs own policy (they're Fiduciary)   |
| No DPA with white-label clients      | Sign DPA before processing their users' data       |
| Grievance email not monitored        | Appoint dedicated officer; acknowledge in 24 hours |
| Cookie banner after page load        | Block all non-essential cookies until consent      |
| Same grievance timeline for all laws | IT Rules: 15 days; Consumer Protection: 30 days    |
| Assuming B2B = no consumer law       | If tenant's end users are consumers, laws apply    |
| No sub-processor list                | Maintain and disclose all sub-processors in DPA    |

## Implementation Checklist

### Before Launch

- [ ] Privacy Policy published (English + Hindi at minimum)
- [ ] Terms of Service with prohibited content list
- [ ] Cookie consent banner blocking analytics until opt-in
- [ ] Refund Policy if charging consumers
- [ ] Grievance Officer contact in footer (name, email, address)
- [ ] Cookie Policy explaining all cookies

### Before Tenant Onboarding (Multi-tenant)

- [ ] Master Services Agreement signed
- [ ] Data Processing Agreement signed
- [ ] Tenant information collected for their Privacy Policy
- [ ] Sub-processor list provided to tenant
- [ ] Security documentation provided

### Ongoing Compliance

- [ ] Grievance log maintained
- [ ] 24-hour acknowledgment process working
- [ ] Monthly grievance stats published (if intermediary)
- [ ] Annual DPA review with tenants
- [ ] Sub-processor list updated when changed

## Document Templates Reference

For ready-to-use templates with placeholder variables, see:

- [Pinaka Legal Templates](../../../pinaka_landing/docs/legal/templates/)
- [Template Usage Guide](../../../pinaka_landing/docs/legal/templates/README.md)

Templates use `{{PLACEHOLDER}}` format for easy find-and-replace customization.

## Key Deadlines

| Law                          | Deadline         |
| ---------------------------- | ---------------- |
| IT Rules 2021                | Already in force |
| Consumer Protection Act 2019 | Already in force |
| DPDP Act 2023 (full)         | May 13, 2027     |

## Related

- [India DPDP Act Compliance](india-dpdp.md) — Data protection specifics
- [Trust Building](../marketing/trust-building.md) — Compliance as trust signal

---

## Changelog

| Date       | Change                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------- |
| 2026-01-27 | Initial version - synthesized from IT Rules 2021, Consumer Protection Act 2019, DPDP Act 2023 |
