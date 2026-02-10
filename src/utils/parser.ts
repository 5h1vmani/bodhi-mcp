/**
 * Markdown and frontmatter parsing utilities
 */

import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import type { Playbook, PlaybookFrontmatter, RouteEntry } from "../types.js";

/**
 * Parse a single markdown playbook file
 */
export function parsePlaybook(filePath: string, basePath: string): Playbook | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data, content: body } = matter(content);

    const frontmatter = data as PlaybookFrontmatter;

    // Extract title from first H1
    const titleMatch = body.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1] ?? frontmatter.topic ?? path.basename(filePath, ".md");

    // Extract description from blockquote after title
    const descMatch = body.match(/^>\s*(.+)$/m);
    const description = descMatch?.[1] ?? "";

    // Extract TL;DR section
    const tldr = extractSection(body, "TL;DR") ?? extractSection(body, "TLDR") ?? "";

    const relativePath = path.relative(basePath, filePath);

    return {
      path: filePath,
      relativePath,
      frontmatter,
      title,
      description,
      tldr,
      content: body,
    };
  } catch (error) {
    console.error(`Failed to parse playbook: ${filePath}`, error);
    return null;
  }
}

/**
 * Extract a section from markdown by heading
 */
export function extractSection(content: string, heading: string): string | null {
  // Normalize line endings
  const normalizedContent = content.replace(/\r\n/g, "\n");

  // Match the heading and capture content until next heading of same or higher level
  // Use a simpler approach: find the heading line, then extract content until next heading
  const lines = normalizedContent.split("\n");
  let inSection = false;
  let sectionLines: string[] = [];

  for (const line of lines) {
    // Check if this is our target heading (## TL;DR or ## TLDR, etc.)
    const headingMatch = line.match(/^##\s+(.+?)\s*$/);
    if (headingMatch) {
      if (headingMatch[1].toLowerCase() === heading.toLowerCase()) {
        inSection = true;
        continue;
      } else if (inSection) {
        // We've hit another ## heading, stop
        break;
      }
    }

    // Check if we hit a # heading (higher level) while in section
    if (inSection && line.match(/^#\s+/)) {
      break;
    }

    if (inSection) {
      sectionLines.push(line);
    }
  }

  if (sectionLines.length === 0) return null;

  // Clean up the content
  return sectionLines
    .map((line) => line.replace(/^[-*]\s+/, "").trim())
    .filter((line) => line.length > 0)
    .join(" ")
    .slice(0, 500); // Limit length for TL;DR
}

/**
 * Parse INDEX.md to extract task routing table
 */
export function parseRoutingTable(indexPath: string): RouteEntry[] {
  try {
    const content = fs.readFileSync(indexPath, "utf-8");
    const routes: RouteEntry[] = [];

    // Find the Task Routing table
    const tableMatch = content.match(
      /\|\s*Task\s*\|\s*Read This\s*\|[\s\S]*?(?=\n\n|\n---|\n##|$)/i
    );

    if (!tableMatch) {
      console.error("Could not find routing table in INDEX.md");
      return routes;
    }

    const tableContent = tableMatch[0];
    const lines = tableContent.split("\n").filter((line) => line.trim().startsWith("|"));

    // Skip header and separator rows
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);

      if (cells.length >= 2) {
        const task = cells[0];
        const playbook = cells[1].replace(/`/g, "");

        if (task && playbook && !task.includes("---")) {
          routes.push({ task, playbook });
        }
      }
    }

    return routes;
  } catch (error) {
    console.error(`Failed to parse routing table: ${indexPath}`, error);
    return [];
  }
}

/**
 * Recursively find all markdown files in a directory
 */
export function findMarkdownFiles(dir: string, files: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories and common non-content dirs
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          findMarkdownFiles(fullPath, files);
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        // Skip index files and templates
        if (!entry.name.startsWith("_") && entry.name !== "INDEX.md") {
          files.push(fullPath);
        }
      }
    }

    return files;
  } catch (error) {
    console.error(`Failed to scan directory: ${dir}`, error);
    return files;
  }
}

/**
 * Load all playbooks from knowledge base
 */
export function loadAllPlaybooks(knowledgePath: string): Playbook[] {
  const domainsPath = path.join(knowledgePath, "domains");
  const files = findMarkdownFiles(domainsPath);

  const playbooks: Playbook[] = [];

  for (const file of files) {
    const playbook = parsePlaybook(file, knowledgePath);
    if (playbook) {
      playbooks.push(playbook);
    }
  }

  return playbooks;
}
