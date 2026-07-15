# Bodhi MCP

> Synthesized decision frameworks for AI agents. Enlightenment through curated knowledge.

[![npm version](https://img.shields.io/npm/v/bodhi-mcp)](https://www.npmjs.com/package/bodhi-mcp)
[![CI](https://github.com/5h1vmani/bodhi-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/5h1vmani/bodhi-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is Bodhi?

Bodhi is an MCP (Model Context Protocol) server that provides **pre-synthesized knowledge** that AI agents can't derive on their own — decision frameworks requiring 2+ sources and human judgment.

Unlike raw documentation, Bodhi serves **distilled wisdom**: decision guides, common mistakes, and actionable checklists synthesized from multiple authoritative sources.

## Quick Start

### MCP-Compatible Clients (Claude Desktop, Cursor, etc.)

Add to your MCP client config (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "bodhi": {
      "command": "npx",
      "args": ["bodhi-mcp"]
    }
  }
}
```

Or with a custom knowledge path:

```json
{
  "mcpServers": {
    "bodhi": {
      "command": "npx",
      "args": ["bodhi-mcp", "--knowledge-path", "/path/to/your/knowledge-base"]
    }
  }
}
```

### Local Development

```bash
# Clone and install
git clone https://github.com/5h1vmani/bodhi-mcp.git
cd bodhi-mcp
npm install

# Build
npm run build

# Run with your knowledge base
npm start -- --knowledge-path /path/to/knowledge
```

## Available Tools

All tools use the `bodhi_` prefix, return both markdown and structured JSON (`response_format: "json" | "markdown"`), and include `outputSchema` + `annotations`.

### `bodhi_route(task)`

**Find the best playbook for a given task.**

Uses the INDEX.md routing table to match tasks to relevant playbooks. Returns the most relevant playbook with confidence score and alternatives.

```
Input: { "task": "pitch deck design for investors" }
Output: {
  "playbook": "domains/marketing/pitch-deck-strategy.md",
  "confidence": 0.85,
  "title": "Pitch Deck Strategy",
  "domain": "marketing",
  "tldr": "Stage-specific structure, investor psychology...",
  "alternatives": [...]
}
```

### `bodhi_search(query, domain?, limit?)`

**Full-text search across all playbooks.**

Use for broader queries when `bodhi_route()` doesn't find a match, or to explore related topics.

```
Input: { "query": "UPI payment", "domain": "ux" }
Output: [
  { "path": "domains/ux/india-checkout-patterns.md", "title": "India Checkout Patterns", "score": 12.5, ... },
  ...
]
```

### `bodhi_list(domain?, complexity?, limit?)`

**List all available playbooks with metadata.**

Use to explore what knowledge is available or filter by domain/complexity.

```
Input: { "domain": "security", "complexity": "advanced" }
Output: [
  { "path": "domains/security/serverless-aws-security.md", "title": "Serverless AWS Security", ... },
  ...
]
```

### `bodhi_read(path, section?)`

**Read the full content of a specific playbook.**

Use after `bodhi_route()` or `bodhi_search()` to get the complete playbook content.

```
Input: { "path": "domains/ux/gamification.md", "section": "Decision Guide" }
Output: "## Decision Guide\n\n| Scenario | Approach | Why |..."
```

### `bodhi_summary()`

**Get a summary of the knowledge base.**

Returns total playbooks, domains, and complexity distribution.

### `bodhi_diagnose()`

**Health check and debugging information.**

Use to troubleshoot setup issues or verify the knowledge base is loaded correctly.

```
Output: {
  "status": "healthy",
  "version": "0.4.0",
  "playbooksCount": 112,
  "routesCount": 339,
  "domainsFound": ["ux", "marketing", "security", ...],
  "issues": [],
  "recommendations": []
}
```

## Domains

Bodhi organizes knowledge into domains:

| Domain             | Topics                                                                  |
| ------------------ | ----------------------------------------------------------------------- |
| **ux**             | Design systems, forms, mobile, gamification, checkout UX, accessibility |
| **marketing**      | GTM strategy, pitch decks, sales, content, email, brand identity        |
| **security**       | India compliance (DPDP), serverless security, CORS/CSP, OWASP          |
| **backend**        | Payments, email delivery, serverless costs, B2B2C architecture          |
| **frontend**       | Next.js, PDF generation, server components                              |
| **devops**         | IaC best practices, verification checklists                             |
| **ai-development** | Agent workflows, MCP server design, model selection, cost optimization  |
| **architecture**   | Decision records, session handoffs                                      |
| **communication**  | Text-based rapport, psychological principles                            |
| **documentation**  | AI-optimized docs, API documentation                                    |

## MCP Spec Compliance (v0.3.0)

| Feature                                            | Status |
| -------------------------------------------------- | ------ |
| Service-prefixed tool names (`bodhi_*`)            | ✅     |
| `outputSchema` on all tools                        | ✅     |
| Tool annotations (`readOnlyHint`, `idempotentHint`) | ✅     |
| `response_format` parameter (`json` / `markdown`)  | ✅     |
| `structuredContent` + `content` in responses       | ✅     |
| Resources primitive (`bodhi://` URIs)              | ✅     |
| `listChanged` capability                           | ✅     |
| Cache with TTL + mtime invalidation               | ✅     |
| Path traversal prevention                          | ✅     |
| Provenance metadata (confidence, status, staleness) | ✅     |

## Creating Your Own Knowledge Base

Bodhi works with any knowledge base following this structure:

```
knowledge/
├── INDEX.md              # Task routing table
├── domains/
│   ├── ux/
│   │   ├── _index.md     # Domain index
│   │   ├── gamification.md
│   │   └── ...
│   ├── marketing/
│   │   └── ...
│   └── ...
└── meta/
    └── contributing.md   # Contribution guidelines
```

### Playbook Format

Each playbook follows a standard format:

```markdown
---
domain: ux
topic: gamification
tags: [engagement, retention, psychology]
complexity: intermediate
last_updated: 2025-01-15
confidence: 0.85
status: validated
review_by: 2025-07-01
---

# Gamification

> One-line value proposition.

## TL;DR

- **Key insight 1** — supporting detail
- **Key insight 2** — supporting detail

## Decision Guide

| Scenario | Approach | Why |
|----------|----------|-----|
| Specific situation | Concrete recommendation | Reasoning |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Real failure | Specific solution |

## Checklist

- [ ] Verification item 1
- [ ] Verification item 2
```

### INDEX.md Routing Table

The routing table maps tasks to playbooks:

```markdown
## Task Routing

| Task | Read This |
|------|-----------|
| Gamification | `domains/ux/gamification.md` |
| Pitch deck design | `domains/marketing/pitch-deck-strategy.md` |
```

## Environment Variables

| Variable               | Description                                                  | Default             |
| ---------------------- | ------------------------------------------------------------ | ------------------- |
| `BODHI_KNOWLEDGE_PATH` | Path to knowledge base                                       | `./knowledge`       |
| `BODHI_LOG_LEVEL`      | Logging level: `debug`, `info`, `warn`, `error`, `silent`    | `info`              |
| `BODHI_CACHE_TTL_MS`   | Cache time-to-live in milliseconds                           | `300000` (5 min)    |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Type check
npm run typecheck
```

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are validated via commitlint.

```
<type>: <subject>

# Examples:
feat: add new search filter option
fix: resolve routing table parsing error
docs: update installation instructions
chore: upgrade dependencies
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by **Team Bodhi** for AI agents seeking enlightenment.
