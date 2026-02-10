# Documentation Domain

> Best practices for writing clear, maintainable, AI-friendly documentation.

## Quick Summary

This domain covers documentation patterns: how to structure docs for humans and AI agents, write effective TL;DRs, maintain docs over time, and optimize for different audiences.

## Files in This Domain

| File              | When to Use                                    | Complexity   |
| ----------------- | ---------------------------------------------- | ------------ |
| `ai-optimized.md` | Writing docs AI agents can consume efficiently | Intermediate |
| `api-docs.md`     | API reference documentation, OpenAPI specs     | Intermediate |

## Key Principles

1. **TL;DR first** - Lead with the summary, details follow
2. **Scannable structure** - Headers, bullets, tables over prose
3. **Single source of truth** - Link, don't duplicate
4. **Update on change** - Docs ship with code
5. **Know your audience** - Developers, AI agents, end users need different things
6. **Examples > explanations** - Show, don't just tell

## Quick Reference

### Document Types

| Type          | Purpose                  | Update Frequency    |
| ------------- | ------------------------ | ------------------- |
| README        | Entry point, quick start | Every release       |
| API Reference | Endpoint details         | With API changes    |
| Architecture  | System design decisions  | Major changes       |
| Tutorials     | Learning paths           | Periodic review     |
| ADRs          | Decision records         | When decisions made |

### TL;DR Patterns

```
Good TL;DR:
- 2-4 bullet points
- Actionable takeaways
- Specific, not vague
- Often sufficient alone

Bad TL;DR:
- "This document covers X" (not actionable)
- 10+ bullets (too long)
- "See below for details" (useless)
```

### AI-Friendly Docs

| Pattern                 | Why It Helps                         |
| ----------------------- | ------------------------------------ |
| Structured headings     | Agents can skip to relevant sections |
| Tables for comparisons  | Denser than prose, easier to parse   |
| Code with language tags | Proper syntax highlighting           |
| Explicit links          | Agents can follow to related docs    |
| Front-loaded content    | Important info in first 20%          |

## When to Consult This Domain

- Starting a new project's documentation
- Writing API documentation
- Creating onboarding guides
- Optimizing docs for AI consumption
- Establishing documentation standards
- Reviewing existing documentation

## Related Domains

- `backend/payment-integration.md` - API design patterns in payment context
- `architecture/` - Decision records, system design
- `testing/` - Test documentation

---

Last updated: 2025-01-24
