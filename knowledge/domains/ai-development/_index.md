# AI Development

> Patterns for AI-assisted software development — agent orchestration, cost optimization, and human-AI collaboration.

## When to Use This Domain

| Task                                | Read This              |
| ----------------------------------- | ---------------------- |
| Multi-agent orchestration           | `agent-workflows.md`   |
| Model selection (Opus/Sonnet/Haiku) | `agent-workflows.md`   |
| Cost optimization for AI agents     | `agent-workflows.md`   |
| Context management                  | `agent-workflows.md`   |
| Building an MCP server              | `mcp-server-design.md` |
| MCP tool design for knowledge bases | `mcp-server-design.md` |
| MCP transport selection             | `mcp-server-design.md` |
| MCP caching and invalidation        | `mcp-server-design.md` |
| MCP evaluation suite design         | `mcp-server-design.md` |

## Documents

| File                   | Description                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| `agent-workflows.md`   | Multi-agent patterns, model selection, cost control                       |
| `mcp-server-design.md` | MCP server architecture, AI-first tool design, caching, provenance, evals |
| `agent-web-data-acquisition.md` | Tiered web-scraping decision framework: HTTP vs headless browser vs AI-native tools, cost tiers |
| `agentic-security-review.md` | Orchestrating agent fleets for vulnerability discovery: find, verify, prove exploitability |
| `git-for-ai-agents.md` | Git workflow for AI agents: worktrees, WIP commits, attribution, guardrails, small PRs |

## Domain Scope

**Include:**

- Multi-agent orchestration patterns
- Model selection decision frameworks
- Cost optimization strategies
- Context management techniques
- Subagent configuration patterns
- Human-AI collaboration workflows
- MCP server design for knowledge bases
- Tool design patterns for AI agent consumption

**Exclude:**

- Generic AI/ML concepts (LLMs know these)
- Prompt engineering basics (well-documented elsewhere)
- Tool-specific tutorials (link to official docs)
- MCP protocol specification details (read the spec directly)
