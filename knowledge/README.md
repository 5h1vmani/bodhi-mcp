# Nucleus

> Synthesized knowledge that AI agents can't derive on their own.

## What Nucleus Is

Nucleus contains **research-backed decisions and synthesized frameworks** — the kind of knowledge that requires reading multiple sources, weighing tradeoffs, and combining insights.

**Nucleus is for:**

- Decision frameworks (When to use X vs Y, with nuanced tradeoffs)
- Synthesized patterns (Octalysis framework applied to your context)
- Anti-patterns from real failures (not textbook "don't do X")
- Your team's specific conventions that override defaults
- Curated checklists combining multiple authoritative sources
- Emerging patterns (2024-2025) not yet in LLM training data

**Nucleus is NOT for:**

- Generic best practices any LLM already knows
- Basic definitions ("Gamification is...")
- Universal standards (48px touch targets, 400ms response times)
- Single-source documentation (just link to it)
- Placeholder "we should document this someday" entries

## The Value Test

Before adding content, ask:

> "Would Claude/GPT-4 need to research and synthesize this, or do they already know it?"

If an LLM can answer correctly without research → **don't add it**.
If it requires reading 3+ sources and making judgment calls → **add it**.

## For AI Agents

**Start here:** Read `CLAUDE.md` for task-based routing.

```
CLAUDE.md          → Entry point, task routing
INDEX.md           → Master index (only existing docs listed)
domains/<topic>/   → Playbooks (synthesized knowledge)
```

### Reading Strategy

```
1. TL;DR (2-4 bullets)     ← Often sufficient
2. Decision Guide          ← Scenario → Approach mapping
3. Full document           ← Only if needed
```

## Structure

```
nucleus/
├── CLAUDE.md              # AI agent entry point
├── INDEX.md               # Index of EXISTING docs only
├── domains/               # Synthesized knowledge by domain
├── templates/             # For creating new docs
├── meta/                  # Contributing guidelines
├── hooks/                 # Git validation
└── scripts/               # Automation
```

## Document Format

Every doc must justify its existence:

```markdown
---
domain: ux
topic: gamification
tags: [gamification, engagement, rewards]
complexity: intermediate
last_updated: 2025-01-25
---

# Topic

> One-line description

## TL;DR

- Synthesized insight 1 (not generic advice)
- Synthesized insight 2
- Decision shortcut 3

## Decision Guide

| Scenario | Approach | Why       |
| -------- | -------- | --------- |
| X        | Do Y     | Because Z |

## [Domain-specific sections...]

## Common Mistakes

| Mistake      | Fix                  |
| ------------ | -------------------- |
| Real failure | Synthesized solution |

## Checklist

- [ ] Verification item
```

## Contributing

Before adding content:

1. **Pass the value test** — Would an LLM need to research this?
2. **No placeholders** — Only add docs that exist and have content
3. **Synthesize, don't summarize** — Combine sources, make decisions
4. **Link, don't duplicate** — If one good source exists, link to it

See `meta/contributing.md` for full guidelines.

## Quality Gates

| Gate               | Requirement                                     |
| ------------------ | ----------------------------------------------- |
| Value test         | LLM would need research to know this            |
| No generic advice  | "Use good naming" fails; decision matrix passes |
| Synthesis required | Combined 2+ sources or made judgment calls      |
| Actionable         | Reader can apply immediately                    |
| Concise            | < 200 lines; tables over prose                  |

## Setup (Required)

**After cloning or pulling this repo, you MUST run:**

```bash
npm install
```

This activates git hooks that validate your changes before commit/push.

> [!IMPORTANT]
> **For AI Agents:** Always run `npm install` in the nucleus directory before making any commits. This configures `core.hooksPath` to use the hooks in `./hooks/`. Without this step, your commits will bypass validation and may be rejected on push.

### Troubleshooting Hooks

If hooks are not running, verify the configuration:

```bash
git config core.hooksPath  # Should output: ./hooks
```

If not set, re-run `npm install` or manually set it:

```bash
git config core.hooksPath ./hooks
```

---

## Git Hooks

| Hook         | Validates                               |
| ------------ | --------------------------------------- |
| `pre-commit` | Frontmatter, TL;DR present, file naming |
| `commit-msg` | Conventional commits format             |
| `pre-push`   | Full validation, no broken links        |

## License

Internal use only.
