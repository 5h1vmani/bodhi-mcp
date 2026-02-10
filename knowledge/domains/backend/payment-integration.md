---
domain: backend
topic: payment-integration
tags: [payments, razorpay, refunds, idempotency]
complexity: advanced
last_updated: 2026-01-29
---

# Payment Gateway Integration & Cost Optimization

> Decision framework for gateway selection, idempotent payment flows, refund handling, and fee reduction -- focused on India-first apps.

## TL;DR

- **Idempotency keys on every payment request** -- network retries and double-clicks cause duplicate charges; UUID per logical operation, checked server-side before processing
- **Webhooks are unreliable by design** -- verify signatures, deduplicate by event ID, ACK fast (return 200), process async, reconcile periodically
- **UPI is 0% MDR in India** -- steer users toward UPI to cut fees; cards cost 2%+ GST; international cards 3-4%+
- **Refunds must link to original transactions** -- unlinked refunds inflate revenue figures; automate reconciliation across settlement cycles
- **Route payments to cheapest acquirer** -- multi-gateway setup lets you negotiate fees; local acquirers always cheaper than cross-border

## Decision Guide

| Scenario                              | Approach                                                             | Why                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| India-first D2C / EdTech startup      | Razorpay (primary) + Cashfree (backup/payout)                        | Best UPI integration; 0% MDR under ₹2K; T+2 settlement; wide local method support                    |
| SaaS with international subscriptions | Stripe (primary) + Razorpay (India fallback)                         | Stripe excels at recurring billing, 135+ currencies, developer experience; Razorpay for domestic UPI |
| Fastest fund access needed            | Cashfree with T+1 settlement (or instant at 1% fee)                  | Cashfree leads settlement speed; Razorpay instant costs ₹1-5/txn                                     |
| High-volume (>₹5L/month)              | Negotiate custom rates with gateway; multi-processor setup           | Volume unlocks lower interchange; multi-processor gives negotiation leverage                         |
| Network timeout during payment        | Idempotency key (UUID) attached to every create-payment call         | Gateway deduplicates by key; returns original result on retry without double-charging                |
| User double-clicks pay button         | Client-side disable + server-side idempotency key                    | UI prevents duplicate submission; idempotency key is the safety net                                  |
| Webhook delivery failure              | Queue-first processing + periodic API reconciliation job             | Webhook may never arrive; reconciliation job catches gaps by comparing against gateway API           |
| Processing refunds                    | Link refund to original `payment_id`; track across settlement cycles | Unlinked refunds distort revenue; gateways may deduct from future settlements                        |
| Reducing card processing fees         | Steer UPI (0%), offer bank transfer incentives, batch settlements    | Cards cost 2%+; UPI is free under ₹2K; batching reduces per-transaction overhead                     |
| B2B payments                          | Level 2/3 card processing with enhanced data                         | Issuers give lower interchange for detailed transaction data; settle within 24hrs for best rates     |

## India Gateway Pricing (2025)

| Feature             | Razorpay               | Stripe                     | Cashfree               |
| ------------------- | ---------------------- | -------------------------- | ---------------------- |
| Setup fee           | ₹0                     | ₹0                         | ₹0 (annual fee)        |
| Domestic cards      | ~2% + GST              | 2%                         | 1.90-1.95% + GST       |
| International cards | 3-4.3% + GST           | 3%                         | ~1.90% + GST           |
| UPI                 | 0% (<₹2K)              | 0.3%                       | 0.5%                   |
| Settlement          | T+2                    | T+4                        | T+1                    |
| Instant payout      | ₹1-5/txn               | No                         | 1% extra               |
| India availability  | Full                   | Invite-only (2025)         | Full                   |
| Best for            | UPI-first, D2C, EdTech | Global SaaS, subscriptions | Fast payouts, low fees |

## Idempotency & Webhook Patterns

### Idempotency Flow

```
Client generates UUID → attaches as idempotency_key → sends payment request
Server checks: key exists in DB?
  → YES: return stored result (no processing)
  → NO: process payment, store key + result, return response
```

| Rule           | Detail                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Key format     | UUID v4 per logical operation (not per HTTP request)                                                   |
| Storage        | DB with unique index on idempotency key                                                                |
| TTL            | Minimum 7 days (Adyen standard); Stripe keeps indefinitely                                             |
| Race condition | Two simultaneous requests with same key → one processes, other gets transient error with `retry: true` |
| Retry strategy | Exponential backoff with jitter; max 5 retries; cap at 30 seconds                                      |

### Webhook Reliability Flow

```
Gateway sends webhook → your endpoint:
  1. Verify signature (HMAC-SHA256)
  2. Check event ID in processed_events table
  3. If duplicate → return 200 immediately
  4. If new → enqueue for async processing → return 200
  5. Worker processes event → updates order status
  6. Reconciliation cron compares gateway API vs local records (hourly/daily)
```

| Rule                | Detail                                                         |
| ------------------- | -------------------------------------------------------------- |
| Response time       | Return 200 within 5 seconds; process async                     |
| Signature           | Always verify; reject unsigned/tampered webhooks               |
| Deduplication       | Store `event_id` with unique DB index; check before processing |
| Out-of-order events | Use event timestamps + state machine; ignore stale transitions |
| Reconciliation      | Periodic job queries gateway API; backfills missing events     |
| Dead letter         | After max retries, route to DLQ for manual investigation       |

## Refund Reconciliation

| Issue                                          | Impact                                             | Fix                                                                      |
| ---------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| Refund not linked to original payment          | Revenue inflated in reports                        | Always pass original `payment_id` when creating refund                   |
| Refund appears in different settlement cycle   | Cash flow reporting mismatch                       | Track refunds by settlement date, not creation date                      |
| Gateway deducts refund from future settlements | Unexpected balance reduction                       | Model refunds as deductions in settlement reconciliation                 |
| Partial refund tracking                        | Overpayment or underpayment to customer            | Track partial amounts against original; flag when total exceeds original |
| Chargeback vs refund confusion                 | Different fee structures; chargebacks cost $15-100 | Proactive refund is always cheaper than lost chargeback dispute          |

## Cost Optimization Checklist

| Strategy                                          | Savings Potential                        | Effort                   |
| ------------------------------------------------- | ---------------------------------------- | ------------------------ |
| Steer users to UPI (India)                        | Eliminates 2% card fee                   | Low -- UI nudge          |
| Negotiate volume rates (>₹5L/month)               | 0.2-0.5% reduction                       | Low -- one call          |
| Multi-processor setup for routing                 | 0.1-0.3% via optimal routing             | Medium -- integration    |
| Batch similar transactions                        | Reduces per-txn overhead                 | Medium -- scheduling     |
| Prevent chargebacks (AVS, 3DS, clear descriptors) | $15-100 per avoided dispute              | Low -- config            |
| Complete PCI compliance annually                  | Avoids $20+/month non-compliance penalty | Low -- annual task       |
| Quarterly fee review                              | Catches rate creep                       | Low -- calendar reminder |
| Level 2/3 processing for B2B                      | Lower interchange on enriched data       | High -- data integration |

## Common Mistakes

| Mistake                                             | Fix                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| No idempotency key on payment creation              | Generate UUID per payment attempt; attach to every create call               |
| Processing webhooks synchronously                   | Return 200 fast; enqueue for async processing                                |
| No webhook signature verification                   | Verify HMAC-SHA256 on every webhook; reject unsigned                         |
| Relying only on webhooks for payment status         | Add reconciliation cron that queries gateway API for gaps                    |
| Logging full payment objects (card numbers, tokens) | Log only IDs and status; never log raw card data                             |
| Same gateway for all markets                        | Use India gateway (Razorpay/Cashfree) for domestic; Stripe for international |
| Ignoring settlement timing in cash flow             | Model T+1/T+2/T+4 settlement delays in financial projections                 |
| No retry limit on failed webhooks                   | Cap retries (5x with exponential backoff); route to DLQ after exhaustion     |
| Refunding without linking to original transaction   | Always pass `payment_id`; track partial refund totals                        |
| Accepting chargeback losses without dispute         | Contest with evidence; proactive refunds are cheaper than lost disputes      |

## Checklist

- [ ] Idempotency key (UUID v4) generated and attached to every payment creation request
- [ ] Webhook endpoint verifies signature before processing
- [ ] Webhook events deduplicated by event ID (unique DB index)
- [ ] Webhook processing is async (return 200 within 5 seconds)
- [ ] Reconciliation job compares local records vs gateway API (at least daily)
- [ ] Refunds linked to original `payment_id` with partial amount tracking
- [ ] UPI prominently offered in checkout flow (India)
- [ ] Gateway fees reviewed quarterly; volume discounts negotiated
- [ ] No raw card data logged anywhere in the system
- [ ] PCI DSS compliance completed (avoids penalty fees)
- [ ] Chargeback prevention enabled (AVS, 3DS, clear billing descriptors)
- [ ] Settlement timing modeled in cash flow projections
- [ ] Dead letter queue configured for failed webhook deliveries

## References

- [Stripe: Ecommerce Payment Reconciliation](https://stripe.com/resources/more/ecommerce-payment-reconciliation-101) -- Reconciliation patterns
- [Adyen: API Idempotency](https://docs.adyen.com/development-resources/api-idempotency) -- Idempotency key specification
- [Apidog: Payment Webhook Best Practices](https://apidog.com/blog/payment-webhook-best-practices/) -- Webhook reliability patterns
- [Spreedly: Payment Gateway Fees](https://www.spreedly.com/blog/payment-gateways-fees-and-pricing) -- Fee structure breakdown
- [Payrails: Lower Processing Costs](https://www.payrails.com/blog/8-ways-to-lower-payment-processing-costs) -- Cost optimization strategies
- [Pine Labs: Payment Reconciliation](https://www.pinelabs.com/blog/your-guide-to-the-best-practices-of-payment-reconciliation) -- Reconciliation best practices
- [EnKash: India Gateway Fees 2025](https://www.enkash.com/resources/blog/payment-gateway-fees-in-india-what-to-expect-in-2025) -- India pricing landscape

## Related

- [Offers & Discounts](./offers-discounts.md) -- Coupon architecture and MRR-safe discounting

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
