# Backend Domain

> Server-side development, APIs, databases, and services.

## Quick Summary

This domain covers everything that runs on the server: APIs, databases, background jobs, and service-to-service communication.

## Files in This Domain

| File                            | Description                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `payment-integration.md`        | Gateway selection, idempotency, webhooks, refunds, India pricing                     |
| `offers-discounts.md`           | Discount engine architecture, abuse prevention, SaaS revenue impact                  |
| `b2b2c-payment-architecture.md` | White-label revenue splits, Razorpay Route, TCS/TDS, tenant payment isolation        |
| `cashfree-integration.md`       | Cashfree PG API integration, webhooks, refunds, settlements, Easy Split, Token Vault |
| `startup-financial-metrics.md`  | Which metrics to track/show by audience and stage; India compliance line items       |
| `serverless-cost-modeling.md`   | Per-exam AWS cost modeling, service breakdown, scoring pipeline economics            |
| `india-email-deliverability.md` | India-specific SES config, open tracking validity, DPDP compliance, Pinpoint EOL     |

## Key Principles

1. **API-first design** - Define contracts before implementation
2. **Fail gracefully** - Handle errors without crashing
3. **Log meaningfully** - Structured logs with context
4. **Idempotency matters** - Safe to retry operations
5. **Validate at boundaries** - Trust nothing from outside

## When to Consult This Domain

- Building new API endpoints
- Designing database schemas
- Debugging performance issues
- Implementing error handling
- Setting up caching
- Integrating payment gateways (Razorpay, Stripe, Cashfree)
- Handling refunds, webhooks, or payment reconciliation
- Building coupon/discount systems for SaaS or e-commerce
- Preventing discount abuse or coupon fraud
- Setting up B2B2C white-label payment flows with revenue share
- Razorpay Route split payments and tenant linked accounts
- GST TCS / Income Tax TDS obligations as e-commerce operator
- Principal vs agent revenue recognition for white-label platforms
- Cashfree Payment Gateway API integration (orders, sessions, verification)
- Cashfree webhook signature verification (HMAC-SHA256)
- Cashfree Easy Split for marketplace vendor payouts
- Cashfree Token Vault for RBI-compliant card tokenization
- Cashfree subscriptions (UPI AutoPay, eNACH)
- Cashfree settlement reconciliation and instant settlements
- Cashfree MCP server for AI agent operations (Claude Desktop, Cursor, VS Code)
- Choosing which financial metrics to track and report at each startup stage
- India-specific compliance metrics (GST on gateway fees, TDS timing, FEMA FC-GPR)
- Metrics for different audiences (investors vs enterprise clients vs internal team)
- Estimating serverless AWS cost per exam or per student
- Optimizing Lambda, DynamoDB, API Gateway, Cognito costs at different scales
- Scoring pipeline cost comparison (Step Functions vs Glue vs EMR)
- Email deliverability for Indian audience (SES region, open tracking, DPDP)
- SES vs Resend vs Postmark vs Customer.io for India
- AWS Pinpoint migration (EOL October 2026)
- Email analytics pipeline (SES -> EventBridge -> DynamoDB)

## Related Domains

- `architecture/` - High-level system design
- `security/` - Authentication, authorization
- `testing/` - API and integration testing
- `data/` - Data pipelines and analytics

---

Last updated: 2026-02-07
