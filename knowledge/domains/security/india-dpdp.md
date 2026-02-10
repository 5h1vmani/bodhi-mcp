---
domain: security
topic: india-dpdp
tags: [dpdp, india, privacy, compliance, consent, children, edtech]
complexity: advanced
last_updated: 2025-01-26
related:
  - ux/ethical-persuasion.md
  - ux/gen-z-loyalty.md
  - security/pre-commit-checklist.md
---

# India DPDP Act Compliance

> Design and technical requirements for Digital Personal Data Protection Act 2023 compliance.

## TL;DR

- **Under-18 threshold for children** — Higher than GDPR (13-16) and COPPA (13); requires parental consent
- **All breaches must be reported** — No materiality threshold; 72-hour detailed report to Board
- **Consent-only model** — No "legitimate interest" like GDPR; must have consent or specific exemption
- **Consent Managers are unique** — Registered entities that manage consent on behalf of users
- **Penalties up to INR 250 crore (~$30M)** — Per violation, for security safeguard failures

## Decision Guide

| Scenario                          | Approach                                            | Why                                               |
| --------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| Any user under 18                 | Parental consent + age verification + no targeting  | DPDP treats all under-18 as children              |
| Collecting personal data          | Consent notice + specific purpose + withdrawal UI   | Consent-only model; no legitimate interest basis  |
| Storing user data                 | Encrypt + mask + access controls + deletion policy  | Rule 6 mandates specific safeguards               |
| Data breach (any size)            | Notify users immediately + Board within 72 hours    | ALL breaches require notification                 |
| Cross-border transfer             | Check government blacklist + sector-specific rules  | Blacklist approach; RBI/telecom rules override    |
| Building consent UI               | Multi-language + clear purpose + easy withdrawal    | 22 scheduled languages; withdrawal = giving       |
| Age verification                  | DigiLocker + self-declaration + guardian verify     | Must verify user age, guardian, and relationship  |
| Significant Data Fiduciary status | DPO in India + annual audits + DPIAs                | Additional obligations for large data handlers    |
| EdTech platform                   | Full compliance; don't assume educational exemption | Commercial platforms likely NOT exempt            |
| Exam proctoring                   | Disclose in notice + limit retention + no profiling | Security purpose permitted; behavioral use banned |
| Learning analytics                | Document as diagnostic; get consent for adaptive    | Educational diagnostic OK; engagement algo banned |

## DPDP vs. GDPR vs. COPPA

| Aspect                  | DPDP Act (India)             | GDPR (EU)                         | COPPA (US)            |
| ----------------------- | ---------------------------- | --------------------------------- | --------------------- |
| Children's age          | Under 18                     | 13-16 (varies by country)         | Under 13              |
| Legal bases             | Consent + limited exemptions | 6 bases incl. legitimate interest | Parental consent      |
| Data categories         | Uniform (no sensitive tier)  | General vs. sensitive             | No distinction        |
| Breach notification     | ALL breaches, 72 hours       | Risk-based, 72 hours              | Only certain breaches |
| Processor liability     | None (Fiduciary liable)      | Direct obligations                | Limited               |
| Cross-border            | Blacklist approach           | Adequacy/SCCs required            | No restrictions       |
| Private right of action | No                           | Yes                               | Yes                   |
| Max penalties           | INR 250 crore (~$30M)        | EUR 20M or 4% turnover            | $50,120/violation     |

## Children's Data (Under 18)

### Requirements

| Requirement               | Implementation                                   |
| ------------------------- | ------------------------------------------------ |
| Age verification          | DigiLocker, self-declaration, or third-party     |
| Guardian verification     | Verify guardian identity and age (must be adult) |
| Relationship verification | Confirm parent-child relationship                |
| Parental consent          | Verifiable consent before any processing         |

### Prohibited Activities

| Activity                    | Status     |
| --------------------------- | ---------- |
| Behavioral tracking         | Prohibited |
| Targeted advertising        | Prohibited |
| Processing harmful to child | Prohibited |
| Location tracking (general) | Prohibited |

### Exemptions (Limited)

| Context          | Allowed Activity                       |
| ---------------- | -------------------------------------- |
| Healthcare       | Child protection and health services   |
| Education        | Educational activities and safety only |
| Childcare/creche | Safety monitoring only                 |
| School transport | Location tracking during travel only   |

## Consent Requirements

### Valid Consent Must Be

| Element       | Requirement                                     |
| ------------- | ----------------------------------------------- |
| Free          | No penalty for declining                        |
| Specific      | Separate consent per purpose                    |
| Informed      | Clear explanation of what, why, how             |
| Unconditional | No bundling with unrelated services             |
| Unambiguous   | Clear affirmative action (no pre-checked boxes) |
| Language      | English or any of 22 scheduled languages        |

### Consent UI Checklist

- [ ] Separate consent for each processing purpose
- [ ] No pre-checked boxes or default opt-ins
- [ ] Multi-language support (22 Indian languages)
- [ ] Withdrawal as easy as giving consent
- [ ] Purpose explanation in plain language
- [ ] Consent versioning with timestamps
- [ ] Consent dashboard showing all active consents

## Privacy Notice Requirements

| Element        | Required Content                              |
| -------------- | --------------------------------------------- |
| Data collected | What personal data is being collected         |
| Purpose        | Why data is being collected                   |
| Rights         | How to access, correct, erase data            |
| Complaints     | How to complain to Data Protection Board      |
| Timing         | Before or simultaneously with consent request |

## Security Safeguards (Rule 6)

| Safeguard           | Implementation                         |
| ------------------- | -------------------------------------- |
| Encryption          | Data at rest and in transit            |
| Masking             | Hide sensitive fields in logs/displays |
| Obfuscation         | Prevent unauthorized inference         |
| Access controls     | Role-based, need-to-know basis         |
| Data backups        | For business continuity                |
| Audit logs          | Maintain for 1 year minimum            |
| Processor contracts | Require equivalent safeguards          |

## Breach Notification

### Timeline

| Step                     | Deadline                    |
| ------------------------ | --------------------------- |
| Notify affected users    | Without delay (immediately) |
| Initial report to Board  | As soon as possible         |
| Detailed report to Board | Within 72 hours             |

### Detailed Report Must Include

- Nature, extent, timing, location of breach
- Causes and consequences
- Mitigation steps taken
- Remedial actions planned
- Proof that user notifications were sent

**Critical:** Unlike GDPR, there is NO materiality threshold. ALL breaches must be reported.

## Penalty Structure

| Violation                                | Maximum Penalty       |
| ---------------------------------------- | --------------------- |
| Failure to implement security safeguards | INR 250 crore (~$30M) |
| Failure to notify breach                 | INR 200 crore (~$24M) |
| Children's data violations               | INR 200 crore (~$24M) |
| Processing without valid consent         | INR 200 crore (~$24M) |
| Other violations                         | INR 50 crore (~$6M)   |
| Data Principal breach of duty            | INR 10,000            |

## Implementation Timeline

| Phase   | Date              | What's Active                                                    |
| ------- | ----------------- | ---------------------------------------------------------------- |
| Phase 1 | November 13, 2025 | DPBI establishment, definitions                                  |
| Phase 2 | November 13, 2026 | Consent Manager registration                                     |
| Phase 3 | May 13, 2027      | All substantive provisions (consent, security, breach, children) |

## Cross-Border Data Transfer

### Approach

India uses a **blacklist model** (opposite of GDPR's whitelist):

- Transfers allowed to any country unless specifically restricted
- Government can block transfers to specific countries without notice
- No SCCs or adequacy decisions required

### Sector-Specific Rules

| Sector     | Additional Rule                          |
| ---------- | ---------------------------------------- |
| Banking    | RBI data localization requirements apply |
| Telecom    | DoT regulations may restrict transfer    |
| Insurance  | IRDAI rules on data handling apply       |
| Healthcare | Additional safeguards may apply          |

## Significant Data Fiduciary (SDF)

If designated as SDF (based on volume, sensitivity, risk):

| Requirement          | Detail                                 |
| -------------------- | -------------------------------------- |
| DPO appointment      | Must be based in India                 |
| Independent auditor  | Annual data protection audits          |
| DPIA                 | Before processing risky/sensitive data |
| Government reporting | Additional compliance requirements     |

## EdTech & Test Prep Platform Compliance

### Do Educational Exemptions Apply to EdTech?

### Short Answer: Likely NO for Commercial Test Prep Platforms

| Entity Type                         | Exempt? | Notes                                      |
| ----------------------------------- | ------- | ------------------------------------------ |
| Schools, colleges, universities     | Yes     | Traditional educational institutions       |
| Vocational training centers         | Yes     | Explicitly included in definition          |
| EdTech as processor FOR schools     | Maybe   | Acting on behalf of exempt institution     |
| Standalone EdTech platforms         | **No**  | Not traditional "institutions of learning" |
| Test prep (BYJU'S, Unacademy, etc.) | **No**  | Commercial entities, not "institutions"    |
| Private coaching classes            | Unclear | Definition ambiguous                       |

### What Educational Exemptions Actually Cover

Fourth Schedule exempts educational institutions from parental consent ONLY for:

- Tracking for **educational activities** (grades, assessments)
- **Safety monitoring** of enrolled students
- Location tracking during school transport

**NOT covered even for exempt institutions:**

- Behavioral tracking for ads or monetization
- Profiling for commercial purposes
- Sharing data with third parties for non-educational use

### EdTech Decision Guide

| Activity                              | Permitted?    | Conditions                                    |
| ------------------------------------- | ------------- | --------------------------------------------- |
| Performance tracking (grades, scores) | Yes           | With parental consent for non-exempt entities |
| Adaptive learning algorithms          | **Uncertain** | May constitute "behavioral monitoring"        |
| Learning engagement metrics           | Maybe         | If clearly educational, with consent          |
| Gamification (progress badges)        | Limited       | Basic progress OK; behavioral rewards risky   |
| Personalized recommendations          | **Risky**     | Likely "behavioral monitoring" if profiling   |
| Targeted ads to students              | **No**        | Absolutely prohibited                         |
| Marketing using student data          | **No**        | Prohibited                                    |

### The Adaptive Learning Problem

Key unresolved question: Does adaptive learning = "behavioral monitoring"?

**Likely PERMITTED:**

- Static performance tracking (test scores)
- Curriculum progress indicators
- Time-on-task metrics (aggregated)

**Likely RESTRICTED:**

- Personalized content based on behavioral profiling
- Engagement-maximizing algorithms
- Predictive analytics on individual behavior

**Recommendation:** Document how personalization serves educational (not commercial) purposes; obtain explicit parental consent for all adaptive features.

### Gamification Restrictions for EdTech

| Element                         | Status         | Notes                                     |
| ------------------------------- | -------------- | ----------------------------------------- |
| Progress bars                   | OK             | Basic completion tracking                 |
| Achievement badges (milestones) | OK             | Non-behavioral rewards                    |
| Streaks                         | **Risky**      | May exploit developmental vulnerabilities |
| Personalized rewards            | **Restricted** | Based on behavioral tracking              |
| Leaderboards                    | **Risky**      | Social pressure on minors                 |
| Engagement-maximizing mechanics | **Prohibited** | Designed to increase addiction            |

### EdTech Compliance Checklist

- [ ] Determine if you qualify as "educational institution" (likely not for commercial platforms)
- [ ] Implement verifiable parental consent for ALL under-18 users
- [ ] Deploy Aadhaar-linked/DigiLocker age verification
- [ ] Disable behavioral tracking and targeted advertising for minors
- [ ] Document educational purpose for all data processing
- [ ] Audit adaptive learning systems for "behavioral monitoring" risk
- [ ] Remove or limit gamification mechanics that exploit vulnerabilities
- [ ] Ensure data not used for marketing or monetization
- [ ] Review third-party data sharing arrangements

### Student Data Retention

| Data Type             | Retention Rule                          |
| --------------------- | --------------------------------------- |
| Academic records      | Until no longer necessary for education |
| Performance analytics | Delete when purpose fulfilled           |
| Consent records       | 7 years (via Consent Managers)          |
| Traffic/audit logs    | Minimum 1 year                          |

### Proctoring & Exam Integrity

Exam proctoring is permitted as a **security measure** (not behavioral monitoring) when:

| Activity                   | Status    | Condition                                  |
| -------------------------- | --------- | ------------------------------------------ |
| Tab switch detection       | Permitted | Exam integrity; disclose in privacy notice |
| Copy/paste blocking        | Permitted | Exam integrity                             |
| Fullscreen monitoring      | Permitted | Exam integrity                             |
| Session/device fingerprint | Permitted | Anti-fraud; document as security purpose   |
| IP address logging         | Permitted | Security; limit retention (30-90 days)     |
| Screenshot capture         | Avoid     | Privacy concern; not essential             |
| Webcam/audio recording     | Avoid     | Disproportionate for most exams            |

**Key requirement:** Proctoring data must be disclosed in privacy notice and cannot be used for behavioral profiling or marketing.

### Educational Analytics Classification

To determine if analytics are permitted, classify as educational diagnostic vs. behavioral monitoring:

| Analytics Type             | Classification         | Status     |
| -------------------------- | ---------------------- | ---------- |
| Score calculation          | Educational diagnostic | Permitted  |
| Topic mastery analysis     | Educational diagnostic | Permitted  |
| Time-per-question metrics  | Educational diagnostic | Permitted  |
| Performance trend analysis | Educational diagnostic | Permitted  |
| Learning pattern diagnosis | Educational diagnostic | Permitted  |
| Engagement-maximizing algo | Behavioral monitoring  | Prohibited |
| Personalized push timing   | Behavioral monitoring  | Prohibited |
| Addiction-prone mechanics  | Behavioral monitoring  | Prohibited |

**Test:** Does the analytics serve the student's learning goals (diagnostic) or the platform's engagement goals (monitoring)?

## Common Mistakes

| Mistake                                   | Fix                                                         |
| ----------------------------------------- | ----------------------------------------------------------- |
| Treating 13-17 as adults                  | Under-18 = child in India; need parental consent            |
| Using "legitimate interest" basis         | DPDP has no legitimate interest; get consent                |
| Only reporting "significant" breaches     | Report ALL breaches, no materiality threshold               |
| English-only consent forms                | Support 22 scheduled Indian languages                       |
| Assuming GDPR compliance = DPDP compliant | Different children's age, breach rules, bases               |
| Relying on processor to handle compliance | Data Fiduciary liable; processors have no direct obligation |
| Making withdrawal harder than consent     | Must be equally easy                                        |
| No age verification for all users         | Must verify age to identify minors                          |
| EdTech assuming educational exemption     | Commercial platforms likely NOT exempt                      |
| Adaptive learning without consent         | May constitute prohibited behavioral monitoring             |
| Gamification for engagement on minors     | Exploiting developmental vulnerabilities = violation        |

## Technical Checklist

### Consent Management

- [ ] Age gate for all users (identify under-18)
- [ ] Parental consent workflow for minors
- [ ] DigiLocker integration or equivalent verification
- [ ] Multi-language consent notices (22 languages)
- [ ] Purpose-specific consent collection
- [ ] Consent withdrawal one-click capability
- [ ] Consent versioning and timestamps
- [ ] Consent dashboard for users

### Security

- [ ] Encryption at rest and in transit
- [ ] Data masking in logs and non-prod environments
- [ ] Role-based access controls
- [ ] Audit logging (1-year retention)
- [ ] Breach detection mechanisms
- [ ] 72-hour breach notification workflow
- [ ] Processor contracts with security requirements

### Data Rights

- [ ] Data access request API/interface
- [ ] Data correction workflow
- [ ] Data deletion capability (with legal retention exceptions)
- [ ] Grievance submission interface
- [ ] 90-day response SLA for grievances
- [ ] Nomination feature (appoint representative)

### Children's Data (if applicable)

- [ ] No behavioral tracking for under-18
- [ ] No targeted advertising for under-18
- [ ] Guardian verification workflow
- [ ] Relationship verification (parent-child)
- [ ] Limited processing for education/safety only

## Related

- [India SaaS Legal Compliance](india-saas-legal.md) — IT Rules, Consumer Protection, multi-tenant structure
- [Ethical Persuasion](../ux/ethical-persuasion.md) — Dark patterns and consent design
- [Gen Z Loyalty](../ux/gen-z-loyalty.md) — Youth audience considerations
- [Pre-commit Checklist](pre-commit-checklist.md) — Security checks

---

## Changelog

| Date       | Change                                               |
| ---------- | ---------------------------------------------------- |
| 2025-01-25 | Initial version                                      |
| 2025-01-25 | Added EdTech & test prep compliance section          |
| 2025-01-26 | Added proctoring and analytics classification guides |
| 2026-01-27 | Added cross-reference to india-saas-legal.md         |
