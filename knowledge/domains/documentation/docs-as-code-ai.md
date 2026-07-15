---
domain: documentation
topic: docs-as-code in the AI-agent era
tags: [documentation, docs-as-code, ai-agents, agents-md, drift]
complexity: intermediate
last_updated: 2026-06-29
confidence: 0.8
source_refs:
  - "AGENTS.md (Agentic AI Foundation / Linux Foundation, Dec 2025); empirical AGENTS.md study"
  - "llms.txt / llms-full.txt for AI doc retrieval"
  - "Diátaxis, Vale, docs-as-code CI (traditional methods that newly matter more)"
  - "Executable docs / docs-as-tests; doc-drift detection"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku/Sonnet researchers
version: 1
---

# Docs-as-Code in the AI Era

> Docs now have two readers: a human who infers, and an agent that takes them literally. The pre-AI docs-as-code pipeline still works — it matters _more_ — but the agent reader adds new artifacts, a new failure mode (drift that silently misdirects agents), and a few unconventional plays that pay off big.

## TL;DR

- **The agent reads prescriptively, not descriptively.** Where a human bridges a stale doc with common sense, an agent executes it literally. Wrong docs don't just confuse — they actively misdirect the agent.
- **Reuse the pre-AI pipeline; it's now load-bearing.** Diátaxis structure, Vale + markdownlint in CI, docs in-repo reviewed by PR, link-checking with warnings-as-errors, single-sourcing. AI floods volume; these are the guardrails that scale.
- **Agent-facing artifacts are non-obvious-only.** `AGENTS.md` and `llms.txt` should carry what an agent can't infer from the repo. A study found LLM-generated AGENTS.md files _lowered_ task success 2% and raised cost 23% by duplicating what was already there.
- **Drift is the core failure.** Close it structurally: generate docs from the source of truth, make snippets executable (docs-as-tests), and run a CI agent that flags doc/code mismatch.
- **AI drafts; humans own correctness.** Never auto-publish. Good 2026 docs are human-judgment docs that AI helped write, not AI-generated docs.

## Decision Guide

| Decision                         | Choice                                                                | Why                                                     |
| -------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| Doc structure                    | Diátaxis (tutorial / how-to / reference / explanation)                | Now the industry-standard split by reader intent        |
| Where docs live                  | In the repo, reviewed by PR, built + linted in CI                     | Same gate as code; drift caught at review               |
| Style + consistency at AI volume | Vale + markdownlint in CI, warnings-as-errors                         | Machine guardrails scale where human review can't       |
| Agent context file               | `AGENTS.md` — non-obvious facts only, reference don't copy            | Generated/duplicated AGENTS.md _hurt_ success and cost  |
| Machine-readable doc index       | `llms.txt` (overview + links); `llms-full.txt` (inline) for retrieval | Agents locate and load the right docs without crawling  |
| API reference                    | Generate from OpenAPI/spec; see [[api-docs]]                          | Single source of truth; no hand-sync                    |
| Keeping docs true                | Generate from source; executable snippets; drift-detection CI         | Prose duplicating code rots; structure prevents it      |
| Publishing AI-drafted docs       | Human review gate, always                                             | AI drafts confidently and wrongly; correctness is human |

## Reuse from the pre-AI playbook (now load-bearing)

None of this is obsolete — AI raises the stakes. **Diátaxis** splits docs by reader intent (tutorials teach, how-tos solve a task, reference states facts, explanation builds understanding); it's now the default structure and it also maps cleanly to what an agent needs (reference + how-to). **Docs-as-code**: docs in the repo, changed via PR, built and linted in CI, with **link-checking and warnings-as-errors** so a broken doc fails the build like a broken test. **Vale + markdownlint** enforce a style guide mechanically — more valuable now because AI generates volume faster than humans can hand-review. **Single-sourcing / DRY**: one canonical place per fact, linked not copied (the same rule that keeps this knowledge base clean). The shift isn't replacement — it's that these guardrails are now the thing standing between an agent and a confidently-wrong instruction.

## Agent-facing artifacts

A new class of doc exists for the agent reader:

- **`AGENTS.md`** — the prescriptive context file an agent loads to work in your repo (donated to the Linux Foundation's Agentic AI Foundation, Dec 2025, alongside MCP). Treat it as an executable contract, not a brochure. **Put only non-obvious facts** (build quirks, invariants, conventions an agent can't infer) and **reference existing docs rather than copying** — the empirical finding is that fat, duplicative, or LLM-generated AGENTS.md files measurably _hurt_ (−2% success, +23% cost). This is the Value Test, applied to agent context.
- **`llms.txt` / `llms-full.txt`** — a machine-readable index (sitemap analog) so agents find the right docs: `llms.txt` is a compact overview with links; `llms-full.txt` embeds full content to avoid fetches.
- **MCP doc server** — expose docs as a tool so agents retrieve current content on demand instead of training on a stale snapshot.

## Drift: the core failure mode, closed structurally

Doc drift — the gap between what the code does and what the docs say — was a human annoyance; for agents it's an active hazard, because the agent acts on the stale doc. Don't fight drift with discipline; remove the gap by construction:

- **Generate from the source of truth.** API reference from the OpenAPI spec, CLI help from the parser, config docs from the schema. Hand-written prose that restates code is what rots.
- **Executable docs (docs-as-tests).** Make every code snippet a runnable test (doctest-style) so the build fails when a sample goes stale. Docs that are tests can't silently lie.
- **Drift-detection in CI.** A check (increasingly an agent) that diffs a code change against the docs it touches and flags or opens a PR when they diverge — the doc analog of a failing test.

## Unconventional, high-leverage with AI

- **Docs-as-evals.** Turn your how-tos into an eval: can an agent complete the task from the doc alone? Failures pinpoint exactly where the doc is ambiguous or wrong — a feedback loop humans never had.
- **Spec-driven development.** The doc/spec is the source; the agent generates code _and_ tests from it. Documentation stops trailing the code and starts driving it.
- **Freshness provenance.** Stamp docs with the commit they were last verified against; a CI agent re-checks and re-stamps. Makes staleness queryable instead of invisible.

## The human-judgment gate

AI is excellent at the first draft and terrible at knowing when it's wrong. 68% of developers now use AI to help write docs (up from 11% in 2023), but the durable rule is unchanged: **AI drafts, a human owns correctness, nothing auto-publishes.** Route AI-written docs through the same PR + CI gate as code (see [[git-for-ai-agents]], [[verification-checklist]]).

## Common Mistakes

| Mistake                                | Fix                                                            |
| -------------------------------------- | -------------------------------------------------------------- |
| Treating AGENTS.md as a brochure       | Non-obvious facts only; reference, don't copy                  |
| LLM-generating AGENTS.md from the repo | Hand-write the genuinely non-obvious; generated/dup files hurt |
| Hand-written prose restating code      | Generate from the source of truth (spec, schema, parser)       |
| Snippets that aren't tested            | Executable docs (doctest); broken sample fails the build       |
| Drift caught only when a human notices | Drift-detection check/agent in CI                              |
| Docs outside the repo, no review       | In-repo, PR-reviewed, built + linted in CI                     |
| No style enforcement at AI volume      | Vale + markdownlint, warnings-as-errors                        |
| Auto-publishing AI-written docs        | Human correctness gate before merge                            |
| One giant doc with no intent split     | Diátaxis: tutorial / how-to / reference / explanation          |

## Checklist

- [ ] Docs live in-repo, changed by PR, built + linted in CI (Vale/markdownlint, link-check, warnings-as-errors)
- [ ] Structure follows Diátaxis; one canonical source per fact, linked not copied
- [ ] `AGENTS.md` holds only non-obvious facts and references rather than duplicates
- [ ] `llms.txt`/`llms-full.txt` (or an MCP doc server) exposes docs to agents
- [ ] Reference docs generated from the source of truth, not hand-restated
- [ ] Code snippets are executable tests; a stale sample fails the build
- [ ] A drift check flags code/doc mismatch in CI
- [ ] AI-drafted docs pass a human correctness gate before publishing

## References

- [AGENTS.md — guide and spec (2026)](https://www.augmentcode.com/guides/how-to-build-agents-md) · [Impact of AGENTS.md on agent efficiency (study)](https://arxiv.org/pdf/2601.20404)
- [llms.txt for AI doc retrieval (Fern)](https://buildwithfern.com/post/optimizing-api-docs-ai-agents-llms-txt-guide)
- [Diátaxis framework](https://diataxis.fr/)
- [Docs linting with Vale (Fern)](https://buildwithfern.com/post/docs-linting-guide)
- [ContextCov — executable constraints from agent instruction files](https://arxiv.org/pdf/2603.00822)

Related: [[ai-optimized]] (how to write for the agent reader), [[api-docs]] (generate reference from the spec), [[git-for-ai-agents]] (docs in-repo, PR-reviewed, commit-as-memory), [[verification-checklist]] (the CI gate), and [[agent-workflows]] (docs-as-evals feed agent quality).
