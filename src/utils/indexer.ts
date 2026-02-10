/**
 * Search indexing utilities using MiniSearch
 */

import MiniSearch from "minisearch";
import type { Playbook, RouteEntry } from "../types.js";

export interface IndexedDocument {
  id: string;
  path: string;
  relativePath: string;
  title: string;
  domain: string;
  topic: string;
  tags: string;
  complexity: string;
  tldr: string;
  description: string;
  content: string;
}

/**
 * Create and populate a MiniSearch index from playbooks
 */
export function createSearchIndex(playbooks: Playbook[]): MiniSearch<IndexedDocument> {
  const index = new MiniSearch<IndexedDocument>({
    fields: ["title", "tldr", "tags", "description", "content", "topic"],
    storeFields: ["path", "relativePath", "title", "domain", "complexity", "tldr", "tags"],
    searchOptions: {
      boost: { title: 4, tldr: 3, tags: 2, description: 2, topic: 2 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  const documents: IndexedDocument[] = playbooks.map((playbook) => ({
    id: playbook.relativePath,
    path: playbook.path,
    relativePath: playbook.relativePath,
    title: playbook.title,
    domain: playbook.frontmatter.domain,
    topic: playbook.frontmatter.topic,
    tags: playbook.frontmatter.tags.join(" "),
    complexity: playbook.frontmatter.complexity,
    tldr: playbook.tldr,
    description: playbook.description,
    content: playbook.content.slice(0, 5000), // Limit content for indexing
  }));

  index.addAll(documents);

  return index;
}

/**
 * Route matcher type
 */
export type RouteMatcher = ReturnType<typeof createRouteMatcher>;

/**
 * Create a simple route matcher using task descriptions
 */
export function createRouteMatcher(routes: RouteEntry[]) {
  // Build a simple index of task keywords to routes
  const routeIndex = new Map<string, RouteEntry[]>();

  for (const route of routes) {
    // Tokenize the task description
    const tokens = tokenize(route.task);

    for (const token of tokens) {
      const existing = routeIndex.get(token) ?? [];
      existing.push(route);
      routeIndex.set(token, existing);
    }
  }

  return {
    /**
     * Find the best matching route for a task query
     */
    match(query: string, limit = 5): Array<{ route: RouteEntry; score: number }> {
      const queryTokens = tokenize(query);
      const scores = new Map<string, { route: RouteEntry; score: number }>();

      for (const token of queryTokens) {
        // Exact match
        const exactMatches = routeIndex.get(token) ?? [];
        for (const route of exactMatches) {
          const existing = scores.get(route.playbook);
          if (existing) {
            existing.score += 2;
          } else {
            scores.set(route.playbook, { route, score: 2 });
          }
        }

        // Partial match (prefix)
        for (const [indexToken, matchedRoutes] of routeIndex) {
          if (indexToken.startsWith(token) || token.startsWith(indexToken)) {
            for (const route of matchedRoutes) {
              const existing = scores.get(route.playbook);
              if (existing) {
                existing.score += 1;
              } else {
                scores.set(route.playbook, { route, score: 1 });
              }
            }
          }
        }
      }

      // Sort by score and return top matches
      return Array.from(scores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },

    /**
     * Get all routes for a specific playbook
     */
    getRoutesForPlaybook(playbookPath: string): RouteEntry[] {
      return routes.filter((r) => r.playbook === playbookPath);
    },
  };
}

/**
 * Simple tokenizer for task matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .filter((token) => !STOP_WORDS.has(token));
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "how",
  "what",
  "when",
  "where",
  "why",
  "which",
  "this",
  "that",
  "from",
  "into",
  "use",
  "using",
]);
