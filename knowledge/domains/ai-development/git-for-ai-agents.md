---
domain: ai-development
topic: git workflow for AI coding agents
tags: [git, ai-agents, worktrees, provenance, multi-agent]
complexity: intermediate
last_updated: 2026-06-29
confidence: 0.85
source_refs:
  - "Worktree-per-agent isolation + lock-contention/data-loss reports (Claude Code, Cursor)"
  - "Linux kernel 2026 AI-contribution policy (Assisted-by, DCO humans-only)"
  - "AgenticFlict 107k-PR conflict dataset; Bloomberg Pomona small-diff study"
  - "Jujutsu (jj) for agents; gitleaks/TruffleHog/push-protection; Sigstore gitsign"

status: validated
review_by: 2026-12-31
author: Claude Opus 4.8 + Haiku/Sonnet researchers
version: 1
---

# Git for AI Coding Agents

> What changes when an agent holds the keyboard: it runs in parallel, loses memory mid-task, commits constantly, and can do something destructive from a misread instruction. Generic git assumes none of that. This is the delta.

## TL;DR

- **One git worktree per agent, branched from main — never share a checkout.** The non-obvious risk: a failed `.git/index.lock` plus auto-cleanup can delete a worktree's uncommitted work silently. Worktrees isolate files, not ports/databases.
- **Commit as save-point and as memory.** Frequent WIP commits are the rollback net and the durable ground truth that survives context compaction. Squash to a clean history only at PR time.
- **Attribute, don't impersonate.** `Assisted-by:` is overtaking `Co-Authored-By:` (a model can't hold copyright or sign a DCO). Only a human adds `Signed-off-by`. The `noreply@anthropic.com` co-author email has misattributed commits to real users.
- **Rails before autonomy.** Protected `main`, no force-push to shared branches, clean-tree precondition, and 3-layer secret scanning — agents leak secrets at ~2-3x the human rate.
- **Small PRs, and don't rewrite a branch mid-review.** Conflict rates triple from ~2-line to ~50-line diffs; force-pushing during review measurably lowers merge odds. Append fixups instead.

## Decision Guide

| Decision                       | Choice                                                             | Why                                                         |
| ------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| Many agents, one repo          | One worktree per agent, branched from main                         | Filesystem isolation; shared `.git` object store, ~1s setup |
| Worktree + runtime collisions  | Per-agent ports + DB branching, or containers                      | Worktrees isolate files, not ports/caches/DBs               |
| Parallel work assignment       | Partition at the **task** level, not just CODEOWNERS               | CODEOWNERS is a review signal, not a lock                   |
| Merging N agent branches       | ≤3 sequential to main; 4+ via an integration branch; avoid octopus | Octopus aborts on any conflict; integration lands serially  |
| History during a long session  | Frequent WIP commits; `--autosquash` before PR                     | Save-points + memory during; clean history at the end       |
| Rolling back a session         | `git tag session-start` → `reset --hard`; `reflog` as the deep net | Tags survive; reflog recovers after a bad reset (~90 days)  |
| Undo on a pushed/shared branch | `git revert`, never `reset --hard`                                 | Rewriting shared history breaks every clone                 |
| AI attribution                 | `Assisted-by:` trailer; human-only `Signed-off-by`                 | Models can't certify the DCO or hold copyright              |
| Signing bot/CI commits         | Sigstore `gitsign` (keyless) or SSH signing                        | No stored key in CI; matters more when bots push            |
| Agent PR size                  | Small; append fixups mid-review, don't force-push                  | Conflict rate triples with size; force-push lowers merges   |

## Isolation: a worktree per agent

`git worktree add -b <branch> <path> origin/main` gives each agent its own working directory while sharing the `.git` object store — ~1s to create, cheap on disk. Native in Claude Code (`isolation: worktree`), Codex, Cursor. The failure modes that bite:

- **Lock contention.** Parallel `git worktree add` races on `.git/config.lock`; concurrent commits race on `.git/index.lock`. Serialize creation or add 100-500ms jitter; retry commits with backoff.
- **Silent data loss.** When a commit fails on the index lock and the harness auto-cleans the worktree, **uncommitted work vanishes**. Preserve dirty worktrees before removal; lock with `git worktree lock` while an agent runs.
- **Files, not runtime.** Two agents still collide on ports, databases, caches. Add per-agent ports + DB branching, or run each in a container.
- **Shared-state path trap.** Handoff/queue files shared across worktrees must resolve via `git rev-parse --git-common-dir`, or they write into the per-worktree dir and disappear on cleanup.
- **Disk creep.** `node_modules`/build artifacts accumulate per worktree; prune aggressively.

Full clones give total isolation but are slow/heavy (small repos only); a single shared checkout is sequential-only — avoid for parallel agents.

## Concurrency and merge

Partition tasks so two agents never target the same files. Treat **lockfiles as generated** — never hand-merge `pnpm-lock.yaml`/`package-lock.json`; regenerate via install, and keep orchestrator commits off them. Beware **semantic conflicts**: git merges two agents cleanly and still produces broken code, so gate every merge with build + type-check + lint. Make agents **idempotent** — compute the final state and overwrite, commit only when checks pass — so a retried agent doesn't duplicate work.

## Long sessions: checkpoint, memory, recovery

Commit at each logical boundary: the commit is both a rollback target and **durable memory** an agent re-reads at startup to rebuild context after compaction. Record the _why_ in the body (constraints, rejected alternatives) so the next window inherits intent, not just a diff. Keep the run's save-points, then **squash before the PR** — tag checkpoints `fixup!`/`squash!` and run `git rebase -i --autosquash main`; back up with a branch first. Recovery: `reflog` is the undo net; `reset --hard` is local-only; `git bisect run <test>` finds a regression (but breaks on flaky/non-monotonic tests). **Precondition every run on a clean tree and correct branch** (`git diff-index --quiet HEAD`); stash or branch pre-existing edits so agent work isn't entangled with unrelated changes.

## Provenance and signing

`Co-Authored-By:` is the current tool default but is being walked back (it implies a legal personhood a model lacks; placeholder emails misattribute commits). The emerging norm — anchored by the Linux kernel's 2026 policy — is **`Assisted-by: <agent>:<model> [tools]`** for disclosure, with the **human's `Signed-off-by`** carrying DCO responsibility (agents must not add it). Sign bot/CI commits with **Sigstore `gitsign`** (keyless, no stored secret) or SSH; require signed commits on protected branches. For an audit trail of who-wrote-what, tools like AgentDiff record agent authorship in git notes.

## Safety rails

- **Protected `main` / rulesets:** require PR, block force-push and direct commits, require signed + linear history.
- **Constrain destructive ops:** an agent should never force-push a shared branch, `reset --hard` shared history, `clean -fdx`, or `filter-repo`. Gate via harness permissions or a pre-tool command guard.
- **Secrets, 3 layers:** gitleaks pre-commit (fast, local) → TruffleHog in CI (`--results=verified`) → platform push protection (free). On a leak, **rotate first** — history-scrubbing with `git filter-repo` is cosmetic because forks and caches keep the old history.
- **Agent-specific threats:** prompt injection from poisoned issues/filenames driving git actions, wrong-remote pushes, and supply-chain via agent-installed deps (pin lockfiles, audit before install, dependency cooldown). Keep agents off untrusted input rather than trusting a filter.

## Review and merge

Keep agent PRs **small** — conflict rate rises from ~10% (≈2-line diffs) to ~30% (≈50-line) and big agent PRs hide tech debt and security issues. **Reviewer engagement is the strongest predictor of a merge**, and **force-pushing mid-review lowers merge odds** (it breaks the reviewer's shared understanding) — append fixup commits instead. Always require a human merge gate even with auto-merge. Use a **merge queue** to serialize many agent PRs (re-tests against the up-to-date base) and **stacked PRs** (Graphite, git-machete, `ghstack`, Sapling) for dependent work. **Local pre-commit/pre-push hooks are the first gate** — an agent reads the hook failure, fixes, and re-commits before CI ever runs. See [[verification-checklist]].

## Emerging: worth a pilot

- **Jujutsu (jj):** no staging index, auto-snapshotted working copy, first-class (non-blocking) conflicts, powerful op-log/undo — argued ideal for agents, with a git-compatible backend. Caveat: it snapshots only on command (no daemon), so crash-recovery needs a shell hook; adoption is still niche. Pilot, don't bet the org.
- **Sparse-checkout / partial clone:** cap an agent's blast radius and context in a monorepo.

## Common Mistakes

| Mistake                                               | Fix                                                         |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Two agents sharing one checkout                       | One worktree per agent; serialize creation                  |
| Auto-cleanup deletes a worktree with uncommitted work | Preserve dirty worktrees; `git worktree lock` while running |
| Assuming worktrees isolate runtime                    | Add per-agent ports + DB branching, or containers           |
| Hand-merging a lockfile                               | Regenerate via install; treat lockfiles as generated        |
| `reset --hard` on a pushed branch                     | `git revert`; reset only local history                      |
| 40 "wip" commits in the PR                            | `--autosquash` before opening; squash-merge                 |
| `Co-Authored-By` with a placeholder email             | `Assisted-by:` trailer; human `Signed-off-by`               |
| Force-pushing a branch under review                   | Append fixup commits; rebase only after approval            |
| Trusting an agent on `main`                           | Protected branch + PR + human merge gate                    |
| Scrubbing a leaked secret instead of rotating         | Rotate first; scrubbing is cosmetic                         |

## Checklist

- [ ] Each agent runs in its own worktree off main; creation serialized; dirty worktrees preserved
- [ ] Runtime isolation (ports, DB) handled, not just files
- [ ] Tasks partitioned so agents don't overlap; merges gated by build/type/lint
- [ ] Frequent WIP commits during the run; `--autosquash` before the PR
- [ ] `session-start` tag + reflog as the rollback path; `revert` on shared history
- [ ] `Assisted-by:` attribution; human `Signed-off-by`; bot commits signed
- [ ] Protected main, no force-push to shared branches, destructive ops gated
- [ ] Secret scanning at pre-commit + CI + push protection; rotate-first on leak
- [ ] Small PRs; no force-push mid-review; human merge gate; hooks as first gate

## References

- [Git worktrees for parallel AI agents (Augment)](https://www.augmentcode.com/guides/git-worktrees-parallel-ai-agent-execution)
- [Linux kernel — coding assistants policy](https://docs.kernel.org/process/coding-assistants.html)
- [Assisted-by: the emerging AI trailer (All Things Open)](https://allthingsopen.org/articles/open-source-ai-contributions-assisted-by-git-trailer-standard)
- [Agent pull requests — how to review them (GitHub)](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/)
- [Sigstore gitsign — keyless signing for bots (Chainguard)](https://www.chainguard.dev/unchained/keyless-git-commit-signing-with-gitsign-and-github-actions)
- [Jujutsu for AI coding agents (Panozzo)](https://www.panozzaj.com/blog/2025/11/22/avoid-losing-work-with-jujutsu-jj-for-ai-coding-agents/)

Related: [[agent-workflows]] (orchestration this rides on), [[verification-checklist]] (the hook gate), [[testing-strategy]] (bisect + flaky tests), [[handoffs]] (commit-as-memory across sessions), and [[logging-observability]] (audit-trail patterns).
