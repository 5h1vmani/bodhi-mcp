---
domain: backend
topic: serverless-cost-modeling
tags: [aws, cost, serverless, lambda]
complexity: advanced
last_updated: 2026-02-07
---

# Serverless Cost Modeling for Exam Platforms

> Decision framework for estimating, tracking, and optimizing AWS serverless costs per exam -- synthesized from 12+ AWS pricing pages (ap-south-1), Pinaka production architecture, and real scoring pipeline benchmarks.

## TL;DR

- **Infra cost is ₹0.90/student ($0.011) at 100K scale** -- serverless architecture means near-zero idle cost; the cost _per exam_ is what matters, not monthly bills; this is your competitive moat against VM-based platforms
- **Cognito + API Gateway = 72% of AWS cost** -- not Lambda or DynamoDB; at 100K students, Cognito MAU fees ($495) and API Gateway requests ($287) dominate; optimize these first
- **Fixed vs variable cost crossover at ~10K students** -- below 10K, Cognito MAU and Kinesis base fees dominate (fixed); above 10K, API Gateway and DynamoDB scale linearly; optimization strategy must change with scale
- **Step Functions + Lambda scoring is 80% cheaper than Glue/EMR** -- ₹0.003/student vs ₹0.03/student; 2 minutes vs 10 minutes; no cold start; stay on current architecture until >1M students

## Decision Guide

| Scenario                                | Approach                                                                                                  | Why                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Estimating cost for a new exam          | Count per-student: (API calls × duration) + (DynamoDB WCUs) + (Kinesis records × size) + (CloudFront GBs) | Each service bills differently; missing one service can 10× your estimate                                          |
| Biggest cost lever at <10K students     | Disable Kinesis telemetry; use Cognito Lite tier                                                          | Fixed costs dominate: Cognito ($495 base) + Kinesis ($35/mo) = 85% of total                                        |
| Biggest cost lever at 10K-100K students | Switch REST → HTTP API Gateway (saves ~60%); batch telemetry flush from 5s → 15s                          | API Gateway becomes #1 variable cost; reducing request count is highest ROI                                        |
| Biggest cost lever at >100K students    | Negotiate AWS EDP (Enterprise Discount Program); consider provisioned DynamoDB for predictable exams      | Volume discounts unlock 10-20% savings; provisioned capacity cheaper than on-demand above predictable baseline     |
| Client asks "what does it cost to run?" | Separate into 3 buckets: Infra (₹0.90/student) + Payment (0-2.4% of fee) + Comms (₹1.50/student for SES)  | Clients confuse these; infrastructure is negligible, payment gateway dominates total cost                          |
| Scoring pipeline optimization           | Stay with Step Functions + Lambda batches (₹0.003/student)                                                | Current approach is 80% cheaper and 5× faster than PySpark/Glue; switch only if you need cross-exam ML aggregation |
| Cost estimate for investor deck         | Report ₹0.90/student infra cost + 95%+ gross margin                                                       | This is a genuine moat; most competitors run on VMs with ₹5-15/student infra cost                                  |
| Load test cost planning                 | Same as production but disable PITR, use dev-tier CloudWatch retention (1 day)                            | Load test environment is identical architecture; cost scales linearly with student count                           |

## Per-Student Cost Breakdown (100K exam, ap-south-1)

| Service            | What It Does Per Student                             | Unit Price                        | Cost/Student | % of Total |
| ------------------ | ---------------------------------------------------- | --------------------------------- | ------------ | ---------- |
| API Gateway        | ~820 requests (telemetry + submissions + results)    | $3.50/1M req                      | $0.0029      | 26%        |
| Cognito            | 1 MAU (auth, OTP)                                    | $0.0055/MAU (after 10K free)      | $0.0050      | 45%        |
| Lambda             | ~820 invocations × ~200ms avg × 256MB                | $0.20/1M + $0.000017/GB-s         | $0.0018      | 16%        |
| DynamoDB           | ~95 WCU + ~15 RCU (submissions, heartbeats, results) | $0.75/1M WCU, $0.15/1M RCU        | $0.0001      | 1%         |
| Kinesis + Firehose | ~720 records × 1.5KB → S3 archive                    | $0.096/GB in + $0.029/GB firehose | $0.0001      | 1%         |
| CloudFront         | ~500KB paper + images + results                      | $0.109/GB + $0.012/10K HTTPS      | $0.0001      | 1%         |
| SQS                | 1 submission message                                 | $0.40/1M req                      | $0.000001    | ~0%        |
| Step Functions     | ~1.2 state transitions (amortized)                   | $0.025/1K transitions             | $0.00003     | ~0%        |
| CloudWatch         | ~5KB logs per student                                | $0.67/GB ingested                 | $0.000003    | ~0%        |
| SES                | 2 emails (registration + result)                     | $0.10/1K emails                   | $0.0002      | 2%         |
| **Total**          |                                                      |                                   | **$0.0110**  | **100%**   |

## Scoring Pipeline Economics

| Approach                              | Cost per 100K Students | Duration | Cold Start      | Maintenance             |
| ------------------------------------- | ---------------------- | -------- | --------------- | ----------------------- |
| **Step Functions + Lambda (current)** | **~$3** (~₹250)        | ~2 min   | None            | Low (TypeScript)        |
| AWS Glue (PySpark)                    | ~$15 (~₹1,250)         | ~10 min  | 2-5 min spin-up | High (Spark tuning)     |
| EMR Serverless                        | ~$8 (~₹670)            | ~5 min   | 1-2 min         | Medium                  |
| ECS Fargate batch                     | ~$5 (~₹420)            | ~3 min   | 30s task start  | Medium (container mgmt) |

**Current architecture details:**

- Batch size: 1,000 students per Lambda
- Max concurrency: 100 parallel batches
- Memory: 1024MB per batch Lambda
- DynamoDB query concurrency: 25 per batch
- S3 write concurrency: 20 per batch

## Scale Cost Projection

| Students | AWS Infra | Cognito | API Gateway | Lambda | DynamoDB | Other | Total  | Per Student |
| -------- | --------- | ------- | ----------- | ------ | -------- | ----- | ------ | ----------- |
| 1,000    | $25       | $5      | $3          | $2     | $0.10    | $15   | $25    | $0.025      |
| 10,000   | $125      | $50     | $29         | $18    | $1       | $27   | $125   | $0.013      |
| 100,000  | $1,095    | $495    | $287        | $180   | $9       | $124  | $1,095 | $0.011      |
| 500,000  | $5,400    | $2,475  | $1,435      | $900   | $45      | $545  | $5,400 | $0.011      |

**Note:** Per-student cost flattens at ~$0.011 above 100K due to linear scaling; meaningful reduction requires architectural changes (HTTP API, provisioned capacity) or AWS EDP.

## Common Mistakes

| Mistake                                              | Fix                                                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estimating monthly AWS cost instead of per-exam cost | Serverless has near-zero idle; cost is per-event; model per-exam then multiply by exam count                                                            |
| Optimizing Lambda memory/duration first              | Lambda is only 16% of cost; optimize Cognito MAU strategy and API Gateway request count first                                                           |
| Keeping Kinesis telemetry on in dev/staging          | Kinesis on-demand has $35/mo base even with zero traffic; disable via feature flag in non-prod                                                          |
| Using REST API Gateway for new endpoints             | HTTP API Gateway is 71% cheaper ($1.00 vs $3.50/1M); REST only needed for request validation and WAF integration                                        |
| Ignoring S3 lifecycle rules                          | Telemetry data at 100GB/exam accumulates fast; INTELLIGENT_TIERING at 30d → GLACIER at 90d → expire at 365d                                             |
| Reporting infra + gateway as single "cost"           | Infrastructure ($0.011/student) and payment gateway (0.7-2.4% of revenue) are fundamentally different cost types; conflating them obscures your margins |

## Checklist

- [ ] Per-exam cost model accounts for all 10 services (API Gateway, Lambda, DynamoDB, S3, CloudFront, Cognito, SES, SQS, Kinesis, Step Functions)
- [ ] Kinesis telemetry disabled in dev/staging via environment config (`enableTelemetry: false`)
- [ ] S3 lifecycle rules configured: INTELLIGENT_TIERING (30d) → GLACIER (90d) → expire (365d)
- [ ] CloudWatch log retention set to 1 week (not unlimited)
- [ ] Cost per exam tracked after each production exam run (actual vs estimate)
- [ ] HTTP API Gateway evaluated for new endpoints (71% cheaper than REST)
- [ ] Payment gateway cost reported as separate line item from infrastructure cost
- [ ] Scoring pipeline stays on Step Functions + Lambda until >1M student threshold

## References

- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/) -- Per-request and GB-second rates by region
- [AWS DynamoDB On-Demand Pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/) -- WRU/RRU rates; 50% price cut effective Nov 2024
- [AWS API Gateway Pricing](https://aws.amazon.com/api-gateway/pricing/) -- REST vs HTTP API comparison; HTTP is $1.00/1M vs $3.50/1M
- [AWS CloudFront India Pricing](https://aws.amazon.com/cloudfront/pricing/) -- India edge: $0.109/GB first 10TB; $0.012/10K HTTPS requests
- [AWS Cognito Pricing](https://aws.amazon.com/cognito/pricing/) -- Lite tier: $0.0055/MAU after 10K free
- [AWS Step Functions Pricing](https://aws.amazon.com/step-functions/pricing/) -- $0.025/1K state transitions; negligible at exam scale

## Related

- [Startup Financial Metrics](./startup-financial-metrics.md) -- Which cost metrics to show to investors vs clients
- [Payment Integration](./payment-integration.md) -- Gateway fee comparison; the other half of total cost
- [IaC Best Practices](../devops/iac-best-practices.md) -- CDK patterns for the infrastructure that generates these costs

---

## Changelog

| Date       | Change                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-07 | Initial version: synthesized from 12+ AWS pricing pages (ap-south-1), Pinaka production architecture, scoring pipeline benchmarks |
