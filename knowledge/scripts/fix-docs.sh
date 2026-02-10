#!/bin/bash
# fix-docs.sh
# Auto-fixes common markdown formatting issues in nucleus documentation
# Cross-platform compatible (Linux, macOS)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "NUCLEUS DOCUMENTATION AUTO-FIX"
echo "=========================================="
echo ""

FIXES=0

# Change to repo root
cd "$(git rev-parse --show-toplevel)"

# Fix function using Python for reliable cross-platform text processing
fix_markdown_formatting() {
    python3 << 'PYTHON_SCRIPT'
import os
import re
import sys

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Track if we're inside a code block to avoid breaking nested blocks
    lines = content.split('\n')
    fixed_lines = []
    in_code_block = False
    prev_was_blank = False
    prev_was_code_fence = False
    prev_was_list = False
    prev_was_table = False

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Detect code fence
        is_code_fence = stripped.startswith('```') or stripped.startswith('~~~')

        if is_code_fence and not in_code_block:
            in_code_block = True
            # Add blank line before code fence if needed
            if fixed_lines and not prev_was_blank and fixed_lines[-1].strip():
                fixed_lines.append('')
            fixed_lines.append(line)
            prev_was_code_fence = True
            prev_was_blank = False
            prev_was_list = False
            prev_was_table = False
        elif is_code_fence and in_code_block:
            in_code_block = False
            fixed_lines.append(line)
            # Add blank line after code fence if next line exists and isn't blank
            if i + 1 < len(lines) and lines[i + 1].strip():
                fixed_lines.append('')
                prev_was_blank = True
            else:
                prev_was_blank = False
            prev_was_code_fence = True
            prev_was_list = False
            prev_was_table = False
        elif in_code_block:
            # Inside code block - don't modify
            fixed_lines.append(line)
            prev_was_blank = False
            prev_was_code_fence = False
            prev_was_list = False
            prev_was_table = False
        else:
            # Outside code block - apply fixes

            # Check if this is a list item
            is_list = bool(re.match(r'^[\s]*[-*+][\s]', line) or re.match(r'^[\s]*\d+\.[\s]', line))

            # Check if this is a table row
            is_table = bool(re.match(r'^[\s]*\|', line))

            # Add blank line before list if coming from non-list, non-blank
            if is_list and not prev_was_list and not prev_was_blank and fixed_lines and fixed_lines[-1].strip():
                fixed_lines.append('')

            # Add blank line before table if coming from non-table, non-blank
            if is_table and not prev_was_table and not prev_was_blank and fixed_lines and fixed_lines[-1].strip():
                fixed_lines.append('')

            fixed_lines.append(line)

            # Add blank line after list ends
            if prev_was_list and not is_list and stripped and not prev_was_blank:
                # Insert blank line before current line
                fixed_lines.insert(-1, '')

            # Add blank line after table ends
            if prev_was_table and not is_table and stripped and not prev_was_blank:
                # Insert blank line before current line
                fixed_lines.insert(-1, '')

            prev_was_blank = not stripped
            prev_was_code_fence = False
            prev_was_list = is_list
            prev_was_table = is_table

        i += 1

    fixed_content = '\n'.join(fixed_lines)

    # Clean up multiple consecutive blank lines (max 2)
    fixed_content = re.sub(r'\n{3,}', '\n\n', fixed_content)

    # Ensure file ends with single newline
    fixed_content = fixed_content.rstrip() + '\n'

    if fixed_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        return True
    return False

# Find all markdown files
fixes = 0
for root, dirs, files in os.walk('.'):
    # Skip excluded directories
    dirs[:] = [d for d in dirs if d not in ['node_modules', '_drafts', '_scratch', '.git']]

    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(root, file)
            # Skip templates
            if '/templates/' in filepath:
                continue
            if fix_file(filepath):
                print(f"Fixed: {filepath}")
                fixes += 1

print(f"\n{fixes} file(s) fixed")
sys.exit(0 if fixes == 0 else 0)  # Always exit 0, fixes are not errors
PYTHON_SCRIPT
}

echo "1. Fixing markdown formatting..."
echo "─────────────────────────────────"
fix_markdown_formatting
echo ""

# 2. Run markdownlint with --fix flag if available
echo "2. Running markdownlint auto-fix..."
echo "───────────────────────────────────"
if command -v markdownlint-cli2 &> /dev/null; then
    # markdownlint-cli2 doesn't have --fix, try markdownlint
    if command -v markdownlint &> /dev/null; then
        markdownlint --fix "**/*.md" --ignore node_modules --ignore templates --ignore _drafts --ignore _scratch 2>/dev/null || true
        echo -e "${GREEN}✅ markdownlint auto-fix complete${NC}"
    else
        echo -e "${YELLOW}⚠️  markdownlint (with --fix) not available. Install with: npm install -g markdownlint-cli${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  markdownlint-cli2 not installed${NC}"
fi
echo ""

# 3. Verify with validation
echo "3. Verifying fixes..."
echo "─────────────────────"
if ./scripts/validate-docs.sh; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "ALL FIXES APPLIED SUCCESSFULLY"
    echo "==========================================${NC}"
else
    echo ""
    echo -e "${YELLOW}=========================================="
    echo "SOME ISSUES REMAIN - MANUAL FIX NEEDED"
    echo "==========================================${NC}"
fi
