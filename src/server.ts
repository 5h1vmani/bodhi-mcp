/**
 * Bodhi MCP Server - Main server implementation
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import * as path from "path";
import { fileURLToPath } from "url";

import type { Playbook } from "./types.js";
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

// Package version
const VERSION = "0.2.0";

/**
 * Load and cache knowledge base data
 */
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

  // Cache the data
  const cacheData = {
    playbooks,
    playbooksList,
    routingTable,
    searchIndex,
    routeMatcher,
    knowledgePath,
    loadedAt: new Date(),
  };
  setCache(cacheData);

  return cacheData;
}

/**
 * Create and configure the Bodhi MCP server
 */
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
    // Check for bundled knowledge first, then auto-download
    const bundledPath = path.resolve(__dirname, "../knowledge");
    try {
      resolvedKnowledgePath = ensureKnowledge();
    } catch {
      // Fallback to bundled if download fails
      logger.warn("Auto-download failed, using bundled knowledge");
      resolvedKnowledgePath = bundledPath;
    }
  }

  // Load knowledge base (with caching)
  const {
    playbooks,
    playbooksList,
    routingTable,
    searchIndex,
    routeMatcher,
  } = loadKnowledgeBase(resolvedKnowledgePath);

  // Create MCP server
  const server = new Server(
    {
      name: "bodhi-mcp",
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "route",
          description:
            "Find the best playbook for a given task. Uses the INDEX.md routing table to match tasks to relevant playbooks. Returns the most relevant playbook with confidence score and alternatives.",
          inputSchema: {
            type: "object" as const,
            properties: {
              task: {
                type: "string",
                description:
                  "Description of the task you need help with (e.g., 'pitch deck design', 'India checkout UX', 'serverless security')",
              },
            },
            required: ["task"],
          },
        },
        {
          name: "search",
          description:
            "Full-text search across all playbooks. Use this for broader queries when route() doesn't find a match, or to explore related topics.",
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
                description: "Maximum number of results (default: 10)",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "list",
          description:
            "List all available playbooks with metadata. Use to explore what knowledge is available or filter by domain/complexity.",
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
            },
          },
        },
        {
          name: "read",
          description:
            "Read the full content of a specific playbook. Use after route() or search() to get the complete playbook content.",
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
            },
            required: ["path"],
          },
        },
        {
          name: "summary",
          description:
            "Get a summary of the knowledge base including total playbooks, domains, and complexity distribution.",
          inputSchema: {
            type: "object" as const,
            properties: {},
          },
        },
        {
          name: "diagnose",
          description:
            "Health check and debugging information. Use to troubleshoot setup issues or verify the knowledge base is loaded correctly.",
          inputSchema: {
            type: "object" as const,
            properties: {},
          },
        },
      ],
    };
  });

  // Register tool call handler
  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    logger.debug("Tool called", { name, args });

    try {
      switch (name) {
        case "route": {
          const task = (args as { task: string }).task;
          if (!task || typeof task !== "string") {
            return {
              content: [{ type: "text" as const, text: "Error: 'task' parameter is required and must be a string" }],
              isError: true,
            };
          }
          const result = routeTask(task, { routeMatcher, playbooks });
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        }

        case "search": {
          const { query, domain, limit } = args as {
            query: string;
            domain?: string;
            limit?: number;
          };
          if (!query || typeof query !== "string") {
            return {
              content: [{ type: "text" as const, text: "Error: 'query' parameter is required and must be a string" }],
              isError: true,
            };
          }
          const result = searchPlaybooks({ query, domain, limit }, { searchIndex });
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        }

        case "list": {
          const { domain, complexity, limit } = args as {
            domain?: string;
            complexity?: "beginner" | "intermediate" | "advanced";
            limit?: number;
          };
          const result = listPlaybooks({ domain, complexity, limit }, { playbooks });
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        }

        case "read": {
          const { path: playbookPath, section } = args as {
            path: string;
            section?: string;
          };
          if (!playbookPath || typeof playbookPath !== "string") {
            return {
              content: [{ type: "text" as const, text: "Error: 'path' parameter is required and must be a string" }],
              isError: true,
            };
          }
          const result = readPlaybook(
            { path: playbookPath, section },
            { playbooks, knowledgePath: resolvedKnowledgePath }
          );
          return {
            content: [
              {
                type: "text" as const,
                text:
                  "error" in result
                    ? JSON.stringify(result, null, 2)
                    : `# ${result.title}\n\n**Domain:** ${result.frontmatter.domain}\n**Complexity:** ${result.frontmatter.complexity}\n**Tags:** ${result.frontmatter.tags.join(", ")}\n\n---\n\n${result.content}`,
              },
            ],
          };
        }

        case "summary": {
          const result = getKnowledgeBaseSummary({ playbooks });
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        }

        case "diagnose": {
          const result = diagnose({
            playbooks,
            knowledgePath: resolvedKnowledgePath,
            routesCount: routingTable.length,
            searchIndexSize: playbooksList.length,
          });
          return {
            content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          };
        }

        default:
          logger.warn("Unknown tool called", { name });
          return {
            content: [{ type: "text" as const, text: `Unknown tool: ${name}. Available tools: route, search, list, read, summary, diagnose` }],
            isError: true,
          };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const stack = error instanceof Error ? error.stack : undefined;
      logger.error("Tool execution failed", { name, error: message, stack });
      return {
        content: [{ type: "text" as const, text: `Error executing tool ${name}: ${message}` }],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Start the server with stdio transport
 */
export async function startServer(knowledgePath?: string) {
  try {
    const server = createBodhiServer(knowledgePath);
    const transport = new StdioServerTransport();

    logger.info("Starting MCP server", { version: VERSION });
    await server.connect(transport);
    logger.info("Server connected and ready");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to start server", { error: message });
    process.exit(1);
  }
}
