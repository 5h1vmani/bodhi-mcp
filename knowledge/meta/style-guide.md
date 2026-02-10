# Nucleus Style Guide

> Writing standards for Nucleus playbooks.

## Playbook Structure

### Required Sections (in order)

```
1. Frontmatter      ← Metadata
2. Title (H1)       ← Topic name
3. One-liner        ← Blockquote value proposition
4. TL;DR            ← 3-5 decision shortcuts
5. Decision Guide   ← Core value (Scenario → Approach → Why)
6. Common Mistakes  ← Real failures with fixes
7. Checklist        ← Verification items
8. Changelog        ← Version history
```

### Optional Sections

Only include if Decision Guide needs supporting detail:

- Framework/approach explanation (if synthesized from multiple sources)
- Guidance with Do/Don't examples (if implementation non-obvious)
- References (external sources only)
- Related (other Nucleus playbooks)

**Rule:** Delete unused optional sections. Target < 200 lines.

## Writing Style

### Voice

| Do                                | Don't                                            |
| --------------------------------- | ------------------------------------------------ |
| Active voice: "Use REST for CRUD" | Passive: "REST should be used"                   |
| Direct: "Do this"                 | Hedging: "You might want to consider"            |
| State facts                       | Give opinions (unless marked as recommendations) |
| Specific terms                    | Vague language                                   |

### Formatting

**Headings:**

```markdown
# Document Title (H1 - only one)

## Major Sections (H2)

### Subsections (H3)
```

**Tables over prose** — Use tables for:

- Comparisons
- Decision guides
- Structured data
- Anything with patterns

**Code blocks:**

- Specify language
- Keep examples minimal
- Show Do/Don't pairs

```python
# Good - language specified
def example():
    pass
```

**Emphasis:**

- **Bold** for key terms
- `code` for technical terms, files, commands
- > Blockquotes for important callouts

## Frontmatter

### Required Fields

```yaml
---
domain: backend # Lowercase, matches folder
topic: api-design # Lowercase, hyphenated
tags: [rest, api, http] # 3-4 max, lowercase
complexity: intermediate # beginner | intermediate | advanced
last_updated: 2025-01-25 # ISO date
---
```

### Optional Fields

```yaml
related:
  - path/to/related.md
deprecated: true # Only if deprecated
superseded_by: new-doc.md # If replaced
```

## Length Guidelines

| Section            | Target          |
| ------------------ | --------------- |
| One-liner          | 1 sentence      |
| TL;DR              | 3-5 bullets     |
| Decision Guide     | 5-10 rows       |
| Common Mistakes    | 3-6 rows        |
| **Total document** | **< 200 lines** |

## Token Efficiency

Playbooks are consumed by AI agents. Optimize for:

1. **Front-load value** — TL;DR and Decision Guide first
2. **Tables over prose** — Compress information
3. **No redundancy** — Link, don't repeat
4. **Clear headings** — Agents can skip sections
5. **Cut aggressively** — Every line must add value

## Linking

### Internal (Nucleus)

Relative paths from current file:

```markdown
[Payment Integration](../domains/backend/payment-integration.md)
```

### External

Full URLs with descriptive text:

```markdown
[Microsoft REST Guidelines](https://github.com/microsoft/api-guidelines)
```

Never use "click here" or bare URLs.

## Review Checklist

- [ ] Frontmatter complete
- [ ] TL;DR has 3-5 decision shortcuts (not background)
- [ ] Decision Guide has specific scenarios and concrete approaches
- [ ] Common Mistakes are real failures (not hypotheticals)
- [ ] Checklist items are verifiable ("Did I do X?")
- [ ] < 200 lines total
- [ ] No broken links
- [ ] Changelog updated
- [ ] `npm run format` passed
