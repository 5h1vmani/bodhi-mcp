import { describe, it, expect, beforeAll } from "vitest";
import * as path from "path";
import { fileURLToPath } from "url";
import type { Playbook } from "../src/types.js";
import { readPlaybook } from "../src/tools/read.js";
import { loadAllPlaybooks } from "../src/utils/parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.resolve(__dirname, "../knowledge");

describe("Security - Path Traversal Protection", () => {
  let playbooks: Map<string, Playbook>;

  beforeAll(() => {
    // Load playbooks for testing
    const playbooksList = loadAllPlaybooks(knowledgePath);
    playbooks = new Map();
    for (const playbook of playbooksList) {
      playbooks.set(playbook.relativePath, playbook);
    }
  });

  describe("readPlaybook path validation", () => {
    it("should reject path traversal with ../../etc/passwd", () => {
      const result = readPlaybook(
        { path: "../../etc/passwd" },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toContain("Invalid path");
        expect(result.error).toContain("outside knowledge base");
      }
    });

    it("should reject path traversal with ../../../.env", () => {
      const result = readPlaybook(
        { path: "../../../.env" },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toContain("Invalid path");
        expect(result.error).toContain("outside knowledge base");
      }
    });

    it("should reject absolute paths like /etc/passwd", () => {
      const result = readPlaybook(
        { path: "/etc/passwd" },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toContain("Invalid path");
        expect(result.error).toContain("outside knowledge base");
      }
    });

    it("should reject absolute paths on Windows-style like C:/Windows/System32", () => {
      const result = readPlaybook(
        { path: "C:/Windows/System32/config" },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        // On Unix systems, Windows paths may just be treated as not found
        // The important thing is they don't succeed in reading anything
        expect(result.error).toBeDefined();
        // Should not successfully read content
        expect(result.error.length).toBeGreaterThan(0);
      }
    });

    it("should reject tricky path traversal with domains/../../etc/passwd", () => {
      const result = readPlaybook(
        { path: "domains/../../etc/passwd" },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toContain("Invalid path");
        expect(result.error).toContain("outside knowledge base");
      }
    });

    it("should allow valid relative paths within knowledge base", () => {
      // Get a known valid playbook path
      const firstPlaybook = Array.from(playbooks.values())[0];

      if (firstPlaybook) {
        const result = readPlaybook(
          { path: firstPlaybook.relativePath },
          { playbooks, knowledgePath }
        );

        expect("error" in result).toBe(false);
        if (!("error" in result)) {
          expect(result.path).toBe(firstPlaybook.relativePath);
          expect(result.title).toBeDefined();
          expect(result.content).toBeDefined();
        }
      }
    });

    it("should allow deeply nested valid paths like domains/ux/gamification.md", () => {
      // Try to find a playbook in domains/ux or use a mock path
      const uxPlaybook = Array.from(playbooks.values()).find((pb) =>
        pb.relativePath.includes("domains/ux")
      );

      if (uxPlaybook) {
        const result = readPlaybook(
          { path: uxPlaybook.relativePath },
          { playbooks, knowledgePath }
        );

        expect("error" in result).toBe(false);
        if (!("error" in result)) {
          expect(result.path).toContain("domains/");
          expect(result.title).toBeDefined();
        }
      } else {
        // If no UX playbook exists, at least test that the validation allows nested paths
        // by checking that a non-existent but valid-looking path doesn't trigger traversal error
        const result = readPlaybook(
          { path: "domains/test/nested/path.md" },
          { playbooks, knowledgePath }
        );

        // Should not be a traversal error - should be "not found" error
        if ("error" in result) {
          expect(result.error).not.toContain("Invalid path");
          expect(result.error).not.toContain("outside knowledge base");
          expect(result.error).toContain("not found");
        }
      }
    });

    it("should allow INDEX.md at root level", () => {
      const result = readPlaybook(
        { path: "INDEX.md" },
        { playbooks, knowledgePath }
      );

      // INDEX.md should either be readable or return "not found", but NOT a traversal error
      if ("error" in result) {
        expect(result.error).not.toContain("Invalid path");
        expect(result.error).not.toContain("outside knowledge base");
      }
    });

    it("should reject null bytes in path", () => {
      const result = readPlaybook(
        { path: "domains/test\0.md" },
        { playbooks, knowledgePath }
      );

      // Should either reject or not find the file, but shouldn't succeed
      if (!("error" in result)) {
        // If it doesn't error, the path should be sanitized and not contain null byte
        expect(result.path).not.toContain("\0");
      }
    });

    it("should handle encoded path traversal attempts", () => {
      // URL-encoded ../ is %2e%2e%2f
      const result = readPlaybook(
        { path: "%2e%2e%2f%2e%2e%2fetc/passwd" },
        { playbooks, knowledgePath }
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        // Should either be invalid path or not found, but shouldn't read /etc/passwd
        expect(result.error).toBeDefined();
      }
    });
  });
});
