---
domain: security
topic: serverless-aws-security
tags: [aws, lambda, serverless, ddos]
complexity: advanced
last_updated: 2026-01-29
---

# Serverless AWS Security at Scale

> Decision framework for securing AWS Lambda / API Gateway architectures serving 100K+ concurrent users (mock tests, flash sales, live events).

## TL;DR

- **Every Lambda function gets its own least-privilege IAM role** -- shared roles across functions create blast radius; one compromised function escalates to everything
- **API Gateway is your perimeter, not Lambda** -- WAF, rate limiting, Cognito/JWT auth, and throttling all live at the gateway; Lambda should never be publicly invocable
- **SQS decouples ingress from processing at scale** -- for 100K+ CCU, buffer requests through SQS to absorb spikes; Lambda polls the queue, not the user
- **Secrets in Secrets Manager, never env vars** -- env vars are readable via SSRF/RCE exploits; Secrets Manager adds encryption + rotation + audit trail
- **OWASP Serverless Top 10 maps to IAM + event validation** -- traditional web vulns (injection, access control) shift to trigger-level input validation and IAM policy discipline

## Decision Guide

| Scenario                                 | Approach                                                                     | Why                                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 100K+ CCU mock test (burst traffic)      | API Gateway → SQS → Lambda (async) + provisioned concurrency                 | SQS absorbs burst; provisioned concurrency eliminates cold starts; Lambda auto-scales from queue                                     |
| Real-time exam responses needed          | API Gateway → Lambda (sync) + provisioned concurrency + reserved concurrency | Low latency required; provisioned concurrency avoids cold starts; reserved concurrency prevents one function consuming account quota |
| Authenticating exam participants         | Cognito User Pool + API Gateway authorizer                                   | Offloads auth to managed service; JWT validation at gateway before Lambda executes                                                   |
| DDoS protection for public endpoints     | CloudFront → AWS WAF (AntiDDoS AMR + rate-based rules) → API Gateway         | Edge filtering blocks attacks before they reach Lambda; rate-based rules auto-block flood IPs                                        |
| Storing DB credentials / API keys        | AWS Secrets Manager with rotation enabled                                    | Encrypted at rest, audited via CloudTrail, auto-rotated; never visible in function code or env vars                                  |
| Function needs to access RDS/ElastiCache | Lambda in VPC with security group + VPC endpoints                            | Network isolation; VPC endpoints avoid public internet transit for AWS service calls                                                 |
| Protecting against supply chain attacks  | Amazon Inspector + CodeGuru on Lambda layers/packages                        | Scans dependencies for known CVEs; catches malicious Lambda layers                                                                   |
| Monitoring for anomalous invocations     | CloudWatch Alarms (error rate, throttles, duration spikes) + X-Ray tracing   | Detects unauthorized access patterns, exfiltration attempts, and latency anomalies                                                   |
| Preventing credential theft from Lambda  | Short-lived STS tokens (default) + IMDSv2 + no wildcard IAM                  | Temporary creds expire quickly; IMDSv2 prevents SSRF credential harvesting; scoped IAM limits blast radius                           |
| Load testing before go-live              | AWS WAF in count mode → run load test → analyze CloudWatch → enable blocking | Validates WAF rules don't block legitimate traffic before enforcing                                                                  |

## Attack Surface Map (Serverless-Specific)

| Attack Vector                     | How It Happens                                                            | Defense                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Event injection                   | Malicious payload via API Gateway, S3 event, SQS message, IoT trigger     | Validate ALL event source inputs at handler entry; use schema validation (Zod, Joi)                 |
| IAM privilege escalation          | Over-permissioned role (`*` policies, `AdministratorAccess`)              | One role per function; scope to specific resources + actions; deny by default                       |
| Credential theft via SSRF         | Attacker reads `AWS_ACCESS_KEY_ID` / `AWS_SESSION_TOKEN` from environment | Use Secrets Manager (not env vars) for app secrets; Lambda runtime creds are short-lived STS tokens |
| Malicious Lambda layers           | Compromised shared layer persists across function redeployments           | AWS CodeSigning for Lambda; audit all layers; avoid public layers from untrusted sources            |
| `/tmp` directory data leak        | Previous invocation's temp files persist in warm container                | Clean `/tmp` at end of every invocation; never write secrets to `/tmp`                              |
| Cold start initialization exploit | Unpatched library loaded during init phase                                | Pin dependency versions; scan with Amazon Inspector; minimal init code                              |
| HTTP flood DDoS                   | Botnet overwhelms API Gateway → triggers Lambda at scale → cost explosion | AWS WAF AntiDDoS AMR at CloudFront/ALB; rate-based rules; API Gateway throttle limits               |
| Information leakage               | Error messages expose stack traces, internal paths, DB schema             | Catch all exceptions in handler; return generic error codes; log details to CloudWatch only         |

## 100K+ CCU Architecture Pattern

```
User → CloudFront (WAF + Shield) → API Gateway (Cognito auth + throttle)
         ├── Sync path: → Lambda (provisioned concurrency) → DynamoDB
         └── Async path: → SQS → Lambda (batch processing) → DynamoDB
```

| Component   | Security Config                                                                    | Scale Config                                     |
| ----------- | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| CloudFront  | WAF ACL with AntiDDoS AMR, IP reputation, geo-blocking                             | Edge caching; global distribution                |
| API Gateway | Cognito/JWT authorizer; per-method rate limits; request validation                 | Burst/steady-state throttle limits               |
| SQS         | Encryption at rest (SSE-SQS); access policy scoped to producer/consumer            | Dead-letter queue for failed messages            |
| Lambda      | Per-function IAM role; VPC if accessing private resources; provisioned concurrency | Reserved concurrency to prevent quota starvation |
| DynamoDB    | Encryption at rest; IAM condition keys for row-level access; on-demand capacity    | Auto-scaling or on-demand mode for burst         |

## Common Mistakes

| Mistake                                                | Fix                                                                                          |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Single IAM role shared across all Lambda functions     | One role per function scoped to exact resources + actions                                    |
| Storing secrets in Lambda environment variables        | Use Secrets Manager with rotation; fetch at runtime                                          |
| No authentication on API Gateway endpoints             | Add Cognito authorizer or Lambda custom authorizer to every endpoint                         |
| Default account concurrency limit (1,000) for 100K CCU | Request limit increase well before load test; set reserved concurrency per critical function |
| Logging raw event objects (may contain PII)            | Redact sensitive fields; log only what's needed                                              |
| No WAF in front of API Gateway                         | Deploy CloudFront + WAF with rate-based rules and AntiDDoS managed rule group                |
| Deploying WAF rules directly to production             | Test in count mode first; analyze CloudWatch; then enable blocking                           |
| Using `*` resource in IAM policies for convenience     | Scope to specific ARNs; use IAM Access Analyzer to detect over-permissioning                 |
| No dead-letter queue on async Lambda                   | Add DLQ (SQS or SNS) to capture failed invocations for investigation                         |
| Ignoring Lambda layer provenance                       | Use CodeSigning; audit all layers; avoid unverified public layers                            |

## Checklist

- [ ] Every Lambda function has its own least-privilege IAM role (no shared roles, no `*` policies)
- [ ] API Gateway has authentication (Cognito/JWT/custom authorizer) on all endpoints
- [ ] AWS WAF deployed at CloudFront or ALB with AntiDDoS AMR + rate-based rules
- [ ] Secrets stored in Secrets Manager with rotation (not in env vars or code)
- [ ] All event source inputs validated at handler entry (schema validation)
- [ ] Account concurrency limits increased for expected peak (100K+ CCU)
- [ ] Provisioned concurrency enabled for latency-critical functions
- [ ] SQS queue with DLQ buffering async workloads
- [ ] CloudWatch Alarms set for error rate, throttle rate, and duration anomalies
- [ ] X-Ray tracing enabled for request flow visibility
- [ ] Lambda functions in VPC with security groups if accessing private resources
- [ ] `/tmp` directory cleaned at end of every invocation
- [ ] WAF rules tested in count mode before enforcement
- [ ] Amazon Inspector scanning Lambda functions and layers for CVEs
- [ ] No raw event objects logged (PII redacted)

## References

- [AWS: DDoS Best Practices Whitepaper](https://docs.aws.amazon.com/whitepapers/latest/aws-best-practices-ddos-resiliency/protecting-api-endpoints-bp4.html) -- API endpoint protection patterns
- [AWS: Serverless Architecture Patterns](https://aws.amazon.com/blogs/architecture/updates-to-serverless-architectural-patterns-and-best-practices/) -- Decoupling and scaling patterns
- [OWASP: Serverless Top 10](https://owasp.org/www-project-serverless-top-10/) -- Serverless-specific vulnerability catalog
- [OWASP: Serverless FaaS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Serverless_FaaS_Security_Cheat_Sheet.html) -- Comprehensive defense checklist
- [Qualys: Serverless Security Risks 2026](https://blog.qualys.com/product-tech/2026/01/15/serverless-security-risks-identity-ssrf-rce) -- Identity + SSRF + RCE threat analysis
- [Ran The Builder: 14 Lambda Security Best Practices](https://www.ranthebuilder.cloud/post/14-aws-lambda-security-best-practices-for-building-secure-serverless-applications) -- Practitioner-focused Lambda hardening
- [Serverless Guru: HTTP Flood Prevention](https://www.serverlessguru.com/blog/serverless-security-preventing-http-flood-ddos-attack) -- WAF + serverless DDoS defense
- [Zest Security: Malicious Lambda Layers](https://www.zestsecurity.io/blog/how-malicious-aws-lambda-layers-can-compromise-your-serverless-environment) -- Supply chain attack vector

## Related

- [Server Actions Security](./server-actions-security.md) -- Next.js mutation security (if frontend is Next.js on this infra)
- [Webapp Security](./webapp-security.md) -- OWASP 2025 Top 10 for general web apps

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
