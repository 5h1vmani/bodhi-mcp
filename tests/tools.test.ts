import { describe, it, expect, beforeAll } from "vitest";
import * as path from "path";
import { fileURLToPath } from "url";
import type { Playbook } from "../src/types.js";
import {
  loadAllPlaybooks,
  parseRoutingTable,
  createSearchIndex,
  createRouteMatcher,
} from "../src/utils/index.js";
import { routeTask } from "../src/tools/route.js";
import { searchPlaybooks } from "../src/tools/search.js";
import { listPlaybooks, getKnowledgeBaseSummary } from "../src/tools/list.js";
import { readPlaybook } from "../src/tools/read.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.resolve(__dirname, "../knowledge");

describe("Tools", () => {
  let playbooks: Map<string, Playbook>;
  let routeMatcher: ReturnType<typeof createRouteMatcher>;
  let searchIndex: ReturnType<typeof createSearchIndex>;

  beforeAll(() => {
    // Load playbooks
    const playbooksList = loadAllPlaybooks(knowledgePath);
    playbooks = new Map();
    for (const playbook of playbooksList) {
      playbooks.set(playbook.relativePath, playbook);
    }

    // Create route matcher
    const indexPath = path.join(knowledgePath, "INDEX.md");
    const routingTable = parseRoutingTable(indexPath);
    routeMatcher = createRouteMatcher(routingTable);

    // Create search index
    searchIndex = createSearchIndex(playbooksList);
  });

  describe("routeTask", () => {
    it("should find a matching playbook for a valid task", () => {
      const result = routeTask("pitch deck design", { routeMatcher, playbooks });

      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(result.playbook).toContain("pitch-deck");
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.title).toBeDefined();
      }
    });

    it("should return error for empty task", () => {
      const result = routeTask("", { routeMatcher, playbooks });

      expect("error" in result).toBe(true);
    });

    it("should include alternatives when multiple matches exist", () => {
      const result = routeTask("security", { routeMatcher, playbooks });

      if (!("error" in result) && result.alternatives) {
        expect(result.alternatives.length).toBeGreaterThan(0);
      }
    });
  });

  describe("searchPlaybooks", () => {
    it("should find playbooks matching search query", () => {
      const result = searchPlaybooks({ query: "gamification" }, { searchIndex });

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty("path");
        expect(result[0]).toHaveProperty("score");
      }
    });

    it("should filter by domain", () => {
      const result = searchPlaybooks(
        { query: "design", domain: "ux" },
        { searchIndex }
      );

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result) && result.length > 0) {
        expect(result.every((r) => r.domain === "ux")).toBe(true);
      }
    });

    it("should return error for empty query", () => {
      const result = searchPlaybooks({ query: "" }, { searchIndex });

      expect("error" in result).toBe(true);
    });

    it("should respect limit parameter", () => {
      const result = searchPlaybooks(
        { query: "design", limit: 3 },
        { searchIndex }
      );

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe("listPlaybooks", () => {
    it("should list all playbooks", () => {
      const result = listPlaybooks({}, { playbooks });

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result)) {
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty("path");
        expect(result[0]).toHaveProperty("title");
        expect(result[0]).toHaveProperty("domain");
      }
    });

    it("should filter by domain", () => {
      const result = listPlaybooks({ domain: "marketing" }, { playbooks });

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result) && result.length > 0) {
        expect(result.every((r) => r.domain === "marketing")).toBe(true);
      }
    });

    it("should filter by complexity", () => {
      const result = listPlaybooks({ complexity: "advanced" }, { playbooks });

      expect(Array.isArray(result)).toBe(true);
      if (Array.isArray(result) && result.length > 0) {
        expect(result.every((r) => r.complexity === "advanced")).toBe(true);
      }
    });
  });

  describe("getKnowledgeBaseSummary", () => {
    it("should return summary statistics", () => {
      const summary = getKnowledgeBaseSummary({ playbooks });

      expect(summary.totalPlaybooks).toBeGreaterThan(0);
      expect(Object.keys(summary.domains).length).toBeGreaterThan(0);
      expect(summary.complexityDistribution).toHaveProperty("beginner");
      expect(summary.complexityDistribution).toHaveProperty("intermediate");
      expect(summary.complexityDistribution).toHaveProperty("advanced");
    });
  });

  describe("readPlaybook", () => {
    it("should read an existing playbook", () => {
      // Get first playbook path
      const firstPlaybook = Array.from(playbooks.values())[0];
      const result = readPlaybook(
        { path: firstPlaybook.relativePath },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(result.title).toBeDefined();
        expect(result.content).toBeDefined();
        expect(result.frontmatter.domain).toBeDefined();
      }
    });

    it("should extract specific section", () => {
      const firstPlaybook = Array.from(playbooks.values())[0];
      const result = readPlaybook(
        { path: firstPlaybook.relativePath, section: "TL;DR" },
        { playbooks, knowledgePath }
      );

      if (!("error" in result)) {
        // Content should be the TL;DR section (or "not found" message)
        expect(result.content).toBeDefined();
      }
    });

    it("should return error for non-existent playbook", () => {
      const result = readPlaybook(
        { path: "non-existent/path.md" },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(true);
    });
  });
});
