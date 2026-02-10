---
domain: ai-development
topic: agent-workflows
tags: [claude-code, multi-agent, cost-optimization]
complexity: intermediate
last_updated: 2025-01-28
---

# AI Agent Workflows

> Cost-optimized multi-agent patterns for Claude Code — when to use Opus, Sonnet, or Haiku.

## Web App vs CLI

Claude Code exists in two interfaces with different model-switching mechanisms:

| Interface                    | Model Switching                                | Subagent Config                               |
| ---------------------------- | ---------------------------------------------- | --------------------------------------------- |
| **Web App** (claude.ai/code) | Select model when starting conversation        | Request subagents inline with model parameter |
| **CLI** (claude command)     | `/model opus`, `/model sonnet`, `/model haiku` | `.claude/agents/` markdown files              |

### Web App Workflow

You're on Opus? Stay there for planning. Spawn subagents for other phases:

```
Use a Haiku agent to explore the authentication code
Use a Sonnet agent to implement the login validation
```

The orchestrating model (your conversation) delegates to cheaper models via subagents.

### CLI Workflow

Switch models mid-session:

```
/model opus    # Plan
/model sonnet  # Implement
/model haiku   # Quick exploration
```

Or use pre-configured subagents from `.claude/agents/`.

## TL;DR

- **Opus for planning** — architecture decisions, feature design, audits
- **Sonnet for implementation** — code generation, bug fixes, standard tasks
- **Haiku for research** — exploration, doc search, read-only analysis (90% capability at 1/3 cost)
- **Parallel subagents** reduce wall-clock time without increasing per-task cost
- **Built-in Explore agent** already uses Haiku — leverage it for codebase navigation

## Decision Guide

### By Phase

| Phase              | Model  | Why                                         |
| ------------------ | ------ | ------------------------------------------- |
| **Planning**       | Opus   | Complex reasoning, architecture decisions   |
| **Implementation** | Sonnet | Code generation, standard tasks             |
| **Research**       | Haiku  | Fast, read-only, 90% capability at 1/3 cost |

### By Task Type

| Scenario                        | Model  | Phase     | Why                                         |
| ------------------------------- | ------ | --------- | ------------------------------------------- |
| Feature planning                | Opus   | Planning  | Requires architectural reasoning            |
| Architecture design             | Opus   | Planning  | Complex tradeoffs, system-wide impact       |
| Codebase audit                  | Opus   | Planning  | Deep security/performance analysis          |
| Large-scale refactoring         | Opus   | Planning  | Multi-file context, novel problem-solving   |
| Standard feature implementation | Sonnet | Implement | Anthropic's recommended default for coding  |
| Bug fixes                       | Sonnet | Implement | Sufficient reasoning at lower cost          |
| Debugging and troubleshooting   | Sonnet | Implement | Good tool orchestration, balanced cost      |
| Codebase exploration            | Haiku  | Research  | Read-only; built-in Explore agent does this |
| Web research, doc fetching      | Haiku  | Research  | High-volume extraction, simple synthesis    |
| Code review (read-only)         | Haiku  | Research  | Pattern matching, no complex reasoning      |
| Type checking, linting          | Haiku  | Research  | Fast validation tasks                       |

## Model Capabilities & Pricing

| Model      | Input   | Output   | Relative | SWE-bench | Best For                    |
| ---------- | ------- | -------- | -------- | --------- | --------------------------- |
| Haiku 4.5  | $1/MTok | $5/MTok  | 1x       | 73.3%     | Subagents, exploration      |
| Sonnet 4.5 | $3/MTok | $15/MTok | 3x       | 77.2%     | Most coding tasks (default) |
| Opus 4.5   | $5/MTok | $25/MTok | 5x       | Best      | Complex orchestration       |

**Key insight:** Haiku gets within 5 percentage points of Sonnet for 1/3 the cost.

## Multi-Agent Patterns

### Pattern 1: Parallel Research (Haiku)

Spawn multiple Haiku subagents for independent exploration:

```
Research the authentication, database, and API modules
in parallel using separate subagents
```

Each runs independently, returns summaries to orchestrator. Cost: 3x Haiku, not 3x Opus.

### Pattern 2: Plan → Implement → Research Workflow

**CLI Workflow:**

```
1. /model opus          ← Plan the feature
2. /model sonnet        ← Implement the code
3. (auto) Haiku         ← Research/explore as needed
```

**CLI Example:**

```
/model opus
> Plan a new authentication flow with OAuth2

[Opus analyzes codebase, proposes architecture]

/model sonnet
> Implement step 1: Add OAuth client configuration

[Sonnet writes the code]

> Research how existing session management works

[Built-in Explore agent uses Haiku automatically]
```

**Web App Workflow:**

Start conversation with Opus, then delegate:

```
> Plan a new authentication flow with OAuth2

[Opus analyzes codebase, proposes architecture]

> Use a Sonnet agent to implement step 1: Add OAuth client configuration

[Sonnet subagent writes the code, returns summary]

> Use a Haiku agent to research how existing session management works

[Haiku subagent explores, returns findings]
```

Reserve Opus for planning and synthesis; delegate implementation to Sonnet subagents.

### Pattern 3: Isolate Verbose Operations

Delegate to subagents to keep main context lean:

- Running test suites
- Fetching documentation
- Processing log files
- Generating reports

Verbose output stays in subagent context; only summary returns.

### Pattern 4: Specialized Subagents by Phase

Create role-specific agents with appropriate model tiers:

| Agent Role    | Model  | Phase     | Tools                       |
| ------------- | ------ | --------- | --------------------------- |
| Planner       | Opus   | Planning  | All tools                   |
| Code Auditor  | Opus   | Planning  | Read, Glob, Grep, Bash      |
| Implementer   | Sonnet | Implement | Read, Edit, Write, Bash     |
| Researcher    | Haiku  | Research  | Read, Glob, Grep, WebSearch |
| Code Reviewer | Haiku  | Research  | Read, Glob, Grep, Bash      |
| Doc Searcher  | Haiku  | Research  | Read, Glob, Grep            |

## Creating Custom Subagents

### CLI Only: Via `/agents` Command

```
/agents → Create new agent → Select model → Configure tools
```

### CLI Only: Via Markdown File (`.claude/agents/`)

```markdown
---
name: code-reviewer
description: Expert code review. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: haiku
---

You are a senior code reviewer. Focus on:

- Code quality and readability
- Security vulnerabilities
- Performance issues
- Best practices violations

Provide specific, actionable feedback.
```

### Research Agent Template

```markdown
---
name: researcher
description: Deep research on topics. Use for exploration tasks.
tools: Read, Glob, Grep, WebFetch, WebSearch
model: haiku
---

Research thoroughly. Return:

1. Key sources (3-5 authoritative)
2. Points of agreement across sources
3. Points of disagreement
4. Synthesis opportunities
```

## Common Mistakes

| Mistake                               | Fix                                               |
| ------------------------------------- | ------------------------------------------------- |
| Using Opus for everything             | Default to Sonnet; Opus for complex orchestration |
| Running exploration in main context   | Use built-in Explore agent (auto-Haiku)           |
| Not using parallel subagents          | Spawn independent research tasks simultaneously   |
| Large context from verbose output     | Delegate tests/logs to subagents                  |
| Creating subagents without model spec | Always set `model: haiku` for read-only agents    |
| Ignoring `/cost` command              | Monitor token usage regularly                     |

## Forcing Delegation (Web App)

Opus won't automatically delegate — you must explicitly instruct it. Without guidance, Opus will handle everything itself (expensive).

### Standing Orders

Start your session with delegation rules:

```
For this session:
- Use Haiku subagents for all codebase exploration and file searches
- Use Sonnet subagents for all code implementation and edits
- Only use Opus (yourself) for planning, synthesis, and architectural decisions
- Before writing code directly, spawn a Sonnet agent to do it
- Before exploring files, spawn a Haiku agent to do it
```

### Per-Task Delegation

Be explicit in every request:

| Instead of...                    | Say...                                                 |
| -------------------------------- | ------------------------------------------------------ |
| "Explore the auth module"        | "Use a Haiku agent to explore the auth module"         |
| "Implement the login validation" | "Use a Sonnet agent to implement the login validation" |
| "Find all API endpoints"         | "Use a Haiku agent to find all API endpoints"          |
| "Fix the bug in user.ts"         | "Use a Sonnet agent to fix the bug in user.ts"         |

### Verify Delegation

Check if Opus is actually delegating:

```
Are you delegating implementation tasks to Sonnet agents?
Show me which model handled the last code change.
```

### CLAUDE.md Delegation Rules (For CLI)

Add to your project's CLAUDE.md:

```markdown
## Mandatory Delegation

When working on this codebase:

- ALWAYS use Haiku subagents for: file exploration, grep/glob searches, reading docs
- ALWAYS use Sonnet subagents for: writing code, editing files, running tests
- ONLY use Opus directly for: planning, architecture, synthesis, complex decisions
- Before ANY file edit, spawn a Sonnet agent
- Before ANY exploration, spawn a Haiku agent
```

## Cost Control Commands (CLI Only)

| Command    | Purpose                                   |
| ---------- | ----------------------------------------- |
| `/cost`    | Show current session token usage          |
| `/model`   | Switch models mid-session                 |
| `/clear`   | Clear context between unrelated tasks     |
| `/compact` | Summarize conversation to reduce tokens   |
| `/agents`  | Manage subagents and their model settings |

**Web App:** These commands are not available. Use model picker for new conversations and request subagents inline.

## Context Management

### Reduce Token Waste

1. **Clear between tasks** — `/clear` when switching topics
2. **Custom compaction** — `/compact Focus on code samples and API usage`
3. **Delegate verbose ops** — tests, logs, docs to subagents
4. **Specific prompts** — "add validation to login in auth.ts" not "improve codebase"

### Subagent Context Isolation

Subagents have independent context windows:

- Verbose output stays in subagent
- Only summary returns to parent
- Subagent transcripts persist for resumption

## Checklist

### CLI Users

- [ ] Default model set to Sonnet (not Opus) in `.claude/settings.json`
- [ ] Planning tasks use `/model opus` before starting
- [ ] Implementation uses Sonnet (default)
- [ ] Research/exploration delegated to Haiku subagents
- [ ] Custom subagents specify `model: haiku` for read-only tasks
- [ ] Custom subagents specify `model: opus` for audit/planning tasks
- [ ] Parallel subagents used for independent research
- [ ] Verbose operations delegated to subagents
- [ ] `/cost` checked periodically
- [ ] Context cleared between unrelated tasks

### Web App Users

- [ ] Start planning conversations with Opus
- [ ] Request Sonnet subagents for implementation tasks
- [ ] Request Haiku subagents for exploration/research
- [ ] Use parallel subagent requests for independent tasks
- [ ] Keep orchestration in Opus; delegate execution to cheaper models

## References

- [Claude Code Subagents Guide](https://code.claude.com/docs/en/sub-agents) — Official subagent documentation
- [Claude Code Costs](https://code.claude.com/docs/en/costs) — Cost management strategies
- [Model Configuration](https://code.claude.com/docs/en/model-config) — Model selection docs
- [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing) — Current pricing

## Related

- [meta/contributing.md](../../meta/contributing.md) — Multi-agent research process

---

## Changelog

| Date       | Change                                                 |
| ---------- | ------------------------------------------------------ |
| 2025-01-28 | Added Forcing Delegation section for Web App users     |
| 2025-01-28 | Added Web App vs CLI distinction and workflows         |
| 2025-01-28 | Added Plan → Implement → Research phase-based workflow |
| 2025-01-28 | Initial version from multi-source synthesis            |
