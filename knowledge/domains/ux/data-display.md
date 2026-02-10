---
domain: ux
topic: data-display
tags: [dashboard, data-visualization, typography, cognitive-load, metrics]
complexity: intermediate
last_updated: 2025-01-24
---

# Data Display & Dashboard Design

> Patterns for displaying metrics, dashboards, and data-dense interfaces.

## TL;DR

- **Target 4 primary metrics per view; max 7** (Cowan 2001: working memory ~4 items; Miller 1956: 7±2 for grouped items)
- **Visual elements (charts, cards, widgets) can reach 9** -- but primary KPI metrics stay ≤7
- Primary metrics: **24-28px** max (larger overwhelms)
- Body text: **16px recommended**; secondary: 14px; labels: 11px minimum (Apple HIG, Google M3, Anthropic all ship 11px for captions; WCAG has no minimum font size -- only requires 200% resize support)
- Use **tabular-nums** for all numeric data
- Max **2-3 font weights** to reduce visual complexity

## Cognitive Load Principles

The brain can only handle 4-7 pieces of information at a time (Sweller, 1980s). Extra details like unnecessary gridlines, too many colors, or dense text overwhelm viewers.

### Dashboard Limits

| Guideline                       | Limit           | Rationale                                                |
| ------------------------------- | --------------- | -------------------------------------------------------- |
| Primary KPI metrics             | Target 4, max 7 | Cowan (2001): working memory ~4 items                    |
| Visual elements (charts, cards) | Up to 9         | Charts/cards group related info into single visual units |
| Colors                          | 4 accent max    | Avoid confusion                                          |
| Font weights                    | 2-3 max         | Reduce visual complexity                                 |

### Design Implications

- Each section should answer ONE question
- Group related metrics together
- Use whitespace to separate concepts
- Remove decorative elements that don't convey information

## Typography for Data

### Font Size Hierarchy

```
Primary Metrics (Score, KPI):      24-28px bold tabular
Secondary Metrics (Percentages):   18-20px bold tabular
Section Headings:                  18px bold
Card Titles:                       15px semibold
Body Text:                         16px normal (recommended default)
Secondary Text:                    14px normal
Small Text / Captions:             12px normal
Labels/Badges:                     11px semibold uppercase (absolute minimum; Apple/Google/Anthropic ship 11px)
```

### Key Rules

1. **Tabular Numbers for Data**
   - Use `font-variant-numeric: tabular-nums` for all numbers
   - Ensures proper alignment in columns and lists
   - Recommended fonts: Roboto, Inter, Open Sans, Lato

2. **Limited Font Weights**
   - Maximum 2-3 weights per interface
   - Stick to: regular (400), semibold (600), bold (700)
   - Avoid light weights (300) for important data

3. **Line Length**
   - Optimal: font size × 2 (in characters)
   - 14px body → ~28 characters per line
   - Prevents eye fatigue on data-dense displays

### What to Avoid

- Mixing more than 2 font families
- Decorative or script fonts for data
- Font sizes below 11px
- Light font weights for metrics

## Spacing System

### Recommended Spacing

| Element         | Spacing | CSS         | Note                                                                                                                                 |
| --------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Section padding | 24px    | `py-6`      | Appropriate for dense data UIs; premium/consumer contexts use 40px+ (see [premium-checkout-design.md](./premium-checkout-design.md)) |
| Grid gaps       | 12px    | `gap-3`     |                                                                                                                                      |
| Card padding    | 16px    | `p-4`       |                                                                                                                                      |
| Element gaps    | 8px     | `space-y-2` |                                                                                                                                      |

### Proximity Principle

Related items should be spaced closer together than unrelated items:

```
┌─────────────────────────────────────┐
│  Revenue                            │ ← Card title
│  $125,430                           │ ← Primary metric (close)
│  +12.5% vs last month               │ ← Context (close)
│                                     │
│  ──────────────────────────────     │ ← Visual separator
│                                     │
│  Breakdown by Region                │ ← New section (distant)
│  ...                                │
└─────────────────────────────────────┘
```

## Color Usage

### Maximum Colors

- **4 accent colors** maximum for data categories
- Use color as enhancement, not sole indicator
- Ensure sufficient contrast (4.5:1 for text)

### Color Guidelines

| Purpose          | Recommendation                    |
| ---------------- | --------------------------------- |
| Positive/up      | Green tones                       |
| Negative/down    | Red tones                         |
| Neutral/baseline | Gray/blue tones                   |
| Categories       | Distinct, colorblind-safe palette |

### Testing

- Test with grayscale to verify hierarchy works without color
- Use colorblind simulation tools
- Ensure text contrast meets WCAG 4.5:1

## Metric Card Patterns

### Primary Metric Card

```
┌─────────────────────────────────────┐
│  REVENUE                 ↗ +12.5%   │  ← Label + trend
│                                     │
│  $125,430                           │  ← Primary metric (28px bold)
│                                     │
│  vs $111,493 last month             │  ← Context (13px muted)
└─────────────────────────────────────┘
```

### Comparison Card

```
┌─────────────────────────────────────┐
│  Conversion Rate                    │
│                                     │
│  3.2%        2.8%                   │
│  Current     Previous               │
│                                     │
│  ████████░░░░ +14%                  │  ← Visual + change
└─────────────────────────────────────┘
```

### Sparkline Card

```
┌─────────────────────────────────────┐
│  Daily Active Users                 │
│                                     │
│  12,847                             │
│  ╭─╮   ╭──╮                        │  ← Sparkline
│  ╯ ╰───╯  ╰─                       │
│                                     │
│  Last 7 days                        │
└─────────────────────────────────────┘
```

## Reducing Anxiety in Results

When displaying scores, grades, or performance data:

### Growth Mindset Language

| Avoid             | Use Instead            |
| ----------------- | ---------------------- |
| "Weaknesses"      | "Areas to improve"     |
| "Failed"          | "Not yet achieved"     |
| "What went wrong" | "Next steps"           |
| "Deficiencies"    | "Growth opportunities" |

### Feedback Mechanisms

- Show clear confirmation when data is saved/submitted
- Display auto-save indicators
- Provide progress indicators for multi-step processes
- Give immediate feedback rather than delayed

### Stress-Reducing Patterns

1. **Cleaner, minimalist designs** - Reduce visual noise
2. **Highlight growth** - Show improvement over time
3. **Actionable insights** - Always provide next steps
4. **Positive framing** - Lead with what's working

## Accessibility

### WCAG Requirements

| Requirement      | Standard  | Implementation               |
| ---------------- | --------- | ---------------------------- |
| Text contrast    | 4.5:1 min | Test all text on backgrounds |
| Large text       | 3:1 min   | 18px+ or 14px+ bold          |
| Touch targets    | 44×44px   | All interactive elements     |
| Focus indicators | Visible   | `focus-visible:ring-2`       |

### Data Visualization Accessibility

- Provide text alternatives for charts
- Don't rely solely on color
- Use patterns/textures in addition to color
- Include data tables as alternative to charts

## Common Mistakes

| Mistake                        | Fix                                           |
| ------------------------------ | --------------------------------------------- |
| Metrics larger than 28px       | Keep primary metrics at 24-28px max           |
| Too many visual elements       | Limit to 5-9 per dashboard view               |
| Inconsistent number formatting | Always use tabular-nums for alignment         |
| Color as only differentiator   | Add icons, patterns, or labels                |
| Dense data without hierarchy   | Use spacing and font weights to create levels |
| Negative framing of results    | Use growth mindset language                   |

## Checklist

Before shipping data displays:

- [ ] Primary metrics ≤ 28px
- [ ] Body text ≥ 16px; secondary ≥ 14px; labels ≥ 11px (industry minimum, not WCAG-mandated)
- [ ] Max 2-3 font weights
- [ ] Max 4 accent colors
- [ ] Max 9 visual elements per view
- [ ] Tabular numbers for all data
- [ ] Section padding = 24px
- [ ] Card padding = 16px
- [ ] Contrast ratio ≥ 4.5:1
- [ ] Touch targets ≥ 44px
- [ ] Growth mindset language used

---

## Changelog

| Date       | Change                                                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-30 | Fix: align cognitive load limits (Cowan 2001 vs Miller 1956); correct WCAG font size attribution (WCAG has no minimum -- 16px is industry convention); add spacing context note; align font size hierarchy (16px body, 14px secondary, 11px minimum per Apple/Google/Anthropic) |
| 2025-01-24 | Initial version                                                                                                                                                                                                                                                                 |
