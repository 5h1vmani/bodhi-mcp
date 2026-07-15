---
domain: testing
topic: testing strategy for assessment platforms
tags: [testing, edtech, assessment, scoring, load-testing, ai-eval]
complexity: intermediate
last_updated: 2026-06-29
confidence: 0.85
source_refs:
  - "fast-check / Hypothesis / Pact / Stryker (current tooling)"
  - "k6 / Artillery serverless burst testing"
  - "DeepEval / promptfoo LLM eval harnesses"
  - "edtech playbooks (scoring, CAT, item-bank, AI pipeline)"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku/Sonnet researchers
version: 2
---

# Testing Strategy (Assessment Platforms)

> General testing discipline plus the assessment-specific tests that generic advice never covers: scoring correctness, adaptive engines, item promotion, payment webhooks, AI content, and exam-day load.

## TL;DR

- **Test the pyramid for ordinary code; test _correctness_ for the things that decide a student's rank.** A silent scoring bug is the NEET grace-mark fiasco — assert your engine against real past papers, every change.
- **Stochastic systems need simulated populations, not hand-written cases.** Adaptive/CAT and IRT calibration are validated by running thousands of synthetic examinees and checking the math recovers, not by example tests.
- **Gate item promotion in CI on psychometrics**, not on "it compiles." Block any item reaching _operational_ unless p-value and discrimination clear the bar.
- **Non-deterministic output (AI-generated questions) is tested with an eval harness, not unit tests** — golden set + LLM-as-judge + regression thresholds.
- **Exam start is a 10x burst at one scheduled minute.** Load/soak/spike test to your Lambda concurrency limit; cold starts and throttling are the failure modes.

## Decision Guide

| What you're testing          | Approach                                                               | Why                                                         |
| ---------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| Scoring, normalization, rank | Golden datasets from past papers + property-based + CI regression gate | Silent math errors are catastrophic and public              |
| Adaptive / CAT engine        | Simulated examinees across the ability range; check θ recovery         | Can't hand-write cases for stochastic item selection        |
| Item-bank promotion          | CI gate on p-value, discrimination, calibration N before operational   | Bad items must never reach a live exam                      |
| Payment webhooks / adapters  | Contract tests + provider sandbox + signature fixtures                 | Can't touch real money; each provider drifts                |
| AI-generated content         | Eval harness (golden set + LLM-judge), not unit tests                  | Output is non-deterministic; equality assertions are wrong  |
| Exam-day traffic             | Load / soak / spike tests to the concurrency limit                     | Thousands hit at one minute; cold starts and throttles bite |
| Ordinary app logic           | Test pyramid: many unit, fewer integration, fewest E2E                 | Fast feedback, cheap to maintain, survives refactoring      |

## Cross-cutting techniques (the non-obvious ones)

Coverage ≥80% is a floor, not a goal (see [[verification-checklist]]) — these techniques catch what coverage misses. **Mutation testing** (Stryker JS/TS, PIT for JVM) tests whether your tests actually catch bugs — high coverage with passing mutants is a false sense of safety. **Property-based testing** (fast-check for TS, Hypothesis for Python) asserts invariants across generated inputs instead of a handful of examples — the right tool for scoring and ranking math. **Contract testing** (Pact) pins the boundary to each payment provider so an upstream change fails your CI, not production. **Snapshot/golden-file** suits stable structured output — but never with timestamps or UUIDs inside, that is how snapshots go flaky. **Flaky tests:** quarantine, fix the root cause (clock, time zone, locale, test order, shared state); retries hide the bug, they don't fix it.

## Scoring correctness — golden datasets + invariants

The non-negotiable: build **golden datasets from real released papers** with published answer keys and official cutoffs, and assert your engine reproduces the marks, percentile, and rank exactly. JEE Main is **percentile-normalised per session**; NEET is **raw marks, no normalisation** — test both paths, they are different code. Add **property-based invariants**: score is monotonic in correct answers, percentile stays in [0,100], rank is strictly non-increasing as score rises, marks are integers (no float). **Regression-gate every scoring change** — a diff to normalisation or grace-mark arithmetic must re-run the golden suite and block on any drift.

## Adaptive / CAT and IRT calibration

You cannot example-test a stochastic selector. Instead **simulate examinees at known ability θ** across the range, push thousands through the engine, and check: the ability estimate **recovers** (bias and RMSE within bounds), exposure caps hold (≤0.20 realised), and stopping rules fire correctly. Before trusting any calibration, **validate IRT parameter recovery** on synthetic response data generated from known parameters.

## Item-bank promotion gate

Make CI the gatekeeper: an item may not move to _operational_ unless **p-value 0.30–0.90**, **discrimination ≥0.20**, and **calibration N** meets the IRT floor (Rasch ~150, 2PL ~500, 3PL ~1,000 responses). Test the lifecycle **state machine** and the rule that a substantive edit mints a **new item_id** (minor edit = patch).

## Payments — contract + sandbox, never live

Per-provider **contract tests** against the common adapter interface; **signature-verification fixtures** = captured raw webhook bodies plus known-good HMACs (verify on the raw body, not parsed JSON); **idempotency test** = replay the same event_id and assert exactly one effect; reconcile joins on your **internal order id**, never amount. Run a **sandbox smoke test** in CI; never point tests at a live gateway. See [[bring-your-own-payment-gateway]].

## AI-generated content — an eval harness, not unit tests

Use a three-tier gate: deterministic checks → LLM-as-judge → human exception. Maintain a **golden Q&A set** (human-vetted); score generated items by embedding similarity or LLM-judge. Use a **cheap judge model** (Haiku / small open model) and **verify the judge on a 5–10 item manual sample** before trusting it — judges carry verbosity, position, and length bias. **Regression-gate** on thresholds (e.g. accuracy must not drop >2% per model/prompt change). Tooling: **DeepEval** (pytest/CI), **promptfoo** (multi-model + red-team), **RAGAS** if explanations are retrieval-based.

## Load / soak / spike for exam day

Model the real event: a **10x burst at one scheduled minute**. Tools: **k6** (lowest memory, single-machine high throughput) or **Artillery** (serverless-native, Fargate-distributed). Test up to your **account Lambda concurrency limit** (default 1,000); assert **graceful degradation** when exhausted (watch `ThrottledFunctions`), and test **provisioned/reserved concurrency** to blunt cold starts. **Soak test** for memory leaks over sustained load. Run load tests in a **dev-tier account** with cheap CloudWatch retention so the bill doesn't balloon.

## Common Mistakes

| Mistake                                         | Fix                                                           |
| ----------------------------------------------- | ------------------------------------------------------------- |
| Unit-testing the scoring engine with toy inputs | Golden datasets from real released papers + official cutoffs  |
| Float arithmetic in score/percentile tests      | Integer marks; assert exact reproduction                      |
| Example tests for an adaptive engine            | Simulate a population at known θ; check recovery and exposure |
| Promoting items because code passed             | CI gate on p-value, discrimination, calibration N             |
| Pointing payment tests at a live gateway        | Sandbox + recorded signature fixtures; never real money       |
| Asserting equality on AI-generated text         | Eval harness: golden set + LLM-judge + regression threshold   |
| Trusting an LLM judge blindly                   | Verify the judge on a manual sample; use a cheap judge model  |
| Load testing at 1x average                      | Spike to 10x at one minute; test to the concurrency limit     |
| Running load tests in prod-tier account         | Dev-tier account, cheap retention; load cost scales linearly  |
| Ignoring flaky tests with auto-retry            | Quarantine, fix root cause (clock/locale/order), retry last   |

## Checklist

- [ ] Scoring/normalisation has a golden-dataset suite from real papers, gated on every change
- [ ] Property-based invariants on score, percentile, rank, integer marks
- [ ] Adaptive engine validated by simulated examinees (θ recovery + exposure caps)
- [ ] Item promotion blocked in CI unless psychometrics clear the bar
- [ ] Payment adapters have contract tests + signature fixtures + idempotency test; no live calls
- [ ] AI content has a golden set, judge verified on a sample, regression threshold in CI
- [ ] Exam-day load/soak/spike tests to the concurrency limit, in a dev-tier account
- [ ] No flaky tests in the gating suite; coverage ≥80% as a floor

## References

- [fast-check (property-based, TS)](https://github.com/dubzzz/fast-check) · [Hypothesis (Python)](https://github.com/HypothesisWorks/hypothesis)
- [Pact (contract testing)](https://pact.io/) · [Stryker Mutator](https://stryker-mutator.io/)
- [k6 load testing](https://k6.io/) · [Artillery (serverless-native)](https://www.artillery.io/)
- [DeepEval](https://github.com/confident-ai/deepeval) · [promptfoo](https://www.promptfoo.dev/)

Related: [[bring-your-own-payment-gateway]], [[verification-checklist]], and [[logging-observability]] (what to record while these run).
