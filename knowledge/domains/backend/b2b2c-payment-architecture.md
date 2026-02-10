---
domain: backend
topic: b2b2c-payment-architecture
tags: [b2b2c, white-label, revenue-share, razorpay-route, multi-tenant-payments]
complexity: advanced
last_updated: 2026-01-29
---

# B2B2C White-Label Payment & Revenue Architecture

> Decision framework for payment routing, revenue share, tax compliance, and tenant payment isolation in a white-label platform where you run the product and tenants bring the audience.

## TL;DR

- **You are the principal, not the agent** -- you control the platform, set pricing, bear fulfillment risk; recognize revenue gross, then pay tenant their share (ASC 606 principal test)
- **Razorpay Route for automated splits** -- collect full payment → auto-split platform share vs tenant share to linked accounts; handles compliance and settlement
- **E-Commerce Operator = mandatory GST TCS** -- platform collects 0.5% TCS on net taxable supplies + 0.1% TDS (Section 194O) on gross sales >₹5L/year; file GSTR-8 monthly
- **Per-tenant payment data isolation is non-negotiable** -- PCI DSS 4.0 Appendix A1 requires logical separation + penetration testing every 6 months for multi-tenant providers
- **Revenue share ≠ commission** -- model as gross revenue with cost-of-revenue payout to tenant; avoids ECO commission GST complications on your own share

## Decision Guide

| Scenario                                                | Approach                                                                                           | Why                                                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Student pays for test prep on tenant's white-label site | Razorpay Route: collect full amount → auto-split (platform % + tenant %) to linked accounts        | Single checkout; automated reconciliation; compliance handled by Route                                 |
| Determining revenue recognition (gross vs net)          | Recognize gross (principal) -- you control platform, set price, bear fulfillment risk              | ASC 606 principal indicators: primary fulfillment responsibility + pricing discretion + inventory risk |
| Tenant onboarding for payment splits                    | Create Razorpay Linked Account per tenant; KYC via Route onboarding API                            | Each tenant needs separate settlement account; Route handles KYC compliance                            |
| GST TCS obligation as platform                          | Collect 0.5% TCS on net taxable supplies; deposit within 10 days of month-end; file GSTR-8         | Section 52 CGST Act; mandatory for e-commerce operators regardless of turnover                         |
| Income Tax TDS on tenant payouts                        | Deduct 0.1% TDS (Section 194O) on gross sales >₹5L/year per tenant                                 | Overrides other TDS sections; exemption below ₹5L if PAN furnished                                     |
| GST on platform's revenue share                         | Platform's share is service income taxed at 18% GST; tenant claims ITC                             | Commission/service fee attracts standard GST rate                                                      |
| Tenant wants to see their earnings                      | Per-tenant revenue dashboard: gross collections, TCS/TDS deductions, platform fee, net payout      | Transparency prevents disputes; audit trail for both parties                                           |
| Protecting tenant payment data from other tenants       | Row-level isolation (tenant_id) + per-tenant encryption keys + separate Razorpay linked accounts   | PCI DSS 4.0 A1: logical separation + 6-month pen test required                                         |
| Refund initiated by student                             | Refund from platform's Razorpay account; reverse proportional amounts from tenant's linked account | Razorpay Route supports transfer reversals; keeps reconciliation clean                                 |
| Tenant disputes revenue share calculation               | Immutable audit log of every transaction with split breakdown                                      | Log: payment_id, gross amount, TCS, TDS, platform fee, tenant payout, timestamp                        |

## Revenue Flow Architecture

| Step             | What Happens                                                               | Who Pays/Receives                                   |
| ---------------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| 1. Student pays  | Full amount collected via Razorpay checkout on tenant's white-label domain | Student → Razorpay                                  |
| 2. TCS deducted  | 0.5% TCS on net taxable supply withheld                                    | Razorpay withholds → deposits to govt               |
| 3. Route splits  | Remaining amount split per configured ratio                                | Razorpay → Platform account + Tenant linked account |
| 4. Platform fee  | Platform's revenue share portion settled to platform account               | Razorpay → Platform                                 |
| 5. Tenant payout | Tenant's share settled to their linked account (T+2)                       | Razorpay → Tenant                                   |
| 6. TDS on payout | Platform deducts 0.1% TDS before tenant payout (if >₹5L/year)              | Platform withholds → deposits to govt quarterly     |
| 7. GST invoice   | Platform issues tax invoice to tenant for service fee (18% GST)            | Tenant pays GST on platform commission              |

## Principal vs Agent Determination

| ASC 606 Indicator                  | Your Platform (White-Label)                                                   | Conclusion          |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------------- |
| Primary fulfillment responsibility | You build, host, and deliver the test prep product                            | → Principal         |
| Inventory / financial risk         | You bear infrastructure cost regardless of sales                              | → Principal         |
| Pricing discretion                 | You set or approve pricing; tenant markets but doesn't set price unilaterally | → Principal         |
| Control before transfer            | Student accesses your platform; you control the service delivery              | → Principal         |
| **Result**                         | **Recognize revenue gross; tenant payout = cost of revenue**                  | **Gross reporting** |

## India Tax Compliance (ECO Obligations)

| Obligation                    | Rate                           | Threshold                                          | Filing           | Deadline           |
| ----------------------------- | ------------------------------ | -------------------------------------------------- | ---------------- | ------------------ |
| GST TCS (Section 52 CGST)     | 0.5% (0.25% CGST + 0.25% SGST) | No threshold; mandatory for all ECOs               | GSTR-8 monthly   | 10th of next month |
| Income Tax TDS (Section 194O) | 0.1% on gross sales            | Exempt if tenant gross <₹5L/year and PAN furnished | TDS return (26Q) | Quarterly          |
| GST on platform commission    | 18%                            | Standard rate                                      | GSTR-1/GSTR-3B   | Monthly/quarterly  |
| Annual reconciliation         | —                              | —                                                  | GSTR-9B          | Dec 31 of next FY  |

## Tenant Payment Data Isolation

| Layer          | Control                                                   | Implementation                                                                       |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Application    | tenant_id on every payment record; enforce in all queries | Row-level security policies; never allow cross-tenant queries                        |
| Encryption     | Per-tenant encryption keys via KMS                        | AWS KMS or equivalent; rotate keys per tenant independently                          |
| Gateway        | Separate Razorpay Linked Account per tenant               | Tenant funds never commingled; separate settlement cycles                            |
| Audit          | Per-tenant audit trails; immutable logs                   | Tenant can only view their own transaction history                                   |
| Access control | RBAC scoped to tenant; no shared admin roles              | Tenant admin sees only their data; platform admin has cross-tenant access with audit |
| Compliance     | PCI DSS 4.0 Appendix A1                                   | Logical separation + penetration test every 6 months                                 |

## Common Mistakes

| Mistake                                                                | Fix                                                                                                      |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Treating yourself as agent (net revenue) when you control the platform | Apply ASC 606 principal test: fulfillment responsibility + pricing discretion + risk = principal = gross |
| Commingling tenant funds in single Razorpay account                    | One Linked Account per tenant via Razorpay Route; funds are legally separated                            |
| Forgetting TCS obligation as e-commerce operator                       | Register as ECO; collect 0.5% TCS; file GSTR-8 by 10th of next month                                     |
| Not deducting TDS on tenant payouts above ₹5L                          | Automate 194O TDS deduction in payout logic; file 26Q quarterly                                          |
| Manual revenue share calculation (spreadsheets)                        | Configure split ratios in Razorpay Route; auto-split on every payment                                    |
| No audit trail for split calculations                                  | Log every transaction: gross, TCS, TDS, platform fee, tenant payout with timestamps                      |
| Same encryption key for all tenant payment data                        | Per-tenant KMS keys; PCI DSS 4.0 A1 requires cryptographic isolation                                     |
| Tenant can see other tenants' transaction data                         | Row-level security + tenant-scoped API tokens; pen test every 6 months                                   |
| GST calculated on gross amount instead of discounted price             | Apply GST on post-discount amount; invoice must show original price, discount, and taxable value         |
| No reconciliation between Route splits and actual settlements          | Daily automated reconciliation: compare Route transfer records vs bank settlement statements             |

## Checklist

- [ ] Platform registered as E-Commerce Operator under GST
- [ ] Razorpay Route configured with Linked Account per tenant
- [ ] Split ratios configured per tenant agreement (revenue share %)
- [ ] TCS (0.5%) collection automated on net taxable supplies
- [ ] TDS (0.1% under 194O) deduction automated on tenant payouts >₹5L/year
- [ ] GSTR-8 filing process established (monthly by 10th)
- [ ] Platform issues GST tax invoice to tenant for service fee (18%)
- [ ] Revenue recognized gross (principal); tenant payout as cost of revenue
- [ ] Per-tenant payment data isolation: row-level security + per-tenant encryption keys
- [ ] Separate Razorpay Linked Account per tenant (funds not commingled)
- [ ] Immutable audit log for every payment split (gross, TCS, TDS, fees, net payout)
- [ ] Per-tenant revenue dashboard showing collections, deductions, and net payouts
- [ ] Refund flow reverses proportional amounts from tenant's linked account
- [ ] PCI DSS 4.0 Appendix A1 compliance: logical separation + 6-month pen test
- [ ] Daily reconciliation: Route transfers vs bank settlements vs internal records

## References

- [Razorpay Route: Split & Distribute Payments](https://razorpay.com/route/) -- Linked accounts, auto-splits, transfer reversals
- [Razorpay Route Documentation](https://razorpay.com/docs/payments/route/) -- API reference for splits and linked account onboarding
- [ClearTax: TCS Under GST](https://cleartax.in/s/tcs-under-goods-and-services-tax) -- ECO obligations, rates, filing (GSTR-8)
- [ClearTax: Section 194O TDS](https://cleartax.in/s/section-194o) -- E-commerce operator TDS on participant payouts
- [RevenueHub: Principal/Agent (Gross vs Net) in ASC 606](https://www.revenuehub.org/article/principalagent-considerations-gross-vs-net) -- Determination framework
- [HubiFi: Principal vs Agent ASC 606](https://www.hubifi.com/blog/agent-vs-principal-revenue) -- Practical indicators and examples
- [OBS Global: PCI DSS 4.0 Multi-Tenant Service Providers](https://info.obsglobal.com/pci-dss-4.0/multi-tenant-service-providers) -- Appendix A1 requirements
- [Brilworks: Secure White Label Software Architecture](https://www.brilworks.com/blog/secure-white-label-software-architecture-checklist/) -- Tenant isolation checklist
- [Startup Movers: E-Commerce Compliance India](https://www.startup-movers.com/e-commerce-compliance-in-india) -- GST, TDS, TCS obligations for platforms

## Related

- [Payment Integration](./payment-integration.md) -- Gateway selection, idempotency, webhook reliability
- [Offers & Discounts](./offers-discounts.md) -- Coupon architecture and MRR-safe discounting
- [India SaaS Legal](../security/india-saas-legal.md) -- Legal documents, DPDP, multi-tenant DPA

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
