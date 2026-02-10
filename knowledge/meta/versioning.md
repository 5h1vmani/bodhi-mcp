# Nucleus Versioning

> How Nucleus playbooks are versioned and maintained.

## Version Tracking

### Document Level

Each playbook tracks:

| Field          | Location        | Purpose                     |
| -------------- | --------------- | --------------------------- |
| `last_updated` | Frontmatter     | Date of most recent change  |
| Changelog      | End of document | Table of changes with dates |

```yaml
---
last_updated: 2025-01-25
---

## Changelog

| Date       | Change                    |
| ---------- | ------------------------- |
| 2025-01-25 | Added Decision Guide      |
| 2025-01-20 | Initial version           |
```

### Schema Level

Overall Nucleus structure version in `CLAUDE.md`:

```markdown
Schema version: 1.3 | Last updated: 2025-01-25
```

Schema version changes when:

- Required frontmatter fields change
- Playbook structure requirements change
- New domains added
- Navigation patterns change

## Update Types

| Type     | Changelog Entry? | Examples                                            |
| -------- | ---------------- | --------------------------------------------------- |
| Minor    | No               | Typo fixes, broken link repairs, clarifications     |
| Standard | Yes              | New guidance, updated recommendations, new sections |
| Major    | Yes + announce   | Changed approaches, deprecations, restructuring     |

## Deprecation Process

When a playbook becomes outdated:

1. **Add deprecation notice** at top:

```markdown
> **DEPRECATED (2025-01-25):** Superseded by [New Playbook](path.md).
```

1. **Update frontmatter:**

```yaml
---
deprecated: true
superseded_by: new-approach.md
---
```

1. **Update INDEX.md** to mark as deprecated

## For AI Agents

When reading playbooks:

| Check                         | Action                            |
| ----------------------------- | --------------------------------- |
| `last_updated` > 6 months old | May need review - mention to user |
| `deprecated: true`            | Follow `superseded_by` link       |
| Schema version mismatch       | Report to user                    |

## Maintenance Schedule

| Content             | Review Frequency            |
| ------------------- | --------------------------- |
| Core playbooks      | Quarterly                   |
| Technology-specific | When major versions release |
| Templates           | Annually                    |
| Meta docs           | When process changes        |
