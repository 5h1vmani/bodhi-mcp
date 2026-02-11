/**
 * Core types for Bodhi MCP
 */

/** Response format for tool output */
export type ResponseFormat = "json" | "markdown";

export interface PlaybookFrontmatter {
  domain: string;
  topic: string;
  tags: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  last_updated: string;
  // Provenance fields (optional — backwards-compatible with existing playbooks)
  confidence?: number; // 0–1 synthesis confidence
  source_refs?: string[]; // DOIs, URLs, internal IDs backing this entry
  status?: "draft" | "validated" | "superseded" | "archived";
  superseded_by?: string; // relative path to newer version
  review_by?: string; // ISO 8601 date — staleness deadline
  author?: string; // who/what produced the synthesis
  version?: number; // monotonically increasing version number
}

export interface Playbook {
  path: string;
  relativePath: string;
  frontmatter: PlaybookFrontmatter;
  title: string;
  description: string;
  tldr: string;
  content: string;
}

export interface RouteEntry {
  task: string;
  playbook: string;
}

export interface RouteResult {
  playbook: string;
  confidence: number;
  title: string;
  domain: string;
  tldr?: string;
  alternatives?: Array<{
    playbook: string;
    confidence: number;
    title: string;
  }>;
}

export interface SearchResult {
  path: string;
  title: string;
  domain: string;
  complexity: string;
  score: number;
  tldr?: string;
  matchedTerms?: string[];
  // Provenance fields surfaced in search results
  confidence?: number;
  status?: string;
  lastUpdated?: string;
  stale?: boolean; // true if past review_by date
}

export interface ListResult {
  path: string;
  title: string;
  domain: string;
  complexity: string;
  tags: string[];
  lastUpdated: string;
  confidence?: number;
  status?: string;
  stale?: boolean;
}

export interface BodhiConfig {
  knowledgePath: string;
  indexPath: string;
}
