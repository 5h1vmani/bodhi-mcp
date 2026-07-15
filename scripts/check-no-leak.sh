#!/usr/bin/env bash
#
# Pre-publish leak gate.
#
# Fails if any private identifier appears anywhere in the publishable surface
# (the files that ship to npm plus the repo's own docs). Deterministic, free,
# and the single source of truth for "is this safe to publish".
#
# Runs in CI and in the npm `prepublishOnly` hook. Never publish on a red gate.

set -uo pipefail
cd "$(dirname "$0")/.."

# Publishable surface. This script lives in scripts/ and is intentionally
# excluded so its own denylist terms do not trip the gate.
SCAN=(knowledge src dist README.md package.json CHANGELOG.md)

status=0
fail() {
  echo "LEAK GATE FAILED: $1"
  echo "$2"
  echo ""
  status=1
}

# 1. Private knowledge-base name. Allow the anatomical "nucleus accumbens".
hits=$(grep -rin "nucleus" "${SCAN[@]}" 2>/dev/null | grep -vi "nucleus accumbens")
[ -n "$hits" ] && fail "'nucleus' reference found" "$hits"

# 2. Product name (covers pinaka_landing, tenant_mypinaka, pinaka_route).
hits=$(grep -rin "pinaka" "${SCAN[@]}" 2>/dev/null)
[ -n "$hits" ] && fail "'pinaka' reference found" "$hits"

# 3. Absolute local filesystem paths. Case-sensitive: macOS home is capital
# "/Users/"; lowercase "/users/" is a legitimate REST API path in the docs.
hits=$(grep -rn "/Users/" "${SCAN[@]}" 2>/dev/null)
[ -n "$hits" ] && fail "local '/Users/' path found" "$hits"

# 4. Private domains that must never ship (they live only in the private source).
if [ -d knowledge/domains/edtech ]; then
  fail "private 'edtech' domain present" "$(find knowledge/domains/edtech -type f | sort)"
fi

if [ "$status" -eq 0 ]; then
  echo "Leak gate passed: no private identifiers in the publishable surface."
fi
exit "$status"
