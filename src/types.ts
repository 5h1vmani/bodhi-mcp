/**
 * Core types for Bodhi MCP
 */

export interface PlaybookFrontmatter {
  domain: string;
  topic: string;
  tags: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  last_updated: string;
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
}

export interface ListResult {
  path: string;
  title: string;
  domain: string;
  complexity: string;
  tags: string[];
  lastUpdated: string;
}

export interface BodhiConfig {
  knowledgePath: string;
  indexPath: string;
}
