#!/bin/bash
# Setup git hooks for nucleus
# Note: Running `npm install` does this automatically via the "prepare" script.
# This script is a fallback for environments without npm.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

REPO_ROOT="$(git rev-parse --show-toplevel)"

# Check if we're in a git repo
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Configure git to use hooks directory
git config core.hooksPath ./hooks

echo -e "${GREEN}✅ Git hooks configured${NC}"
echo ""
echo "Hooks will run automatically on:"
echo "  - pre-commit: Validates staged .md files"
echo "  - commit-msg: Validates conventional commit format"
echo "  - pre-push: Full validation of all docs"
echo ""
echo "To skip hooks temporarily, use --no-verify flag"
