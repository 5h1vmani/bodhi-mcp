---
domain: documentation
topic: ai-optimized
tags: [documentation, ai, llm, context, token-efficiency]
complexity: intermediate
last_updated: 2025-01-24
---

# AI-Optimized Documentation

> How to write documentation that AI agents can consume efficiently and act on accurately.

## TL;DR

- **TL;DR first** - AI can often stop reading after the summary
- **Structured over prose** - Tables, lists, headers > paragraphs
- **Front-load decisions** - Put the "what to do" before "why"
- **Explicit over implicit** - State the obvious; AI won't infer
- **Link, don't repeat** - AI can follow links; duplication wastes tokens

## Decision Guide

| Documentation Type | Structure Approach                  | Key Elements                            |
| ------------------ | ----------------------------------- | --------------------------------------- |
| API reference      | Tables for endpoints/parameters     | Defaults, required fields, types        |
| Tutorial           | Numbered steps, code blocks         | Expected output at each step            |
| Architecture       | Diagrams (Mermaid), decision tables | Trade-offs, when to use what            |
| Configuration      | Tables with defaults                | All options, explicit values            |
| Troubleshooting    | Table: Problem → Solution           | Specific error messages, exact commands |
| Best practices     | Decision guide first, then examples | Scenarios → approaches                  |

## The TL;DR Pattern

```markdown
## TL;DR

- **Key term** - One actionable sentence
- **Another term** - Specific, not vague (e.g., "48px minimum" not "large enough")
- **Action-oriented** - "Use X" not "X exists"
```

**Rules:** 2-4 bullets max, bold key terms, self-contained (often the only part read).

## Structured Content

### Tables Over Prose

```markdown
| Field Type | Validate On | Why                         |
| ---------- | ----------- | --------------------------- |
| Standard   | Blur        | Don't interrupt typing      |
| Email      | Blur        | Complete input needed       |
| Password   | Input       | Show strength in real-time  |
| Optional   | Submit      | Don't nag for optional data |
```

### Lists Over Paragraphs

```markdown
Loading state timing:

- **< 400ms** - No indicator needed
- **400ms - 1s** - Spinner
- **1s - 4s** - Skeleton screen
- **> 4s** - Progress bar with estimate
```

## Front-Load Decisions

Put the answer before the explanation:

```markdown
## Authentication Methods

**Use session cookies for web apps.** Use JWT for APIs. Use OAuth for third-party integration.

| Method          | Best For            | Trade-off                         |
| --------------- | ------------------- | --------------------------------- |
| Session cookies | Web apps            | Requires session store            |
| JWT             | APIs, microservices | Token size, revocation complexity |
| OAuth           | Third-party auth    | Implementation complexity         |
```

## Explicit Instructions

AI agents don't infer. Be explicit about every step:

```markdown
Handle errors by:

1. Catching at the boundary (controller/handler level)
2. Logging with context (user ID, request ID)
3. Returning user-friendly message (never expose stack traces)
4. Using appropriate HTTP status codes (400 for client, 500 for server)
```

Always specify defaults:

```markdown
| Option    | Default       | Description              |
| --------- | ------------- | ------------------------ |
| `timeout` | `30000`       | Request timeout in ms    |
| `retries` | `3`           | Number of retry attempts |
| `backoff` | `exponential` | Retry strategy           |
```

## Token Efficiency

### Link, Don't Repeat

```markdown
## API Error Handling

Follow [standard error handling](../backend/error-handling.md). For API-specific concerns, also handle:

- Rate limiting (429 responses)
- Version deprecation warnings
```

### Use Anchors for Sections

```markdown
See [validation timing](./form-design.md#validation-timing).
```

## Semantic Structure

Use predictable headings: TL;DR → Decision Guide → Main Content → Common Mistakes → Checklist → Changelog.

### YAML Frontmatter

```yaml
---
domain: backend
topic: error-handling
tags: [errors, exceptions, logging, http-status]
complexity: intermediate
last_updated: 2025-01-24
---
```

Enables filtering by domain, searching by tags, assessing complexity, and checking freshness.

### Code Blocks

Always specify language:

````markdown
```python
def example():
    pass
```
````

## Common Mistakes

| Mistake                            | Fix                                              |
| ---------------------------------- | ------------------------------------------------ |
| Vague TL;DR ("this covers X")      | Actionable bullets with specific values          |
| Prose paragraphs for options       | Tables with columns for scenarios/approaches     |
| Burying recommendations in text    | Lead with bold recommendation, table for details |
| "Handle appropriately"             | Explicit numbered steps                          |
| Repeating content across docs      | Link to single source of truth                   |
| Generic headings ("Introduction")  | Specific names ("Why This Matters")              |
| Missing defaults in config docs    | Table with Default column                        |
| Code blocks without language tags  | Always specify language for syntax highlighting  |
| Explanation before decision        | Decision first (bold), explanation after         |
| Implicit assumptions about context | State all prerequisites explicitly               |

## Checklist

- [ ] TL;DR section with 2-4 actionable bullets
- [ ] Decision guide table for different scenarios
- [ ] Tables for comparisons, lists for sequences
- [ ] Decisions/recommendations stated first
- [ ] Explicit instructions (no "handle appropriately")
- [ ] Links instead of duplicated content
- [ ] YAML frontmatter with tags
- [ ] Code blocks with language specified
- [ ] All defaults and required values documented

---

## Changelog

| Date       | Change                                     |
| ---------- | ------------------------------------------ |
| 2025-01-24 | Condensed, added Decision Guide and tables |
| 2025-01-24 | Initial version                            |
