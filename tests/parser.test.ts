import { describe, it, expect, beforeAll } from "vitest";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  parsePlaybook,
  parseRoutingTable,
  findMarkdownFiles,
  loadAllPlaybooks,
  extractSection,
} from "../src/utils/parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.resolve(__dirname, "../knowledge");

describe("Parser Utils", () => {
  describe("findMarkdownFiles", () => {
    it("should find markdown files in domains directory", () => {
      const domainsPath = path.join(knowledgePath, "domains");
      const files = findMarkdownFiles(domainsPath);

      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.endsWith(".md"))).toBe(true);
      expect(files.every((f) => !f.includes("_index.md"))).toBe(true);
    });
  });

  describe("parsePlaybook", () => {
    it("should parse a valid playbook with frontmatter", () => {
      const files = findMarkdownFiles(path.join(knowledgePath, "domains"));
      const firstFile = files[0];

      const playbook = parsePlaybook(firstFile, knowledgePath);

      expect(playbook).not.toBeNull();
      expect(playbook?.frontmatter.domain).toBeDefined();
      expect(playbook?.title).toBeDefined();
      expect(playbook?.relativePath).toBeDefined();
    });

    it("should extract TL;DR section", () => {
      const files = findMarkdownFiles(path.join(knowledgePath, "domains"));
      const playbook = parsePlaybook(files[0], knowledgePath);

      // TL;DR may or may not exist, but should be a string
      expect(typeof playbook?.tldr).toBe("string");
    });
  });

  describe("parseRoutingTable", () => {
    it("should parse INDEX.md routing table", () => {
      const indexPath = path.join(knowledgePath, "INDEX.md");
      const routes = parseRoutingTable(indexPath);

      expect(routes.length).toBeGreaterThan(0);
      expect(routes[0]).toHaveProperty("task");
      expect(routes[0]).toHaveProperty("playbook");
    });

    it("should have mostly valid playbook paths", () => {
      const indexPath = path.join(knowledgePath, "INDEX.md");
      const routes = parseRoutingTable(indexPath);

      // Most playbook paths should start with domains/ or meta/
      const validPaths = routes.filter(
        (r) => r.playbook.startsWith("domains/") || r.playbook.startsWith("meta/")
      );
      // Allow for some edge cases (at least 95% should be valid)
      expect(validPaths.length / routes.length).toBeGreaterThan(0.95);
    });
  });

  describe("loadAllPlaybooks", () => {
    it("should load all playbooks from knowledge base", () => {
      const playbooks = loadAllPlaybooks(knowledgePath);

      expect(playbooks.length).toBeGreaterThan(0);

      // Each playbook should have required fields
      for (const playbook of playbooks) {
        expect(playbook.path).toBeDefined();
        expect(playbook.relativePath).toBeDefined();
        expect(playbook.title).toBeDefined();
        expect(playbook.frontmatter.domain).toBeDefined();
      }
    });
  });

  describe("extractSection", () => {
    it("should extract TL;DR section", () => {
      const content = `
# Test

## TL;DR

- Point 1
- Point 2

## Decision Guide

Some content
`;
      const tldr = extractSection(content, "TL;DR");

      expect(tldr).toContain("Point 1");
      expect(tldr).toContain("Point 2");
    });

    it("should return null for non-existent section", () => {
      const content = `# Test\n\n## Other Section\n\nContent`;
      const result = extractSection(content, "TL;DR");

      expect(result).toBeNull();
    });
  });
});
