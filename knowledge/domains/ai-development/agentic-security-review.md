---
domain: ai-development
topic: agentic security review and orchestrated vulnerability discovery
tags: [security, ai-agents, orchestration, code-review, pentest]
complexity: advanced
last_updated: 2026-06-29
confidence: 0.8
source_refs:
  - "Microsoft MDASH multi-model agentic scanning (CyberGym 88.45%)"
  - "Anthropic Claude Code Security self-challenge verification"
  - "XBOW exploitability-gated autonomous pentest"
  - "Cybersecurity SLMs; CyberGym / ZeroDayBench / PentestJudge benchmarks"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku/Sonnet researchers
version: 1
---

# Agentic Security Review

> Vulnerability discovery is an orchestration problem, not a frontier-model problem. A fleet of cheap specialized agents that find broadly, then adversarially verify and prove exploitability, beats a single large model — at a fraction of the cost.

## TL;DR

- **The moat is the system, not the model.** Orchestrating 100+ specialized agents over distilled + frontier models (Microsoft's MDASH) tops single large models on CyberGym (88.45%); security-tuned _small_ models beat the frontier labs on the hardest sub-task (data-flow false-positive tracing).
- **Security uniquely suits orchestration** because it decomposes without coordination (one lens per vuln class, read in parallel) and is machine-verifiable (a finding can be disproved by data-flow or proved by an exploit).
- **The pipeline that works: find → adversarially verify → prove exploitability → rate.** Generate broadly with cheap models; spend the budget _filtering_, not generating.
- **Cheap finders, expensive judges.** Small/on-prem models do the breadth sweep; a stronger model or a vote-panel runs the verify stage and the ambiguous high-severity calls.
- **Agents raise the floor; humans own sign-off.** Autonomy gives breadth and continuous coverage; validation, judgment, and regulatory sign-off stay human. Never auto-merge a security fix.

## Decision Guide

| Decision                   | Choice                                                             | Why                                                          |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| One big model or a fleet?  | Fleet of specialized agents, ensembled                             | Security decomposes + verifies; orchestration beats scale    |
| Finder model tier          | Cheap / distilled / security-tuned smalls, on-prem                 | Breadth is the cost driver; smalls win on data-flow tracing  |
| Verify / judge model tier  | Stronger model or a multi-vote skeptic panel                       | Verification is where accuracy and budget should concentrate |
| How to cut false positives | Adversarial self-challenge: try to **disprove** each finding       | SAST's core failure is noise; disproof is the filter         |
| When to accept a finding   | Only when exploitability is confirmed by controlled validation/PoC | Stops hallucinated exploits reaching humans                  |
| LLM vs traditional tooling | LLM triages **on top of** SAST/DAST/fuzzers/CodeQL/Semgrep         | Tools give ground truth; the model gives judgment            |
| Cadence                    | Continuous, shift-left in CI — not an annual point-in-time pentest | Agents give breadth no manual team matches                   |
| Final merge of a fix       | Human review with severity + confidence rating                     | Jagged frontier: agents are blind on some classes            |

## Why security rewards orchestration

Two properties most tasks lack. **It decomposes without coordination:** injection, authz/authn, SSRF, deserialization, secrets, crypto, supply-chain, and cloud-misconfig are independent lenses — specialized reviewers read the _same_ code in parallel and emit separate findings, no shared state (embarrassingly parallel). **It is machine-verifiable:** a claimed bug can be refuted by data-flow tracing or proved by a working exploit. Because verification is cheaper and more reliable than generation, you let cheap models over-generate candidates and spend the real budget filtering them.

## The pipeline: find → verify → prove → rate

| Stage                    | What happens                                                                 | Tier                           |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------ |
| **Find (breadth)**       | One finder per vuln class / per file, fanned out                             | Cheap distilled / SLM          |
| **Verify (adversarial)** | The finding is _challenged_; it advances only if the agent can't disprove it | Stronger model / skeptic panel |
| **Prove (exploit)**      | Accept only when exploitability is confirmed in a sandbox (PoC)              | Sandboxed exploit attempt      |
| **Rate**                 | Attach **severity + confidence** (some bugs are ambiguous from source)       | —                              |

This is the converged industry pattern. Anthropic's Claude Code Security runs a self-challenge loop — generate a finding, try to punch holes in it, and an agentic reviewer reads callers/sanitizers/related files before reporting — explicitly to kill the false-positive flood. XBOW's rule: "agents explore creatively, but findings are accepted only when exploitability is confirmed through controlled validation." Keep severity and confidence separate; confidence acknowledges genuine source-level ambiguity.

## Cheap finders, expensive judges

The cost lever behind "frontier-level results from small models." Run the broad finder sweep on small, distilled, or security-tuned models — fast, on-prem on consumer GPUs, well under frontier-API cost — and reserve a stronger model or a multi-vote panel for the verify/judge stage and ambiguous high-severity findings. MDASH ensembles distilled + frontier models for exactly this. Same finder/judge economics as any well-built workflow: spend tokens where accuracy is decided, not on breadth. See [[agent-workflows]].

## Specialized reviewers, no coordination

Give each agent one concern and the same diff: injection, authz, secrets, crypto, SSRF/deserialization, dependency/supply-chain, IaC/cloud misconfig. They run independently and emit separate findings; dedup and merge afterward. This mirrors how human security review actually parallelizes — domain experts don't need to talk to each other to each read the PR. Ground every lens in deterministic tooling (SAST/DAST/fuzzers/CodeQL/Semgrep): the tool finds candidates and provides ground truth, the agent decides whether a candidate is real and reachable.

## Securing the review agents themselves

A security-review agent ingests untrusted code and runs tools, so it is itself an attack surface. 2026 saw remote-code-execution in agent frameworks ("when prompts become shells") and orchestrator-induced data leakage. Apply least privilege, per-agent identity, scoped tool allowlists, and **runtime** governance — static testing misses the emergent attack paths agents create dynamically. Treat the harness with the same suspicion you'd apply to any code that evals untrusted input. See [[git-for-ai-agents]] (agent secret/destructive-op rails).

## Evaluate the pipeline

Don't trust vibes on a security pipeline. Benchmark against **CyberGym** (real-world bug discovery), **ZeroDayBench** (unseen zero-days, guards against train-set leakage), and **PentestJudge** (judges agent _behavior_ against operational requirements, not just outcomes). Track precision (false-positive rate) and recall (missed classes) separately — the jagged frontier means a pipeline strong on injection can be blind on logic flaws.

## Common Mistakes

| Mistake                                          | Fix                                                         |
| ------------------------------------------------ | ----------------------------------------------------------- |
| Reaching for one big model                       | Orchestrate a fleet; ensemble distilled + frontier          |
| Spending budget on generation                    | Over-generate cheaply; spend on adversarial verification    |
| Reporting findings without disproof              | Self-challenge each finding; advance only survivors         |
| Accepting findings without a PoC                 | Gate on confirmed exploitability in a sandbox               |
| LLM free-solo instead of tool-grounded           | Triage on top of SAST/DAST/fuzzers; tools give ground truth |
| One severity number                              | Severity **and** confidence, rated separately               |
| Auto-merging agent security fixes                | Human validation + sign-off, always                         |
| Trusting the review harness with broad privilege | Least privilege, scoped allowlists, runtime governance      |
| Benchmarking on possibly-leaked datasets         | Include unseen-zero-day evals (ZeroDayBench)                |

## Checklist

- [ ] Findings produced by a fan-out of specialized per-class agents, not one model
- [ ] Finder tier is cheap/distilled/on-prem; verify/judge tier is stronger or a vote-panel
- [ ] Each finding passes an adversarial self-challenge before it surfaces
- [ ] Findings accepted only on confirmed exploitability (PoC), not plausibility
- [ ] Agents grounded in SAST/DAST/fuzzers/CodeQL — not raw pattern-matching
- [ ] Severity and confidence rated separately; human owns merge/sign-off
- [ ] Runs continuously in CI (shift-left), not as an annual pentest
- [ ] Review harness runs least-privilege with scoped tool allowlists
- [ ] Pipeline measured on CyberGym / ZeroDayBench / PentestJudge, precision and recall split

## References

- [Anthropic — Claude Code Security](https://www.anthropic.com/news/claude-code-security)
- [Microsoft Build 2026 — securing code, agents, models (MDASH)](https://www.microsoft.com/en-us/security/blog/2026/06/02/microsoft-build-2026-securing-code-agents-and-models-across-the-development-lifecycle/)
- [XBOW — AI penetration testing platform](https://xbow.com/platform)
- [Toward Cybersecurity-Expert Small Language Models](https://arxiv.org/html/2510.14113v1)
- [PentestJudge — judging agent behavior](https://arxiv.org/pdf/2508.02921) · [ZeroDayBench](https://arxiv.org/pdf/2603.02297)

Related: [[agent-workflows]] (the orchestration + cost discipline this rides on), [[git-for-ai-agents]] (securing the agents and their git ops), [[verification-checklist]] (the local gate), and the `security/` domain — [[webapp-security]], [[serverless-aws-security]] — for what these agents are looking _for_.
