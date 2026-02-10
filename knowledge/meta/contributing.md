# Contributing to Nucleus

> Only add what AI agents can't derive on their own.

## The Value Test (Required)

Before adding ANY content, ask:

> "Would Claude/GPT-4 need to research and synthesize this, or do they already know it?"

| Test Result                    | Action                                 |
| ------------------------------ | -------------------------------------- |
| LLM knows this                 | **Don't add** — it's wasted tokens     |
| Requires 1 source              | **Link to source** — don't duplicate   |
| Requires 2+ sources + judgment | **Add to Nucleus** — this is the value |

### Examples

| Content                                                     | Passes? | Why                                |
| ----------------------------------------------------------- | ------- | ---------------------------------- |
| "Use 48px touch targets"                                    | No      | Every LLM knows this               |
| "Gamification means adding game mechanics"                  | No      | Basic definition                   |
| "Octalysis: 8 Core Drives with White/Black Hat distinction" | Yes     | Synthesized framework              |
| "When to use streaks vs badges vs leaderboards"             | Yes     | Decision matrix requiring judgment |
| "Our team uses X instead of Y"                              | Yes     | Team-specific convention           |

## What Belongs in Nucleus

| Include                                    | Exclude                   |
| ------------------------------------------ | ------------------------- |
| Decision frameworks with tradeoffs         | Generic advice            |
| Synthesized patterns from multiple sources | Single-source summaries   |
| Anti-patterns from real project failures   | Textbook warnings         |
| Team conventions that differ from defaults | Universal standards       |
| Curated checklists (combined sources)      | Single-source checklists  |
| Emerging 2024-2025 patterns                | Well-established patterns |

## Contribution Process

### For AI Agents

```
1. Identify gap: "Nucleus doesn't cover [topic]"
2. Apply value test: Would I need to research this?
3. If NO → Don't add. Use your existing knowledge.
4. If YES → Ask user: "Should I research and add [topic] to Nucleus?"
5. If approved:
   - Research from multiple sources
   - Synthesize into decision framework
   - Create doc using template
   - Update _index.md and INDEX.md
```

### For Humans

```
1. Apply value test
2. If passes: Create doc using templates/playbook.md
3. Update index files
4. Commit with conventional message
```

## Writing Playbooks

### Creation Order

Write sections in this order (not document order):

```
1. Decision Guide    ← Core value. Write FIRST.
2. Common Mistakes   ← Real failures, not hypotheticals
3. TL;DR             ← Compress Decision Guide into bullets
4. Checklist         ← Verification items from above
5. Guidance sections ← Supporting detail only if needed
```

### Section-by-Section Guide

#### Decision Guide (Required — Write First)

The most important section. Every playbook exists to answer "When X, do Y."

| Rule                        | Example                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| Scenarios must be specific  | "Building onboarding flow" not "When you need engagement"         |
| Approaches must be concrete | "Progress bar + quick-win badges" not "Use appropriate mechanics" |
| Include the WHY column      | Helps reader adapt when scenario doesn't match exactly            |
| 5-10 rows maximum           | If more, split into multiple playbooks                            |

```markdown
✓ | Scenario | Approach | Why |
| Onboarding new users | Progress bar + 3 quick-win badges | Completion drive + early dopamine |
| Habit formation app | Streaks with freeze option | Loss aversion without anxiety |

✗ | Scenario | Approach |
| When needed | Use best approach |
| Complex cases | It depends |
```

#### TL;DR (Required)

Must work standalone — reader should get value without reading anything else.

| Rule                                | Example                                             |
| ----------------------------------- | --------------------------------------------------- |
| 3-5 bullets maximum                 | More = not a summary                                |
| Each bullet = one decision shortcut | Not background or definitions                       |
| Bold the key insight                | `**White Hat > Black Hat** — positive mechanics...` |
| No "you should" or "consider"       | State facts, not suggestions                        |

```markdown
✓ TL;DR

- **Intrinsic > Extrinsic** — mastery beats points for lasting engagement
- **White Hat mechanics** (accomplishment) over Black Hat (scarcity)
- Streaks need forgiveness — add freeze option or users quit

✗ TL;DR

- Gamification can improve user engagement
- Consider your user's motivation
- There are several approaches to choose from
```

#### Common Mistakes (Required)

Must be real failures, not hypothetical warnings.

| Rule                   | Example                                                |
| ---------------------- | ------------------------------------------------------ |
| From actual experience | "Teams often do X" not "You might do X"                |
| Fix must be specific   | "Add 1-2 streak freezes/month" not "Be more forgiving" |
| Table format preferred | Scannable, token-efficient                             |

```markdown
✓ | Mistake | Fix |
| Points without meaning | Tie XP to real progress (lessons, tasks) |
| Same mechanics for all | Segment: achievers→levels, socializers→teams |

✗ | Mistake | Fix |
| Bad gamification | Use good gamification |
| Not thinking about users | Think about users more |
```

#### Checklist (Required)

Verification items, not process steps. Answer "Did I do X?" not "Do X."

```markdown
✓ Checklist

- [ ] Rewards tied to real user value (not arbitrary points)
- [ ] Streaks have forgiveness mechanism
- [ ] Leaderboards are optional or segmented

✗ Checklist

- [ ] Implement gamification
- [ ] Test thoroughly
- [ ] Consider edge cases
```

#### Guidance Sections (Optional)

Only add if Decision Guide needs supporting detail.

| Rule                   | When to Include                             |
| ---------------------- | ------------------------------------------- |
| Framework explanations | Only if synthesized from multiple sources   |
| Code examples          | Only if implementation is non-obvious       |
| Detailed tables        | Only if they compress significant knowledge |

**Cut aggressively.** If the Decision Guide is clear, readers don't need more.

### Compression Rules

Target: **< 200 lines**. If over, apply these:

| Bloat                                   | Fix                                       |
| --------------------------------------- | ----------------------------------------- |
| Paragraphs explaining obvious things    | Delete entirely                           |
| Multiple examples making same point     | Keep best one                             |
| "Introduction" or "Background" sections | Move essential bits to TL;DR, delete rest |
| Nested bullet lists                     | Convert to table                          |
| Prose that could be a table             | Convert to table                          |

### One Playbook = One Decision Type

| Scope                                          | Status                      |
| ---------------------------------------------- | --------------------------- |
| "Gamification" (one topic, multiple scenarios) | Good                        |
| "Gamification and Analytics" (two topics)      | Split into two playbooks    |
| "Authentication and Authorization"             | Split — different decisions |
| "REST API Design" (one topic)                  | Good                        |

### Research Process (For AI Agents)

```
1. Search 3-5 authoritative sources on the topic
2. Identify where sources AGREE → becomes Decision Guide
3. Identify where sources DISAGREE → becomes "it depends" scenarios
4. Identify what sources MISS → your synthesis value-add
5. Identify common failures → becomes Common Mistakes
6. Compress into Nucleus format
```

### Multi-Agent Cost Optimization (For Claude Code)

When using Claude Code (Opus 4.5 orchestrator), delegate research tasks to cheaper models:

| Task                          | Model  | Why                                    |
| ----------------------------- | ------ | -------------------------------------- |
| Codebase exploration          | Haiku  | Read-only, uses built-in Explore agent |
| Web research, source fetching | Haiku  | High-volume, simple extraction         |
| Synthesis, decision framework | Sonnet | Balanced reasoning at 1/3 Opus cost    |
| Final review, orchestration   | Opus   | Complex judgment, architectural calls  |

**Model pricing (per million tokens):**

- Haiku: $1/$5 (input/output) — 90% of Sonnet capability at 1/3 cost
- Sonnet: $3/$15 — Anthropic's recommended default
- Opus: $5/$25 — reserve for complex orchestration

**Parallel research pattern:**

```
Research [topic A], [topic B], and [topic C] in parallel using separate subagents
```

Each runs on Haiku, works independently, returns summaries to orchestrator.

**Create custom Haiku subagents for repetitive research:**

```markdown
---
name: nucleus-researcher
description: Research topics for Nucleus playbooks. Use proactively for source gathering.
tools: Read, Glob, Grep, WebFetch, WebSearch
model: haiku
---

Research the topic thoroughly. Return:

1. Key sources (3-5 authoritative)
2. Points of agreement
3. Points of disagreement
4. Gaps/synthesis opportunities
```

## Quality Gates

Every document must pass ALL gates:

| Gate             | Requirement                                | Check                             |
| ---------------- | ------------------------------------------ | --------------------------------- |
| Value test       | LLM needs research to know this            | Would GPT-4 need to look this up? |
| Synthesis        | Combined 2+ sources or made judgment calls | Not just summarizing one article  |
| Decision-focused | Contains scenario → approach mapping       | Has a Decision Guide table        |
| Actionable       | Reader can apply immediately               | No "it depends" without specifics |
| Concise          | < 200 lines; tables over prose             | Token-efficient                   |
| No placeholders  | Content exists and is complete             | No "TODO" or empty sections       |

## Document Structure

Required sections:

```markdown
---
domain: [required]
topic: [required]
tags: [3-4 max, no redundant terms]
complexity: [beginner|intermediate|advanced]
last_updated: [YYYY-MM-DD]
---

# Title

> One line (not a definition — a value proposition)

## TL;DR

- Synthesized insight (not "use good practices")
- Decision shortcut
- Key tradeoff

## Decision Guide

| Scenario           | Approach                | Why       |
| ------------------ | ----------------------- | --------- |
| Specific situation | Concrete recommendation | Reasoning |

## [Topic-specific content]

## Common Mistakes

| Mistake              | Fix                  |
| -------------------- | -------------------- |
| Real failure pattern | Synthesized solution |

## Checklist

- [ ] Actionable verification item

## References

- [Source](url) — Only if adds value beyond the doc
```

## What NOT to Include

### Generic Advice (Fails Value Test)

```markdown
❌ "Write clean code"
❌ "Test your code thoroughly"
❌ "Consider user experience"
❌ "Follow security best practices"
```

### Definitions (LLMs Know These)

```markdown
❌ "Gamification is the application of game mechanics..."
❌ "REST stands for Representational State Transfer..."
❌ "TDD means writing tests before code..."
```

### Universal Numbers (Well-Known)

```markdown
❌ "Touch targets should be 48px minimum"
❌ "Respond to user actions within 400ms"
❌ "Aim for 80% test coverage"
```

## Good Contributions

### Decision Framework

```markdown
✓ | Scenario | Approach |
| Onboarding | Progress bar + quick-win badges |
| Habit formation | Streaks + daily challenges |
| Learning app | XP + levels + mastery badges |
```

### Synthesized Pattern

```markdown
✓ Octalysis Framework: 8 Core Drives

- White Hat (1-3): Long-term engagement
- Black Hat (6-8): Short-term action, long-term churn
- Lean toward White Hat for sustainable products
```

### Anti-Pattern from Experience

```markdown
✓ | Mistake | Fix |
| Points without meaning | Tie XP to real progress |
| Same mechanics for all users | Segment by motivation type |
```

## File Naming

- Lowercase, hyphens: `api-design.md`
- Match topic in frontmatter
- Descriptive but concise

## Updating Existing Docs

1. Read fully first
2. Make focused changes
3. Update `last_updated`
4. Add changelog entry for substantive changes

## Deprecating Content

```markdown
> **DEPRECATED:** Superseded by [New Doc](path.md).

---

deprecated: true
superseded_by: path/to/new.md

---
```

## No Placeholders Policy

- INDEX.md lists only existing docs
- Don't add "TODO: write this" entries
- Don't create empty domain folders
- If a doc doesn't exist, it's not listed

## Questions?

- AI agents: Ask the user
- Humans: Discuss before major changes
