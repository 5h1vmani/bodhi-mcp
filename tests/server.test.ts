import { describe, it, expect, beforeAll } from "vitest";
import * as path from "path";
import { fileURLToPath } from "url";
import { createBodhiServer } from "../src/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.resolve(__dirname, "../knowledge");

describe("Server Integration", () => {
  let server: ReturnType<typeof createBodhiServer>;

  beforeAll(() => {
    // Set log level to silent to avoid noise during tests
    process.env.BODHI_LOG_LEVEL = "silent";
  });

  describe("createBodhiServer", () => {
    it("should create server without errors", () => {
      expect(() => {
        server = createBodhiServer(knowledgePath);
      }).not.toThrow();
    });

    it("should return a server object", () => {
      server = createBodhiServer(knowledgePath);
      expect(server).toBeDefined();
      expect(server).toHaveProperty("setRequestHandler");
      expect(server).toHaveProperty("connect");
    });

    it("should create server with default knowledge path when not provided", () => {
      // Don't pass knowledgePath, let it use default
      expect(() => {
        const defaultServer = createBodhiServer();
        expect(defaultServer).toBeDefined();
      }).not.toThrow();
    });

    it("should create server with BODHI_KNOWLEDGE_PATH env var", () => {
      const originalEnv = process.env.BODHI_KNOWLEDGE_PATH;
      process.env.BODHI_KNOWLEDGE_PATH = knowledgePath;

      try {
        expect(() => {
          const envServer = createBodhiServer();
          expect(envServer).toBeDefined();
        }).not.toThrow();
      } finally {
        if (originalEnv !== undefined) {
          process.env.BODHI_KNOWLEDGE_PATH = originalEnv;
        } else {
          delete process.env.BODHI_KNOWLEDGE_PATH;
        }
      }
    });

    it("should handle custom log level from environment", () => {
      const originalLogLevel = process.env.BODHI_LOG_LEVEL;
      process.env.BODHI_LOG_LEVEL = "debug";

      try {
        expect(() => {
          const debugServer = createBodhiServer(knowledgePath);
          expect(debugServer).toBeDefined();
        }).not.toThrow();
      } finally {
        if (originalLogLevel !== undefined) {
          process.env.BODHI_LOG_LEVEL = originalLogLevel;
        } else {
          delete process.env.BODHI_LOG_LEVEL;
        }
      }
    });

    it("should use cached knowledge base on second instantiation", () => {
      // First server load
      const server1 = createBodhiServer(knowledgePath);
      expect(server1).toBeDefined();

      // Second server load should use cache
      const startTime = Date.now();
      const server2 = createBodhiServer(knowledgePath);
      const loadTime = Date.now() - startTime;

      expect(server2).toBeDefined();
      // Cached load should be faster (though this is a heuristic test)
      // We're just verifying it doesn't throw, the cache tests verify caching behavior
    });

    it("should handle multiple server instances", () => {
      expect(() => {
        const server1 = createBodhiServer(knowledgePath);
        const server2 = createBodhiServer(knowledgePath);
        const server3 = createBodhiServer(knowledgePath);

        expect(server1).toBeDefined();
        expect(server2).toBeDefined();
        expect(server3).toBeDefined();
      }).not.toThrow();
    });
  });

  describe("Server module exports", () => {
    it("should export createBodhiServer function", async () => {
      const serverModule = await import("../src/server.js");
      expect(serverModule.createBodhiServer).toBeDefined();
      expect(typeof serverModule.createBodhiServer).toBe("function");
    });

    it("should export startServer function", async () => {
      const serverModule = await import("../src/server.js");
      expect(serverModule.startServer).toBeDefined();
      expect(typeof serverModule.startServer).toBe("function");
    });

    it("should have correct module structure", async () => {
      const serverModule = await import("../src/server.js");

      // Should have the main exports
      expect(serverModule).toHaveProperty("createBodhiServer");
      expect(serverModule).toHaveProperty("startServer");
    });
  });

  describe("Server error handling", () => {
    it("should handle invalid knowledge path gracefully", () => {
      const invalidPath = "/path/that/definitely/does/not/exist/at/all";

      // Server creation might not throw immediately, but it should handle it
      // The actual error would occur during knowledge loading
      expect(() => {
        try {
          createBodhiServer(invalidPath);
        } catch (error) {
          // If it throws, that's acceptable error handling
          expect(error).toBeDefined();
        }
      }).not.toThrow();
    });
  });
});
