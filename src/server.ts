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
} from "./utils/index.js";
import {
  routeTask,
  searchPlaybooks,
  listPlaybooks,
  readPlaybook,
  getKnowledgeBaseSummary,
} from "./tools/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create and configure the Bodhi MCP server
 */
export async function createBodhiServer(knowledgePath?: string) {
  // Resolve knowledge path
  const resolvedKnowledgePath =
    knowledgePath ??
    process.env.BODHI_KNOWLEDGE_PATH ??
    path.resolve(__dirname, "../knowledge");

  // Load playbooks
  console.error(`[Bodhi] Loading playbooks from: ${resolvedKnowledgePath}`);
  const playbooksList = loadAllPlaybooks(resolvedKnowledgePath);
  console.error(`[Bodhi] Loaded ${playbooksList.length} playbooks`);

  // Create playbooks map for quick lookup
  const playbooks = new Map<string, Playbook>();
  for (const playbook of playbooksList) {
    playbooks.set(playbook.relativePath, playbook);
  }

  // Load routing table
  const indexPath = path.join(resolvedKnowledgePath, "INDEX.md");
  const routingTable = parseRoutingTable(indexPath);
  console.error(`[Bodhi] Loaded ${routingTable.length} route entries`);

  // Create search index
  const searchIndex = createSearchIndex(playbooksList);
  console.error(`[Bodhi] Search index created`);

  // Create route matcher
  const routeMatcher = createRouteMatcher(routingTable);

  // Create MCP server
  const server = new Server(
    {
      name: "bodhi-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
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
      ],
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "route": {
          const task = (args as { task: string }).task;
          const result = routeTask(task, { routeMatcher, playbooks });
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "search": {
          const { query, domain, limit } = args as {
            query: string;
            domain?: string;
            limit?: number;
          };
          const result = searchPlaybooks({ query, domain, limit }, { searchIndex });
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
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
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "read": {
          const { path: playbookPath, section } = args as {
            path: string;
            section?: string;
          };
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
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          return {
            content: [
              {
                type: "text" as const,
                text: `Unknown tool: ${name}`,
              },
            ],
            isError: true,
          };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error executing tool ${name}: ${message}`,
          },
        ],
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
  const server = await createBodhiServer(knowledgePath);
  const transport = new StdioServerTransport();

  console.error("[Bodhi] Starting MCP server...");
  await server.connect(transport);
  console.error("[Bodhi] Server connected and ready");
}
