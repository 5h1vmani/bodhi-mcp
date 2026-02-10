---
domain: meta
topic: observe-before-editing
tags: [principle, code-reading, context, ai-workflow, best-practice]
complexity: beginner
last_updated: 2025-01-24
related:
  - contributing.md
  - ../domains/architecture/handoffs.md
---

# Observe Before Editing

> The principle of thoroughly understanding code before modifying it.

## TL;DR

- Read and understand code before changing it
- Check for existing patterns, conventions, and related code
- Understand the WHY, not just the WHAT
- This applies to both humans and AI agents

## Context

The urge to dive into code and start fixing is strong. But modifications without understanding create bugs, break conventions, duplicate existing solutions, and increase technical debt. "Observe before editing" is a discipline that improves code quality and reduces rework.

For AI agents, this is especially important: agents often have limited context and may not see the full picture. Taking time to observe prevents confident-sounding but incorrect changes.

## The Principle

### Before You Edit, Ask

1. **What does this code do?** - Understand its purpose
2. **Why is it written this way?** - There may be reasons not obvious from the code
3. **What depends on this?** - Changing it may break other things
4. **Are there similar patterns elsewhere?** - Follow existing conventions
5. **What's the history?** - Git blame reveals context

## Observation Checklist

### 1. Read the Immediate Context

Before editing a function/method:

```
[ ] Read the entire function, not just the line to change
[ ] Read the file's imports - what dependencies exist?
[ ] Read adjacent functions - are there related helpers?
[ ] Read the class/module - understand the overall structure
```

### 2. Check for Patterns

Before adding new code:

```
[ ] Search for similar functionality - does it already exist?
[ ] Check how similar things are done elsewhere
[ ] Look at naming conventions used in the codebase
[ ] Check for utility functions you could reuse
```

**Do:**

```bash
# Before adding a date formatting function
grep -rn "formatDate\|dateFormat\|toISOString" src/

# Before adding an API call pattern
grep -rn "fetch\|axios\|apiClient" src/
```

### 3. Understand Dependencies

Before modifying interfaces or APIs:

```
[ ] Find all callers of this function/endpoint
[ ] Check for tests that depend on current behavior
[ ] Look for documentation that references this code
[ ] Check if it's exported/public - changes affect others
```

**Do:**

```bash
# Find all usages of a function
grep -rn "functionName" src/ test/

# Find all imports of a module
grep -rn "from './module'\|require('./module')" src/
```

### 4. Read the History

Before making changes to unfamiliar code:

```
[ ] git blame - who wrote this and when?
[ ] git log -p -- filename - what changes were made?
[ ] Look for linked issues/PRs - why was it done this way?
[ ] Check for ADRs or documentation explaining decisions
```

**Do:**

```bash
# See who wrote each line and when
git blame src/auth/jwt.ts

# See recent changes to the file
git log --oneline -10 -- src/auth/jwt.ts

# See the actual changes
git log -p -3 -- src/auth/jwt.ts
```

### 5. Run the Code

Before modifying behavior:

```
[ ] Run existing tests - understand expected behavior
[ ] Run the code manually - see how it actually works
[ ] Check error cases - how does it fail?
[ ] Review logs/output - what does it produce?
```

## For AI Agents

AI agents should explicitly observe before editing:

### Recommended Agent Workflow

```
1. User requests a change to file X

2. OBSERVE PHASE (do this first):
   - Read the entire file, not just the relevant section
   - Search for related files (tests, types, related modules)
   - Check for patterns in similar code
   - Look at recent git history if available

3. UNDERSTAND PHASE:
   - Summarize what the code does
   - Identify dependencies and callers
   - Note any patterns or conventions

4. PROPOSE PHASE:
   - Explain the planned change
   - Note how it fits with existing patterns
   - Identify potential impacts

5. EDIT PHASE:
   - Make minimal, focused changes
   - Follow observed patterns
   - Preserve existing conventions
```

### What Agents Should Read Before Editing

| Editing...       | First Read...                              |
| ---------------- | ------------------------------------------ |
| A function       | The entire file, related tests             |
| An API endpoint  | Other endpoints in same router, middleware |
| A component      | Parent component, similar components       |
| A database query | Schema, other queries on same table        |
| A configuration  | Other config files, environment setup      |
| A test           | The code being tested, other tests         |

### Signs an Agent Didn't Observe

- Suggests code that duplicates existing utilities
- Uses different naming conventions than the codebase
- Breaks callers of the modified code
- Misses related changes needed in other files
- Changes behavior that tests depend on

## Common Mistakes

1. **Mistake:** Editing the first matching line found

   **Fix:** Read the full context - there may be multiple places or a better location

2. **Mistake:** Adding a new utility when one exists

   **Fix:** Search for similar functionality before creating new code

3. **Mistake:** Changing behavior without checking callers

   **Fix:** Find all usages and verify the change is safe

4. **Mistake:** Ignoring existing patterns

   **Fix:** Match the conventions used in surrounding code

5. **Mistake:** Not reading tests before changing code

   **Fix:** Tests document expected behavior - read them first

## Examples

### Example 1: Good Observation

**Task:** Add email validation to user registration

**Observation process:**

```
1. Read src/routes/auth.ts - find registration endpoint
2. Search "email" in codebase - find existing validation
   → Found: src/utils/validators.ts has isValidEmail()
3. Check how other fields are validated in registration
   → Uses Zod schema in src/schemas/user.ts
4. Check tests in tests/auth.test.ts
   → Existing tests validate error responses
```

**Result:** Add email validation using existing `isValidEmail()` in the Zod schema, matching the pattern already used. No duplicate code created.

### Example 2: Poor Observation (Anti-pattern)

**Task:** Add email validation to user registration

**What went wrong:**

```
1. Opened src/routes/auth.ts
2. Added inline regex for email validation
3. Didn't check for existing validators
4. Didn't follow the Zod schema pattern
5. Created duplicate validation logic
```

**Result:** Duplicate code, inconsistent patterns, harder to maintain.

## Checklist

Before editing any code:

- [ ] Read the entire file/function being modified
- [ ] Search for existing patterns and utilities
- [ ] Check for callers and dependencies
- [ ] Review tests for expected behavior
- [ ] Understand why code is written the way it is
- [ ] Check git history for context if unclear
- [ ] Identify all files that may need related changes

## Related Documentation

- [Contributing to Nucleus](./contributing.md) - How to contribute properly
- [Session Handoffs](../domains/architecture/handoffs.md) - Capturing context for future sessions

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2025-01-24 | Initial version |
