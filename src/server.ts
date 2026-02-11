/**
 * Bodhi MCP Server - Main server implementation
 *
 * All tools use the `bodhi_` service prefix to avoid name collisions.
 * All tools declare outputSchema, annotations, and support response_format.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import * as path from "path";
import { fileURLToPath } from "url";

import type { Playbook, ResponseFormat } from "./types.js";
import {
  loadAllPlaybooks,
  parseRoutingTable,
  createSearchIndex,
  createRouteMatcher,
  logger,
  setLogLevel,
  getCache,
  setCache,
  isCacheValid,
  takeMtimeSnapshot,
  ensureKnowledge,
} from "./utils/index.js";
import {
  routeTask,
  searchPlaybooks,
  listPlaybooks,
  readPlaybook,
  getKnowledgeBaseSummary,
  diagnose,
} from "./tools/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Package version — single source of truth
const VERSION = "0.3.0";

// ─── Output Schema Definitions ──────────────────────────────────────────────

const ROUTE_OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    playbook: { type: "string" as const, description: "Relative path to the matched playbook" },
    confidence: { type: "number" as const, minimum: 0, maximum: 1, description: "Match confidence score" },
    title: { type: "string" as const, description: "Playbook title" },
    domain: { type: "string" as const, description: "Knowledge domain" },
    tldr: { type: "string" as const, description: "Brief summary of the playbook" },
    alternatives: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          playbook: { type: "string" as const },
          confidence: { type: "number" as const },
          title: { type: "string" as const },
        },
      },
      description: "Alternative matches ranked by confidence",
    },
  },
  required: ["playbook", "confidence", "title", "domain"] as string[],
};

const SEARCH_OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    results: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          path: { type: "string" as const },
          title: { type: "string" as const },
          domain: { type: "string" as const },
          complexity: { type: "string" as const },
          score: { type: "number" as const },
          tldr: { type: "string" as const },
          matchedTerms: { type: "array" as const, items: { type: "string" as const } },
          confidence: { type: "number" as const },
          status: { type: "string" as const },
          lastUpdated: { type: "string" as const },
          stale: { type: "boolean" as const },
        },
      },
    },
    total: { type: "integer" as const, description: "Number of results returned" },
  },
  required: ["results", "total"] as string[],
};

const LIST_OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    results: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          path: { type: "string" as const },
          title: { type: "string" as const },
          domain: { type: "string" as const },
          complexity: { type: "string" as const },
          tags: { type: "array" as const, items: { type: "string" as const } },
          lastUpdated: { type: "string" as const },
          confidence: { type: "number" as const },
          status: { type: "string" as const },
          stale: { type: "boolean" as const },
        },
      },
    },
    total: { type: "integer" as const },
  },
  required: ["results", "total"] as string[],
};

const READ_OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    path: { type: "string" as const },
    title: { type: "string" as const },
    content: { type: "string" as const, description: "Full playbook content or extracted section" },
    frontmatter: {
      type: "object" as const,
      properties: {
        domain: { type: "string" as const },
        topic: { type: "string" as const },
        tags: { type: "array" as const, items: { type: "string" as const } },
        complexity: { type: "string" as const },
      },
    },
  },
  required: ["path", "title", "content", "frontmatter"] as string[],
};

const SUMMARY_OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    totalPlaybooks: { type: "integer" as const },
    domains: { type: "object" as const, additionalProperties: { type: "integer" as const } },
    complexityDistribution: {
      type: "object" as const,
      properties: {
        beginner: { type: "integer" as const },
        intermediate: { type: "integer" as const },
        advanced: { type: "integer" as const },
      },
    },
  },
  required: ["totalPlaybooks", "domains", "complexityDistribution"] as string[],
};

const DIAGNOSE_OUTPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    status: { type: "string" as const, enum: ["healthy", "degraded", "error"] },
    version: { type: "string" as const },
    knowledgePath: { type: "string" as const },
    playbooksCount: { type: "integer" as const },
    routesCount: { type: "integer" as const },
    searchIndexSize: { type: "integer" as const },
    issues: { type: "array" as const, items: { type: "string" as const } },
    recommendations: { type: "array" as const, items: { type: "string" as const } },
  },
  required: ["status", "version", "playbooksCount"] as string[],
};

// ─── Annotation Presets ─────────────────────────────────────────────────────

const READ_ONLY_ANNOTATION = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

// ─── Response Format Helpers ────────────────────────────────────────────────

/**
 * Build the MCP tool response with both content (text) and structuredContent (JSON).
 * When response_format is "markdown", the text block is human-friendly.
 * When response_format is "json", the text block is raw JSON.
 * structuredContent is always included for programmatic clients.
 */
function buildToolResponse(
  structured: Record<string, unknown>,
  markdownFn: () => string,
  format: ResponseFormat = "markdown"
) {
  const text = format === "markdown" ? markdownFn() : JSON.stringify(structured, null, 2);
  return {
    content: [{ type: "text" as const, text }],
    structuredContent: structured,
  };
}

function buildErrorResponse(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    structuredContent: { error: message },
    isError: true,
  };
}

// ─── Markdown Formatters ────────────────────────────────────────────────────

function routeResultToMarkdown(result: Record<string, unknown>): string {
  if ("error" in result) return `**Error:** ${String(result.error)}`;
  const lines = [
    `## 🎯 ${String(result.title)}`,
    `**Path:** \`${String(result.playbook)}\``,
    `**Domain:** ${String(result.domain)} | **Confidence:** ${String(result.confidence)}`,
  ];
  if (result.tldr) lines.push(`\n> ${String(result.tldr)}`);
  const alts = result.alternatives as Array<Record<string, unknown>> | undefined;
  if (alts && alts.length > 0) {
    lines.push("\n### Alternatives");
    for (const alt of alts) {
      lines.push(`- \`${String(alt.playbook)}\` (${String(alt.confidence)}) — ${String(alt.title)}`);
    }
  }
  return lines.join("\n");
}

function searchResultsToMarkdown(results: Array<Record<string, unknown>>): string {
  if (results.length === 0) return "No results found.";
  const lines = [`## Search Results (${String(results.length)})\n`];
  for (const r of results) {
    let line = `- **${String(r.title)}** (score: ${String(r.score)}) — \`${String(r.path)}\``;
    if (r.stale) line += " ⚠️ stale";
    if (r.status && r.status !== "validated") line += ` [${String(r.status)}]`;
    lines.push(line);
    if (r.tldr) lines.push(`  > ${String(r.tldr)}`);
  }
  return lines.join("\n");
}

function listResultsToMarkdown(results: Array<Record<string, unknown>>): string {
  if (results.length === 0) return "No playbooks found.";
  const lines = [`## Playbooks (${String(results.length)})\n`];
  let currentDomain = "";
  for (const r of results) {
    if (r.domain !== currentDomain) {
      currentDomain = r.domain as string;
      lines.push(`\n### ${currentDomain}`);
    }
    let line = `- **${String(r.title)}** (\`${String(r.complexity)}\`) — \`${String(r.path)}\``;
    if (r.stale) line += " ⚠️ stale";
    lines.push(line);
  }
  return lines.join("\n");
}

function summaryToMarkdown(result: Record<string, unknown>): string {
  const lines = [
    `## Knowledge Base Summary`,
    `**Total playbooks:** ${String(result.totalPlaybooks)}\n`,
    `### Domains`,
  ];
  const domains = result.domains as Record<string, number>;
  for (const [domain, count] of Object.entries(domains)) {
    lines.push(`- ${domain}: ${count}`);
  }
  const dist = result.complexityDistribution as Record<string, number>;
  lines.push("\n### Complexity Distribution");
  for (const [level, count] of Object.entries(dist)) {
    lines.push(`- ${level}: ${count}`);
  }
  return lines.join("\n");
}

function diagnoseToMarkdown(result: Record<string, unknown>): string {
  const statusEmoji = result.status === "healthy" ? "✅" : result.status === "degraded" ? "⚠️" : "❌";
  const lines = [
    `## ${statusEmoji} Bodhi Diagnostics`,
    `**Status:** ${String(result.status)} | **Version:** ${String(result.version)}`,
    `**Playbooks:** ${String(result.playbooksCount)} | **Routes:** ${String(result.routesCount)} | **Search index:** ${String(result.searchIndexSize)}`,
  ];
  const issues = result.issues as string[];
  if (issues && issues.length > 0) {
    lines.push("\n### Issues");
    for (const issue of issues) lines.push(`- ❌ ${issue}`);
  }
  const recs = result.recommendations as string[];
  if (recs && recs.length > 0) {
    lines.push("\n### Recommendations");
    for (const rec of recs) lines.push(`- 💡 ${rec}`);
  }
  return lines.join("\n");
}

// ─── Knowledge Base Loader ──────────────────────────────────────────────────

function loadKnowledgeBase(knowledgePath: string) {
  // Check cache first
  if (isCacheValid(knowledgePath)) {
    const cached = getCache();
    if (cached) {
      logger.debug("Using cached knowledge base");
      return cached;
    }
  }

  logger.info("Loading playbooks", { path: knowledgePath });
  const playbooksList = loadAllPlaybooks(knowledgePath);
  logger.info("Playbooks loaded", { count: playbooksList.length });

  // Create playbooks map for quick lookup
  const playbooks = new Map<string, Playbook>();
  for (const playbook of playbooksList) {
    playbooks.set(playbook.relativePath, playbook);
  }

  // Load routing table
  const indexPath = path.join(knowledgePath, "INDEX.md");
  const routingTable = parseRoutingTable(indexPath);
  logger.info("Routes loaded", { count: routingTable.length });

  // Create search index
  const searchIndex = createSearchIndex(playbooksList);
  logger.debug("Search index created");

  // Create route matcher
  const routeMatcher = createRouteMatcher(routingTable);

  // Snapshot file modification times for cache invalidation
  const mtimeSnapshot = takeMtimeSnapshot(knowledgePath);

  // Cache the data
  const cacheData = {
    playbooks,
    playbooksList,
    routingTable,
    searchIndex,
    routeMatcher,
    knowledgePath,
    loadedAt: new Date(),
    mtimeSnapshot,
  };
  setCache(cacheData);

  return cacheData;
}

// ─── Server Factory ─────────────────────────────────────────────────────────

export function createBodhiServer(knowledgePath?: string) {
  // Set log level from environment
  if (process.env.BODHI_LOG_LEVEL) {
    setLogLevel(process.env.BODHI_LOG_LEVEL as "debug" | "info" | "warn" | "error" | "silent");
  }

  // Resolve knowledge path with auto-download fallback
  let resolvedKnowledgePath: string;

  if (knowledgePath) {
    resolvedKnowledgePath = knowledgePath;
  } else if (process.env.BODHI_KNOWLEDGE_PATH) {
    resolvedKnowledgePath = process.env.BODHI_KNOWLEDGE_PATH;
  } else {
    const bundledPath = path.resolve(__dirname, "../knowledge");
    try {
      resolvedKnowledgePath = ensureKnowledge();
    } catch {
      logger.warn("Auto-download failed, using bundled knowledge");
      resolvedKnowledgePath = bundledPath;
    }
  }

  // Load knowledge base (with caching + TTL + mtime checks)
  const {
    playbooks,
    playbooksList,
    routingTable,
    searchIndex,
    routeMatcher,
  } = loadKnowledgeBase(resolvedKnowledgePath);

  // Create MCP server with tools + resources capabilities
  const server = new Server(
    {
      name: "bodhi-mcp",
      version: VERSION,
    },
    {
      capabilities: {
        tools: { listChanged: true },
        resources: { listChanged: true },
      },
    }
  );

  // ─── Tool List Handler ──────────────────────────────────────────────────

  const RESPONSE_FORMAT_PARAM = {
    type: "string" as const,
    enum: ["json", "markdown"],
    description: 'Output format: "markdown" (default, human-friendly) or "json" (structured, all fields)',
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "bodhi_route",
          description:
            "Find the best playbook for a given task. Uses the INDEX.md routing table to match tasks to relevant playbooks. Returns the most relevant playbook with confidence score and alternatives. Use this first — if no match, fall back to bodhi_search.",
          inputSchema: {
            type: "object" as const,
            properties: {
              task: {
                type: "string",
                description:
                  "Description of the task you need help with (e.g., 'pitch deck design', 'India checkout UX', 'serverless security')",
              },
              response_format: RESPONSE_FORMAT_PARAM,
            },
            required: ["task"],
          },
          outputSchema: ROUTE_OUTPUT_SCHEMA,
          annotations: READ_ONLY_ANNOTATION,
        },
        {
          name: "bodhi_search",
          description:
            "Full-text search across all playbooks in the Bodhi knowledge base. Use for broader queries when bodhi_route() doesn't find a match, or to explore related topics. Returns scored results with provenance metadata.",
          inputSchema: {
            type: "object" as const,
            properties: {
              query: {
                type: "string",
                description: "Search query (keywords, phrases)",
              },
              domain: {
                type: "string",
                description:
                  "Optional: Filter by domain (ux, marketing, security, backend, frontend, devops, architecture, documentation, ai-development)",
              },
              limit: {
                type: "number",
                description: "Maximum number of results (default: 10, max: 50)",
              },
              response_format: RESPONSE_FORMAT_PARAM,
            },
            required: ["query"],
          },
          outputSchema: SEARCH_OUTPUT_SCHEMA,
          annotations: READ_ONLY_ANNOTATION,
        },
        {
          name: "bodhi_list",
          description:
            "List all available playbooks in the Bodhi knowledge base with metadata. Use to explore what knowledge is available or filter by domain/complexity. Stale entries are flagged.",
          inputSchema: {
            type: "object" as const,
            properties: {
              domain: {
                type: "string",
                description: "Optional: Filter by domain",
              },
              complexity: {
                type: "string",
                enum: ["beginner", "intermediate", "advanced"],
                description: "Optional: Filter by complexity level",
              },
              limit: {
                type: "number",
                description: "Maximum number of results (default: 50)",
              },
              response_format: RESPONSE_FORMAT_PARAM,
            },
          },
          outputSchema: LIST_OUTPUT_SCHEMA,
          annotations: READ_ONLY_ANNOTATION,
        },
        {
          name: "bodhi_read",
          description:
            "Read the full content of a specific playbook from the Bodhi knowledge base. Use after bodhi_route() or bodhi_search() to get the complete playbook content. Supports extracting specific sections.",
          inputSchema: {
            type: "object" as const,
            properties: {
              path: {
                type: "string",
                description:
                  "Path to the playbook (e.g., 'domains/ux/gamification.md')",
              },
              section: {
                type: "string",
                description:
                  "Optional: Extract only a specific section (e.g., 'TL;DR', 'Decision Guide', 'Common Mistakes')",
              },
              response_format: RESPONSE_FORMAT_PARAM,
            },
            required: ["path"],
          },
          outputSchema: READ_OUTPUT_SCHEMA,
          annotations: READ_ONLY_ANNOTATION,
        },
        {
          name: "bodhi_summary",
          description:
            "Get a summary of the Bodhi knowledge base including total playbooks, domains, and complexity distribution.",
          inputSchema: {
            type: "object" as const,
            properties: {
              response_format: RESPONSE_FORMAT_PARAM,
            },
          },
          outputSchema: SUMMARY_OUTPUT_SCHEMA,
          annotations: READ_ONLY_ANNOTATION,
        },
        {
          name: "bodhi_diagnose",
          description:
            "Health check and debugging information for the Bodhi MCP server. Use to troubleshoot setup issues or verify the knowledge base is loaded correctly.",
          inputSchema: {
            type: "object" as const,
            properties: {
              response_format: RESPONSE_FORMAT_PARAM,
            },
          },
          outputSchema: DIAGNOSE_OUTPUT_SCHEMA,
          annotations: READ_ONLY_ANNOTATION,
        },
      ],
    };
  });

  // ─── Tool Call Handler ──────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;
    const typedArgs = (args ?? {}) as Record<string, unknown>;
    const format = (typedArgs.response_format as ResponseFormat) ?? "markdown";

    logger.debug("Tool called", { name, args: typedArgs });

    try {
      switch (name) {
        case "bodhi_route": {
          const task = typedArgs.task as string;
          if (!task || typeof task !== "string") {
            return buildErrorResponse("'task' parameter is required and must be a string");
          }
          const result = routeTask(task, { routeMatcher, playbooks });
          if ("error" in result) {
            return buildErrorResponse(result.error);
          }
          return buildToolResponse(
            result as unknown as Record<string, unknown>,
            () => routeResultToMarkdown(result as unknown as Record<string, unknown>),
            format
          );
        }

        case "bodhi_search": {
          const query = typedArgs.query as string;
          const domain = typedArgs.domain as string | undefined;
          const limit = typedArgs.limit as number | undefined;
          if (!query || typeof query !== "string") {
            return buildErrorResponse("'query' parameter is required and must be a string");
          }
          const result = searchPlaybooks({ query, domain, limit }, { searchIndex });
          if ("error" in result) {
            return buildErrorResponse((result as { error: string }).error);
          }
          const structured = { results: result, total: (result as unknown[]).length };
          return buildToolResponse(
            structured,
            () => searchResultsToMarkdown(result as unknown as Array<Record<string, unknown>>),
            format
          );
        }

        case "bodhi_list": {
          const domain = typedArgs.domain as string | undefined;
          const complexity = typedArgs.complexity as "beginner" | "intermediate" | "advanced" | undefined;
          const limit = typedArgs.limit as number | undefined;
          const result = listPlaybooks({ domain, complexity, limit }, { playbooks });
          if ("error" in result) {
            return buildErrorResponse((result as { error: string }).error);
          }
          const structured = { results: result, total: (result as unknown[]).length };
          return buildToolResponse(
            structured,
            () => listResultsToMarkdown(result as unknown as Array<Record<string, unknown>>),
            format
          );
        }

        case "bodhi_read": {
          const playbookPath = typedArgs.path as string;
          const section = typedArgs.section as string | undefined;
          if (!playbookPath || typeof playbookPath !== "string") {
            return buildErrorResponse("'path' parameter is required and must be a string");
          }
          const result = readPlaybook(
            { path: playbookPath, section },
            { playbooks, knowledgePath: resolvedKnowledgePath }
          );
          if ("error" in result) {
            return buildErrorResponse(result.error);
          }
          return buildToolResponse(
            result as unknown as Record<string, unknown>,
            () =>
              `# ${result.title}\n\n**Domain:** ${result.frontmatter.domain}\n**Complexity:** ${result.frontmatter.complexity}\n**Tags:** ${result.frontmatter.tags.join(", ")}\n\n---\n\n${result.content}`,
            format
          );
        }

        case "bodhi_summary": {
          const result = getKnowledgeBaseSummary({ playbooks });
          return buildToolResponse(
            result as unknown as Record<string, unknown>,
            () => summaryToMarkdown(result as unknown as Record<string, unknown>),
            format
          );
        }

        case "bodhi_diagnose": {
          const result = diagnose({
            playbooks,
            knowledgePath: resolvedKnowledgePath,
            routesCount: routingTable.length,
            searchIndexSize: playbooksList.length,
          });
          return buildToolResponse(
            result as unknown as Record<string, unknown>,
            () => diagnoseToMarkdown(result as unknown as Record<string, unknown>),
            format
          );
        }

        default:
          logger.warn("Unknown tool called", { name });
          return buildErrorResponse(
            `Unknown tool: ${name}. Available tools: bodhi_route, bodhi_search, bodhi_list, bodhi_read, bodhi_summary, bodhi_diagnose`
          );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const stack = error instanceof Error ? error.stack : undefined;
      logger.error("Tool execution failed", { name, error: message, stack });
      return buildErrorResponse(`Tool ${name} failed: ${message}`);
    }
  });

  // ─── Resource Handlers ────────────────────────────────────────────────

  // Resource templates let clients browse the knowledge base structure
  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return {
      resourceTemplates: [
        {
          uriTemplate: "bodhi://domains/{domain}/{playbook}",
          name: "Bodhi Playbook",
          description: "Read a specific playbook from a domain. Example: bodhi://domains/ux/gamification.md",
          mimeType: "text/markdown",
        },
      ],
    };
  });

  // List all playbooks as individual resources
  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources = [];

    // Add domain index resources
    const domains = new Set<string>();
    for (const pb of playbooks.values()) {
      domains.add(pb.frontmatter.domain);
    }
    for (const domain of Array.from(domains).sort()) {
      resources.push({
        uri: `bodhi://domains/${domain}`,
        name: `${domain} domain`,
        description: `All playbooks in the ${domain} domain`,
        mimeType: "text/markdown" as const,
      });
    }

    // Add individual playbook resources
    for (const pb of playbooks.values()) {
      resources.push({
        uri: `bodhi://${pb.relativePath}`,
        name: pb.title,
        description: `[${pb.frontmatter.domain}/${pb.frontmatter.complexity}] ${pb.description || pb.tldr || ""}`.trim(),
        mimeType: "text/markdown" as const,
      });
    }

    return { resources };
  });

  // Read a specific resource
  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    // Handle domain listing: bodhi://domains/{domain}
    const domainMatch = uri.match(/^bodhi:\/\/domains\/([^/]+)$/);
    if (domainMatch) {
      const domain = domainMatch[1];
      const domainPlaybooks = Array.from(playbooks.values()).filter(
        (pb) => pb.frontmatter.domain === domain
      );

      if (domainPlaybooks.length === 0) {
        throw new Error(`Domain not found: ${domain}`);
      }

      const lines = [`# ${domain} Domain\n`];
      for (const pb of domainPlaybooks) {
        lines.push(`- **${pb.title}** (\`${pb.frontmatter.complexity}\`) — \`${pb.relativePath}\``);
        if (pb.tldr) lines.push(`  > ${pb.tldr.slice(0, 200)}`);
      }

      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown" as const,
            text: lines.join("\n"),
          },
        ],
      };
    }

    // Handle playbook reading: bodhi://domains/{domain}/{playbook} or bodhi://{relativePath}
    const playbookPath = uri.replace(/^bodhi:\/\//, "");
    const pb = playbooks.get(playbookPath) ?? findPlaybookByUri(playbookPath, playbooks);

    if (!pb) {
      throw new Error(`Playbook not found: ${uri}. Use bodhi_list() to see available playbooks.`);
    }

    const header = [
      `# ${pb.title}`,
      `\n**Domain:** ${pb.frontmatter.domain}`,
      `**Complexity:** ${pb.frontmatter.complexity}`,
      `**Tags:** ${pb.frontmatter.tags.join(", ")}`,
      `**Last Updated:** ${pb.frontmatter.last_updated}`,
    ];
    if (pb.frontmatter.confidence !== undefined) {
      header.push(`**Confidence:** ${pb.frontmatter.confidence}`);
    }
    if (pb.frontmatter.status) {
      header.push(`**Status:** ${pb.frontmatter.status}`);
    }
    header.push("\n---\n");

    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown" as const,
          text: header.join("\n") + pb.content,
        },
      ],
    };
  });

  return server;
}

/** Find a playbook by URI path (fuzzy matching) */
function findPlaybookByUri(uriPath: string, playbooks: Map<string, Playbook>): Playbook | undefined {
  for (const [key, pb] of playbooks) {
    if (key.endsWith(uriPath) || pb.relativePath.endsWith(uriPath)) {
      return pb;
    }
  }
  return undefined;
}

// ─── Server Startup ─────────────────────────────────────────────────────────

export async function startServer(knowledgePath?: string) {
  try {
    const server = createBodhiServer(knowledgePath);
    const transport = new StdioServerTransport();

    logger.info("Starting Bodhi MCP server", { version: VERSION });
    await server.connect(transport);
    logger.info("Server connected and ready");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to start server", { error: message });
    process.exit(1);
  }
}
