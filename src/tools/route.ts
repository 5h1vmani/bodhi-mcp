/**
 * route(task) tool - Find the best playbook for a given task
 */

import type { RouteResult, Playbook } from "../types.js";
import type { createRouteMatcher } from "../utils/indexer.js";

export interface RouteToolDeps {
  routeMatcher: ReturnType<typeof createRouteMatcher>;
  playbooks: Map<string, Playbook>;
}

/**
 * Find the best playbook for a given task description
 */
export function routeTask(
  task: string,
  deps: RouteToolDeps
): RouteResult | { error: string } {
  const { routeMatcher, playbooks } = deps;

  if (!task || task.trim().length === 0) {
    return { error: "Task description is required" };
  }

  const matches = routeMatcher.match(task, 5);

  if (matches.length === 0) {
    return {
      error: `No matching playbook found for task: "${task}". Try using search() for broader results.`,
    };
  }

  const topMatch = matches[0];
  const playbookPath = topMatch.route.playbook;

  // Find playbook details
  const playbook = findPlaybookByPath(playbookPath, playbooks);

  const maxPossibleScore = task.split(/\s+/).filter((t) => t.length > 2).length * 2;
  const confidence = Math.min(topMatch.score / Math.max(maxPossibleScore, 1), 1);

  const result: RouteResult = {
    playbook: playbookPath,
    confidence: Math.round(confidence * 100) / 100,
    title: playbook?.title ?? extractTitleFromPath(playbookPath),
    domain: playbook?.frontmatter.domain ?? extractDomainFromPath(playbookPath),
    tldr: playbook?.tldr,
  };

  // Add alternatives if there are other good matches
  if (matches.length > 1) {
    result.alternatives = matches.slice(1, 4).map((m) => {
      const pb = findPlaybookByPath(m.route.playbook, playbooks);
      const altConfidence = Math.min(m.score / Math.max(maxPossibleScore, 1), 1);
      return {
        playbook: m.route.playbook,
        confidence: Math.round(altConfidence * 100) / 100,
        title: pb?.title ?? extractTitleFromPath(m.route.playbook),
      };
    });
  }

  return result;
}

/**
 * Find a playbook by its relative path
 */
function findPlaybookByPath(
  path: string,
  playbooks: Map<string, Playbook>
): Playbook | undefined {
  // Try exact match first
  if (playbooks.has(path)) {
    return playbooks.get(path);
  }

  // Try matching by relative path ending
  for (const [key, playbook] of playbooks) {
    if (key.endsWith(path) || playbook.relativePath.endsWith(path)) {
      return playbook;
    }
  }

  return undefined;
}

/**
 * Extract title from path as fallback
 */
function extractTitleFromPath(path: string): string {
  const filename = path.split("/").pop() ?? path;
  return filename
    .replace(".md", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract domain from path as fallback
 */
function extractDomainFromPath(path: string): string {
  const parts = path.split("/");
  const domainsIndex = parts.indexOf("domains");
  if (domainsIndex >= 0 && parts[domainsIndex + 1]) {
    return parts[domainsIndex + 1];
  }
  return "unknown";
}
