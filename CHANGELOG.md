# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-02-10

### Added

- `diagnose()` tool - Health check and debugging information for troubleshooting setup issues
- In-memory caching for playbooks - Faster subsequent tool calls within a session
- Structured logging with configurable log levels (`BODHI_LOG_LEVEL` env var: debug, info, warn, error, silent)
- Auto-download knowledge base on first run (falls back to bundled if network unavailable)
- GitHub Actions CI workflow - Automated testing on Node 18, 20, 22
- Code coverage reporting with `npm run test:coverage`
- Input validation for all tool parameters with helpful error messages
- Graceful error handling with detailed error messages

### Changed

- Improved error messages for unknown tools (now lists available tools)
- Better logging format with timestamps and log levels

### Technical Details

- Added `logger.ts` utility for structured logging
- Added `cache.ts` for in-memory playbook caching
- Added `downloader.ts` for auto-fetching knowledge base
- Added `diagnose.ts` tool implementation

## [0.1.0] - 2026-02-10

### Added

- Initial release
- `route(task)` tool - Find the best playbook for a given task using INDEX.md routing table
- `search(query, domain?, limit?)` tool - Full-text search across all playbooks using MiniSearch
- `list(domain?, complexity?, limit?)` tool - List available playbooks with metadata
- `read(path, section?)` tool - Read specific playbook content
- `summary()` tool - Get knowledge base statistics
- Support for custom knowledge base paths via CLI argument or environment variable
- Markdown frontmatter parsing with gray-matter
- TypeScript implementation with strict mode
- ESLint and Prettier configuration
- Vitest test setup

### Technical Details

- Uses `@modelcontextprotocol/sdk` for MCP server implementation
- Uses `minisearch` for full-text search indexing
- Uses `gray-matter` for frontmatter parsing
- Supports stdio transport for MCP client integration
