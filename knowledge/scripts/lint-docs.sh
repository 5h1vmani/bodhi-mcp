#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📝 Linting nucleus documentation...${NC}"

# Check if markdownlint-cli2 is installed
if ! command -v markdownlint-cli2 &> /dev/null; then
    echo -e "${YELLOW}Installing markdownlint-cli2...${NC}"
    npm install -g markdownlint-cli2
fi

# Step 1: Auto-fix markdown issues
# Uses .markdownlint-cli2.jsonc for globs and ignore patterns
echo -e "${YELLOW}🔧 Auto-fixing markdown issues...${NC}"
markdownlint-cli2 --fix || true

# Step 2: Stage any auto-fixed files
if ! git diff --quiet -- "*.md" 2>/dev/null; then
    echo -e "${GREEN}✅ Auto-fixed some issues. Staging changes...${NC}"
    git add -u "*.md"
fi

# Step 3: Validate (will fail if unfixable issues remain)
echo -e "${YELLOW}🔍 Validating markdown...${NC}"
if ! markdownlint-cli2; then
    echo -e "${RED}❌ Markdown validation failed. Please fix the issues above.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All documentation checks passed!${NC}"
