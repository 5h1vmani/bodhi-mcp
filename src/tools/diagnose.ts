/**
 * bodhi_diagnose tool - Health check and debugging information
 */

import * as fs from "fs";
import * as path from "path";
import type { Playbook } from "../types.js";
import { getCacheStats } from "../utils/cache.js";
import { getLogLevel } from "../utils/logger.js";

export interface DiagnoseResult {
  status: "healthy" | "degraded" | "error";
  version: string;
  knowledgePath: string;
  knowledgePathExists: boolean;
  indexExists: boolean;
  domainsFound: string[];
  playbooksCount: number;
  routesCount: number;
  searchIndexSize: number;
  cache: {
    isCached: boolean;
    ageMs: number | null;
  };
  logLevel: string;
  nodeVersion: string;
  issues: string[];
  recommendations: string[];
}

export interface DiagnoseDeps {
  playbooks: Map<string, Playbook>;
  knowledgePath: string;
  routesCount: number;
  searchIndexSize: number;
}

export function diagnose(deps: DiagnoseDeps): DiagnoseResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let status: "healthy" | "degraded" | "error" = "healthy";

  const { playbooks, knowledgePath, routesCount, searchIndexSize } = deps;

  // Check knowledge path
  const knowledgePathExists = fs.existsSync(knowledgePath);
  if (!knowledgePathExists) {
    issues.push(`Knowledge path does not exist: ${knowledgePath}`);
    status = "error";
  }

  // Check INDEX.md
  const indexPath = path.join(knowledgePath, "INDEX.md");
  const indexExists = fs.existsSync(indexPath);
  if (!indexExists && knowledgePathExists) {
    issues.push("INDEX.md not found in knowledge path");
    recommendations.push("Create INDEX.md with a task routing table");
    status = status === "healthy" ? "degraded" : status;
  }

  // Check domains
  const domainsPath = path.join(knowledgePath, "domains");
  let domainsFound: string[] = [];
  if (fs.existsSync(domainsPath)) {
    try {
      domainsFound = fs
        .readdirSync(domainsPath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    } catch {
      issues.push("Could not read domains directory");
    }
  } else if (knowledgePathExists) {
    issues.push("domains/ directory not found");
    recommendations.push("Create domains/ directory with playbook subdirectories");
    status = status === "healthy" ? "degraded" : status;
  }

  // Check playbook count
  const playbooksCount = playbooks.size;
  if (playbooksCount === 0 && knowledgePathExists) {
    issues.push("No playbooks loaded");
    recommendations.push("Add .md playbook files to domains/ subdirectories");
    status = status === "healthy" ? "degraded" : status;
  } else if (playbooksCount < 10) {
    recommendations.push(
      `Only ${playbooksCount} playbooks found. Consider adding more for better coverage.`
    );
  }

  // Check routes
  if (routesCount === 0 && indexExists) {
    issues.push("No routes found in INDEX.md");
    recommendations.push("Add task routing entries to INDEX.md");
    status = status === "healthy" ? "degraded" : status;
  }

  // Check for playbooks without frontmatter
  let missingFrontmatter = 0;
  for (const playbook of playbooks.values()) {
    if (!playbook.frontmatter.domain || !playbook.frontmatter.topic) {
      missingFrontmatter++;
    }
  }
  if (missingFrontmatter > 0) {
    recommendations.push(
      `${missingFrontmatter} playbooks are missing frontmatter (domain/topic)`
    );
  }

  // Cache stats
  const cacheStats = getCacheStats();

  return {
    status,
    version: "0.2.0",
    knowledgePath,
    knowledgePathExists,
    indexExists,
    domainsFound,
    playbooksCount,
    routesCount,
    searchIndexSize,
    cache: {
      isCached: cacheStats.isCached,
      ageMs: cacheStats.ageMs,
    },
    logLevel: getLogLevel(),
    nodeVersion: process.version,
    issues,
    recommendations,
  };
}
