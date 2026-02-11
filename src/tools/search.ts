/**
 * bodhi_search(query, domain?) tool - Full-text search across playbooks
 */

import type MiniSearch from "minisearch";
import type { SearchResult } from "../types.js";
import type { IndexedDocument } from "../utils/indexer.js";

export interface SearchToolDeps {
  searchIndex: MiniSearch<IndexedDocument>;
}

export interface SearchOptions {
  query: string;
  domain?: string;
  limit?: number;
}

/**
 * Search across all playbooks
 */
export function searchPlaybooks(
  options: SearchOptions,
  deps: SearchToolDeps
): SearchResult[] | { error: string } {
  const { searchIndex } = deps;
  const { query, domain, limit = 10 } = options;

  if (!query || query.trim().length === 0) {
    return { error: "Search query is required" };
  }

  try {
    let results = searchIndex.search(query, {
      boost: { title: 4, tldr: 3, tags: 2 },
      fuzzy: 0.2,
      prefix: true,
    });

    // Filter by domain if specified
    if (domain) {
      const normalizedDomain = domain.toLowerCase();
      results = results.filter((r) => {
        const docDomain = (r.domain as string)?.toLowerCase();
        return docDomain === normalizedDomain;
      });
    }

    // Limit results
    results = results.slice(0, limit);

    // Transform to SearchResult format
    return results.map((r) => ({
      path: r.relativePath as string,
      title: r.title as string,
      domain: r.domain as string,
      complexity: r.complexity as string,
      score: Math.round(r.score * 100) / 100,
      tldr: r.tldr as string | undefined,
      matchedTerms: r.terms,
      confidence: r.confidence as number | undefined,
      status: r.status as string | undefined,
      lastUpdated: r.lastUpdated as string | undefined,
      stale: r.stale as boolean | undefined,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown search error";
    return { error: `Search failed: ${message}` };
  }
}

/**
 * Get available domains
 */
export function getAvailableDomains(
  deps: SearchToolDeps
): string[] {
  const { searchIndex } = deps;
  const domains = new Set<string>();

  // MiniSearch doesn't have a direct way to get all values of a stored field
  // We'll search for everything and extract domains
  const allDocs = searchIndex.search("*", { prefix: true });

  for (const doc of allDocs) {
    if (doc.domain) {
      domains.add(doc.domain as string);
    }
  }

  return Array.from(domains).sort();
}
