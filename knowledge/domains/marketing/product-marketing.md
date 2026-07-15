---
domain: marketing
topic: product-marketing
tags: [product-marketing, positioning, launch, sales-enablement]
complexity: advanced
last_updated: 2026-02-24
confidence: 0.7
source_refs:
  - "Olivine Marketing: Positioning & Messaging Guide"
  - "Product Marketing Alliance: PMM vs Demand Gen"
  - "Directive Consulting: B2B GTM Playbook"
  - "Kalungi: B2B SaaS Messaging Framework"

status: draft
review_by: 2026-08-24
author: claude-opus-4-6 + human-directed
version: 1
---

# Product Marketing

> Operational decision framework for PMM: when to hire, how to structure launches, build battle cards, and maintain the positioning → sales → feedback loop.

## TL;DR

- **PMM bridges product and market** — owns positioning, messaging, launches, and sales enablement. Not demand gen (campaigns) or product management (roadmap)
- **Hire first PMM at Series A** — before that, founder-led positioning works. After Series B, expand to cover launch tiers, competitive intel, and enablement
- **Messaging hierarchy: positioning → messaging → content** — positioning answers "why us?", messaging translates to audience-specific language, content operationalizes into assets. Skip positioning and everything downstream is noise
- **Launch tiers prevent launch fatigue** — Tier 1 (major: full GTM), Tier 2 (moderate: targeted campaign), Tier 3 (minor: changelog + email). Not everything is a "launch"
- **Weekly feedback loops, not annual** — PMM effectiveness depends on win/loss data flowing back from sales into positioning refinement continuously

## Decision Guide

| Scenario                                           | Approach                                                                                       | Why                                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Pre-PMF, no PMM hire yet                           | Founder owns positioning; document ICP + "why us" in one page                                  | Positioning too fluid for dedicated PMM; founder has deepest customer intuition        |
| Series A, first PMM hire                           | PMM covers positioning, messaging, launch coordination, basic battle cards                     | One person can handle core PMM loop; align with demand gen from day one                |
| Series B+, scaling sales team                      | Expand PMM: dedicated competitive intel, tiered launches, sales enablement program             | Sales team can't function without battle cards, objection handling, and launch cadence |
| New market entry / repositioning                   | PMM-led customer research sprint (10+ interviews) → repositioning workshop                     | Can't reposition from a conference room; customer language ≠ internal language         |
| Feature shipping faster than marketing can keep up | Implement launch tier system (Tier 1/2/3)                                                      | Prevents launch fatigue; reserves full GTM energy for what actually moves pipeline     |
| Sales losing to specific competitor                | Competitive battle card sprint: promises, shortfalls, talk tracks                              | Win rate drops trace to messaging gaps, not product gaps, 60%+ of the time             |
| PMM and demand gen misaligned                      | Weekly sync: PMM provides positioning/personas, demand gen feeds back performance + objections | Symbiotic loop; demand gen operationalizes messaging, PMM refines based on results     |

## PMM vs Adjacent Roles

| Responsibility                       | Product Marketing                | Demand Gen                 | Product Management       |
| ------------------------------------ | -------------------------------- | -------------------------- | ------------------------ |
| "What is it and why does it matter?" | Owns                             | Amplifies                  | Informs                  |
| "Who is it for?"                     | Owns (personas, JTBD)            | Targets                    | Validates                |
| "How do we reach them?"              | Informs                          | Owns                       | —                        |
| "What do we build?"                  | Informs (market input)           | —                          | Owns                     |
| Sales enablement                     | Owns (battle cards, talk tracks) | Supports (campaign assets) | Supports (product demos) |
| Competitive intelligence             | Owns                             | —                          | Consumes                 |
| Launch execution                     | Orchestrates                     | Executes campaigns         | Ships product            |
| Win/loss analysis                    | Owns                             | Contributes data           | Consumes insights        |

## Messaging Hierarchy

| Layer       | Answers                                 | Example                                                                        | Owner                           |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------- |
| Positioning | Why should this category of buyer care? | "The only ABM platform that predicts buying windows"                           | PMM (validated with customers)  |
| Messaging   | What do we say to each persona?         | CTO: "Reduce pipeline waste by 40%"; VP Marketing: "Attribution you can trust" | PMM (persona-specific)          |
| Content     | What assets carry the message?          | Blog post, case study, battle card, landing page                               | PMM + demand gen + content team |

**Key rule:** Positioning takes weeks of customer research to get right. Messaging is derived from positioning. Content is derived from messaging. Skipping layers creates misalignment.

## Launch Tiers

| Tier              | Trigger                                         | Activities                                                                              | Timeline       |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- | -------------- |
| Tier 1 (Major)    | New product, new market, major platform shift   | Full GTM: press, analyst briefing, webinar, sales training, email, social, landing page | 6-8 weeks prep |
| Tier 2 (Moderate) | Significant feature, new integration, expansion | Targeted: blog, email sequence, sales one-pager, social campaign                        | 2-4 weeks prep |
| Tier 3 (Minor)    | Feature update, improvement, bug fix            | Lightweight: changelog entry, in-app notification, customer email                       | 1 week or less |

**Decision rule:** If it doesn't change how you sell or who you sell to, it's Tier 3. If it opens a new persona or use case, it's Tier 2. If it requires repositioning, it's Tier 1.

## Battle Cards

| Section               | Content                                                                | Update Cadence                |
| --------------------- | ---------------------------------------------------------------------- | ----------------------------- |
| Competitor overview   | What they promise, pricing, target market                              | Quarterly                     |
| Where they fall short | Specific gaps validated by win/loss data                               | Monthly (from sales feedback) |
| Talk tracks           | "When they say X, we say Y" objection handling                         | Monthly                       |
| Proof points          | Customer quotes, benchmarks, case studies that counter their strengths | Quarterly                     |
| Landmines             | Questions to plant that expose competitor weaknesses                   | Quarterly                     |

**Critical:** Battle cards built without sales input are shelfware. Win/loss interviews are the #1 input.

## Metrics

| Metric                         | What It Measures                                               | Leading/Lagging |
| ------------------------------ | -------------------------------------------------------------- | --------------- |
| Win rate by competitor         | Positioning effectiveness against specific alternatives        | Lagging         |
| Sales asset adoption           | Are reps actually using battle cards, one-pagers, talk tracks? | Leading         |
| Message resonance score        | Buyer feedback on clarity and relevance of positioning         | Leading         |
| Launch pipeline impact         | Pipeline generated within 30/60/90 days of launch              | Lagging         |
| Time-to-first-deal post-launch | How quickly new positioning converts                           | Lagging         |
| Objection theme frequency      | Which objections are rising/falling (positioning health)       | Leading         |

## Common Mistakes

| Mistake                                        | Fix                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Skipping positioning, jumping to content       | Invest 2-4 weeks in customer research + positioning workshop before creating any assets       |
| Feature-led messaging ("we have X capability") | Lead with outcome: "Reduce Y by Z%" — features are proof points, not headlines                |
| Static positioning (set-and-forget)            | Weekly feedback loop: sales objections → PMM refinement → updated messaging                   |
| Every release is a "launch"                    | Implement tier system; reserve Tier 1 energy for what changes how/who you sell to             |
| Battle cards without sales input               | Win/loss interviews are #1 input; cards built from marketing assumptions are shelfware        |
| PMM reports into product (not marketing)       | PMM's primary customer is sales and demand gen; reporting into product creates inward focus   |
| No competitive monitoring cadence              | Monthly competitor review: pricing page changes, new features, positioning shifts, G2 reviews |

## Checklist

- [ ] Positioning documented from customer language (not internal jargon)
- [ ] Messaging hierarchy exists: positioning → persona messaging → content briefs
- [ ] Launch tier system defined (Tier 1/2/3 with clear triggers and activity lists)
- [ ] Battle cards exist for top 3 competitors, updated monthly from win/loss data
- [ ] Weekly PMM ↔ demand gen sync established (messaging performance + objection themes)
- [ ] Win/loss interview program running (minimum 5 interviews/month at scale)
- [ ] Sales enablement adoption tracked (are reps using the assets?)
- [ ] Competitive monitoring cadence set (monthly review of positioning shifts)

## References

- [Olivine: Positioning & Messaging Guide](https://www.olivinemarketing.com/positioning-messaging-guide) — Five-area framework
- [Product Marketing Alliance: PMM vs Demand Gen](https://www.productmarketingalliance.com/product-marketing-the-oil-greasing-the-cogs-of-the-demand-gen-machine/) — Role boundary definitions
- [Directive: B2B GTM Playbook](https://directiveconsulting.com/blog/a-practical-playbook-for-building-a-b2b-go-to-market-strategy/) — Launch methodology
- [Kalungi: SaaS Messaging Framework](https://www.kalungi.com/blog/how-to-make-your-first-b2b-saas-messaging-framework-template-included) — Messaging hierarchy

## Related

- [GTM Strategy](./gtm-strategy.md) — April Dunford positioning framework (brief); this playbook operationalizes it
- [Account-Based Marketing](./account-based-marketing.md) — ABM needs PMM's messaging and battle cards
- [B2B Sales Lifecycle](./b2b-sales-lifecycle.md) — Sales enablement assets flow from PMM
- [Content-Led Acquisition](./content-led-acquisition.md) — Content strategy consumes PMM's messaging

---

## Changelog

| Date       | Change                                                              |
| ---------- | ------------------------------------------------------------------- |
| 2026-02-24 | Initial version — synthesized from Olivine, PMA, Directive, Kalungi |
