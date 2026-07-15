---
domain: marketing
topic: ai-citation-content-structure
tags: [GEO, AIO, passage-extraction, content-structure]
complexity: intermediate
last_updated: 2026-05-22
confidence: 0.8
source_refs:
  [
    Princeton GEO paper (Aggarwal et al. 2024),
    SE Ranking AI Overview studies 2025-2026,
    Google AI Overviews citation analysis (Authoritas 2026),
    Perplexity citation behavior (Otterly 2026),
    Backlinko AI Overview study 2026,
    Search Engine Land passage indexing 2026,
    Anthropic Claude retrieval docs 2026,
    OpenAI search citation studies 2026,
    Liu et al. Lost in the Middle (Stanford 2024),
  ]
status: validated
review_by: 2026-11-22
author: opus-4.7 (multi-agent synthesis)
version: 1
---

# Content Structure for AI Citation

> Decision framework for structuring pages so LLM answer engines extract and quote them. Companion to seo-aio-discoverability.md; this doc covers the passage-level mechanics, not the site-level setup.

## TL;DR

- **AI engines cite passages, not pages.** Optimal extractable passage is 134 to 167 words. Beyond that, content gets truncated mid-thought during retrieval.
- **Answer first, expand later.** 72 percent of ChatGPT-cited pages answer the heading question in 2 to 3 sentences immediately. 55 percent of all AI citations come from the top 30 percent of the page.
- **Tables beat prose 4.2x, numbered lists 2.7x, bullet lists 1.8x.** Convert comparisons, sequences, and option matrices into tables or numbered lists.
- **Entity density of ~20 percent gets cited 3 to 4x more.** Replace pronouns with named entities. "Acme students" not "they". "Claude Opus 4.7" not "the model".
- **Lost in the middle is real.** LLMs recall the start (85 to 95 percent) and end (similar) of long content far better than the middle (76 to 82 percent). Mirror the TL;DR at the bottom as Key Takeaways.

## Decision Guide

| Scenario                         | Approach                                                                                                          | Why                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Skill or concept explainer       | Question H2 + 40-75 word answer first + tabular breakdown of subtypes + numbered step-by-step + Key Takeaways box | Maps to PAA query phrasing; tabular content earns 4.2x citations vs prose                |
| Comparison or "X vs Y" page      | Lead with one-sentence verdict + comparison table on row 1 of body + dimension-by-dimension H2s                   | Comparison tables are heavily extracted by AI Overviews and Perplexity                   |
| Definitional or "What is X" page | Definition-led paragraph (X is Y that does Z) + FAQPage schema + at least 5 Q&A pairs                             | FAQPage schema lifts citation rate from ~15 percent to ~41 percent                       |
| How-to or tutorial               | HowTo schema + numbered list with each step under 50 words + screenshot per step with alt text                    | Numbered lists are 2.7x; HowTo is one of three schema types Google explicitly favors     |
| Statistic or report page         | Stat-led headline ("X% of Y") + sourced number in first 80 chars of TL;DR + methodology section with year and n   | Statistics in first paragraph drive +41% citation lift (Princeton GEO)                   |
| Author or expert page            | Person schema with credentials, sameAs to scholarly profiles + 3+ named achievements + recent publication list    | Author entity boost is 1.9x bare byline; 2.3x byline plus credentials                    |
| Pillar / long-form (>2000 words) | TL;DR up top + Key Takeaways mirror at bottom + section anchors + internal links to cluster pages                 | Counters lost-in-the-middle decay; section anchors give AI a stable URL fragment to cite |
| Time-sensitive content           | "Last updated" prominently + datePublished and dateModified in schema + quarterly refresh cadence                 | Median AI-cited content is 25 to 32 days fresh on Perplexity, 108 days on Google         |

## Passage Mechanics

| Property                                      | Target                             | Source                                                |
| --------------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| Extractable passage length                    | 134 to 167 words                   | Multiple 2025-2026 corpus studies                     |
| Optimal TL;DR length                          | 40 to 75 words                     | Matches average LLM quote span                        |
| Entity density (named entities / total words) | ~20 percent                        | 3 to 4x normal English; correlates with citation rate |
| Paragraph length                              | 3 to 5 sentences                   | Longer paragraphs get truncated at extraction         |
| Heading style                                 | Question form when natural         | Matches People Also Ask query distribution            |
| Sentence opener for facts                     | Subject + verb + object            | Front-loads the claim, avoids buried-lede truncation  |
| Hedging language                              | Minimize "may", "might", "perhaps" | LLMs deprioritize uncertain passages                  |
| Readability target                            | Flesch-Kincaid grade 6 to 10       | Matches average LLM quote register                    |

## Structural Components Worth Including

| Component                              | Effect                                                     |
| -------------------------------------- | ---------------------------------------------------------- |
| TL;DR box at top                       | Becomes the lead-quote candidate; AI extracts it first     |
| Key Takeaways box at bottom            | Counters lost-in-the-middle; final-position recall is high |
| Definition callout boxes               | Provides isolated quotable atoms                           |
| Tables for comparisons                 | 4.2x citation rate vs equivalent prose                     |
| Numbered steps for sequences           | 2.7x citation rate vs bullets                              |
| FAQPage block at end                   | Lifts citation rate from ~15 to ~41 percent                |
| speakable JSON-LD on TL;DR             | Voice AI surfaces use this; Google AI Overviews honor it   |
| Last updated date visible              | Freshness signal for retrieval ranking                     |
| Author byline with link to Person page | 1.9x (byline) to 2.3x (byline + credentials)               |

## Chunking Reality

AI retrieval systems chunk pages before indexing. Defaults in 2026:

- 256 to 512 tokens per chunk, 10 to 20 percent overlap (LangChain, LlamaIndex, common RAG defaults).
- Structure-aware chunking (split on H2/H3 and `<table>` boundaries) is roughly 35 percent more accurate than naive token splitting.
- Markdown source produces 20 to 30 percent fewer tokens than equivalent HTML for the same content. This matters when AI agents pull pages programmatically.

Implication: write pages so each H2 section is self-contained and roughly 300 to 500 words. Each section should make sense quoted in isolation.

## Common Mistakes

| Mistake                                               | Fix                                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Answer buried after backstory or context paragraph    | Lead the section with the 40 to 75 word answer; move context after                      |
| Heading as a statement, not a question                | Rewrite to match PAA phrasing: "How does X work" not "Understanding X"                  |
| Walls of text without subheadings or lists            | Break at every distinct claim; convert anything sequence-shaped into a numbered list    |
| Pronouns dominating the prose ("it", "they", "this")  | Replace with named entities; aim for 20 percent entity density                          |
| One TL;DR at the top, no recap at the bottom          | Mirror the TL;DR as Key Takeaways at end; counters lost-in-the-middle recall decay      |
| Tables built as styled divs                           | Use real `<table>` with `<thead>` and `<tbody>`; structure-aware chunkers depend on it  |
| Statistics quoted without year or sample size         | Include "(2026, n=X)" inline; verifiability lifts citation 89 percent                   |
| FAQs as collapsibles without schema                   | Mark up with FAQPage JSON-LD even if the visual is an accordion                         |
| Generic author byline with no credentials             | Link byline to a Person page with sameAs and named achievements                         |
| Updating only the dateModified field on stale content | Actually refresh the substantive claims; LLMs deprioritize "lipstick" updates over time |

## Checklist

- [ ] H2 headings phrased as questions where natural
- [ ] Every section answers its question in the first 40 to 75 words
- [ ] Pages over 1500 words have a TL;DR up top and a Key Takeaways mirror at the bottom
- [ ] Comparisons and option matrices are rendered as real `<table>` elements, not styled divs
- [ ] Sequences and step-by-step content are numbered lists, not paragraphs
- [ ] Named entity density is roughly 20 percent (pronouns minimized)
- [ ] FAQPage JSON-LD on any page with question and answer pairs
- [ ] HowTo JSON-LD on any step-by-step tutorial
- [ ] Person schema on author pages with credentials and sameAs
- [ ] speakable JSON-LD on TL;DR sections
- [ ] Last updated date visible on page and matched in dateModified
- [ ] Quarterly refresh cadence scheduled for evergreen pages

## References

- [Aggarwal et al. — GEO: Generative Engine Optimization](https://arxiv.org/abs/2311.09735) — Original empirical paper on citation lift from statistics, quotes, citations
- [Liu et al. — Lost in the Middle](https://arxiv.org/abs/2307.03172) — Stanford study on position-based recall decay in long contexts
- [Authoritas — AI Overview Source Analysis 2026](https://www.authoritas.com/) — Where AI Overview citations come from
- [Schema.org speakable](https://schema.org/speakable) — Markup voice AI uses

## Related

- [seo-aio-discoverability.md](./seo-aio-discoverability.md) — Site-level AIO setup (robots.txt, llms.txt, schema stack)
- [ai-citation-measurement.md](./ai-citation-measurement.md) — How to track whether the structure work is paying off
- [copywriting.md](./copywriting.md) — Conversion-side writing patterns; complementary to citation-side

---

## Changelog

| Date       | Change                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-22 | Initial version. Synthesized from Princeton GEO, AI Overview source studies, lost-in-the-middle research, and 2026 retrieval system defaults |
