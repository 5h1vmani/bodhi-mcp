---
domain: security
topic: children-data-protection
tags: [coppa, gdpr, dpdp, privacy, minors]
complexity: advanced
last_updated: 2026-02-10
---

# Children's Data Protection

> Decision framework for COPPA, GDPR Article 8, and India DPDP Act compliance in educational platforms handling minors' data, with multi-jurisdiction consent mechanisms.

## TL;DR

- **India DPDP is strictest: under 18 requires parental consent** -- stricter than GDPR (16/13) and COPPA (13); if serving India, design for under-18 consent
- **COPPA updated April 2026: separate consent for advertising** -- operators must obtain distinct opt-in for third-party disclosures vs primary functions; granular consent is mandatory
- **Expanded PII definition** -- device IDs, IP addresses, biometric data, geolocation, behavioral/inferred data now covered; audit your data collection
- **Penalties are severe** -- COPPA: $51,744 per child per violation; DPDP: ₹250 crore (~$30M); compliance is non-negotiable
- **Data minimization is the strongest defense** -- collect only essential information; "nice to have" analytics = compliance risk

## Decision Guide

| Scenario                                      | Approach                                                       | Why                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Exam platform serving India                   | Age gate at registration; parental consent for <18             | DPDP Act: under-18 is a child (strictest globally)                                       |
| Exam platform serving US only                 | Parental consent for <13; COPPA compliance deadline April 2026 | COPPA updated rules; separate advertising consent required                               |
| Exam platform serving EU                      | Parental consent for <16 (or <13 based on member state)        | GDPR Article 8; member states vary (13-16)                                               |
| Multi-jurisdiction platform (India + US + EU) | Use strictest rule: parental consent for <18 (India DPDP)      | Single flow simplifies compliance; covers all jurisdictions                              |
| Collecting device IDs, IP addresses           | Treat as PII requiring parental consent                        | COPPA 2025 expanded definition includes persistent identifiers                           |
| Behavioral tracking / analytics               | Obtain separate opt-in consent; disable by default for minors  | COPPA: separate consent for non-integral uses; DPDP: no legitimate interest for children |
| Targeted advertising to students              | Prohibited without explicit parental opt-in                    | COPPA + state laws (NY Child Data Protection Act); high-risk, low-reward                 |
| Email marketing to students                   | Requires parental consent; double opt-in recommended           | CAN-SPAM + COPPA; accidental COPPA violation common                                      |
| Exam results storage                          | Retain only as long as necessary; provide deletion mechanism   | COPPA data retention; DPDP "purpose limitation"                                          |
| Payment info for minor account                | Parental payment method only; never store minor's card         | PCI-DSS + COPPA; legal capacity to contract                                              |
| Parental consent verification                 | Email + confirmation code OR credit card verification          | COPPA "reasonable efforts" standard; avoid overly burdensome                             |
| Consent withdrawal                            | Easy, one-click process; delete data within 30 days            | COPPA + GDPR + DPDP rights; difficult withdrawal = violation                             |
| Free vs paid exam pricing                     | Same consent requirements; "free" doesn't exempt from COPPA    | Common misconception; consent based on age, not pricing                                  |
| Third-party integrations (analytics, CDN)     | Data Processing Agreement (DPA) + COPPA compliance clause      | You're liable for third-party violations; due diligence required                         |

## Multi-Jurisdiction Age Requirements

| Jurisdiction                             | Age Threshold                       | Definition                               | Parental Consent Required                                    |
| ---------------------------------------- | ----------------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| **India (DPDP Act)**                     | Under 18                            | "Child"                                  | Yes (strictest globally)                                     |
| **US (COPPA)**                           | Under 13                            | "Child"                                  | Yes                                                          |
| **EU (GDPR Article 8)**                  | Under 16 (or 13-16 by member state) | "Child" for information society services | Yes (can be lowered to 13 by member states)                  |
| **California (CCPA)**                    | Under 16                            | "Minor"                                  | Yes (under 13: parental; 13-16: child or parent can consent) |
| **New York (Child Data Protection Act)** | Under 18                            | "Minor"                                  | Restrictions on advertising, addictive features              |

**Platform decision:**

- If serving India: use <18 threshold (covers all jurisdictions)
- If US/EU only: use <13 (COPPA) or <16 (GDPR) based on primary market
- If multi-jurisdiction: <18 is safest (single flow, maximum compliance)

## COPPA 2025 Updates (Effective April 2026)

**Major changes from FTC final rule:**

### 1. Separate Consent Requirements

**Before (COPPA 2013):**

- Single blanket consent for all data collection

**After (COPPA 2025):**

- **Primary function consent** (e.g., account creation, exam access)
- **Separate opt-in for third-party disclosures** (advertising, analytics, non-integral uses)

**Implementation:**

```typescript
// ✅ COPPA 2025 compliant consent flow
const consentForm = {
  essentialConsent: {
    label: "Create account and access exams",
    required: true,
    preChecked: false, // Must be user action
  },
  analyticsConsent: {
    label: "Allow usage analytics to improve our service",
    required: false,
    preChecked: false, // Must be explicit opt-in
  },
  marketingConsent: {
    label: "Receive email updates about new exams",
    required: false,
    preChecked: false, // Separate from essential
  },
};

// ❌ COPPA violation: bundled consent
const consentForm = {
  allConsent: {
    label: "I agree to all data uses",
    required: true, // Bundling is prohibited
  },
};
```

### 2. Expanded Personal Information Definition

**Now includes:**

- Persistent identifiers (device IDs, cookie IDs, IP addresses)
- Biometric data (fingerprints, voiceprints, facial recognition)
- Geolocation data (precise location)
- Behavioral data (browsing history, app usage)
- Inferred data (profiling, predictive analytics)

**Audit your data collection:**

```typescript
// ❌ PII under COPPA 2025 (requires parental consent)
const userData = {
  deviceId: uuid(), // Persistent identifier
  ipAddress: req.ip, // Now PII
  sessionRecording: true, // Behavioral data
  clickstream: [...], // Behavioral data
};

// ✅ Minimize data collection
const userData = {
  userId: uuid(), // Necessary for account
  examId: examId, // Necessary for service
  score: score, // Necessary for results
  // NO device tracking, IP logging, or behavioral analytics
};
```

### 3. Data Retention and Deletion

**Requirements:**

- Delete data once no longer necessary for stated purpose
- Provide clear data retention policy
- Honor parental deletion requests within reasonable time (30 days recommended)

**Implementation:**

```sql
-- Automated data purging after exam completion + retention period
DELETE FROM exam_sessions
WHERE user_age < 13
  AND exam_completed_at < NOW() - INTERVAL '90 days';

-- Parental deletion request
DELETE FROM users WHERE id = $1 AND age < 13;
DELETE FROM exam_results WHERE user_id = $1;
DELETE FROM analytics_events WHERE user_id = $1;
-- Ensure cascading deletes to ALL related tables
```

## GDPR Article 8 (Children's Data)

**Key differences from COPPA:**

| Aspect        | COPPA (US)                           | GDPR Article 8 (EU)                                       |
| ------------- | ------------------------------------ | --------------------------------------------------------- |
| Age threshold | Under 13                             | Under 16 (can be lowered to 13 by member states)          |
| Consent model | Parental consent                     | Parental consent OR child consent if member state allows  |
| Scope         | Online services directed at children | Information society services processing children's data   |
| Rights        | Parental access, deletion            | Right to erasure, access, rectification, data portability |
| Penalties     | $51,744 per child per violation      | Up to €20M or 4% global revenue                           |

**Educational platforms must:**

- Verify age using reasonable methods
- Obtain parental consent for <16 (or lower member state threshold)
- Provide easy consent withdrawal
- Respect all GDPR rights (access, erasure, portability)

## India DPDP Act (Children Under 18)

**Strictest global requirements:**

### Age Definition

- **Child = under 18** (higher than GDPR/COPPA)
- Applies to ALL data processing, not just targeted services

### Consent Model

- Parental/guardian consent MANDATORY
- No "legitimate interest" exception for children
- Opt-in only (no pre-checked boxes)

### Specific Prohibitions

- Tracking or behavioral monitoring of children
- Targeted advertising to children
- Any processing that could cause harm to child

### Breach Notification

- ALL breaches must be reported (no materiality threshold)
- 72-hour detailed report to Data Protection Board

### Penalties

- Up to ₹250 crore (~$30 million) per violation

**Platform obligations:**

```typescript
// Age verification for India
const registrationFlow = async (userInput) => {
  const age = calculateAge(userInput.dateOfBirth);

  if (age < 18) {
    // DPDP: parental consent required
    return {
      requiresParentalConsent: true,
      consentMechanism: "email_verification", // Or OTP to parent phone
      dataMinimization: true, // Collect only essential
      noTracking: true, // Disable analytics for minors
      noAdvertising: true, // Prohibited
    };
  }

  // Adult flow (18+)
  return { requiresParentalConsent: false };
};
```

## Parental Consent Mechanisms

**COPPA "reasonable efforts" standard:**

| Method                               | Verification Strength | User Friction | Cost                          |
| ------------------------------------ | --------------------- | ------------- | ----------------------------- |
| Email + confirmation link            | Low                   | Low           | Free                          |
| Email + follow-up call               | Medium                | Medium        | Moderate (staff time)         |
| Credit card verification (no charge) | High                  | Medium        | Payment processor fees        |
| Government ID upload                 | High                  | High          | ID verification service costs |
| Video call verification              | High                  | High          | Staff time + scheduling       |

**Recommended approach for exam platforms:**

```typescript
// Two-tier consent based on data sensitivity

// Tier 1: Email verification (low-risk data)
const basicConsent = {
  method: "email_confirmation",
  steps: [
    "Child enters parent email",
    "Parent receives consent request",
    "Parent clicks confirmation link",
    "Account activated",
  ],
  suitable: "Basic exam access, no PII beyond name/email",
};

// Tier 2: Enhanced verification (payment, sensitive data)
const enhancedConsent = {
  method: "credit_card_or_id",
  steps: [
    "Email verification (above)",
    "PLUS: credit card match OR ID upload",
    "Account activated with full features",
  ],
  suitable: "Payment processing, detailed analytics, third-party integrations",
};
```

## Data Minimization Strategy

**Principle:** Don't collect what you don't need

| Data Type               | Essential?                   | COPPA/GDPR/DPDP Requirement                           |
| ----------------------- | ---------------------------- | ----------------------------------------------------- |
| Name                    | Yes (for account)            | Essential function: allowed                           |
| Email                   | Yes (for login/results)      | Essential function: allowed                           |
| Date of birth           | Yes (for age verification)   | Essential function: allowed                           |
| Parent email (if minor) | Yes (for consent)            | Required by COPPA/GDPR/DPDP                           |
| Phone number            | No (unless SMS login)        | Requires separate consent                             |
| Device ID               | No (analytics only)          | Requires parental consent (COPPA 2025)                |
| IP address              | No (unless fraud prevention) | PII under COPPA 2025; requires consent                |
| Geolocation             | No (unless exam proctoring)  | Requires separate opt-in                              |
| Behavioral tracking     | No (analytics)               | Prohibited for minors (DPDP); requires opt-in (COPPA) |
| Biometric data          | No (unless proctoring)       | High-risk; avoid if possible; requires consent        |

**Default to NO collection:**

```typescript
// ✅ Minimal data collection for exam platform
const essentialData = {
  userId: uuid(),
  name: "Student Name",
  email: "student@example.com",
  dateOfBirth: "2010-05-15", // For age verification only
  parentEmail: "parent@example.com", // If <13/<16/<18
};

// ❌ Excessive data collection
const excessiveData = {
  ...essentialData,
  deviceId: "...", // Not essential
  ipAddress: "...", // Not essential
  sessionRecording: true, // Privacy violation
  clickstream: [...], // Behavioral tracking
  adPersonalization: true, // Prohibited for minors
};
```

## Common Mistakes

| Mistake                                         | Fix                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| Treating "free" services as exempt from COPPA   | COPPA applies regardless of pricing; consent based on age, not payment |
| Single bundled consent for all data uses        | Separate consent for advertising/third-party disclosures (COPPA 2025)  |
| Not treating device IDs / IP addresses as PII   | COPPA 2025 expanded definition; requires parental consent              |
| Using "legitimate interest" for children's data | Not allowed under DPDP (India); weak basis under GDPR for minors       |
| Pre-checked consent boxes                       | Must be opt-in (user action required); pre-checked = invalid consent   |
| No age verification at registration             | Age gate required; asking date of birth is minimum                     |
| Retaining data indefinitely                     | Data retention limits required; delete after purpose fulfilled         |
| Difficult consent withdrawal process            | Must be as easy as granting consent; one-click withdrawal              |
| Third-party integrations without DPA            | You're liable for vendor COPPA violations; due diligence required      |
| No parental access to child's data              | COPPA/GDPR right: parents can view, correct, delete child's data       |
| Behavioral tracking / analytics for minors      | Prohibited under DPDP; requires separate consent under COPPA 2025      |
| Targeted advertising to students                | High-risk; requires explicit opt-in; many state laws prohibit          |
| Using India <13 threshold instead of <18        | DPDP Act: child = under 18 (strictest globally)                        |
| No breach notification plan                     | COPPA: report to FTC; DPDP: 72-hour report; GDPR: 72-hour report       |

## Checklist

- [ ] Age verification implemented at registration (date of birth minimum)
- [ ] Parental consent flow for minors (<13 COPPA, <16 GDPR, <18 DPDP)
- [ ] Separate consent for advertising vs essential functions (COPPA 2025)
- [ ] Data minimization: collect only essential information (name, email, DOB)
- [ ] Device IDs, IP addresses NOT collected for minors (or require consent)
- [ ] Behavioral tracking / analytics disabled for minors by default
- [ ] Targeted advertising disabled for minors (no opt-in offered)
- [ ] Data retention policy published; automated purging after retention period
- [ ] Easy consent withdrawal mechanism (one-click)
- [ ] Parental data access portal (view/correct/delete child's data)
- [ ] Third-party vendors (analytics, CDN) have DPA with COPPA compliance clause
- [ ] Privacy policy uses age-appropriate language (plain language summary)
- [ ] Breach notification plan in place (COPPA, GDPR, DPDP requirements)
- [ ] No pre-checked consent boxes; all opt-in requires user action
- [ ] Payment processing uses parental method only (no minor credit cards)
- [ ] Email marketing to minors requires parental consent (double opt-in)
- [ ] Geolocation disabled for minors (or requires separate consent)
- [ ] Regular audits of data collection (quarterly review)

## Platform-Specific Implementation (Exam Platforms)

### Registration Flow

```typescript
const handleRegistration = async (input) => {
  // 1. Calculate age
  const age = calculateAge(input.dateOfBirth);
  const jurisdiction = detectJurisdiction(input.country);

  // 2. Determine consent requirements
  const requiresConsent =
    (jurisdiction === "US" && age < 13) ||
    (jurisdiction === "EU" && age < 16) ||
    (jurisdiction === "IN" && age < 18);

  if (requiresConsent) {
    // 3. Request parental consent
    await sendParentalConsentEmail({
      parentEmail: input.parentEmail,
      childName: input.name,
      dataUses: {
        essential: "Account creation, exam access, results",
        optional: {
          analytics: false, // Disabled for minors
          marketing: false, // Requires separate opt-in
        },
      },
    });

    // 4. Pending approval state
    return {
      status: "pending_parental_consent",
      message: "Consent request sent to parent/guardian",
    };
  }

  // Adult flow
  return createAccount(input);
};
```

### Data Retention

```sql
-- Retention policy: exam results kept for 1 year after completion
CREATE TABLE data_retention_policies (
  user_age_group VARCHAR(20),
  data_type VARCHAR(50),
  retention_days INT
);

INSERT INTO data_retention_policies VALUES
  ('minor', 'exam_results', 365),
  ('minor', 'session_data', 30),
  ('minor', 'analytics_events', 0); -- Not collected

-- Automated cleanup job (daily cron)
DELETE FROM exam_results
WHERE user_age < 18
  AND exam_completed_at < NOW() - INTERVAL '365 days';
```

### Parental Dashboard

```typescript
// Parent can view/delete child's data
const parentDashboard = {
  endpoints: {
    viewChildData: "/api/parent/child-data",
    deleteChildData: "/api/parent/delete-child",
    withdrawConsent: "/api/parent/withdraw-consent",
    exportData: "/api/parent/export-data", // GDPR data portability
  },
  features: [
    "View all exams taken",
    "View exam results",
    "Download data (GDPR export)",
    "Delete account and all data",
    "Modify consent preferences",
  ],
};
```

## References

- [FTC COPPA Rule (2025)](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa) -- Official updated rule
- [COPPA Compliance Guide (2025)](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/) -- EdTech-specific guidance
- [GDPR Article 8: Children](https://gdpr-info.eu/art-8-gdpr/) -- EU children's data protection
- [India DPDP Act (2023)](https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf) -- Official act text
- [NIST K-12 Cybersecurity Framework](https://www.nist.gov/cyberframework) -- Educational platform security
- [CISA K-12 Cybersecurity Guide](https://www.cisa.gov/topics/cybersecurity-best-practices/K12cybersecurity/protecting-our-future-cybersecurity-k12) -- Children's data protection

## Related

- [India DPDP](./india-dpdp.md) -- Comprehensive India data protection compliance
- [Webapp Security](./webapp-security.md) -- OWASP 2025 Top 10 defenses
- [Multi-Tenant Isolation](./multi-tenant-isolation.md) -- Tenant data separation for educational platforms

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-02-10 | Initial version |
