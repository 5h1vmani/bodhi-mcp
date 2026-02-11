/**
 * bodhi_read(path) tool - Read a specific playbook content
 */

import * as fs from "fs";
import * as path from "path";
import type { Playbook } from "../types.js";

/**
 * Validate that a resolved path stays within the allowed base directory.
 * Prevents path traversal attacks (e.g., "../../etc/passwd").
 */
function isPathWithinBase(basePath: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(basePath);
  const resolvedTarget = path.resolve(basePath, targetPath);
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(resolvedBase + path.sep);
}

export interface ReadToolDeps {
  playbooks: Map<string, Playbook>;
  knowledgePath: string;
}

export interface ReadOptions {
  path: string;
  section?: string;
}

export interface ReadResult {
  path: string;
  title: string;
  content: string;
  frontmatter: {
    domain: string;
    topic: string;
    tags: string[];
    complexity: string;
  };
}

/**
 * Read a specific playbook by path
 */
export function readPlaybook(
  options: ReadOptions,
  deps: ReadToolDeps
): ReadResult | { error: string } {
  const { playbooks, knowledgePath } = deps;
  const { path: requestedPath, section } = options;

  if (!requestedPath || requestedPath.trim().length === 0) {
    return { error: "Playbook path is required" };
  }

  // Find the playbook
  let playbook = playbooks.get(requestedPath);

  if (!playbook) {
    // Try to find by relative path match
    for (const [key, pb] of playbooks) {
      if (
        key.endsWith(requestedPath) ||
        pb.relativePath.endsWith(requestedPath) ||
        pb.relativePath.includes(requestedPath)
      ) {
        playbook = pb;
        break;
      }
    }
  }

  if (!playbook) {
    // Validate path stays within knowledge base (prevent traversal)
    if (!isPathWithinBase(knowledgePath, requestedPath)) {
      return { error: "Invalid path: access outside knowledge base is not allowed." };
    }

    // Try direct file read as fallback
    const fullPath = path.resolve(knowledgePath, requestedPath);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        return {
          path: requestedPath,
          title: extractTitleFromContent(content) ?? requestedPath,
          content: section ? extractSection(content, section) : content,
          frontmatter: {
            domain: "unknown",
            topic: requestedPath,
            tags: [],
            complexity: "intermediate",
          },
        };
      } catch (error) {
        return { error: `Failed to read file: ${requestedPath}` };
      }
    }

    return {
      error: `Playbook not found: ${requestedPath}. Use bodhi_list() to see available playbooks.`,
    };
  }

  let content = playbook.content;

  // Extract specific section if requested
  if (section) {
    content = extractSection(content, section);
  }

  return {
    path: playbook.relativePath,
    title: playbook.title,
    content,
    frontmatter: {
      domain: playbook.frontmatter.domain,
      topic: playbook.frontmatter.topic,
      tags: playbook.frontmatter.tags,
      complexity: playbook.frontmatter.complexity,
    },
  };
}

/**
 * Extract a section from markdown content
 */
function extractSection(content: string, sectionName: string): string {
  const normalizedName = sectionName.toLowerCase().replace(/\s+/g, "\\s+");
  const regex = new RegExp(
    `^(#{1,3})\\s+${normalizedName}\\s*$([\\s\\S]*?)(?=^\\1\\s|^#{1,2}\\s|$)`,
    "mi"
  );

  const match = content.match(regex);
  if (match) {
    return match[0].trim();
  }

  // Try without level matching
  const simpleRegex = new RegExp(
    `^#+\\s+${normalizedName}\\s*$([\\s\\S]*?)(?=^#+\\s|$)`,
    "mi"
  );

  const simpleMatch = content.match(simpleRegex);
  if (simpleMatch) {
    return simpleMatch[0].trim();
  }

  return `Section "${sectionName}" not found in playbook.`;
}

/**
 * Extract title from markdown content
 */
function extractTitleFromContent(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1] ?? null;
}
