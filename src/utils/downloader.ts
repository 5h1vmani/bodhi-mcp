/**
 * Knowledge base downloader - Auto-fetch on first run
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";
import { logger } from "./logger.js";

const KNOWLEDGE_REPO = "https://github.com/5h1vmani/bodhi-mcp.git";
const KNOWLEDGE_BRANCH = "main";
const BODHI_HOME = path.join(os.homedir(), ".bodhi");
const KNOWLEDGE_DIR = path.join(BODHI_HOME, "knowledge");
const VERSION_FILE = path.join(BODHI_HOME, ".version");

export interface DownloadResult {
  success: boolean;
  path: string;
  message: string;
  isNew: boolean;
}

/**
 * Get the default knowledge path, downloading if necessary
 */
export function ensureKnowledge(): string {
  // First check if bundled knowledge exists (npm package)
  const bundledPath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../../knowledge"
  );

  if (fs.existsSync(bundledPath) && fs.existsSync(path.join(bundledPath, "INDEX.md"))) {
    logger.debug("Using bundled knowledge base", { path: bundledPath });
    return bundledPath;
  }

  // Check if downloaded knowledge exists
  if (fs.existsSync(KNOWLEDGE_DIR) && fs.existsSync(path.join(KNOWLEDGE_DIR, "INDEX.md"))) {
    logger.debug("Using downloaded knowledge base", { path: KNOWLEDGE_DIR });
    return KNOWLEDGE_DIR;
  }

  // Download knowledge base
  logger.info("Knowledge base not found, downloading...");
  const result = downloadKnowledge();

  if (!result.success) {
    throw new Error(`Failed to download knowledge base: ${result.message}`);
  }

  return result.path;
}

/**
 * Download or update the knowledge base from GitHub
 */
export function downloadKnowledge(): DownloadResult {
  try {
    // Ensure .bodhi directory exists
    if (!fs.existsSync(BODHI_HOME)) {
      fs.mkdirSync(BODHI_HOME, { recursive: true });
      logger.debug("Created Bodhi home directory", { path: BODHI_HOME });
    }

    const isNew = !fs.existsSync(KNOWLEDGE_DIR);

    if (isNew) {
      // Clone the repo (sparse checkout for just knowledge folder)
      logger.info("Downloading knowledge base for the first time...");

      // Initialize sparse checkout
      execSync(`git clone --depth 1 --filter=blob:none --sparse "${KNOWLEDGE_REPO}" "${KNOWLEDGE_DIR}-temp"`, {
        stdio: "pipe",
      });

      // Configure sparse checkout for knowledge folder only
      execSync("git sparse-checkout set knowledge", {
        cwd: `${KNOWLEDGE_DIR}-temp`,
        stdio: "pipe",
      });

      // Move knowledge folder to final location
      const sourcePath = path.join(`${KNOWLEDGE_DIR}-temp`, "knowledge");
      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, KNOWLEDGE_DIR);
      } else {
        // Fallback: copy entire repo if sparse checkout didn't work as expected
        fs.renameSync(`${KNOWLEDGE_DIR}-temp`, KNOWLEDGE_DIR);
      }

      // Clean up temp folder if it exists
      if (fs.existsSync(`${KNOWLEDGE_DIR}-temp`)) {
        fs.rmSync(`${KNOWLEDGE_DIR}-temp`, { recursive: true, force: true });
      }

      // Save version info
      saveVersionInfo();

      logger.info("Knowledge base downloaded successfully");
      return {
        success: true,
        path: KNOWLEDGE_DIR,
        message: "Knowledge base downloaded successfully",
        isNew: true,
      };
    } else {
      // Update existing knowledge
      logger.info("Updating knowledge base...");

      try {
        execSync(`git pull origin ${KNOWLEDGE_BRANCH}`, {
          cwd: KNOWLEDGE_DIR,
          stdio: "pipe",
        });

        saveVersionInfo();

        logger.info("Knowledge base updated successfully");
        return {
          success: true,
          path: KNOWLEDGE_DIR,
          message: "Knowledge base updated successfully",
          isNew: false,
        };
      } catch (pullError) {
        // If pull fails (not a git repo), just return existing path
        logger.warn("Could not update knowledge base (not a git repo or network issue)");
        return {
          success: true,
          path: KNOWLEDGE_DIR,
          message: "Using existing knowledge base (update skipped)",
          isNew: false,
        };
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to download knowledge base", { error: message });

    // If download fails but we have existing knowledge, use it
    if (fs.existsSync(KNOWLEDGE_DIR)) {
      return {
        success: true,
        path: KNOWLEDGE_DIR,
        message: `Using existing knowledge base (download failed: ${message})`,
        isNew: false,
      };
    }

    return {
      success: false,
      path: "",
      message: `Failed to download knowledge base: ${message}`,
      isNew: false,
    };
  }
}

/**
 * Update the knowledge base
 */
export function updateKnowledge(): DownloadResult {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    return downloadKnowledge();
  }

  try {
    execSync(`git fetch origin ${KNOWLEDGE_BRANCH}`, {
      cwd: KNOWLEDGE_DIR,
      stdio: "pipe",
    });

    execSync(`git reset --hard origin/${KNOWLEDGE_BRANCH}`, {
      cwd: KNOWLEDGE_DIR,
      stdio: "pipe",
    });

    saveVersionInfo();

    return {
      success: true,
      path: KNOWLEDGE_DIR,
      message: "Knowledge base updated successfully",
      isNew: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      path: KNOWLEDGE_DIR,
      message: `Failed to update: ${message}`,
      isNew: false,
    };
  }
}

/**
 * Get knowledge base info
 */
export function getKnowledgeInfo(): {
  path: string;
  exists: boolean;
  isGitRepo: boolean;
  lastUpdated: Date | null;
} {
  const exists = fs.existsSync(KNOWLEDGE_DIR);
  const isGitRepo = exists && fs.existsSync(path.join(KNOWLEDGE_DIR, ".git"));

  let lastUpdated: Date | null = null;
  if (fs.existsSync(VERSION_FILE)) {
    try {
      const content = fs.readFileSync(VERSION_FILE, "utf-8");
      const data = JSON.parse(content) as { updatedAt?: string };
      if (data.updatedAt) {
        lastUpdated = new Date(data.updatedAt);
      }
    } catch {
      // Ignore parse errors
    }
  }

  return {
    path: KNOWLEDGE_DIR,
    exists,
    isGitRepo,
    lastUpdated,
  };
}

function saveVersionInfo(): void {
  const versionInfo = {
    updatedAt: new Date().toISOString(),
    repo: KNOWLEDGE_REPO,
    branch: KNOWLEDGE_BRANCH,
  };

  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));
}
