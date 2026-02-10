---
domain: backend
topic: india-email-deliverability
tags: [email, india, ses, deliverability]
complexity: intermediate
last_updated: 2026-02-07
related:
  - marketing/email-marketing.md
  - marketing/exam-lifecycle-emails.md
  - security/india-dpdp.md
---

# India Email Deliverability

> India-specific email infrastructure decisions that contradict mainstream (Western-centric) advice.

## TL;DR

- **India inbox placement: 69.8%** --- 30% of emails never reach inbox; deliverability is a feature, not an assumption
- **Apple Mail Privacy Protection is irrelevant** --- 95% Android market share means open tracking still works in India (opposite of Western advice)
- **SES ap-south-1 is the only correct choice** --- 40-60ms vs 200-300ms from us-east-1; latency directly affects transactional email trust
- **AWS Pinpoint is deprecated (Oct 2026)** --- Do not build on Pinpoint; migrate to SES + EventBridge if already using it
- **DPDP Act requires explicit consent** --- Not GDPR-equivalent; different rules for children's data and cross-border transfer

## Decision Guide

| Scenario                     | Approach                                  | Why                                                                      |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| Transactional email (India)  | SES from ap-south-1                       | 40-60ms latency; $0.10/1K emails; highest trust for time-sensitive       |
| Marketing email (<50K/month) | SES + React Email templates               | Cost: ~$5/month; no platform overhead needed yet                         |
| Marketing email (>50K/month) | Add Loops.so or Customer.io on top of SES | Behavioral automation, A/B testing; SES as transport layer               |
| Analytics pipeline           | SES events -> EventBridge -> DynamoDB     | Per-email event tracking without third-party dependency                  |
| Open rate tracking (India)   | Trust it (unlike Western markets)         | 95% Android; Apple MPP affects <5% of Indian users                       |
| Email tool selection         | Avoid Pinpoint; avoid Resend for India    | Pinpoint EOL Oct 2026; Resend has no India region                        |
| Compliance                   | DPDP Act explicit consent + unsubscribe   | Stricter than GDPR on children; requires Data Fiduciary registration     |
| Template system              | React Email + SES SDK                     | Type-safe, component-based, version-controlled; no drag-and-drop lock-in |

## Platform Comparison (India-Specific)

| Factor           | SES (ap-south-1)      | Resend          | Postmark                | Customer.io        |
| ---------------- | --------------------- | --------------- | ----------------------- | ------------------ |
| India region     | Mumbai (ap-south-1)   | No India region | No India region         | No India region    |
| Latency (India)  | 40-60ms               | 200-300ms       | 200-300ms               | 200-300ms          |
| Cost per 100K    | $10                   | $200            | $110                    | $150+              |
| Behavioral flows | Manual (EventBridge)  | No              | No                      | Yes (core feature) |
| Template system  | SES Templates or SDK  | React Email     | MJML                    | Drag-and-drop      |
| Deliverability   | You manage reputation | Managed         | Managed (best-in-class) | Managed            |

**Verdict:** SES wins on cost and latency for India. Add a behavioral layer (Customer.io/Loops) only when you need automated sequences beyond what EventBridge can trigger.

## India Open Tracking Reality

Western email advice says "open rates are unreliable due to Apple MPP." This is wrong for India:

| Market    | Apple Mail Share | MPP Impact | Open Rate Reliability |
| --------- | ---------------- | ---------- | --------------------- |
| US/Europe | 50-60%           | High       | Unreliable            |
| India     | <5%              | Negligible | Reliable              |

**Implication:** Indian email strategies can still use open rates for A/B testing, send time optimization, and engagement scoring. This is a significant advantage Western-focused guides miss entirely.

## SES Analytics Pipeline

| Event Type | What to Track                   | Store In                      |
| ---------- | ------------------------------- | ----------------------------- |
| Send       | Timestamp, recipient, template  | DynamoDB                      |
| Delivery   | Delivery timestamp, MTA info    | DynamoDB                      |
| Open       | First open time, device, OS     | DynamoDB                      |
| Click      | Link clicked, timestamp         | DynamoDB                      |
| Bounce     | Bounce type (hard/soft), reason | DynamoDB + alert              |
| Complaint  | Complaint timestamp             | DynamoDB + alert + auto-unsub |

**Architecture:** SES -> SNS -> EventBridge -> Lambda -> DynamoDB. Cost at 100K emails/month: ~$2 for the pipeline.

## DPDP Act Email Requirements

| Requirement            | What It Means for Email                           |
| ---------------------- | ------------------------------------------------- |
| Explicit consent       | Double opt-in or clear checkbox (not pre-checked) |
| Right to erasure       | Must delete all email data on request             |
| Children's data (< 18) | Verifiable parental consent required              |
| Cross-border transfer  | Allowed unless government restricts destination   |
| Data Fiduciary duties  | Must appoint DPO if processing significant data   |
| Breach notification    | 72 hours to Data Protection Board                 |

**Key difference from GDPR:** DPDP has stricter children's data rules (relevant for student exam platforms) and different cross-border transfer mechanics.

## Common Mistakes

| Mistake                                                 | Fix                                                     |
| ------------------------------------------------------- | ------------------------------------------------------- |
| Using SES from us-east-1 for Indian users               | Deploy in ap-south-1; 4x latency reduction              |
| Building on AWS Pinpoint                                | Pinpoint EOL October 2026; use SES + EventBridge        |
| Ignoring open rates because "MPP makes them unreliable" | In India, 95% Android; open rates are valid             |
| Choosing Resend/Postmark for Indian audience            | No India region; 200ms+ latency; 10-20x cost of SES     |
| Pre-checked email consent checkbox                      | DPDP requires explicit consent; unchecked by default    |
| No bounce/complaint handling                            | Auto-suppress hard bounces; auto-unsub on complaints    |
| Skipping dedicated IP for transactional email           | Shared IP reputation varies; dedicated IP at >50K/month |

## Checklist

- [ ] SES configured in ap-south-1 (Mumbai)
- [ ] SPF, DKIM, and DMARC records configured and verified
- [ ] Dedicated IP address if sending >50K/month
- [ ] Bounce and complaint handlers auto-suppress recipients
- [ ] DPDP-compliant consent mechanism (explicit, not pre-checked)
- [ ] Children's data consent flow includes parental verification
- [ ] EventBridge pipeline capturing send/delivery/open/click/bounce/complaint
- [ ] Open rate tracking enabled (valid for Indian audience)
- [ ] No dependency on AWS Pinpoint (EOL October 2026)

## References

- [Netcore India Email Benchmark 2025](https://netcorecloud.com/resources/reports/email-benchmark-report/) --- 69.8% inbox placement, India-specific data
- [Statista India Mobile OS Share 2025](https://www.statista.com/statistics/262157/market-share-held-by-mobile-operating-systems-in-india/) --- 95% Android
- [AWS SES Regional Endpoints](https://docs.aws.amazon.com/ses/latest/dg/regions.html) --- ap-south-1 availability
- [AWS Pinpoint EOL Announcement](https://aws.amazon.com/pinpoint/) --- End of life October 2026
- [India DPDP Act 2023](https://www.meity.gov.in/data-protection-framework) --- Digital Personal Data Protection

## Related

- [Email Marketing Psychology](../marketing/email-marketing.md) --- Subject lines, timing, frequency
- [Exam Lifecycle Emails](../marketing/exam-lifecycle-emails.md) --- Exam-specific email patterns
- [India DPDP Compliance](../security/india-dpdp.md) --- Full DPDP compliance guide

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-02-07 | Initial version |
