#!/bin/bash
# validate-docs.sh
# Validates nucleus documentation structure and content
# Cross-platform compatible (Linux, macOS)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helper function for cross-platform path normalization
normalize_path() {
    local dir="$1"
    local link="$2"
    # Use python for cross-platform path resolution (available on both Linux and macOS)
    python3 -c "import os; print(os.path.normpath(os.path.join('$dir', '$link')))" 2>/dev/null || echo "$dir/$link"
}

echo "=========================================="
echo "NUCLEUS DOCUMENTATION VALIDATION"
echo "=========================================="
echo ""

ERRORS=0

# 1. Check frontmatter on best practice docs
echo "1. Checking frontmatter in domains/**/*.md..."
echo "----------------------------------------------"
FRONTMATTER_ERRORS=0
while IFS= read -r -d '' file; do
    # Skip _index.md files
    if [[ "$file" == *"_index.md" ]]; then
        continue
    fi

    if ! head -1 "$file" | grep -q "^---$"; then
        echo -e "${RED}❌ Missing frontmatter: $file${NC}"
        FRONTMATTER_ERRORS=$((FRONTMATTER_ERRORS + 1))
        ERRORS=$((ERRORS + 1))
    fi
done < <(find domains -name "*.md" -type f -print0)

if [ $FRONTMATTER_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All best practice docs have frontmatter${NC}"
fi
echo ""

# 2. Check for TL;DR sections
echo "2. Checking for TL;DR sections..."
echo "----------------------------------"
TLDR_ERRORS=0
while IFS= read -r -d '' file; do
    if [[ "$file" == *"_index.md" ]]; then
        continue
    fi

    if ! grep -q "^## TL;DR" "$file"; then
        echo -e "${YELLOW}⚠️  Missing TL;DR: $file${NC}"
        TLDR_ERRORS=$((TLDR_ERRORS + 1))
    fi
done < <(find domains -name "*.md" -type f -print0)

if [ $TLDR_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All best practice docs have TL;DR sections${NC}"
else
    echo -e "${YELLOW}   ($TLDR_ERRORS docs missing TL;DR - consider adding)${NC}"
fi
echo ""

# 3. Check for broken internal links (excluding templates/)
echo "3. Checking for broken internal links..."
echo "-----------------------------------------"
LINK_ERRORS=0

# Function to extract links outside of code blocks using Python
extract_links_outside_codeblocks() {
    python3 << 'PYTHON_SCRIPT' "$1"
import sys
import re

filepath = sys.argv[1]
with open(filepath, 'r') as f:
    content = f.read()

# Remove fenced code blocks (``` ... ```)
content_no_code = re.sub(r'```[\s\S]*?```', '', content)

# Remove inline code (`...`)
content_no_code = re.sub(r'`[^`]+`', '', content_no_code)

# Find relative links: [text](./path) or [text](../path)
links = re.findall(r'\]\((\.\.?/[^)]+)\)', content_no_code)
for link in links:
    print(link)
PYTHON_SCRIPT
}

while IFS= read -r -d '' file; do
    # Extract relative links outside of code blocks
    links=$(extract_links_outside_codeblocks "$file" 2>/dev/null || true)

    for link in $links; do
        # Remove anchor fragments for file existence check
        link_without_anchor="${link%%#*}"

        # Get directory of current file
        dir=$(dirname "$file")
        target=$(normalize_path "$dir" "$link_without_anchor")

        if [ ! -e "$target" ]; then
            echo -e "${RED}❌ Broken link in $file: $link${NC}"
            LINK_ERRORS=$((LINK_ERRORS + 1))
            ERRORS=$((ERRORS + 1))
        fi
    done
done < <(find . -name "*.md" -type f -not -path "./templates/*" -print0)

if [ $LINK_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ No broken internal links found${NC}"
fi
echo ""

# 4. Check required files exist
echo "4. Checking required files..."
echo "-----------------------------"
REQUIRED_FILES=(
    "CLAUDE.md"
    "INDEX.md"
    "templates/best-practice.md"
    "templates/project-doc.md"
    "templates/adr.md"
    "meta/contributing.md"
    "meta/style-guide.md"
)

REQUIRED_ERRORS=0
for required in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$required" ]; then
        echo -e "${RED}❌ Missing required file: $required${NC}"
        REQUIRED_ERRORS=$((REQUIRED_ERRORS + 1))
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $REQUIRED_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All required files present${NC}"
fi
echo ""

# 5. Check domain index files
echo "5. Checking domain _index.md files..."
echo "--------------------------------------"
INDEX_ERRORS=0
for domain in domains/*/; do
    if [ ! -f "${domain}_index.md" ]; then
        echo -e "${RED}❌ Missing _index.md in $domain${NC}"
        INDEX_ERRORS=$((INDEX_ERRORS + 1))
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $INDEX_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All domains have _index.md${NC}"
fi
echo ""

# 6. Check file naming convention (kebab-case)
echo "6. Checking file naming convention (kebab-case)..."
echo "---------------------------------------------------"
NAMING_ERRORS=0

# Pattern: lowercase letters, numbers, hyphens only (plus .md extension)
# Exceptions: CLAUDE.md, INDEX.md, _index.md
while IFS= read -r -d '' file; do
    filename=$(basename "$file")

    # Skip allowed exceptions
    if [[ "$filename" == "CLAUDE.md" ]] || [[ "$filename" == "INDEX.md" ]] || [[ "$filename" == "_index.md" ]] || [[ "$filename" == "README.md" ]]; then
        continue
    fi

    # Check if filename matches kebab-case pattern
    if ! echo "$filename" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*\.md$'; then
        echo -e "${RED}❌ Invalid filename (not kebab-case): $file${NC}"
        NAMING_ERRORS=$((NAMING_ERRORS + 1))
        ERRORS=$((ERRORS + 1))
    fi
done < <(find . -name "*.md" -type f -not -path "./node_modules/*" -print0)

if [ $NAMING_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All files follow kebab-case naming${NC}"
fi
echo ""

# Summary
echo "=========================================="
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}VALIDATION FAILED: $ERRORS error(s) found${NC}"
    exit 1
else
    echo -e "${GREEN}VALIDATION PASSED${NC}"
fi
echo "=========================================="
