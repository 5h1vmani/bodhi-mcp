---
domain: backend
topic: startup-financial-metrics
tags: [metrics, fundraising, unit-economics, india]
complexity: advanced
last_updated: 2026-02-07
---

# Startup Financial Metrics by Audience & Stage

> Decision framework for which metrics to track, when, and which to show to investors vs clients vs your internal team -- synthesized from a16z, YC, Indian VC practices, DPIIT/RBI compliance, and EdTech benchmarks.

## TL;DR

- **Same metric, different audience** -- investors want LTV:CAC and ARR; enterprise clients want cost-per-unit and uptime; internal team needs burn and runway; showing the wrong metric to the wrong audience wastes the meeting
- **India adds 3 compliance line items most founders miss** -- GST on gateway fees (18% on the 2%, not on revenue), TDS timing gaps (cash vs accrual mismatch), and FEMA FC-GPR dual-currency reporting for foreign raises; these distort standard SaaS metrics if not separated
- **Post-2022 VC shift: spreadsheets over FOMO** -- US VCs now require CAC payback <12mo and LTV:CAC >3:1 before Series A; Indian VCs (Peak XV, Blume) added governance quality as a gating criterion after Byju's; UK VCs raised revenue bar 75% vs 2021
- **Track payment gateway cost as a separate line item** -- at 70% UPI mix it's 0.7% of revenue; at 70% cards it's 2.4%; this swing can be the difference between 95% and 92% gross margin, which changes your valuation multiple

## Decision Guide

| Scenario                             | Metrics to Show                                                                               | Why                                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Internal weekly review               | Cash balance, runway (months), net burn, MoM revenue growth, cost per exam                    | Survival metrics only; more than 5 metrics weekly creates noise                                             |
| Internal monthly review              | Add: CAC, LTV:CAC, gross margin, payment method mix, exam completion rate                     | Unit economics need 30-day sample size to be meaningful                                                     |
| Pre-seed pitch (Indian angel)        | Student growth curve, unit economics sketch, runway >18mo, founder-market fit                 | Post-angel-tax-abolition (FY25), Indian angels now weight governance and capital efficiency over raw growth |
| Pre-seed pitch (US accelerator / YC) | MoM growth 10-15%, retention cohorts, TAM narrative                                           | YC screens for growth velocity and founder intensity; financials are optional at this stage                 |
| Seed pitch (Indian VC)               | MRR, LTV:CAC >2:1, gross margin, governance structure                                         | Peak XV and Blume now require board constitution evidence at seed; governance is a gate, not a checkbox     |
| Series A pitch (US VC)               | ARR, LTV:CAC >3:1, CAC payback <12mo, gross margin >70%, net revenue retention                | US VCs are spreadsheet-first post-2022; "FOMO era" is over; every metric must be backed by cohort data      |
| Series A pitch (UK VC, SEIS/EIS)     | Revenue traction (75% higher bar than 2021), R&D spend ratio, 24-36mo runway                  | SEIS/EIS compliance shapes what to show; HMRC R&D credit eligibility requires proving R&D spend             |
| EU VC or EIC grant                   | Unit economics, GDPR compliance cost as visible line item, impact metrics, capital efficiency | GDPR costs (15-25% of early budget) must be surfaced; hiding them in COGS triggers due diligence flags      |
| B2B2C enterprise client pitch        | Cost per exam (₹0.90 infra), uptime SLA, gross margin >95%, scoring pipeline latency          | Clients care about reliability, cost predictability, and white-label economics -- not your growth rate      |
| Board meeting / quarterly review     | ARR + growth, burn multiple, runway, cohort retention, CAC by channel                         | Burn multiple (net burn / net new ARR) <2x signals capital efficiency; >3x triggers board concern           |

## India Compliance Metrics

These three items distort standard SaaS metrics if lumped into generic expense categories.

| Item                       | What Happens                                                                                         | How to Track                                                               | Impact on Metrics                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| GST on gateway fees        | 18% GST charged on the gateway's commission (e.g., 18% on 2% = 0.36% effective), not on your revenue | Separate line: `Payment Processing > GST on Fees`                          | Inflates COGS by 0.3-0.5% if not isolated; distorts gross margin comparison with US SaaS           |
| TDS timing                 | TDS deducted at payment (not accrual); 7-day government deposit required; quarterly filing           | Track TDS receivable as current asset; reconcile quarterly                 | Cash flow statement shows lower operating cash than P&L profit; confuses investors used to US GAAP |
| FEMA FC-GPR dual reporting | Foreign investment must be reported in INR + USD within 30 days of share allocation using TTBR rate  | Maintain dual-currency books from day 1; log TTBR rate at each transaction | Forex gain/loss creates P&L volatility that doesn't reflect operations; disclose separately        |

## Payment Mix Impact on Margins

| UPI : Card Ratio  | Effective Gateway Cost                | Gross Margin (₹500 exam) | Implication                                           |
| ----------------- | ------------------------------------- | ------------------------ | ----------------------------------------------------- |
| 90:10 UPI-heavy   | ~0.24%                                | ~96.5%                   | Best case; steer checkout UX toward UPI               |
| 70:30 (India avg) | ~0.71%                                | ~95.8%                   | Healthy; report this as your base case                |
| 30:70 card-heavy  | ~1.65%                                | ~94.4%                   | If card-heavy, negotiate volume rates above ₹5L/month |
| 0:100 cards only  | ~2.36% (Razorpay) / ~1.90% (Cashfree) | ~93.2-94.0%              | Switch to Cashfree for card-heavy flows; save 0.46%   |

## Common Mistakes

| Mistake                                                  | Fix                                                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Showing same metrics to Indian and US VCs                | Indian VCs gate on governance + capital efficiency; US VCs gate on growth velocity + retention; tailor the emphasis                         |
| Hiding GDPR/compliance cost inside COGS                  | Surface as separate line item; EU VCs specifically look for this; hiding it triggers deeper due diligence                                   |
| Reporting revenue in USD without FEMA compliance         | Maintain INR primary books; USD conversion at TTBR rate on transaction date; file FC-GPR within 30 days                                     |
| Conflating payment gateway fees with infrastructure cost | Gateway fees (0.7-2.4% of revenue) dwarf AWS infra cost (₹0.90/student); separate into `Payment Processing` and `Infrastructure` line items |
| Tracking CAC without channel attribution                 | Blended CAC hides that organic is ₹1,500 while paid is ₹4,000+; report by channel so you know what to scale                                 |
| Using Unacademy's growth playbook                        | Unacademy's LTV:CAC fell to 0.5:1 by over-spending on acquisition; maintain >3:1 before scaling spend                                       |

## Checklist

- [ ] Weekly dashboard tracks exactly 5 metrics: cash, runway, burn, MoM growth, cost per exam
- [ ] Monthly review adds unit economics: CAC (by channel), LTV:CAC, gross margin, payment method mix
- [ ] GST on payment gateway fees tracked as separate line item (not lumped into COGS)
- [ ] TDS receivable tracked as current asset with quarterly reconciliation
- [ ] Dual-currency books maintained from first foreign investment (INR primary, USD at TTBR)
- [ ] Investor deck metrics match the stage-audience matrix in Decision Guide
- [ ] Payment method mix monitored monthly; UPI steering active in checkout UX
- [ ] Burn multiple (net burn / net new ARR) calculated quarterly; <2x target

## References

- [a16z: 16 Startup Metrics](https://a16z.com/16-startup-metrics/) -- Baseline metric definitions and what matters at each stage
- [YC: Key Startup Metrics](https://www.ycombinator.com/library/KR-key-startup-metrics) -- YC's distilled view; growth rate is the primary signal
- [DPIIT Startup Recognition](https://www.startupindia.gov.in/content/sih/en/startupgov/startup_recognition_page.html) -- Section 80-IAC eligibility; <₹100Cr turnover, <10 years
- [Legal500: Angel Tax Abolition](https://www.legal500.com/developments/thought-leadership/abolition-of-angel-tax-in-india-a-boost-for-the-startup-ecosystem/) -- Section 56(2)(viib) removed FY25-26; eliminates 30.9% tax on excess valuations
- [Bain: India VC Report 2025](https://www.bain.com/insights/india-venture-capital-report-2025/) -- Profitability focus; governance gating at seed
- [Sifted: UK R&D Tax Credit Crackdown](https://sifted.eu/articles/uk-startups-tax-credit-crackdown) -- HMRC scrutiny up 20x; 20% of claims now audited vs 1% historically

## Related

- [Payment Integration](./payment-integration.md) -- Gateway fee details, idempotency, webhook patterns
- [B2B2C Payment Architecture](./b2b2c-payment-architecture.md) -- TCS/TDS obligations, revenue splits
- [Pitch Deck Strategy](../marketing/pitch-deck-strategy.md) -- Slide structure, investor psychology, regional expectations

---

## Changelog

| Date       | Change                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 2026-02-07 | Initial version: synthesized from a16z, YC, Indian VC practices, DPIIT/FEMA compliance, EdTech benchmarks |
