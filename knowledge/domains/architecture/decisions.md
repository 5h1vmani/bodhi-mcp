---
domain: architecture
topic: decisions
tags: [adr, documentation, architecture, decisions]
complexity: beginner
last_updated: 2025-01-24
related:
  - ../../templates/adr.md
---

# Architecture Decision Records (ADRs)

> How to document architectural decisions so future developers (and AI agents) understand WHY choices were made.

## TL;DR

- Document significant technical decisions using ADRs
- Focus on context and rationale, not just the decision
- Keep ADRs immutable - supersede rather than edit
- Store ADRs close to the code they affect

## Context

Code tells you WHAT and HOW, but rarely WHY. ADRs capture the context behind technical decisions, preventing repeated discussions and helping new team members (including AI agents) understand the codebase.

## When to Write an ADR

**Do write ADRs for:**

- Technology/framework selection
- Architectural patterns (monolith vs microservices)
- Data storage choices
- Authentication/authorization approach
- API design decisions (REST vs GraphQL)
- Major refactoring approaches
- Third-party service selection
- Breaking changes to existing patterns

**Don't write ADRs for:**

- Code style preferences (use linters)
- Library version updates (routine maintenance)
- Bug fixes (use commit messages)
- Implementation details within established patterns

## ADR Structure

Essential format:

```markdown
# ADR-001: [Title]

## Status

Accepted | Rejected | Deprecated | Superseded by ADR-XXX

## Context

What problem are we solving? What constraints exist?

## Decision Drivers

- Key factors influencing the decision

## Considered Options

1. Option A (pros/cons)
2. Option B (pros/cons)

## Decision

We will use [option] because [rationale]

## Consequences

### Positive

- Benefits gained

### Negative

- Trade-offs accepted
```

## Key Practices

### Keep ADRs Immutable

Never edit an accepted ADR. Create a new one that supersedes it.

```markdown
# ADR-005: Migrate from PostgreSQL to CockroachDB

## Status

Accepted (supersedes ADR-001)
```

**Why:** The historical record shows how thinking evolved.

### Store ADRs Near the Code

```
project/
├── docs/
│   └── decisions/
│       ├── adr-001-database-selection.md
│       └── README.md  # Index of all ADRs
└── src/
```

**Cross-cutting decisions** that affect multiple repos go in Nucleus or central documentation.

### Number and Title Conventions

```
adr-001-use-postgresql-for-database.md
adr-002-adopt-rest-api-standard.md
adr-003-implement-event-sourcing.md
```

### Link ADRs to Code

```python
# Using PostgreSQL JSONB for flexible metadata storage
# See: docs/decisions/adr-001-database-selection.md
metadata = Column(JSONB, nullable=True)
```

## Decision Guide

| Scenario                  | Action                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| New project starting      | Document initial tech stack choices                                 |
| Changing existing pattern | Write ADR explaining why change is needed                           |
| Rejected proposal         | Document as "Rejected" - valuable for avoiding repeated discussions |
| Decision reversed         | Write new ADR that supersedes, explain what changed                 |
| Temporary workaround      | Document with "Deprecated" status and timeline                      |

## Common Mistakes

| Mistake                                      | Fix                                                         |
| -------------------------------------------- | ----------------------------------------------------------- |
| Writing ADRs after the fact, missing context | Write ADRs during the decision-making process, not after    |
| Too much detail about implementation         | Focus on the decision and rationale, not how to implement   |
| Not listing rejected alternatives            | Always document what you considered and why you rejected it |
| ADRs scattered across wikis, docs, Slack     | One canonical location per repository                       |

## Checklist

- [ ] Decision is significant enough to warrant an ADR
- [ ] Context clearly explains the problem/need
- [ ] All considered options are listed with pros/cons
- [ ] Decision rationale is clear
- [ ] Consequences (positive and negative) are documented
- [ ] ADR is numbered sequentially
- [ ] ADR is stored in the correct location
- [ ] Index/README is updated

## References

- [Documenting Architecture Decisions - Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)

## Related Documentation

- Architecture Patterns - Common patterns to consider (coming soon)
- [ADR Template](../../templates/adr.md) - Template for new ADRs

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2025-01-24 | Initial version |
