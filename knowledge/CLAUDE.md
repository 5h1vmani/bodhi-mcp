# Nucleus - AI Agent Guide

> Synthesized knowledge that requires research to derive. Not generic advice.

---

## Setup (Run First)

**Before making ANY commits, run:**

```bash
npm install
```

This activates git hooks. Skip this and your commits may be rejected.

---

## Getting Started

1. **Find your task** → `INDEX.md` has task routing table
2. **Read ONE doc** → TL;DR first, full doc only if needed
3. **Skip templates/ and meta/** → Unless contributing to Nucleus

---

## How to Read Docs

```
1. TL;DR (2-4 bullets)     ← Often sufficient
2. Decision Guide          ← Scenario → Approach
3. Checklist               ← Before completing work
4. Full doc                ← Only if needed
```

---

## When to Ask vs Proceed

| Situation                    | Action  |
| ---------------------------- | ------- |
| Following existing patterns  | Proceed |
| Clear specification provided | Proceed |
| Architectural change         | Ask     |
| Multiple valid approaches    | Ask     |
| Not covered by patterns      | Ask     |

---

## Adding to Nucleus

**Value Test:** Would an LLM need to research this, or does it already know?

| Result                         | Action         |
| ------------------------------ | -------------- |
| LLM knows this                 | Don't add      |
| Requires 1 source              | Link to source |
| Requires 2+ sources + judgment | Add to Nucleus |

**If adding:**

1. Tell user → get approval
2. **Read `meta/contributing.md`** → Writing Playbooks section has quality rules
3. Use `templates/playbook.md` → Write Decision Guide FIRST
4. Update `INDEX.md` and domain `_index.md`
5. Run `npm run format`

---

## Before Committing

Run formatting after editing markdown files:

```bash
npm run format        # Format all files
npm run format:check  # Check without changing
```

Pre-commit hook runs Prettier automatically on staged files.

---

## Structure

```
nucleus/
├── CLAUDE.md      ← You are here
├── INDEX.md       ← Task routing + full file list
├── domains/       ← Playbooks (synthesized knowledge)
├── templates/     ← For new docs
└── meta/          ← About Nucleus
```

---

Schema version: 1.3 | Last updated: 2025-01-25
