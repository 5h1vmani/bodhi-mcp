/**
 * list(domain?) tool - List available playbooks with metadata
 */

import type { Playbook, ListResult } from "../types.js";

export interface ListToolDeps {
  playbooks: Map<string, Playbook>;
}

export interface ListOptions {
  domain?: string;
  complexity?: "beginner" | "intermediate" | "advanced";
  limit?: number;
}

/**
 * List all playbooks, optionally filtered by domain
 */
export function listPlaybooks(
  options: ListOptions,
  deps: ListToolDeps
): ListResult[] | { error: string } {
  const { playbooks } = deps;
  const { domain, complexity, limit = 50 } = options;

  try {
    let results = Array.from(playbooks.values());

    // Filter by domain
    if (domain) {
      const normalizedDomain = domain.toLowerCase();
      results = results.filter(
        (p) => p.frontmatter.domain.toLowerCase() === normalizedDomain
      );
    }

    // Filter by complexity
    if (complexity) {
      results = results.filter((p) => p.frontmatter.complexity === complexity);
    }

    // Sort by domain, then by title
    results.sort((a, b) => {
      const domainCompare = a.frontmatter.domain.localeCompare(b.frontmatter.domain);
      if (domainCompare !== 0) return domainCompare;
      return a.title.localeCompare(b.title);
    });

    // Limit results
    results = results.slice(0, limit);

    // Transform to ListResult format
    return results.map((p) => ({
      path: p.relativePath,
      title: p.title,
      domain: p.frontmatter.domain,
      complexity: p.frontmatter.complexity,
      tags: p.frontmatter.tags,
      lastUpdated: p.frontmatter.last_updated,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to list playbooks: ${message}` };
  }
}

/**
 * Get summary statistics about the knowledge base
 */
export function getKnowledgeBaseSummary(deps: ListToolDeps): {
  totalPlaybooks: number;
  domains: Record<string, number>;
  complexityDistribution: Record<string, number>;
} {
  const { playbooks } = deps;

  const domains: Record<string, number> = {};
  const complexityDistribution: Record<string, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  for (const playbook of playbooks.values()) {
    // Count by domain
    const domain = playbook.frontmatter.domain;
    domains[domain] = (domains[domain] ?? 0) + 1;

    // Count by complexity
    const complexity = playbook.frontmatter.complexity;
    if (complexity in complexityDistribution) {
      complexityDistribution[complexity]++;
    }
  }

  return {
    totalPlaybooks: playbooks.size,
    domains,
    complexityDistribution,
  };
}
