---
domain: devops
topic: logging and observability for serverless edtech
tags: [logging, observability, serverless, dpdp, audit-trail, canonical-logs]
complexity: intermediate
last_updated: 2026-06-29
confidence: 0.85
source_refs:
  - "AWS serverless observability (Powertools, EMF, ADOT, X-Ray maintenance Feb 2026)"
  - "DPDP Act 2023 + Rules 2025 logging/retention duties"
  - "Canonical log lines / wide events / tail sampling / tamper-evident ledgers"
  - "Real-world Lambda monorepo logging patterns"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku/Sonnet researchers
version: 2
---

# Logging & Observability (Serverless + Edtech)

> The non-obvious decisions: what library (often none), how correlation attaches without hand-threading, how to keep PII out by construction, and which unconventional technique to reach for. Plus the edtech parts generic advice skips — DPDP-safe logging of minors and a dispute-proof audit trail.

## TL;DR

- **On Lambda, write no logging library.** The runtime ships stdout to CloudWatch for you, so a 40-line hand-rolled JSON emitter beats pino/winston — fewer deps, no cold-start weight. Put the emitter in a shared package and make raw `console.*` an eslint error, or field names drift across hundreds of call sites.
- **Attach correlation in an AsyncLocalStorage request context, never by threading `requestId` through every call.** Hand-threading is the failure mode that leaves half your logs uncorrelated.
- **Keep PII out by projection, not redaction.** Structure read paths so answers, keys, and emails never reach code that can log them. Redaction and tokenization are defense-in-depth, not the primary control.
- **The audit trail is a separate, tamper-evident, ≥1-year store — not your CloudWatch logs.** Ops-log retention (weeks) and DPDP Rule 8 audit retention (a year) are different needs; one stream can't serve both.
- **Default to one canonical log line per request**; escalate to flight-recorder, wide events, or tail sampling only when the request/response model stops answering your questions.

## Decision Guide

| Decision                  | Choice                                                                   | Why                                                       |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| Logging library on Lambda | None — hand-rolled JSON emitter in a shared package                      | Runtime is the transport; libraries add cold-start weight |
| Event naming              | `dot.case` action label as a stable `msg` (`mock.submit`, `attempt.put`) | Low-cardinality, greppable, survives refactors            |
| Correlation id            | Created at the edge, stored in AsyncLocalStorage, auto-attached          | Threading by hand leaves logs uncorrelated                |
| Keeping PII out           | Exclude by data projection first; redaction/tokenization second          | A field the code never holds can't leak                   |
| Enforcement               | eslint-error on raw `console.*`; logger mandatory                        | An optional logger is an unused logger                    |
| Tracing SDK               | OpenTelemetry / ADOT                                                     | X-Ray SDK enters maintenance Feb 2026                     |
| Audit vs ops logs         | Separate stores; ops weeks, audit ≥1 year then WORM                      | Different retention, different tamper guarantees          |
| Per-request shape         | One canonical wide line; escalate only when it stops answering           | Cheaper to store and query than scattered lines           |

## The logger: zero-dep JSON, enforced

One `emit()` builds a line — `level`, `msg` (dot.case event), `service`, `env`, `ts`, plus a typed `extra` — `JSON.stringify`s it, and writes to the matching `console` stream. Gate `debug` behind env; always emit `info`/`warn`/`error`. Two things make or break it: put it in a **shared package** so every service uses identical field names, and **ban raw `console.*` with an eslint _error_** (a warn-level rule gets ignored and you end up with hundreds of hand-built JSON blobs and drifting keys). Keep a **typed event catalog** — each `msg` and its required fields declared once, checked at the call site — so events stay consistent and queryable.

## Correlation without hand-threading

Create a correlation id at the edge (API Gateway request id, or generate one), put it plus tenant/user into an **AsyncLocalStorage** store at the start of the request, and have `emit()` read from that store automatically. Every line is then correlated with zero per-call effort. This is the fix for the common anti-pattern of pulling `requestId` out of the event and passing it into every log by hand — which silently fails wherever someone forgets.

## PII: exclude by construction

The primary control is **projection**: shape the read path so sensitive fields (answer keys, `correctOptionId`, raw emails) are never selected into objects that logging code touches. Log **operator-safe internal ids**, never natural PII. For individuals you must not profile (minors), log **aggregates, not per-subject events**. Then add defense-in-depth: **CloudWatch Logs Data Protection** policies (regex field masking) at the log-group level, or scrub before serialisation. For data you must keep but may have to erase, **tokenise at ingestion** — logs carry a token, a separate vault holds the mapping, and erasure = delete the mapping. See [[india-dpdp]], [[children-data-protection]].

## DPDP-safe logging (minors)

**May log:** student internal id, score, submission timestamp, question id, engagement events, auth events, device/IP for fraud (minimised for minors). **Must not put in operational logs:** answer content, biometric/proctoring data without consent, and **any behavioural or psychometric inference about a minor** (prohibited). **Erasure trap:** masking must be irreversible and logs must not be able to **recreate PII after an erasure request** (30-day window) — an audit row that resurrects a deleted student is itself a breach (tokenisation solves this). **Residency:** keep logs in the India region; encrypt; restrict access.

## The audit trail (dispute-proof, separate)

Integrity-critical events get an **append-only, tamper-evident** store distinct from operational logs: result release, grace-mark and normalisation arithmetic, score recomputation, item exposure, consent grant/revoke, auth, DSAR actions, item-bank access. **Log the arithmetic before the result ships** — the NEET 2024 grace-mark fiasco (impossible 718/720) was an arithmetic failure an audit trail catches. Make it tamper-evident with **hash-chained records or a WORM store** (S3 Object Lock, ledger DB), retain **≥1 year** (DPDP Rule 8), then archive to Glacier for legal holds. CloudWatch ops logs (weeks of retention) do not meet this — they are a different system.

## Unconventional techniques: when to reach for each

| Technique                            | Use when                                                       | Cost / caution                           |
| ------------------------------------ | -------------------------------------------------------------- | ---------------------------------------- |
| Canonical log line (1 wide/req)      | Default for request/response services                          | Needs the ALS context; flush on response |
| Flight recorder (emit only on error) | High-volume happy path, rich failure detail needed             | Memory per request; lost on hard crash   |
| Wide events / observability 2.0      | Debugging unknown-unknowns at per-student/per-item cardinality | Event store + storage cost               |
| Tail-based sampling                  | Exam-day bursts where keeping every trace is too costly        | OTel collector buffers full traces       |
| Hash-chain / WORM audit              | Results, scoring, payments, consent — anything disputable      | Append-only; history is immutable        |
| Event sourcing                       | Must reconstruct exactly what happened                         | High complexity, projection rebuilds     |
| Change data capture (DDB Streams)    | Complete mutation record without app-level logging             | Schema coupling, replay handling         |
| Dynamic log levels (SSM/flag)        | Live prod incident on a quiet-by-default service               | Guard access; revert after               |
| OTel + exemplars                     | Outgrown grep; need logs↔metrics↔traces correlation            | Instrumentation + collector ops          |

## Exam-day observability

**Before:** warm provisioned concurrency, run a synthetic canary, stand up a dashboard of P99 latency, concurrent executions, throttles, error rate, DLQ depth. **During:** alarm on `ThrottledFunctions` and rising P99; trace scoring and adaptive pipelines separately. **Integrity is observability too:** watch p-value drift, discrimination decline, response-time anomalies, local dependence. **Metrics cheaply via EMF** (async custom metrics embedded in logs) — mind the limits (1 MB log, 100 metrics, 30 dimension keys) and high-cardinality dimensions, which explode cost. Telemetry isn't free — budget it.

## Common Mistakes

| Mistake                                          | Fix                                                          |
| ------------------------------------------------ | ------------------------------------------------------------ |
| Pulling in pino/winston on Lambda                | Hand-rolled JSON emitter; runtime ships stdout to CloudWatch |
| Logger optional, `console.*` only warned         | Shared package + eslint **error** on raw console             |
| Threading `requestId` through every call         | AsyncLocalStorage context; `emit()` auto-attaches it         |
| Redaction as the primary PII control             | Exclude by projection first; redact/tokenise as backup       |
| Behavioural/psychometric logging of minors       | Prohibited under DPDP — don't collect it                     |
| Audit events in CloudWatch ops logs              | Separate append-only, tamper-evident, ≥1-year store          |
| Releasing results without logging the arithmetic | Log grace-mark/normalisation math before release             |
| New tracing on the X-Ray SDK                     | ADOT/OpenTelemetry (X-Ray SDK maintenance Feb 2026)          |
| Logs leaving the India region                    | India-region storage; encrypt; restrict access               |

## Checklist

- [ ] One shared zero-dep JSON logger; raw `console.*` is an eslint error
- [ ] Correlation id in AsyncLocalStorage, auto-attached to every line
- [ ] `dot.case` event catalog, typed and consistent across services
- [ ] PII excluded by projection; internal ids not natural PII; tokenise erasable data
- [ ] No behavioural/psychometric logging of minors; aggregates only
- [ ] Audit events in a separate append-only, tamper-evident, ≥1-year store (then WORM/Glacier)
- [ ] Grace-mark/normalisation arithmetic logged before any result release
- [ ] Tracing on ADOT/OpenTelemetry; logs stay in-region, encrypted
- [ ] Exam-day dashboard + alarms (P99, concurrency, throttles, DLQ); EMF cardinality watched

## References

- [AWS Powertools for Lambda](https://aws.amazon.com/powertools-for-aws-lambda/) · [Serverless observability best practices](https://aws-observability.github.io/observability-best-practices/guides/serverless/aws-native/lambda-based-observability/)
- [CloudWatch EMF spec](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html) · [ADOT for Lambda](https://aws-observability.github.io/observability-best-practices/guides/serverless/oss/lambda-based-observability-adot/)
- [Canonical log lines (Stripe)](https://brandur.org/canonical-log-lines) · [DPDP data retention & deletion](https://ksandk.com/data-protection-and-data-privacy/data-retention-and-deletion-under-indias-dpdp-rules/)

Related: [[india-dpdp]], [[children-data-protection]], [[verification-checklist]], and [[testing-strategy]] (what to test while you observe).
