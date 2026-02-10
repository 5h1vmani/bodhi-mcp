#!/usr/bin/env node
/**
 * Bodhi MCP CLI entry point
 */

import { startServer } from "./server.js";

// Parse command line arguments
const args = process.argv.slice(2);
let knowledgePath: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--knowledge-path" || args[i] === "-k") {
    knowledgePath = args[i + 1];
    i++;
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`
Bodhi MCP - Synthesized decision frameworks for AI agents

Usage:
  bodhi-mcp [options]

Options:
  -k, --knowledge-path <path>  Path to the knowledge base directory
                               (default: ./knowledge or BODHI_KNOWLEDGE_PATH env var)
  -h, --help                   Show this help message
  -v, --version                Show version

Environment Variables:
  BODHI_KNOWLEDGE_PATH         Path to the knowledge base directory

Examples:
  bodhi-mcp
  bodhi-mcp --knowledge-path /path/to/nucleus
  BODHI_KNOWLEDGE_PATH=/path/to/nucleus bodhi-mcp
`);
    process.exit(0);
  } else if (args[i] === "--version" || args[i] === "-v") {
    console.log("bodhi-mcp v0.1.0");
    process.exit(0);
  }
}

// Start the server
startServer(knowledgePath).catch((error) => {
  console.error("[Bodhi] Fatal error:", error);
  process.exit(1);
});
