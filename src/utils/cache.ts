/**
 * In-memory cache for playbooks and indexes — with TTL and modification tracking
 */

import * as fs from "fs";
import * as path from "path";
import type { Playbook, RouteEntry } from "../types.js";
import type MiniSearch from "minisearch";
import type { RouteMatcher } from "./indexer.js";

/** Default TTL: 5 minutes (in ms). Override via BODHI_CACHE_TTL_MS env var. */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

export interface CachedData {
  playbooks: Map<string, Playbook>;
  playbooksList: Playbook[];
  routingTable: RouteEntry[];
  searchIndex: MiniSearch;
  routeMatcher: RouteMatcher;
  knowledgePath: string;
  loadedAt: Date;
  /** Snapshot of file modification times at load time */
  mtimeSnapshot: Map<string, number>;
}

let cache: CachedData | null = null;

export function getCache(): CachedData | null {
  return cache;
}

export function setCache(data: CachedData): void {
  cache = data;
}

export function clearCache(): void {
  cache = null;
}

/**
 * Check if the cache is still valid:
 * 1. Cache exists and matches the knowledge path
 * 2. TTL has not expired
 * 3. No files have been modified on disk since cache was created
 */
export function isCacheValid(knowledgePath: string): boolean {
  if (!cache || cache.knowledgePath !== knowledgePath) return false;

  // Check TTL
  const ttlMs = parseInt(process.env.BODHI_CACHE_TTL_MS ?? "", 10) || DEFAULT_TTL_MS;
  const ageMs = Date.now() - cache.loadedAt.getTime();
  if (ageMs > ttlMs) return false;

  // Check file modification times (sample check — INDEX.md + a few domain dirs)
  const indexPath = path.join(knowledgePath, "INDEX.md");
  try {
    if (fs.existsSync(indexPath)) {
      const currentMtime = fs.statSync(indexPath).mtimeMs;
      const cachedMtime = cache.mtimeSnapshot.get(indexPath);
      if (cachedMtime !== undefined && currentMtime !== cachedMtime) return false;
    }
    // Check domains directory mtime
    const domainsPath = path.join(knowledgePath, "domains");
    if (fs.existsSync(domainsPath)) {
      const currentMtime = fs.statSync(domainsPath).mtimeMs;
      const cachedMtime = cache.mtimeSnapshot.get(domainsPath);
      if (cachedMtime !== undefined && currentMtime !== cachedMtime) return false;
    }
  } catch {
    // If stat fails, invalidate cache to be safe
    return false;
  }

  return true;
}

/**
 * Take a snapshot of key file modification times for invalidation checks
 */
export function takeMtimeSnapshot(knowledgePath: string): Map<string, number> {
  const snapshot = new Map<string, number>();

  const paths = [
    path.join(knowledgePath, "INDEX.md"),
    path.join(knowledgePath, "domains"),
  ];

  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        snapshot.set(p, fs.statSync(p).mtimeMs);
      }
    } catch {
      // Skip if stat fails
    }
  }

  return snapshot;
}

export function getCacheStats(): {
  isCached: boolean;
  knowledgePath: string | null;
  playbooksCount: number;
  routesCount: number;
  loadedAt: Date | null;
  ageMs: number | null;
  ttlMs: number;
} {
  const ttlMs = parseInt(process.env.BODHI_CACHE_TTL_MS ?? "", 10) || DEFAULT_TTL_MS;

  if (!cache) {
    return {
      isCached: false,
      knowledgePath: null,
      playbooksCount: 0,
      routesCount: 0,
      loadedAt: null,
      ageMs: null,
      ttlMs,
    };
  }

  return {
    isCached: true,
    knowledgePath: cache.knowledgePath,
    playbooksCount: cache.playbooksList.length,
    routesCount: cache.routingTable.length,
    loadedAt: cache.loadedAt,
    ageMs: Date.now() - cache.loadedAt.getTime(),
    ttlMs,
  };
}
