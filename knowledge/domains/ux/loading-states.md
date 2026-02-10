---
domain: ux
topic: loading-states
tags: [loading, skeleton, progress, feedback, perceived-performance]
complexity: intermediate
last_updated: 2025-01-24
---

# Loading States & Perceived Performance

> Techniques to manage user perception during wait times and async operations.

## TL;DR

- Use **skeleton screens** for known content structure (pages, cards, tables)
- Use **spinners** for unknown content or short waits (<1s)
- Use **labor illusion** (3-5s artificial delay with steps) for high-value operations
- **400ms rule**: acknowledge user action within 400ms or they assume it failed
- Progress bars that **accelerate near the end** reduce perceived wait time

## Decision Guide

| Scenario                  | Duration | Pattern                          | Why                                  |
| ------------------------- | -------- | -------------------------------- | ------------------------------------ |
| Button click/interaction  | <400ms   | Button state change              | Acknowledge action before completion |
| Quick background task     | <1s      | Spinner or button loading state  | Simple, unobtrusive                  |
| Page/content load         | 1-3s     | Skeleton screen                  | Shows expected structure             |
| File upload/download      | 1-10s    | Determinate progress bar         | User needs completion estimate       |
| Multi-step process        | 3-10s    | Progress steps with checkmarks   | Shows progress through workflow      |
| High-value operation      | 3-5s     | Labor illusion with steps        | Builds trust and perceived value     |
| Long background operation | 10s+     | Toast notification or background | Don't block UI for long tasks        |
| Security/payment          | 1.5-3s   | Steps with intentional delay     | Instant feels suspicious             |

## The 400ms Rule

When someone clicks, their visual system expects change. If nothing happens within **400 milliseconds**, the brain assumes it didn't work.

**Rule:** You don't need to complete the task—just acknowledge you heard them.

## Response Time Thresholds

| Time | User Perception | Design Response                         |
| ---- | --------------- | --------------------------------------- |
| 0.1s | Instantaneous   | Direct manipulation, no feedback needed |
| 1.0s | Flow maintained | Simple feedback (button state change)   |
| 10s  | Attention limit | Progress indicator required             |

## Skeleton Screens

### When to Use

| Use Skeleton            | Use Spinner           |
| ----------------------- | --------------------- |
| Full page load          | Background operation  |
| Known content structure | Unknown content shape |
| Data tables             | Very short wait (<1s) |
| Card layouts            | Modal loading         |

### Design Rules

**Do:**

- Match structure of final content
- Use subtle animation (shimmer or pulse)
- Size skeletons to actual content dimensions
- Include all major content blocks

**Don't:**

- Use minimal skeletons (just header)
- Create overly complex animations
- Use for content under 1s load time
- Make animation too fast/distracting

### Pulse Animation (Simple)

```css
.skeleton {
  background: var(--color-muted);
  border-radius: 4px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Shimmer Animation (Premium)

```css
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-muted) 0%,
    var(--color-muted-foreground) 50%,
    var(--color-muted) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

## Labor Illusion

The **labor illusion** is a psychological phenomenon where users perceive products as more valuable when they believe effort has been invested.

### When to Use

| Good Use Cases             | Bad Use Cases       |
| -------------------------- | ------------------- |
| Payment processing         | Simple navigation   |
| Searching multiple sources | Toggle switches     |
| Complex calculations       | Autocomplete        |
| Security operations        | Repeat interactions |
| AI-generated content       | Basic CRUD          |

### Optimal Timing

- **3-5 seconds**: Sweet spot for most applications
- **Up to 15 seconds**: Acceptable for high-value operations
- **Up to 30 seconds**: Only for aggregation (e.g., travel search)

### Implementation Pattern

Show sequential steps with variable timing (feels more authentic):

```
Processing payment...
├── ✓ Verifying details...        (0.8s)
├── ✓ Validating payment...       (1.2s)
├── ● Securing enrollment...      (0.6s)  ← current
└── ○ Preparing dashboard...      (1.0s)
```

**Key principles:**

- Variable timing per step (not uniform)
- Show completed steps with checkmarks
- Current step shows spinner
- Future steps dimmed

### When Delays Build Trust

| Operation            | Recommended Delay | Why                      |
| -------------------- | ----------------- | ------------------------ |
| Loan/credit check    | 2-3s              | Instant feels suspicious |
| Payment verification | 1.5-2s            | Security perception      |
| Search aggregation   | 2-4s              | "Checking many sources"  |
| AI generation        | 1-3s              | "Processing complexity"  |

## Progress Indicators

### Accelerating Progress Bar

Progress bars that accelerate near the end reduce perceived wait time.

```css
@keyframes accelerating-progress {
  0% {
    width: 0%;
  }
  50% {
    width: 30%;
  }
  80% {
    width: 60%;
  }
  95% {
    width: 90%;
  }
  100% {
    width: 100%;
  }
}

.progress-bar {
  animation: accelerating-progress 3s ease-in forwards;
}
```

### Determinate vs Indeterminate

| Determinate (%)    | Indeterminate (spinner) |
| ------------------ | ----------------------- |
| File uploads       | Unknown duration        |
| Multi-step wizards | API calls               |
| Downloads          | Authentication          |

## Common Mistakes

| Mistake                                  | Fix                                                   |
| ---------------------------------------- | ----------------------------------------------------- |
| No feedback on button click              | Immediately show loading state (spinner in button)    |
| Generic "Loading..." text                | Describe what's loading ("Loading your dashboard...") |
| Same skeleton for all content            | Match skeleton to actual content structure            |
| Instant response for security operations | Add 1.5-2s delay with progress steps                  |
| Blocking UI during background operations | Use optimistic updates or toast notifications         |

## Checklist

Before shipping loading states:

- [ ] Button shows immediate feedback on click (<400ms)
- [ ] Skeleton matches actual content structure
- [ ] Long operations (>3s) show progress steps
- [ ] Error states are handled gracefully
- [ ] Loading states are accessible (aria-busy, aria-live)

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2025-01-24 | Initial version |
