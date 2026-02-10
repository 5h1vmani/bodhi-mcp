---
domain: ux
topic: conversion
tags: [conversion, trust, checkout, abandonment, pricing]
complexity: intermediate
last_updated: 2025-01-24
---

# Conversion Optimization

> Patterns for reducing abandonment and building trust in checkout and signup flows.

## TL;DR

- Show **total price early** - unexpected costs cause 48% of abandonment
- Place **trust signals near payment fields** (security badges, guarantees)
- Use **guest checkout** - forced account creation causes 26% abandonment
- Frame price as **cost-per-unit** ("Just $2/lesson" vs "$200 total")
- **Money-back guarantee** below CTA button, not buried in footer

## Top Abandonment Reasons

| Reason                   | % Users | Solution                           |
| ------------------------ | ------- | ---------------------------------- |
| Unexpected costs         | 48%     | Show price early, no surprises     |
| Forced account creation  | 26%     | Guest checkout + auto-create after |
| Complicated checkout     | 22%     | Single-page accordion              |
| Didn't trust site        | 19%     | Trust signals, security badges     |
| Couldn't calculate total | 17%     | Real-time order summary            |

## Trust Signals

### Placement Strategy

Fewer well-placed badges outperform scattered badges (Baymard). Limit to 2-3 trust signals near the action point, not 5+ across the page.

| Location          | Signal Type                        | Priority                                  |
| ----------------- | ---------------------------------- | ----------------------------------------- |
| Near payment form | Lock icon + payment processor logo | Required -- highest-impact placement      |
| Below CTA         | Money-back guarantee text          | Required -- reduces final-step hesitation |
| Above form        | Customer count or rating (if real) | Optional -- only if verifiable            |

**Don't scatter badges across header, sidebar, and footer.** Multiple scattered badges signal insecurity, not security. See [premium-checkout-design.md](./premium-checkout-design.md) for the 1-2 badge rule.

## Money-Back Guarantee

**Primary placement:** Below CTA button

**Copy template:**

```
🛡️ 30-Day Money-Back Guarantee
Not satisfied? Get a full refund within 30 days—no questions asked.
```

**Guarantee types:**

- Time-based: "30-day money-back guarantee"
- Outcome-based: "Get results or full refund"
- Satisfaction-based: "100% satisfaction guaranteed"

## Price Presentation

### Value Framing

**Cost-per-unit:** "$199 for complete course → That's just $2 per lesson (100 video lessons)"

**Comparison anchoring:** "Private coaching: $100-200/hour → Our course: $2/lesson"

**Outcome framing:** "Average 30% improvement in 60 days • 93% report better results"

### Subscription Pricing

Show monthly vs annual side-by-side:

- Pre-select recommended option
- Display savings clearly ("Save $120 vs monthly")
- Explain billing cycle ("billed as $228/year")

## Order Summary

**Desktop:** Always visible sidebar with real-time updates

- Itemized breakdown (subtotal, discounts, tax)
- Total prominently displayed
- Key benefits below ("Cancel anytime", "30-day guarantee")

**Mobile:** Collapsible header showing total, expandable for full breakdown

## Guest Checkout

**Pattern:**

1. Don't require account creation upfront
2. Collect email early (for cart recovery)
3. After purchase, offer account creation with password field and skip option

**Post-purchase prompt:** "Create a password to access your purchases anytime" with [Create Account] / [Skip for now] buttons

## Cart Abandonment Recovery

### Email Sequence

| Email | Timing   | Content                                    |
| ----- | -------- | ------------------------------------------ |
| 1     | 1 hour   | "Complete your order" + cart contents      |
| 2     | 24 hours | "Still thinking?" + social proof           |
| 3     | 72 hours | "Last chance" + small incentive (optional) |

### Exit-Intent Popup

Trigger on mouse moving toward browser close/back:

- "Wait! Your cart is waiting 🛒"
- Offer to save cart via email
- Alternative: chat with support, show testimonial, or offer discount (use sparingly)

## Testimonials

**Placement:** Near signup/checkout form, sidebar (desktop), above fold

**Format requirements:**

- Specific outcome/result with numbers
- Name and role/title
- Photo (increases trust)
- Star rating

**Social proof numbers:** "Trusted by 50,000+ customers • ★★★★★ 4.8/5 from 2,400 reviews"

## Express Payment

Place express payment options (Apple Pay, Google Pay, PayPal) at TOP of checkout with "or pay with card" divider before card form. Express payment can reduce checkout time by 40%.

## Common Mistakes

| Mistake                           | Fix                                               |
| --------------------------------- | ------------------------------------------------- |
| Hiding total until final step     | Show running total throughout                     |
| Requiring account before checkout | Guest checkout with post-purchase account offer   |
| Trust badges buried in footer     | Place near payment fields and CTA                 |
| Generic guarantee text            | Specific: "30-day money-back, no questions asked" |
| No social proof                   | Add customer count, ratings, testimonials         |

## Checklist

Before shipping checkout:

- [ ] Total price visible from start
- [ ] Guest checkout available
- [ ] Security badges near payment fields
- [ ] Money-back guarantee below CTA
- [ ] Express payment options (Apple Pay, etc.)
- [ ] Order summary always visible (desktop)
- [ ] Cart abandonment email set up
- [ ] At least one testimonial visible
- [ ] Price anchoring/framing used

---

## Changelog

| Date       | Change                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-30 | Fix: reduce trust badge placement from 5+ scattered locations to 2-3 focused signals (aligned with Baymard research and premium-checkout-design.md) |
| 2025-01-24 | Initial version                                                                                                                                     |
