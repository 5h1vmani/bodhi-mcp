---
domain: backend
topic: bring-your-own payment gateway
tags: [payments, multi-tenant, rbi-compliance, byo-gateway]
complexity: advanced
last_updated: 2026-06-28
confidence: 0.8
source_refs:
  - "RBI Regulation of Payment Aggregators Directions 2025 (Master Direction)"
  - "Razorpay Partner OAuth; Stripe Connect"
  - "PCI-DSS v4.0 SAQ-A; the iframe trap"
  - "Payment orchestration (HyperSwitch); AWS multi-tenant KMS"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku/Sonnet researchers
version: 1
---

# Bring-Your-Own Payment Gateway

> Let each tenant connect their own gateway and collect payments — without touching funds, needing an RBI licence, or holding card data.

## TL;DR

- **Never touch the money.** If tenants use their **own** gateway account and funds settle **directly** to their bank, you're a Payment Gateway (technology provider) — RBI explicitly carves you out of Payment Aggregator (PA) licensing. The moment you pool, hold, split, or are the payee, you're a PA and need a licence.
- **Charge a flat SaaS fee, invoiced separately.** Deducting your cut from the customer's payment = split settlement = PA activity. This is the most common way to accidentally need a licence.
- **Prefer OAuth/Connect over raw keys.** Razorpay Partner OAuth / Stripe Connect hand you scoped, revocable tokens — never the tenant's raw secret. Envelope-encrypt anything you must store (per-tenant KMS key).
- **Stay PCI SAQ-A:** redirect to the provider's hosted checkout; never touch card data. Iframes drag you out of SAQ-A under PCI v4.0 unless you add CSP + SRI.
- **One adapter per provider + a dynamic field schema** drives a provider-agnostic onboarding form. The per-provider credential field lists are volatile config — keep them in product code, not here.

## Decision Guide

| Decision                       | Choice                                                                            | Why                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Do you need an RBI PA licence? | No — if the tenant uses their own gateway and funds settle directly to their bank | RBI regulates funds in transit; a PG that never handles funds is exempt |
| How do you charge your fee?    | Flat SaaS fee, invoiced separately                                                | Deducting from the payment = split settlement = PA activity             |
| Each tenant's gateway account  | One independent account per tenant                                                | A shared/platform-owned account pools funds = PA activity               |
| Auth model                     | OAuth/Connect (scoped, revocable) over raw API keys                               | Never hold the raw secret; tenant can revoke instantly                  |
| Stored secrets                 | Envelope-encrypt, per-tenant KMS key, decrypt only in an isolated payment service | A DB leak yields ciphertext; blast radius = one tenant                  |
| Card data / PCI                | Hosted checkout / redirect; never touch card data → SAQ-A                         | iframe → SAQ-A-EP/D under PCI v4.0 without CSP+SRI                      |
| Add a provider                 | One adapter on a common interface + one field-schema entry                        | The onboarding form renders from the schema; no core changes            |
| Webhook trust                  | Verify HMAC on the raw body; dedup via DB unique; reconcile via API               | Spoofed and missed webhooks both happen                                 |

## The RBI bright line (India)

RBI regulates **funds in transit**. A **Payment Aggregator** _receives, pools, holds in escrow, and settles_ customer payments to merchants — needs authorisation (₹15→25 cr net worth, escrow, merchant KYC, FIU-IND, data localisation). A **Payment Gateway** _provides technology to route/process transactions with no handling of funds_ — explicitly **not** required to be licensed. Stay on the PG side.

**Red lines that flip you into a PA (never do these):**

| Action                                                   | Why it triggers a licence                       |
| -------------------------------------------------------- | ----------------------------------------------- |
| Deduct your fee from the customer's payment              | You're now in the funds flow (split settlement) |
| Be the payee / merchant-of-record                        | Classic PA activity                             |
| Share one platform-owned gateway across tenants          | Pooling funds across merchants                  |
| Hold any float (batch-settle then distribute)            | Custody of funds in transit                     |
| Route refunds through your account                       | Fund-handling                                   |
| Onboard tenants as sub-merchants under your own PA stack | Sub-aggregator / marketplace — prohibited       |

All PA obligations (escrow, merchant KYC, T+1 settlement, net worth, FIU-IND, data localisation) sit with the **tenant's licensed gateway**, not you. **Informational — a payments lawyer must confirm the specific arrangement and the tenant contract.**

## Secure secret storage

Treat tenants' gateway secrets like passwords. Envelope-encrypt: secret → AES-256-GCM with a per-tenant data key → data key wrapped by a **per-tenant KMS key** that never leaves KMS. One KMS key per tenant (alias `tenant-<id>`), with an encryption context that must match at decrypt. Decrypt **only** inside an isolated payment-execution service (never the web/API tier). Never log secrets — audit logs reference key ids only. Separate keys for sandbox vs production. Rotate the KEK on a schedule (immediately on compromise).

## OAuth/Connect over raw keys

Preference: **provider OAuth/Connect > partner-key delegation > tenant pastes raw key.** Razorpay Partner OAuth gives per-merchant scoped tokens (≈90-day access / 180-day refresh, tenant-revocable); Stripe Connect uses a `Stripe-Account` header so you never hold the connected account's secret. When forced to raw keys (PayU/CCAvenue/PhonePe/etc.): encrypt (above), mask after save, isolate, rate-limit decryptions, and treat OAuth access tokens as secrets too (encrypt them; run a refresh job before expiry).

## PCI scope (stay SAQ-A)

Card number/CVV/expiry are entered into the **provider's hosted UI** and processed by them; you see only an order id/token. SAQ-A holds for a **full redirect** to the provider's hosted page. It is **lost** if you host a card form or read card fields with JS. PCI v4.0's iframe trap: iframe checkouts must prove resistance to script-injection (CSP + SRI + WAF, or a provider attestation) — **prefer redirect over iframe.**

## Adapter layer, webhooks, reconciliation

A provider-agnostic interface (`createOrder`, `capture`, `refund`, `verifyWebhookSignature`, `parseWebhookEvent`) — adding a provider = one adapter + one field-schema entry that renders the onboarding form. Verify each webhook's signature on the **raw body** (parsing then re-serialising breaks it), per-tenant secret, route `POST /webhooks/{tenantId}/{provider}`. Idempotency via a DB `UNIQUE (tenant_id, provider, event_id)` + `ON CONFLICT DO NOTHING`. Reconcile pending orders by querying the provider API, joining on **your internal order id (never amount)**. Store money as **integer paise, never float.** Circuit-break per provider on downtime.

## Common Mistakes

| Mistake                                           | Fix                                                        |
| ------------------------------------------------- | ---------------------------------------------------------- |
| Deducting your fee from the payment               | Split settlement = PA. Charge a separate flat SaaS fee     |
| One platform gateway account for all tenants      | Pooling = PA. Each tenant uses their own account           |
| Storing gateway keys in plaintext                 | Envelope-encrypt with a per-tenant KMS key, Day 1          |
| Holding the tenant's raw secret when OAuth exists | Use Partner OAuth / Connect — scoped, revocable tokens     |
| iframe checkout without CSP/SRI                   | Use redirect, or add CSP+SRI, else you fall out of SAQ-A   |
| Verifying webhook on parsed JSON                  | Verify HMAC on the raw body before parsing                 |
| Reconciling by amount                             | Join on your internal order id; equal amounts collide      |
| Float arithmetic for money                        | Integer paise everywhere; format only at display           |
| Putting per-provider field lists in shared docs   | Volatile config — keep in product code, verify per release |

## Checklist

- [ ] Funds settle directly tenant-gateway → tenant-bank; platform never in the flow
- [ ] Platform fee is a separate flat invoice, never deducted from payments
- [ ] Each tenant has their own independent gateway account
- [ ] OAuth/Connect used where available; raw keys envelope-encrypted per-tenant
- [ ] Card collection via hosted checkout/redirect (SAQ-A); no card data touched
- [ ] Webhooks verified on raw body; idempotent via DB unique; reconciliation job runs
- [ ] Money stored as integer minor units
- [ ] Payments lawyer signed off the model + tenant contract (RBI, GST, DPDP)

## References

- [RBI Regulation of Payment Aggregators Directions 2025](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896)
- [Razorpay Partner OAuth](https://razorpay.com/docs/partners/technology-partners/onboard-businesses/integrate-oauth/integration-steps/)
- [Stripe Connect — how it works](https://docs.stripe.com/connect/how-connect-works)
- [PCI-DSS v4.0 SAQ-A iframe changes](https://trustedsec.com/blog/the-hidden-trap-in-the-pci-dss-saq-a-changes)
- [HyperSwitch — payment abstraction](https://github.com/juspay/hyperswitch/wiki/What-is-Payment-Abstraction)

Related: [[b2b2c-payment-architecture]] (the opposite model — you _do_ split funds, so you need a PA/Route), [[payment-integration]], [[cashfree-integration]], and `security/india-saas-legal`, `security/india-dpdp`.
