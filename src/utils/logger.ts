/**
 * Logging utility with configurable levels
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

let currentLevel: LogLevel =
  (process.env.BODHI_LOG_LEVEL as LogLevel) || "info";

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[Bodhi][${level.toUpperCase()}][${timestamp}]`;
  if (data !== undefined) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  debug(message: string, data?: unknown): void {
    if (shouldLog("debug")) {
      console.error(formatMessage("debug", message, data));
    }
  },

  info(message: string, data?: unknown): void {
    if (shouldLog("info")) {
      console.error(formatMessage("info", message, data));
    }
  },

  warn(message: string, data?: unknown): void {
    if (shouldLog("warn")) {
      console.error(formatMessage("warn", message, data));
    }
  },

  error(message: string, data?: unknown): void {
    if (shouldLog("error")) {
      console.error(formatMessage("error", message, data));
    }
  },
};

export default logger;
