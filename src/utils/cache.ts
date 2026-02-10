/**
 * In-memory cache for playbooks and indexes
 */

import type { Playbook, RouteEntry } from "../types.js";
import type MiniSearch from "minisearch";
import type { RouteMatcher } from "./indexer.js";

export interface CachedData {
  playbooks: Map<string, Playbook>;
  playbooksList: Playbook[];
  routingTable: RouteEntry[];
  searchIndex: MiniSearch;
  routeMatcher: RouteMatcher;
  knowledgePath: string;
  loadedAt: Date;
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

export function isCacheValid(knowledgePath: string): boolean {
  return cache !== null && cache.knowledgePath === knowledgePath;
}

export function getCacheStats(): {
  isCached: boolean;
  knowledgePath: string | null;
  playbooksCount: number;
  routesCount: number;
  loadedAt: Date | null;
  ageMs: number | null;
} {
  if (!cache) {
    return {
      isCached: false,
      knowledgePath: null,
      playbooksCount: 0,
      routesCount: 0,
      loadedAt: null,
      ageMs: null,
    };
  }

  return {
    isCached: true,
    knowledgePath: cache.knowledgePath,
    playbooksCount: cache.playbooksList.length,
    routesCount: cache.routingTable.length,
    loadedAt: cache.loadedAt,
    ageMs: Date.now() - cache.loadedAt.getTime(),
  };
}
