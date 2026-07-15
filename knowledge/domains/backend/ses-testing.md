---
domain: backend
topic: testing AWS SES email sending
tags: [aws-ses, email, testing, deliverability, reputation]
complexity: intermediate
last_updated: 2026-06-29
confidence: 0.85
source_refs:
  - "AWS SES mailbox simulator + reputation thresholds (AWS docs)"
  - "LocalStack/MailHog SES emulation + its event-trigger gap"
  - "SES Virtual Deliverability Manager (2026); SPF/DKIM/DMARC alignment"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku/Sonnet researchers
version: 1
---

# Testing AWS SES

> Two questions people conflate: "does my code send correctly?" and "will the mail land in the inbox?" — different layers, different tools. And one rule underpins all of it: a careless test can damage sender reputation and get the account suspended.

## TL;DR

- **Never point a test at a real third-party inbox.** SES bounces/complaints hurt reputation, and AWS acts: bounce >5% probation, >10% stop; complaint >0.1% trouble. The whole strategy is built around _not_ generating real bounces.
- **Use the SES Mailbox Simulator** for bounce/complaint/suppression testing — those sends fire real events but **don't count toward reputation metrics** (they do count against quota/rate).
- **Mock the SDK for unit tests** (`aws-sdk-client-mock`, `moto`); use **LocalStack** for local integration — but know LocalStack **doesn't fire real bounce/complaint/delivery events**, so the event pipeline needs the simulator against real SES.
- **Sandbox first.** New accounts: verified recipients only, 200/day, 1 msg/sec. Simulator addresses work in sandbox without verification.
- **Deliverability ≠ delivery.** "SES accepted it" isn't "Gmail inboxed it" — verify SPF/DKIM/DMARC alignment and inbox placement (VDM, mail-tester) before launch.

## Decision Guide

| Goal                                   | Use                                                    | Why                                                |
| -------------------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| Unit-test send logic                   | Mock the SDK (`aws-sdk-client-mock` JS, `moto` Python) | No network; assert params + error handling         |
| Local integration / inspect outbound   | LocalStack (+ MailHog extension) or moto               | Offline CI, captured-mail inspection               |
| Test bounce/complaint/suppression flow | **Mailbox Simulator** against real SES                 | Real events, reputation-safe                       |
| Test the event pipeline                | Configuration set → SNS/EventBridge + simulator        | LocalStack can't fire real bounce/complaint events |
| Early dev before production access     | SES sandbox + verified identities                      | Default state; safe, rate-limited                  |
| Will it inbox?                         | VDM, mail-tester.com, GlockApps; real DNS              | Delivery ≠ deliverability                          |
| Stop staging emailing real users       | Catch-all sink (MailHog/Mailtrap) + recipient override | Non-prod must never reach a real recipient         |

## The reputation rule

SES bounces and complaints damage sender reputation, and AWS enforces it — excessive rates put the account on probation or terminate it (bounce >5% / >10%, complaint >0.1% / 0.5%). So **no test ever sends to a real external inbox.** Every layer below exists to exercise SES without generating a real bounce or complaint. This is the general "tests that touch external services use sinks, not the real thing" discipline, made concrete: the external service here punishes you for misuse.

## The Mailbox Simulator

AWS provides special addresses that exercise real SES end-to-end and **do not count toward bounce/complaint reputation metrics** (they still count against sending quota and rate):

| Address                                   | Simulates                |
| ----------------------------------------- | ------------------------ |
| `success@simulator.amazonses.com`         | Successful delivery      |
| `bounce@simulator.amazonses.com`          | Hard bounce              |
| `complaint@simulator.amazonses.com`       | Complaint (spam report)  |
| `suppressionlist@simulator.amazonses.com` | Suppression-list bounce  |
| `ooto@simulator.amazonses.com`            | Out-of-office auto-reply |

These fire **real** events through your configuration set, so they are how you test bounce/complaint handling, suppression-list logic, and the SNS/EventBridge pipeline safely. They work inside the sandbox without verifying the addresses.

## The testing pyramid

| Layer                     | Tool                                     | Proves                                                              | Gap                                                               |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Unit**                  | Mock the SDK                             | Correct `SendEmail`/`SendBulkTemplatedEmail` params, error handling | No real SES                                                       |
| **Local integration**     | LocalStack (+ MailHog) / moto            | Wiring, captured-mail inspection, offline CI                        | Mocks receipt rules; **no real bounce/complaint/delivery events** |
| **Reputation-safe smoke** | Mailbox Simulator vs real SES            | Real send + real event flow                                         | Counts against quota/rate                                         |
| **Deliverability**        | VDM / mail-tester / GlockApps + real DNS | Inbox placement, SPF/DKIM/DMARC, spam score                         | Pre-launch / post-DNS-change only                                 |

## The other practices

- **Sandbox first.** Do early testing in the SES sandbox (verified recipients, 200/day, 1/sec); request production access before launch.
- **Event-pipeline tests.** Wire a configuration set → event destination (SNS/EventBridge/CloudWatch/Firehose), then use the simulator to assert your handler processes bounces/complaints and updates the suppression list. (Test side of the SES→EventBridge pipeline in [[india-email-deliverability]].)
- **Staging catch-all sink.** Route _all_ non-prod outbound to MailHog/Mailtrap or a verified catch-all, with a recipient override at the send boundary, so staging can never email a real user.
- **Throttling tests.** Assert backoff on `Throttling` / max-send-rate-exceeded and respect the per-second cap.
- **Template tests.** Validate with `TestRenderEmailTemplate` and render with sample data before `SendBulkTemplatedEmail`.
- **Deliverability checks.** Verify SPF/DKIM/DMARC alignment against real DNS and check inbox-vs-spam placement (SES Virtual Deliverability Manager, 2026, shows the split at major providers) before launch and after any sender/DNS change.

## Common Mistakes

| Mistake                                           | Fix                                                    |
| ------------------------------------------------- | ------------------------------------------------------ |
| Load-testing against real Gmail/Outlook addresses | Mailbox Simulator; never real third-party inboxes      |
| Assuming LocalStack tests the bounce pipeline     | LocalStack doesn't fire real events; use the simulator |
| Hitting real SES in unit tests                    | Mock the SDK (`aws-sdk-client-mock`/`moto`)            |
| Treating "SES accepted" as "inbox delivered"      | Deliverability check: DNS alignment + VDM/mail-tester  |
| Staging that can email real users                 | Catch-all sink + recipient override in non-prod        |
| Verifying simulator addresses                     | Not needed — they work in sandbox as-is                |
| No backoff on throttle errors                     | Test and handle `Throttling`/max-rate; respect the cap |

## Checklist

- [ ] No test sends to a real external inbox
- [ ] Unit tests mock the SDK; assert params + error handling
- [ ] Local integration via LocalStack/moto; bounce/complaint flow via the Mailbox Simulator
- [ ] Configuration set + event destination wired; handler + suppression logic tested via simulator
- [ ] Early dev in sandbox; production access requested before launch
- [ ] Staging routes all outbound to a sink; recipient override in non-prod
- [ ] Throttling backoff and template rendering tested
- [ ] SPF/DKIM/DMARC alignment + inbox placement verified pre-launch (VDM/mail-tester)

## References

- [AWS SES — using the mailbox simulator](https://docs.aws.amazon.com/ses/latest/dg/send-an-email-from-console.html) · [SES success metrics & thresholds](https://docs.aws.amazon.com/ses/latest/dg/success-metrics.html)
- [How to test email sending (AWS Messaging Blog)](https://aws.amazon.com/blogs/messaging-and-targeting/how-to-test-email-sending/)
- [Local SES testing with LocalStack + MailHog](https://blog.localstack.cloud/local-testing-ses-workflows-localstack-mailhog-extension/)

Related: [[india-email-deliverability]] (SES region, DKIM, event pipeline this tests), [[testing-strategy]] (broader test discipline).
