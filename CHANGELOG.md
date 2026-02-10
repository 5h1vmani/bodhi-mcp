# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
