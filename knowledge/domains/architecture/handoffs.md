---
domain: architecture
topic: handoffs
tags: [handoff, session-continuity, context-transfer, ai-workflow]
complexity: beginner
last_updated: 2025-01-26
related:
  - decisions.md
  - ../../templates/handoff.md
---

# Session Handoffs

> How to document context for seamless continuation of work across sessions, team members, or AI agents.

## TL;DR

- Create handoff documents when pausing work that will be resumed later
- Capture: what was done, what's next, key decisions, and blockers
- Store handoffs in a predictable location (`/docs/handoffs`)
- Write for someone with zero context about your session

## When to Create Handoffs

| Trigger                     | Action                             |
| --------------------------- | ---------------------------------- |
| End of work session         | Create handoff for incomplete work |
| Switching to different task | Handoff current task state         |
| Before vacation/time off    | Handoff all active work            |
| AI context getting full     | Checkpoint via handoff             |
| Passing work to teammate    | Detailed handoff required          |
| Completing a phase          | Handoff to document what's ready   |

## Essential Handoff Sections

```markdown
# Handoff: [Task Name]

**Date:** 2025-01-24 | **Author:** [Name] | **Status:** [In Progress/Blocked/Paused]

## Summary

One paragraph: What is this work about? What's the goal?

## What Was Completed

- Specific completed items with file references

## What's Next

1. Prioritized remaining tasks
2. Include estimates if known

## Key Decisions Made

| Decision | Rationale | Alternatives Considered |
| -------- | --------- | ----------------------- |

## Blockers / Open Questions

- Anything blocking progress
- Questions needing answers

## How to Continue

1. Step-by-step resumption instructions
2. Reference exact files and line numbers
```

## Best Practices

### Write for Zero Context

- Assume reader knows nothing about your session
- Be specific: "Created user authentication using JWT tokens" not "Did the auth thing"
- Reference exact files, line numbers, and identifiers

### Capture Critical Information

- **Decisions:** Document rationale, not just what was chosen
- **Blockers:** List explicitly with clear labels (BLOCKED, QUESTION, DEPENDENCY)
- **File changes:** List all modified files with brief descriptions
- **Context that might get lost:** Client requirements, constraints, unusual choices

### Include Recovery Instructions

- How to reset if things go wrong
- Required environment variables or feature flags
- Database migrations or setup steps

## Storage & Naming

**Location:**

```
docs/handoffs/
├── 2025-01-24-auth-implementation.md
├── 2025-01-24-payment-refactor.md
└── _active.md  # Current/most recent handoff
```

**Naming:** `YYYY-MM-DD-brief-description.md`

**For AI Agents:**

- Check for `docs/handoffs/_active.md` at session start
- Read recent handoffs for context
- Create/update `_active.md` when work pauses
- Archive completed handoffs by renaming with date prefix

## Common Mistakes

| Mistake                                 | Fix                                                       |
| --------------------------------------- | --------------------------------------------------------- |
| Handoffs too brief to be useful         | Include enough detail for zero-context reader             |
| Not creating handoffs ("I'll remember") | Always create - you won't remember                        |
| Handoffs scattered across tools         | Use one canonical location per project                    |
| Missing "how to continue" instructions  | Always include specific next steps and file locations     |
| Not mentioning blockers                 | Make blockers prominent and explicit                      |
| Vague descriptions ("fixed bug")        | Be specific ("Fixed JWT expiry validation in auth.ts:78") |
| No rationale for decisions              | Document why, not just what                               |
| Missing file locations and line numbers | Reference exact locations for easy resumption             |

## Checklist

Before ending a session with incomplete work:

- [ ] Handoff document created
- [ ] Summary explains the work clearly
- [ ] Completed items listed specifically
- [ ] Next steps are actionable and ordered
- [ ] Key decisions documented with rationale
- [ ] Blockers called out explicitly
- [ ] File locations and line numbers included
- [ ] Recovery instructions if needed
- [ ] Stored in correct location

## Related Documentation

- [Architecture Decisions](./decisions.md) - Document significant technical decisions
- [Handoff Template](../../templates/handoff.md) - Copy-paste starter template
