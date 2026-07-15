---
domain: marketing
topic: devtool-website-anatomy
tags: [devtools, landing-page, website-structure, developer-marketing]
complexity: advanced
last_updated: 2026-03-24
confidence: 0.85
source_refs:
  [
    "Evil Martians 2025 (100 devtool landing pages study)",
    "StoryBrand (Donald Miller) SB7 framework",
    "Rosenfeld/Morville Information Architecture",
    "Stripe.com, Linear.app, Vercel.com (pattern analysis)",
  ]
status: validated
review_by: 2026-09-24
author: opus-4.6 (synthesis from multi-source research)
version: 1
---

# DevTool Website Anatomy

> Section-by-section blueprint for developer tool websites, synthesized from the Evil Martians 2025 study (100 devtool landing pages), StoryBrand narrative framework, and IA best practices.

## TL;DR

- **Homepage section order: Hero, Trust, Problem, Plan (How It Works), Features, Protocols/Integrations, Social Proof, FAQ, Final CTA.** Evil Martians confirms top-performing devtool sites follow this sequence.
- **Hero CTA is the install command, not "Get Started."** Developers trust `npm install x` over marketing buttons. Dual CTA (install + GitHub link) outperforms single CTA.
- **StoryBrand maps to devtool sections.** Character = developer, Problem = integration pain, Guide = your tool (trust signals), Plan = 3-step how-it-works, CTA = install, Success = outcome, Failure = status quo.
- **Docs in primary nav, not buried.** Developer tool docs quality directly influences conversion. Starlight/Docusaurus/Nextra with prominent nav placement.
- **Skip at launch: pricing page (if OSS), playground, chatbot, animations, newsletter popup.** Each adds complexity without proven conversion lift for early-stage devtools.

## Decision Guide

| Scenario                           | Approach                                                                                      | Why                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Pre-launch devtool (0 users)       | Single landing page + docs + 1 blog post. No social proof section.                            | Empty sections signal stalled project. Ship only what's real.                                           |
| OSS devtool with GitHub traction   | Lead with GitHub stars + install count in trust block. Code snippet in hero.                  | OSS developers validate via stars and source code, not marketing copy.                                  |
| CLI-first tool                     | Hero shows terminal output, not UI screenshots. `paso init` not "Get Started."                | Your product IS the terminal. Show the actual DX.                                                       |
| Multi-protocol/integration tool    | Protocols table as dedicated section. Status badges (Stable/Beta/Planned).                    | Integration breadth is the value prop. Make it scannable.                                               |
| Devtool with visual UI             | Animated product UI in hero (Evil Martians: most common hero pattern). Tabbed features below. | UI screenshots prove the product exists and looks good.                                                 |
| Devtool targeting enterprise       | Add comparison table + security section. "SOC 2" badge in trust block.                        | Enterprise buyers need compliance signals early.                                                        |
| Selling to developers AND managers | Hero speaks to developer (technical). Below-fold speaks to manager (outcomes, cost, time).    | Developer scrolls for code. Manager scrolls for business case. Both convert at different scroll depths. |

## Homepage Section Template

### Section 1: Hero

**StoryBrand:** Character (developer) meets Problem (pain).

| Element           | Spec                                     | Example                                          |
| ----------------- | ---------------------------------------- | ------------------------------------------------ |
| Eyebrow           | Version tags, "Open Source," license     | `[v0.4.0] [Open Source] [Apache 2.0]`            |
| H1                | 4-8 words. What it enables.              | "One paso. Every protocol."                      |
| Subheadline       | One sentence. What + time promise.       | "Make your API agent-ready in hours, not weeks." |
| CTA 1 (primary)   | Install command, not "Get Started"       | `npm install usepaso`                            |
| CTA 2 (secondary) | GitHub or docs link, ghost/outline style | `View on GitHub`                                 |
| Code block        | 2-4 line terminal output showing the DX  | `$ paso generate --all`                          |

**Evil Martians finding:** Tabbed hero blocks work for multi-runtime tools (show Node tab + Python tab).

### Section 2: Trust Block

**StoryBrand:** Guide (credibility).

| Stage          | Content                                             | Format                  |
| -------------- | --------------------------------------------------- | ----------------------- |
| Pre-launch     | Trust line: "Self-hosted. Open source. No lock-in." | Single line, muted text |
| Early traction | GitHub stars + npm downloads + license              | Horizontal stats bar    |
| Growth         | Client logos (grayscale, 8-12) + stats              | Logo carousel + metrics |

### Section 3: Problem Statement

**StoryBrand:** Problem (external + internal + philosophical).

| Layer         | What to write                   | Example                                                          |
| ------------- | ------------------------------- | ---------------------------------------------------------------- |
| External      | The factual problem             | "17 agent protocols, each requiring custom integration"          |
| Internal      | How it makes the developer feel | "Your team wastes weeks on protocol adapters instead of product" |
| Philosophical | Why it's wrong                  | "The infrastructure layer should be invisible"                   |

**Format:** H2 headline (the pithy version) + 2-3 body sentences (the expansion). No images.

### Section 4: How It Works (The Plan)

**StoryBrand:** Plan (3 steps max).

3-column horizontal layout: Number, one-word heading, one-line description.

Below: Tabbed code block showing input (your config) and output (generated files). Evil Martians calls this the "step-by-step + tabbed feature" pattern.

### Section 5: Feature Blocks

**Evil Martians: 9 layout formats ranked by effectiveness for devtools:**

| Format                      | Best for                                          | Effort |
| --------------------------- | ------------------------------------------------- | ------ |
| Tabbed feature blocks       | Multi-category features (Build/Deploy/Monitor)    | Medium |
| Step-by-step                | Onboarding flows, setup processes                 | Low    |
| Chess layout (alternating)  | 3 key features with code examples                 | Medium |
| Rich cards (bento grid)     | Visual products with multiple surfaces            | High   |
| Code snippets inline        | CLI tools, API-first products                     | Low    |
| Full screenshots            | Products with polished UI                         | Low    |
| Video tutorials             | Complex workflows, early-stage (no design budget) | Low    |
| Text + icons                | Simple feature lists (least effective)            | Low    |
| Full-width scrollable belts | Large feature sets                                | High   |

**For early-stage devtools:** Chess layout (3 features) or step-by-step + tabs. Low effort, high clarity.

### Section 6: Integrations / Protocols

Table format. Protocol name, status badge, output file. Keep updated.

### Section 7: Social Proof

| Stage        | Approach                                                                         |
| ------------ | -------------------------------------------------------------------------------- |
| No users yet | Skip entirely. Better than fake.                                                 |
| Early users  | 1-2 real quotes from GitHub issues/discussions. Link to source.                  |
| Traction     | 3 testimonial cards: real name, avatar, company, one sentence. Manually curated. |

**Evil Martians finding:** Contextual quotes (alongside features) outperform dedicated testimonial sections.

### Section 8: FAQ

5-7 questions, accordion format. FAQ schema markup for rich snippets. Answer in 1-2 sentences, link to docs for detail.

### Section 9: Final CTA

Full-width, visually distinct. Repeat the install command. Optional "failure" line (StoryBrand: what happens if they don't act).

## Site Map (Minimum Viable)

```
/              Homepage (all sections above)
/docs          Starlight/Docusaurus (Getting Started, Concepts, API, Examples)
/blog          1-2 posts at launch (origin story + tutorial)
/about         Mission + beliefs + open source info
/brand         Public brand guidelines + asset downloads
/llms.txt      AI crawler description
```

**Not at launch:** /pricing (if OSS), /customers, /integrations (list on homepage), /changelog (use GitHub releases), /community.

## Common Mistakes

| Mistake                                              | Fix                                                                                                      |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| "Get Started" button with no install command         | Primary CTA = `npm install x`. Developers convert via package managers, not signup flows.                |
| Empty social proof section with placeholder text     | Remove the section entirely. Add when you have 3+ real testimonials.                                     |
| Docs buried in footer or behind "Resources" dropdown | Docs in primary nav. Prominent. Developer tools live or die by docs quality.                             |
| Feature list without code examples                   | Every feature needs a code block or terminal output showing the DX. Developers evaluate by reading code. |
| Hero animation that delays content paint             | No animations on marketing pages. Static hero. Zero JS. Lighthouse 95+. Your audience judges slow sites. |
| Pricing page for a free OSS tool                     | Skip it. State "Free. Open source. Apache 2.0." in the trust block.                                      |
| Newsletter popup on first visit                      | Off-brand for devtools. Intrusive. Use blog RSS or GitHub watch instead.                                 |

## Checklist

- [ ] Hero shows install command as primary CTA (not "Get Started")
- [ ] Code block in hero proves the DX in 2-4 lines
- [ ] Trust block uses real numbers only (GitHub stars, downloads). No fake stats.
- [ ] Problem statement addresses external, internal, and philosophical layers
- [ ] How it works is 3 steps or fewer
- [ ] Feature blocks include code examples, not just descriptions
- [ ] Docs are in primary navigation (not footer, not dropdown)
- [ ] FAQ uses schema markup for rich snippets
- [ ] Social proof uses real quotes or is omitted entirely
- [ ] No animations, no chatbot, no newsletter popup
- [ ] Lighthouse Performance 95+ on marketing pages
- [ ] `llms.txt` at root for AI crawlers

## References

- [Evil Martians: 100 DevTool Landing Pages Study (2025)](https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025)
- [StoryBrand: Framework for Homepage Design](https://www.toptal.com/designers/ux/storybrand-framework)
- [Evil Martians DevTool Template (GitHub)](https://github.com/evilmartians/devtool-template)
