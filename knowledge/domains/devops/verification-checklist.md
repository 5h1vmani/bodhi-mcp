---
domain: devops
topic: verification-checklist
tags: [quality, checklist, pr-review, ci-cd, verification]
complexity: beginner
last_updated: 2025-01-24
related:
  - ../testing/strategy.md
  - ../security/pre-commit-checklist.md
---

# Verification Checklist

> A 6-phase quality gate to run before submitting code for review or deployment.

## TL;DR

- Run all 6 phases in order: Build → Types → Lint → Test → Security → Diff
- All phases must pass before code is PR-ready
- Catches issues early, before they reach reviewers or production

## Context

Running a verification loop locally before pushing saves time, reduces CI failures, and shows respect for reviewers' time. This checklist provides a systematic approach to self-verification.

## The 6-Phase Verification Loop

### Phase 1: Build Verification

```bash
# JavaScript/TypeScript
npm run build

# Python
poetry build

# Go
go build ./...

# Rust
cargo build
```

**Pass criteria:** Exit code 0, no compilation errors

---

### Phase 2: Type Check

```bash
# TypeScript
npx tsc --noEmit

# Python
mypy src/
```

**Pass criteria:** No type errors. Type errors often reveal real bugs.

---

### Phase 3: Lint Check

```bash
# JavaScript/TypeScript
npm run lint

# Python
ruff check .

# Go
golangci-lint run
```

**Pass criteria:** No errors. Run auto-fix if available (`--fix` flag), then manually fix remaining issues.

---

### Phase 4: Test Suite

```bash
# JavaScript/TypeScript
npm test -- --coverage

# Python
pytest --cov=src --cov-report=term-missing

# Go
go test -cover ./...
```

**Pass criteria:** All tests pass, coverage ≥ 80% (or project-defined threshold)

**Action on failure:** Fix implementation, not tests (unless tests are wrong). Add tests for uncovered paths.

---

### Phase 5: Security Scan

```bash
# Check for hardcoded secrets
grep -r "API_KEY\|SECRET\|PASSWORD\|TOKEN" src/ --include="*.ts" --include="*.js" --include="*.py"

# Check for debug statements
grep -r "console\.log\|print(\|debugger" src/ --include="*.ts" --include="*.js" --include="*.py"

# Dedicated tools
npx secretlint "**/*"
gitleaks detect --source .
```

**Pass criteria:** No hardcoded secrets, debug statements, or obvious vulnerabilities

---

### Phase 6: Diff Review

```bash
git diff --stat
git diff
git status
```

**Review checklist:**

- [ ] Only intended files modified
- [ ] No accidental formatting changes to unrelated code
- [ ] No commented-out code
- [ ] Error handling present for new code paths
- [ ] No TODO/FIXME without ticket references

**Pass criteria:** You would approve this PR if someone else submitted it

---

## Verification Report Format

```markdown
| Phase    | Status  | Notes                   |
| -------- | ------- | ----------------------- |
| Build    | ✅ Pass |                         |
| Types    | ✅ Pass |                         |
| Lint     | ✅ Pass | 2 warnings (acceptable) |
| Tests    | ✅ Pass | 94% coverage            |
| Security | ✅ Pass |                         |
| Diff     | ✅ Pass | 3 files changed         |

**PR Ready:** Yes
```

## When to Run Verification

| Checkpoint                  | Run Phases               |
| --------------------------- | ------------------------ |
| After completing a function | 1-3 (Build, Types, Lint) |
| After completing a feature  | 1-5 (All except Diff)    |
| Before committing           | 1-6 (Full loop)          |
| Before pushing              | 1-6 (Full loop)          |
| Before creating PR          | 1-6 (Full loop)          |

## Common Mistakes

| Mistake                                 | Fix                                                                   |
| --------------------------------------- | --------------------------------------------------------------------- |
| Skipping phases to save time            | Run all phases. Skipping creates technical debt that costs more later |
| Ignoring warnings                       | Treat warnings seriously. They often become errors or indicate issues |
| Running only in CI, not locally         | Run locally first. CI failures waste time and context switches        |
| Not reviewing diff before commit        | Always `git diff` before commit. Catches unintended changes           |
| Pushing code that "works on my machine" | Ensure build and tests pass in clean environment                      |

## Checklist

Before marking code as ready for review:

- [ ] Build passes (Phase 1)
- [ ] Type check passes (Phase 2)
- [ ] Lint check passes (Phase 3)
- [ ] All tests pass with adequate coverage (Phase 4)
- [ ] No secrets or debug statements (Phase 5)
- [ ] Diff reviewed, only intended changes (Phase 6)

## Related Documentation

- [Testing Strategy](../testing/strategy.md) - What and how to test
- [Security Pre-commit Checklist](../security/pre-commit-checklist.md) - Detailed security checks

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2025-01-24 | Initial version |
