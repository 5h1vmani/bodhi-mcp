---
domain: ai-development
topic: mcp-server-design
tags: [mcp, knowledge-base, tool-design, protocol]
complexity: advanced
last_updated: 2026-02-11
confidence: 0.85
source_refs:
  - "MCP Specification (Nov 2025) — modelcontextprotocol.io"
  - "Philipp Schmid — MCP Best Practices (philschmid.de)"
  - "Geeksfino kb-mcp-server — GitHub"
  - "jeanibarz knowledge-base-mcp-server — GitHub"
  - "Qdrant MCP Server — GitHub"
  - "AWS Bedrock KB MCP — GitHub"
  - "Bodhi MCP v0.3.0 audit — internal"
status: validated
review_by: 2026-08-01
author: "Claude + Shivam"
version: 1
---

# MCP Server Design for Knowledge Bases

> When to use each MCP primitive, how to design AI-first tools, and the patterns that separate production servers from prototypes.

## TL;DR

- **One server = one domain** — compose multiple focused servers, never build a monolith
- **Design tools for agents, not APIs** — orchestrate multi-step logic inside the tool; expose one high-level action, not CRUD primitives
- **Every tool needs 4 things**: service prefix, outputSchema, annotations, response_format param
- **Cache reads with TTL + mtime** — file-backed KBs get 5-min TTL with filesystem change detection; never cache mutations
- **Ship an evaluation suite before v1.0** — 10+ multi-hop questions, ≥80% accuracy target; iterate on tool descriptions until you hit it

## Decision Guide

| Scenario                                                                | Approach                                                            | Why                                                                                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Building a KB server for synthesized docs (markdown files, frontmatter) | MiniSearch/FAISS + file-backed indexing, no vector DB infra         | Synthesized content is structured; full-text search + frontmatter filtering matches intent better than embeddings alone |
| Building a KB server for raw unstructured content                       | Vector DB (Qdrant/Milvus) + embedding pipeline + reranker           | Semantic similarity search is the only way to find relevant chunks in unstructured text                                 |
| Local dev tool, single user                                             | Stdio transport                                                     | Zero config; client launches server as subprocess                                                                       |
| Shared service, multiple users                                          | Streamable HTTP (stateless JSON default, SSE opt-in)                | Scales horizontally without session affinity; SSE only for real-time notifications                                      |
| Agent needs to find the right doc for a task                            | `route` tool — matches task description to routing table (INDEX.md) | Deterministic, fast, avoids semantic search overhead for known task patterns                                            |
| Agent needs keyword/concept search across KB                            | `search` tool — full-text + metadata filtering                      | Broad recall; let the agent refine with follow-up reads                                                                 |
| Agent needs full document content                                       | `read` tool with section extraction                                 | Avoids dumping entire docs into context; `section` param extracts just TL;DR or Decision Guide                          |
| Agent needs overview of what's available                                | `list` tool with domain/complexity filters                          | Discovery; returns metadata without content                                                                             |
| Agent needs to summarize a domain                                       | `summarize` tool — server-side aggregation                          | Orchestrate internally; don't force the LLM to read→synthesize across 20 docs                                           |
| Agent suspects stale or broken KB state                                 | `diagnose` tool — validation, missing index entries, orphan files   | Self-healing; catches issues before they affect agent reasoning                                                         |

## Tool Design Rules

### The 4 Required Elements

Every tool must declare:

| Element             | What                                            | Example                                                   |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| **Service prefix**  | `{project}_` on all tool names                  | `bodhi_search`, `pinaka_route`                            |
| **outputSchema**    | JSON Schema for structured output               | `{ results: [], total_results: int, has_more: bool }`     |
| **Annotations**     | Behavioral hints for the host                   | `readOnlyHint: true, idempotentHint: true`                |
| **response_format** | `"json" \| "markdown"` param (default markdown) | Markdown for LLM context; JSON for programmatic consumers |

### AI-First vs API-First

| Anti-Pattern (API-First)                             | Correct (AI-First)                                                          | Why                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| 3 tools: `get_user`, `get_orders`, `calculate_total` | 1 tool: `track_latest_order(email)`                                         | Agent makes one call instead of coordinating three     |
| `create_record`, `update_row` (generic CRUD)         | `submit_expense_report`, `approve_leave` (domain verbs)                     | Rich description helps the model select the right tool |
| Thin description: "Searches the knowledge base"      | Full description: when to use, arg formats, edge cases, what to expect back | Tool descriptions ARE the agent's reasoning context    |

### Annotation Mapping for KB Tools

| Tool Type                                      | readOnly | destructive | idempotent | openWorld               |
| ---------------------------------------------- | -------- | ----------- | ---------- | ----------------------- |
| route, search, list, read, summarize, diagnose | true     | false       | true       | false                   |
| store/ingest (if you have write tools)         | false    | false       | false      | true (if fetching URLs) |

## Caching Decision Matrix

| Signal                                | Action                    | Why                                         |
| ------------------------------------- | ------------------------- | ------------------------------------------- |
| Same query within TTL (default 5 min) | Serve from cache          | Avoids re-indexing unchanged files          |
| File mtime changed since cache load   | Invalidate + rebuild      | File content changed; cache is stale        |
| `store` / `ingest` tool called        | Invalidate affected scope | Mutation = cache is wrong                   |
| TTL expired, no mtime changes         | Invalidate anyway         | Protects against external edits (git pull)  |
| Embedding model changed               | Invalidate ALL vectors    | Old vectors are incompatible with new model |

**Never cache**: tool calls with mutations/side-effects, user-specific state, real-time data.

## Common Mistakes

| Mistake                                            | Fix                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Exposing CRUD instead of domain verbs              | Design tools around agent tasks: "find the right playbook for X" not "query index where domain=Y"                        |
| No service prefix on tool names                    | Always prefix (`bodhi_`, `kb_`); hosts compose multiple servers and names must be unique                                 |
| Returning opaque text without outputSchema         | Declare JSON schemas; return `structuredContent` alongside `content` text                                                |
| Cache without invalidation                         | TTL + filesystem mtime snapshot; invalidate on any write operation                                                       |
| No evaluation before shipping                      | Write 10+ multi-hop questions first; iterate tool descriptions until ≥80% accuracy                                       |
| Dumping full documents into responses              | Use section extraction, pagination cursors, and hierarchical summarization                                               |
| Hardcoded embedding model                          | Config-based (`EMBEDDING_MODEL`, `EMBEDDING_DIM`); namespace vector collections by model version                         |
| Skipping path validation on read tools             | `path.resolve()` + boundary check before any `fs.read`; reject `../` traversal                                           |
| Using Resources where Tools belong (or vice versa) | Resources = data the application attaches to context. Tools = actions the model invokes. Don't expose search-as-resource |

## Checklist

- [ ] All tools have `{project}_` prefix
- [ ] All tools declare `outputSchema` with JSON Schema
- [ ] All tools have `annotations` (readOnlyHint, destructiveHint, idempotentHint, openWorldHint)
- [ ] All read tools accept `response_format` parameter (`"json" | "markdown"`)
- [ ] Tool responses return both `content` (text) and `structuredContent` (typed JSON)
- [ ] Cache has TTL + filesystem mtime invalidation
- [ ] Path traversal prevented on all file-reading tools
- [ ] Evaluation suite exists with 10+ multi-hop questions
- [ ] Evaluation accuracy ≥ 80% before release
- [ ] Server capabilities declare `{ tools: { listChanged: true } }`
- [ ] Resources expose content via URI templates (if applicable)
- [ ] Tool descriptions specify when to use, argument formats, and response shape

## MCP Primitives

| Primitive     | Control                | Use For                                                                            |
| ------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| **Tools**     | Model-controlled       | Search, read, route, summarize — anything the agent decides to call                |
| **Resources** | Application-controlled | Browsable content the client attaches to context; URI templates for dynamic access |
| **Prompts**   | User-controlled        | Reusable message templates (slash commands); rarely needed for KB servers          |

**Decision**: Most KB servers need Tools + Resources. Prompts are only needed if you want slash-command shortcuts like `/search [query]`.

## Provenance Metadata Schema

For synthesized knowledge entries, track:

| Field           | Type      | Purpose                                              |
| --------------- | --------- | ---------------------------------------------------- |
| `confidence`    | float 0-1 | Synthesis confidence; surface in search results      |
| `source_refs`   | string[]  | What was synthesized from (DOIs, URLs, report names) |
| `status`        | enum      | `draft` / `validated` / `superseded` / `archived`    |
| `superseded_by` | string    | Path to replacement doc                              |
| `review_by`     | date      | Staleness deadline; flag in results when past        |
| `author`        | string    | Who/what produced the synthesis                      |
| `version`       | integer   | Bump on significant updates                          |

**Freshness rules**: Past `review_by` = flag as stale (don't hide). `superseded` = exclude from default search, accessible by ID. Surface `confidence` in results so agents can weigh trustworthiness.

## References

- [MCP Specification (Nov 2025)](https://modelcontextprotocol.io/specification/2025-11-25) — Protocol spec, primitives, transports
- [Philipp Schmid — MCP Best Practices](https://www.philschmid.de/mcp-best-practices) — AI-first tool design principles
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — Reference implementation

## Related

- [agent-workflows.md](./agent-workflows.md) — Cost-optimized multi-agent patterns (Opus/Sonnet/Haiku delegation)
- [meta/contributing.md](../../meta/contributing.md) — Nucleus contribution process

---

## Changelog

| Date       | Change                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2026-02-11 | Initial version — synthesized from MCP spec, 6 real-world implementations, and Bodhi MCP v0.3.0 audit |
