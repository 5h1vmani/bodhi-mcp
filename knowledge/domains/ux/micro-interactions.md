---
domain: ux
topic: micro-interactions
tags: [animation, feedback, interactions, motion, delight]
complexity: intermediate
last_updated: 2025-01-24
---

# Micro-interactions & Motion

> Patterns for adding polish, feedback, and delight through subtle animations.

## TL;DR

- Every interactive element needs **7 states**: default, hover, focus, active, loading, success, disabled
- Use **spring animations** for natural feeling (not linear)
- Keep animations **under 300ms** for responsiveness
- **Success celebrations** (confetti, checkmarks) increase perceived value
- Respect **prefers-reduced-motion** for accessibility

## Decision Guide

| Need                    | Duration   | Easing          | Example                           |
| ----------------------- | ---------- | --------------- | --------------------------------- |
| Button press feedback   | 100-150ms  | ease-out        | Active state, toggle              |
| UI state transitions    | 200-300ms  | ease-out        | Modal open, accordion, card hover |
| Success emphasis        | 300-500ms  | spring/ease-out | Checkmark animation, confetti     |
| Number count-up (stats) | 1.5-2s     | ease-out        | Dashboard metrics                 |
| Number count-up (price) | 2-3s       | ease-out        | Pricing reveals                   |
| High-value celebration  | 2-3s       | ease-out        | Purchase complete, level up       |
| Staggered list items    | 50ms       | delay per item  | Search results, feeds             |
| Page transitions        | 500-1000ms | ease-in-out     | Route changes, reveals            |

## Button States

Every interactive button needs these states:

| State    | Trigger        | Visual Change         |
| -------- | -------------- | --------------------- |
| Default  | Rest           | Base appearance       |
| Hover    | Mouse over     | Slight lift, brighter |
| Focus    | Keyboard focus | Visible focus ring    |
| Active   | Being pressed  | Scale down slightly   |
| Loading  | Processing     | Spinner, disabled     |
| Success  | Completed      | Checkmark, green      |
| Disabled | Not available  | Dimmed, no pointer    |

**Flow**: Default → Hover → Active → Loading → Success (all can return to default)

### Essential Implementation

```css
.button {
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.button:hover {
  transform: translateY(-2px);
}
.button:active {
  transform: scale(0.98);
}
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Animation Timing Values

### Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1); /* Most UI */
--ease-in-out: cubic-bezier(0.76, 0, 0.24, 1); /* Symmetric */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
```

**Usage**: ease-out for most UI, ease-in-out for symmetric transforms, spring for playful interactions, linear only for progress bars.

## Form Feedback

### Error Shake Animation

```css
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  50% {
    transform: translateX(8px);
  }
  75% {
    transform: translateX(-8px);
  }
}
.input-error {
  animation: shake 0.4s ease-out;
}
```

### Success Checkmark

- Circle stroke draws first (0.5s)
- Check stroke draws second (0.3s delay)
- Optional: scale bounce (0.2s)

Use `stroke-dasharray` and `stroke-dashoffset` animation on SVG paths.

## Success Celebrations

### When to Use

- **Checkmark**: Standard confirmations, form submissions
- **Confetti**: Purchase complete, account created, goal achieved, level up
- **Count-up**: Stats reveal, pricing, progress metrics

### Confetti Guidelines

- 150-200 pieces
- 2-3 second duration
- One burst only (don't recycle)
- Low gravity for gentle fall

## Card & List Patterns

### Hover Lift

```css
.card {
  transition:
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

### Staggered Entry

Apply 50ms delay per item using `:nth-child()` with `animation-delay`. Use `fadeInUp` with `translateY(16px)` start.

### Skeleton to Content

Fade in content over 200ms ease-out when replacing skeleton screens.

## Modal Animations

- **Backdrop**: Fade in (200ms)
- **Content**: Scale in from 0.95 (200ms ease-out)
- **Bottom Sheet**: Slide up from 100% translateY (300ms ease-out)

## Loading States

### Spinner

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.spinner {
  animation: spin 1s linear infinite;
}
```

### Skeleton Pulse

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.skeleton {
  animation: pulse 2s ease-in-out infinite;
}
```

### Button Loading Pattern

`[ Submit ] → [ ○ Processing... ] → [ ✓ Done! ]`

## Accessibility

### Reduced Motion (Required)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Alternative Feedback

When animations are disabled, use:

- Outline changes instead of transforms
- Opacity changes instead of motion
- Instant state changes instead of transitions

## Common Mistakes

| Mistake                                     | Fix                                        |
| ------------------------------------------- | ------------------------------------------ |
| Linear easing for UI                        | Use ease-out for natural feeling           |
| Animations over 300ms                       | Keep micro-interactions fast (150-200ms)   |
| No loading state on buttons                 | Show spinner immediately on click          |
| Ignoring prefers-reduced-motion             | Always provide reduced-motion fallback     |
| Animating layout properties (width, height) | Use transform and opacity for performance  |
| Same animation timing for all list items    | Stagger entry animations (50ms delay each) |
| Missing focus states                        | Always provide visible focus ring          |

## Checklist

Before shipping animations:

- [ ] All buttons have 7 states defined
- [ ] Animations under 300ms for interactions
- [ ] Using ease-out or spring, not linear
- [ ] Loading states for async actions
- [ ] Success feedback for completions
- [ ] prefers-reduced-motion respected
- [ ] Only animating transform/opacity
- [ ] Focus states visible for keyboard users
- [ ] Tested on lower-end devices

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2025-01-24 | Initial version |
