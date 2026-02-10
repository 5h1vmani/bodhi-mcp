# Architecture Domain

> System design patterns, architectural decisions, and high-level technical planning.

## Quick Summary

This domain covers how to design systems at a high level, make architectural decisions, and document them for future reference.

## Files in This Domain

| File             | When to Use                                          | Complexity   |
| ---------------- | ---------------------------------------------------- | ------------ |
| `patterns.md`    | Choosing between monolith, microservices, serverless | Intermediate |
| `decisions.md`   | Documenting why you made a technical choice          | Beginner     |
| `handoffs.md`    | Session continuity and context transfer              | Beginner     |
| `scalability.md` | Planning for growth and high load                    | Advanced     |

## Key Principles

1. **Document decisions, not just outcomes** - Future developers need to know WHY
2. **Start simple, evolve as needed** - Don't over-architect early
3. **Consider operational complexity** - More services = more things to manage
4. **Design for failure** - Assume components will fail

## When to Consult This Domain

- Starting a new project or major feature
- Evaluating technology choices
- Preparing for scale or performance requirements
- Refactoring existing systems
- Onboarding team members to system design

## Related Domains

- `backend/` - Implementation details for server-side
- `devops/` - Infrastructure and deployment
- `security/` - Security architecture considerations

---

Last updated: 2025-01-24
