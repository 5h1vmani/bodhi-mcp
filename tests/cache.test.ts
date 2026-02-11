import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as path from "path";
import { fileURLToPath } from "url";
import type { CachedData } from "../src/utils/cache.js";
import {
  getCache,
  setCache,
  clearCache,
  isCacheValid,
  takeMtimeSnapshot,
  getCacheStats,
} from "../src/utils/cache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.resolve(__dirname, "../knowledge");

describe("Cache", () => {
  beforeEach(() => {
    clearCache();
  });

  afterEach(() => {
    clearCache();
    delete process.env.BODHI_CACHE_TTL_MS;
  });

  describe("getCache and setCache", () => {
    it("should start as null", () => {
      const cache = getCache();
      expect(cache).toBeNull();
    });

    it("should support setCache/getCache round trip", () => {
      const mockCache: CachedData = {
        playbooks: new Map(),
        playbooksList: [],
        routingTable: [],
        searchIndex: {} as any,
        routeMatcher: {} as any,
        knowledgePath: "/test/path",
        loadedAt: new Date(),
        mtimeSnapshot: new Map(),
      };

      setCache(mockCache);
      const retrieved = getCache();

      expect(retrieved).toBe(mockCache);
      expect(retrieved?.knowledgePath).toBe("/test/path");
    });
  });

  describe("clearCache", () => {
    it("should reset cache to null", () => {
      const mockCache: CachedData = {
        playbooks: new Map(),
        playbooksList: [],
        routingTable: [],
        searchIndex: {} as any,
        routeMatcher: {} as any,
        knowledgePath: "/test/path",
        loadedAt: new Date(),
        mtimeSnapshot: new Map(),
      };

      setCache(mockCache);
      expect(getCache()).not.toBeNull();

      clearCache();
      expect(getCache()).toBeNull();
    });
  });

  describe("isCacheValid", () => {
    it("should return false when cache is empty", () => {
      const isValid = isCacheValid(knowledgePath);
      expect(isValid).toBe(false);
    });

    it("should return false for wrong knowledgePath", () => {
      const mockCache: CachedData = {
        playbooks: new Map(),
        playbooksList: [],
        routingTable: [],
        searchIndex: {} as any,
        routeMatcher: {} as any,
        knowledgePath: "/different/path",
        loadedAt: new Date(),
        mtimeSnapshot: new Map(),
      };

      setCache(mockCache);
      const isValid = isCacheValid(knowledgePath);
      expect(isValid).toBe(false);
    });

    it("should return false when TTL expired", async () => {
      // Set TTL to 1ms
      process.env.BODHI_CACHE_TTL_MS = "1";

      const mockCache: CachedData = {
        playbooks: new Map(),
        playbooksList: [],
        routingTable: [],
        searchIndex: {} as any,
        routeMatcher: {} as any,
        knowledgePath,
        loadedAt: new Date(),
        mtimeSnapshot: new Map(),
      };

      setCache(mockCache);

      // Wait 5ms for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 5));

      const isValid = isCacheValid(knowledgePath);
      expect(isValid).toBe(false);
    });

    it("should return true for valid cache within TTL", () => {
      // Take a real snapshot
      const mtimeSnapshot = takeMtimeSnapshot(knowledgePath);

      const mockCache: CachedData = {
        playbooks: new Map(),
        playbooksList: [],
        routingTable: [],
        searchIndex: {} as any,
        routeMatcher: {} as any,
        knowledgePath,
        loadedAt: new Date(),
        mtimeSnapshot,
      };

      setCache(mockCache);
      const isValid = isCacheValid(knowledgePath);
      expect(isValid).toBe(true);
    });
  });

  describe("takeMtimeSnapshot", () => {
    it("should return a Map with entries for existing paths", () => {
      const snapshot = takeMtimeSnapshot(knowledgePath);

      expect(snapshot).toBeInstanceOf(Map);
      expect(snapshot.size).toBeGreaterThan(0);

      // Should include INDEX.md and/or domains directory
      const indexPath = path.join(knowledgePath, "INDEX.md");
      const domainsPath = path.join(knowledgePath, "domains");

      const hasIndex = snapshot.has(indexPath);
      const hasDomains = snapshot.has(domainsPath);

      // At least one of these should exist
      expect(hasIndex || hasDomains).toBe(true);

      // Values should be numbers (mtime in milliseconds)
      for (const value of snapshot.values()) {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThan(0);
      }
    });

    it("should handle non-existent paths gracefully", () => {
      const nonExistentPath = "/path/that/does/not/exist";
      const snapshot = takeMtimeSnapshot(nonExistentPath);

      expect(snapshot).toBeInstanceOf(Map);
      // Should be empty since paths don't exist
      expect(snapshot.size).toBe(0);
    });
  });

  describe("getCacheStats", () => {
    it("should report isCached: false when empty", () => {
      const stats = getCacheStats();

      expect(stats.isCached).toBe(false);
      expect(stats.knowledgePath).toBeNull();
      expect(stats.playbooksCount).toBe(0);
      expect(stats.routesCount).toBe(0);
      expect(stats.loadedAt).toBeNull();
      expect(stats.ageMs).toBeNull();
      expect(stats.ttlMs).toBeGreaterThan(0);
    });

    it("should report correct stats when cache exists", () => {
      const mockPlaybook = {
        path: "/test/path.md",
        relativePath: "test/path.md",
        title: "Test",
        description: "Test playbook",
        tldr: "Test TL;DR",
        content: "# Test\n\nContent",
        frontmatter: {
          domain: "test",
          topic: "testing",
          tags: ["test"],
          complexity: "intermediate" as const,
          last_updated: "2024-01-01",
        },
      };

      const mockCache: CachedData = {
        playbooks: new Map([["test/path.md", mockPlaybook]]),
        playbooksList: [mockPlaybook],
        routingTable: [
          { task: "test task", playbook: "test/path.md" },
          { task: "another task", playbook: "test/path.md" },
        ],
        searchIndex: {} as any,
        routeMatcher: {} as any,
        knowledgePath: "/test/knowledge",
        loadedAt: new Date(),
        mtimeSnapshot: new Map(),
      };

      setCache(mockCache);
      const stats = getCacheStats();

      expect(stats.isCached).toBe(true);
      expect(stats.knowledgePath).toBe("/test/knowledge");
      expect(stats.playbooksCount).toBe(1);
      expect(stats.routesCount).toBe(2);
      expect(stats.loadedAt).toBeInstanceOf(Date);
      expect(stats.ageMs).toBeGreaterThanOrEqual(0);
      expect(stats.ttlMs).toBeGreaterThan(0);
    });

    it("should use custom TTL from environment", () => {
      process.env.BODHI_CACHE_TTL_MS = "12345";

      const stats = getCacheStats();
      expect(stats.ttlMs).toBe(12345);
    });
  });
});
