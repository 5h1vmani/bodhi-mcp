---
domain: backend
topic: offers-discounts
tags: [coupons, discounts, saas-billing, abuse-prevention]
complexity: intermediate
last_updated: 2026-01-29
---

# Offers, Discounts & Coupon Architecture

> Decision framework for building discount systems that don't destroy MRR, leak revenue, or get abused.

## TL;DR

- **SaaS discounting lowers LTV by 30%** -- Price Intelligently research shows discounted customers churn faster; discount one-time fees first, protect recurring revenue
- **Every coupon needs: max redemptions, expiry, user-level cap, and audit trail** -- without all four, abuse is guaranteed
- **Discount engine = rules + evaluation + tracking** -- separate discount logic from checkout logic; rules define eligibility, engine evaluates, tracker enforces limits
- **Time-bound flat discounts at catalog level** -- prevents "one-time" deals from renewing indefinitely; keeps ASC 606 compliance clean
- **Validate server-side, never trust client-submitted discount amounts** -- client sends coupon code only; server looks up and applies the amount

## Decision Guide

| Scenario                                        | Approach                                                                  | Why                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| New user acquisition offer                      | Time-limited % discount on first billing period only                      | Limits revenue impact; creates urgency; doesn't reduce LTV of recurring payments          |
| Annual plan incentive                           | Offer 2 months free (not %) on annual commitment                          | Preserves monthly MRR perception; locks in longer commitment; cleaner revenue recognition |
| Seasonal sale (Diwali, Black Friday)            | Public coupon with hard expiry + total redemption cap                     | Urgency drives conversion; cap prevents runaway liability; easy to track ROI              |
| Loyalty / retention discount for churning users | Private coupon tied to user segment; % off for N months                   | Targeted prevents dilution; time-bound protects long-term MRR                             |
| B2B enterprise pricing                          | Custom quote with approval workflow; no coupon codes                      | Coupons leak; enterprise deals need signed contracts with specific terms                  |
| Referral program                                | Unique code per referrer; reward on referee's first payment (not signup)  | Pay-on-payment prevents fake referral abuse; unique codes enable attribution              |
| Bundle / cross-sell discount                    | Cart-level discount with minimum qualifying items/value                   | Increases AOV; minimum threshold prevents gaming                                          |
| Student / educator discount                     | Verification-gated (SheerID, manual verification); annual re-verification | Prevents non-students from claiming; re-verification catches expired status               |
| Free trial                                      | No coupon needed; use billing system's trial period feature               | Cleaner than 100% discount; proper state machine (trial → active → cancelled)             |
| Flash sale with limited inventory               | Coupon + inventory lock (reserve on apply, release on timeout)            | Prevents overselling; timeout releases abandoned reservations                             |

## Discount Engine Architecture

| Component           | Responsibility                                       | Example                                                            |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| Coupon entity       | Code, type (% / flat / free months), value, metadata | `DIWALI25` → 25% off, max 500 uses, expires Nov 15                 |
| Rules engine        | Eligibility conditions evaluated at apply-time       | Min cart ₹999, first purchase only, specific plan tier             |
| Evaluation engine   | Calculates discount amount given cart + rules        | ₹2,499 plan × 25% = ₹624.75 discount                               |
| Tracking store      | Redemption counts, per-user usage, audit log         | User X redeemed `DIWALI25` on 2025-11-01; 312/500 total uses       |
| Billing integration | Applies discount to invoice; handles renewal logic   | Discount applies to invoice #1 only; invoice #2 charges full price |

## Abuse Prevention Matrix

| Attack Vector                             | Control                                                         | Implementation                                                                 |
| ----------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Same user redeeming multiple times        | Per-user redemption cap (usually 1)                             | Track `user_id` + `coupon_id` in redemptions table; unique constraint          |
| Fake accounts for repeated use            | Device fingerprinting + email domain check + phone verification | Block disposable email domains; require phone OTP for discount                 |
| Coupon code sharing (public leak)         | Private codes with segment targeting; unique single-use codes   | Generate unique codes per user/campaign; invalidate on leak detection          |
| Stacking multiple discounts               | Stacking rules in engine (allow/deny/max stack count)           | Default: no stacking; explicit opt-in for approved combinations                |
| Discount applied to wrong products        | Product-level eligibility rules                                 | Coupon scoped to specific SKUs / plan tiers                                    |
| "One-time" discount renewing indefinitely | Time-bound at catalog level with explicit duration              | `duration: once` or `duration_months: 3`; billing system enforces              |
| Client-side discount manipulation         | Server-side validation only                                     | Client sends code; server looks up amount; never trust client-submitted values |
| Bulk automated redemption (bots)          | Rate limiting + CAPTCHA on coupon apply endpoint                | Max 3 coupon attempts per minute per session                                   |

## SaaS Revenue Impact

| Discount Type                | MRR Impact               | LTV Impact                              | When to Use                                   |
| ---------------------------- | ------------------------ | --------------------------------------- | --------------------------------------------- |
| % off first month            | Low (one period)         | Moderate (churn risk if no value shown) | Acquisition only; pair with onboarding        |
| Flat ₹ off first month       | Lowest                   | Lowest                                  | Small nudge for price-sensitive segment       |
| N months free on annual      | None (already committed) | Positive (locks in commitment)          | Annual plan incentive                         |
| Perpetual % discount         | High (every period)      | Severe (30% LTV reduction per research) | Almost never; reserved for strategic partners |
| Usage credit (not price cut) | None                     | Positive (encourages adoption)          | Growth-stage SaaS; drives feature usage       |
| Extended trial (no coupon)   | None                     | Neutral                                 | Evaluation-heavy products; enterprise         |

## ASC 606 / Revenue Recognition

| Rule                                                 | Implication                                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| Discount must map to specific performance obligation | Tie coupon to SKU/plan, not arbitrary cart amount                 |
| Time-bound discounts need clear duration             | `duration: once` or `duration_months: N` in coupon entity         |
| Free periods affect deferred revenue balance         | Allocate transaction price across all periods including free ones |
| Renewal pricing must be explicit                     | State full price resumes after discount period ends               |

## Common Mistakes

| Mistake                                                | Fix                                                                                              |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| No redemption cap on public coupon                     | Set total cap + per-user cap on every coupon                                                     |
| No expiry date on coupons                              | Every coupon gets an expiry; no exceptions                                                       |
| Discount amount submitted by client                    | Server looks up coupon and calculates discount; client sends code only                           |
| Flat discount renewing every billing cycle             | Set `duration: once` or explicit month count at catalog level                                    |
| No audit trail for coupon operations                   | Log creation, application, removal with timestamp + user + reason                                |
| Same discount strategy for all user segments           | Segment: new users get acquisition offers; churning users get retention offers                   |
| Discounting recurring revenue instead of one-time fees | Discount setup fees, onboarding fees first; protect MRR                                          |
| No approval workflow for enterprise discounts          | Require manager approval for discounts >X% or >₹Y amount                                         |
| Ignoring GST on discounted amount (India)              | Apply GST on the discounted price, not original; invoice must show both                          |
| Measuring coupon success by redemptions only           | Track: redemption count, revenue impact, cohort retention, LTV of discounted vs full-price users |

## Checklist

- [ ] Every coupon has: expiry date, total redemption cap, per-user cap
- [ ] Discount amount calculated server-side only (client sends code, not amount)
- [ ] Coupon stacking rules defined and enforced (default: no stacking)
- [ ] Time-bound discounts have explicit duration in coupon entity
- [ ] Billing system stops applying discount after defined duration
- [ ] Audit log captures all coupon CRUD and redemption events
- [ ] Abuse prevention: rate limiting on apply endpoint, disposable email blocking
- [ ] Revenue impact tracked per coupon campaign (redemptions, MRR delta, cohort LTV)
- [ ] Enterprise discounts require approval workflow
- [ ] GST calculated on discounted price (India)
- [ ] Referral rewards triggered on payment, not signup
- [ ] Free trials use billing system trial feature, not 100% discount coupon

## References

- [Chargebee: Promotional Coupons in SaaS](https://www.chargebee.com/blog/5-ways-promotional-coupons-saas-company/) -- SaaS coupon strategy patterns
- [Ordway Labs: SaaS Coupons & ASC 606 FAQ](https://ordwaylabs.com/faqs/coupons-discounts/) -- Revenue recognition implications
- [Ibbaka: Deconstructing SaaS Discounting](https://www.ibbaka.com/ibbaka-market-blog/deconstructing-saas-discounting) -- LTV impact research and discount-first-what analysis
- [GeeksforGeeks: Coupon Management System Design](https://www.geeksforgeeks.org/design-coupon-and-voucher-management-system/) -- System architecture components
- [Medium: Building a Flexible Discount Engine](https://medium.com/@sammyasopa/building-a-flexible-discount-engine-b9f4fba3af51) -- Rules engine architecture
- [PayPro Global: SaaS Discount Strategy](https://payproglobal.com/how-to/set-up-saas-discount-strategy/) -- 6-step strategy framework
- [Voucherify: Coupon UX Best Practices](https://www.voucherify.io/blog/coupon-promotions-ui-ux-best-practices-inspirations) -- Frontend coupon patterns

## Related

- [Payment Integration](./payment-integration.md) -- Gateway selection, fees, refund handling

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
