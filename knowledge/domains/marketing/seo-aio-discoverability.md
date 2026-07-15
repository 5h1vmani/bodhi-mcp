---
domain: marketing
topic: seo-aio-discoverability
tags: [SEO, GEO, AIO, llms-txt]
complexity: intermediate
last_updated: 2026-05-22
confidence: 0.85
source_refs:
  [
    Google Search Central AI Features,
    llmstxt.org,
    Search Engine Land GEO 2026,
    Cloudflare AI Crawlers 2025,
    Semrush llms.txt Guide,
    Backlinko E-E-A-T for GEO,
    robotstxt.com/ai,
    Sid Bharath GEO Guide 2026,
    Shortlist.io AAIO Guide 2026,
    Cassidy Williams LLM discoverability experiment,
    Fern llms.txt platforms comparison Jan 2026,
    Passionfruit GEO per-platform guide,
    AISuggest GEO Guide 2026,
    Princeton GEO paper (Aggarwal et al.),
    SE Ranking AI Overview studies 2026,
    Bing Webmaster Tools AI Performance Feb 2026,
    Otterly Profound Bluefish 2026 benchmarks,
    Authoritas AI Overview source studies 2026,
  ]
status: validated
review_by: 2026-11-22
author: opus-4.6 (v2), opus-4.7 (v3 multi-agent synthesis)
version: 3
---

# SEO and AI Discoverability

> Decision framework for making websites, developer tools, and packages citable by AI agents (ChatGPT, Claude, Perplexity, Gemini) alongside traditional search.

## TL;DR

- **Three layers: SEO → GEO → AAIO.** SEO ranks you. GEO (Generative Engine Optimization) gets you cited in AI answers. AAIO (Agentic AI Optimization) makes you actionable by autonomous agents. Each builds on the last.
- **AI Overviews appear on roughly 47 to 48 percent of Google searches.** Informational queries hit 83 to 98 percent; education and health hit 83 to 85 percent. Roughly 83 percent of AI Overview citations come from URLs that do not rank in Google's top 10.
- **Brand mentions now outweigh backlinks for AI visibility.** Correlation with AI visibility: brand mentions 0.664, backlinks 0.218, domain authority 0.18. The bet shifts from link building to mention building.
- **Each AI platform cites differently.** Claude: 68% from structured databases; 1.7x boost for limitation sections. Perplexity: median cited content 32.5 days old (Google's is 108 days). Gemini: mirrors Google SEO. ChatGPT: 47.9% Wikipedia. Google AI Overviews: 23% YouTube.
- **Training-vs-retrieval bot split is now decision-relevant.** GPTBot trains; OAI-SearchBot serves search. ClaudeBot trains; Claude-Web and Claude-SearchBot serve search. Block training selectively, allow retrieval to keep citations flowing.
- **Third-party mentions > self-promotion for GEO.** Reddit accounts for ~40 percent of LLM citations across engines. YouTube transcripts drive 4 to 7x more citations than auto-captions.

## Decision Guide

| Scenario                                   | Approach                                                                                      | Why                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Marketing/company site (no blog)           | robots.txt + llms.txt + Organization/WebSite JSON-LD + OG/Twitter meta                        | Minimum viable AIO. 2-3 hours of work, covers all major AI crawlers                                                        |
| SaaS documentation site                    | robots.txt + llms.txt with full page index + FAQ schema per page + answer-first headings      | Docs are the #1 source LLMs cite. llms.txt with comprehensive page map is high-value here                                  |
| Developer tool / open-source package       | llms.txt + AGENTS.md + comparison pages + Reddit/HN presence + "Best of" list inclusion       | AI models cite third-party comparisons and community discussions more than self-promotion. npm noindexes low-download pkgs |
| Blog/content site                          | robots.txt + Article schema per post + author bios with credentials + FAQ sections            | E-E-A-T signals dominate. Author expertise visible on page gets 40% more AI citations                                      |
| E-commerce/product site                    | robots.txt + Product schema + FAQ schema on product pages + Review schema                     | Product schema feeds Google Shopping AI; FAQ schema answers purchase-intent queries                                        |
| Pre-launch / coming soon                   | robots.txt allowing crawlers + minimal llms.txt with company description                      | Even before launch, let AI crawlers index what exists. They'll have context when you ship                                  |
| Site with sensitive training data concerns | Allow OAI-SearchBot + ChatGPT-User; block GPTBot specifically                                 | GPTBot is training; ChatGPT-User and OAI-SearchBot are search/retrieval. You can allow citation without allowing training  |
| Targeting Claude citations specifically    | Wikipedia/directory presence + limitation sections + factual tone + clear source attributions | Claude: 68% influenced by structured databases. Marketing language actively deprioritized. Limitation sections get 1.7x    |
| Targeting Perplexity citations             | Fresh content + strong source reputation + real-time searchable pages                         | Perplexity is citation-heavy, recency-biased, uses real-time web search. Stale content gets skipped                        |
| Preparing for AI agents (AAIO)             | llms.txt + AGENTS.md + clean semantic HTML + MCP server (if API) + machine-readable docs      | Agents compare, fill forms, complete purchases. AGENTS.md (25+ tools support it) tells agents how to interact              |

## AI Crawler Reference

| User-Agent         | Company      | Purpose                                | Respects robots.txt                  |
| ------------------ | ------------ | -------------------------------------- | ------------------------------------ |
| GPTBot             | OpenAI       | Training data                          | Yes                                  |
| ChatGPT-User       | OpenAI       | User-initiated browse                  | No                                   |
| OAI-SearchBot      | OpenAI       | ChatGPT search retrieval               | Limited                              |
| ClaudeBot          | Anthropic    | Training data                          | Yes                                  |
| Claude-User        | Anthropic    | User-initiated fetch                   | Yes                                  |
| Claude-Web         | Anthropic    | Real-time web for chat                 | Yes                                  |
| Claude-SearchBot   | Anthropic    | Claude search retrieval                | Yes                                  |
| anthropic-ai       | Anthropic    | Legacy training UA                     | Yes                                  |
| PerplexityBot      | Perplexity   | Search and citation crawl              | Reported non-compliance in 2024-2025 |
| Perplexity-User    | Perplexity   | User-initiated fetch                   | Variable                             |
| Google-Extended    | Google       | AI training opt-out (not a crawler)    | N/A                                  |
| Googlebot          | Google       | Standard indexing (feeds AI Overviews) | Yes                                  |
| GoogleOther        | Google       | Internal research and product crawl    | Yes                                  |
| Bingbot            | Microsoft    | Standard indexing (feeds Copilot)      | Yes                                  |
| Applebot-Extended  | Apple        | Apple Intelligence training opt-out    | N/A                                  |
| Bytespider         | ByteDance    | TikTok / Doubao training               | Documented non-compliance            |
| CCBot              | Common Crawl | Public crawl feeding LLM training sets | Yes                                  |
| Amazonbot          | Amazon       | Alexa and Q training                   | Yes                                  |
| Meta-ExternalAgent | Meta         | Llama training                         | Yes                                  |

**Key nuance:** Google-Extended is not a crawler. It controls whether content already crawled by Googlebot can be used for AI training. Allowing Googlebot but blocking Google-Extended lets you appear in search but opt out of Gemini training.

**Training vs retrieval split (2026):** OpenAI and Anthropic both split crawling. Block GPTBot, ClaudeBot, anthropic-ai, CCBot, Bytespider, Amazonbot, Meta-ExternalAgent for training opt-out. Allow OAI-SearchBot, ChatGPT-User, Claude-Web, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot to keep AI citations flowing. Enforce critical blocks at the WAF, not just robots.txt; Bytespider and Perplexity have documented non-compliance.

## llms.txt Specification

Markdown file at `/llms.txt` (site root). Spec at [llmstxt.org](https://llmstxt.org/).

| Rule     | Detail                                                                             |
| -------- | ---------------------------------------------------------------------------------- |
| Format   | Markdown. Heading = company name, blockquote = one-liner, sections = page links    |
| Location | `https://yourdomain.com/llms.txt` (also create `/llms-full.txt` for comprehensive) |
| Content  | Curated summary + links to key pages with descriptions. No marketing fluff         |
| Tooling  | Fern, Mintlify auto-generate from docs. Fern serves Markdown to LLM traffic        |

## Structured Data That Moves the Needle

| Schema Type     | AI Citation Impact            | Use When                                         |
| --------------- | ----------------------------- | ------------------------------------------------ |
| Organization    | Baseline (required)           | Every company site. Name, URL, description, logo |
| WebSite         | Baseline (required)           | Every site. Helps AI understand site identity    |
| FAQ             | +40-60% citations             | Any page with Q&A-style content                  |
| HowTo           | +40-60% citations             | Step-by-step guides, tutorials                   |
| Article         | Moderate                      | Blog posts, news articles                        |
| Person (author) | +40% when credentials visible | Content with named authors                       |
| Product         | Moderate                      | Product/pricing pages                            |
| BreadcrumbList  | Low                           | Deep sites with hierarchy (skip for flat sites)  |

**Format:** Always JSON-LD (`<script type="application/ld+json">`). Validate at [schema.org validator](https://validator.schema.org/).

## Per-Platform GEO Optimization

| Platform   | What It Indexes                           | Optimize For                                                          |
| ---------- | ----------------------------------------- | --------------------------------------------------------------------- |
| ChatGPT    | Bing search + training data patterns      | Conversational structure, brand authority, social media presence      |
| Claude     | Structured databases (68%), training data | Wikipedia, directories, limitation sections (+1.7x), factual tone     |
| Perplexity | Real-time web search, citations           | Recency, source reputation, up-to-date content, direct answers        |
| Gemini     | Google's search infrastructure directly   | Standard Google SEO. Strong SEO = Gemini visibility (most direct 1:1) |

**Third-party authority** is the highest-leverage GEO tactic across all platforms:

| Channel                         | GEO Impact | Why                                                   |
| ------------------------------- | ---------- | ----------------------------------------------------- |
| "Best of" / comparison articles | Very High  | AI models cite these more than any other content type |
| Reddit discussions              | Very High  | Heavily indexed by all major AI models                |
| YouTube content                 | High       | AI models cite video transcripts frequently           |
| Stack Overflow answers          | High       | Direct problem→solution mapping AI models love        |
| Wikipedia mentions              | Very High  | Outsized signal for Claude; strong for all platforms  |
| G2/Product Hunt reviews         | High       | Structured review data feeds product recommendations  |

## AAIO (Agentic AI Optimization)

The emerging third layer: SEO (rank) → GEO (get cited) → AAIO (become actionable).

AI agents now browse, compare, and transact. Key standards:

| Standard   | Purpose                                  | Adoption                           |
| ---------- | ---------------------------------------- | ---------------------------------- |
| llms.txt   | AI-readable site/product summary         | Anthropic, Perplexity, Cursor, HF  |
| AGENTS.md  | Instructions for AI agents to interact   | 25+ tools (GitHub Copilot, Cursor) |
| MCP        | Protocol for tool/service AI integration | Anthropic ecosystem, growing       |
| Schema.org | Machine-readable structured data         | Universal, established             |

**Three levels of readiness:** Accessible (crawlers allowed) → Citable (structured data) → Actionable (agents can interact with forms, APIs, checkout).

## Common Mistakes

| Mistake                                             | Fix                                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Blocking GPTBot thinking it only prevents training  | GPTBot block also removes you from ChatGPT search results. Allow it, or selectively allow OAI-SearchBot    |
| No robots.txt at all                                | Create one. Default behavior varies by crawler. Explicit Allow is better than implicit                     |
| llms.txt that's just a list of URLs                 | Add descriptions. LLMs need context, not just links. Write it like you're explaining your site to a person |
| Structured data on homepage only                    | Add Organization/WebSite globally; add FAQ/Article schema per relevant page                                |
| Optimizing for AI before basic SEO works            | AI Overviews cite pages that already rank. Fix title tags, descriptions, headings, and page speed first    |
| Stuffing keywords for AI                            | LLMs evaluate semantic relevance, not keyword density. Write clear, direct answers                         |
| No og:image                                         | Social sharing and link previews drive backlinks which drive E-E-A-T. Missing og:image = invisible shares  |
| Ignoring third-party presence for GEO               | AI models weight Reddit, "Best of" lists, and comparisons more than your own site. Build external presence |
| Using marketing language for Claude optimization    | Claude actively deprioritizes promotional content. Use factual, balanced tone with limitation sections     |
| npm/PyPI: optimizing site but ignoring package.json | npm searches name, description, keywords, README. Google noindexes low-download packages                   |
| No AGENTS.md for developer tools                    | AI coding assistants (Copilot, Cursor) use AGENTS.md to understand how to interact with your tool          |

## Checklist

- [ ] robots.txt exists and explicitly allows major AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
- [ ] robots.txt references sitemap URL
- [ ] llms.txt exists at site root with company/product description and key page links
- [ ] Every page has unique title tag and meta description
- [ ] Every page has canonical URL
- [ ] Open Graph tags complete (title, description, type, url, image, site_name, locale)
- [ ] Twitter Card tags present (card, title, description, image)
- [ ] JSON-LD Organization + WebSite schema in site layout (all pages)
- [ ] FAQ pages have FAQPage schema
- [ ] XML sitemap exists and is referenced in robots.txt
- [ ] Content uses H2/H3 headings as questions where natural
- [ ] Key content sections lead with direct answer in first 2-3 sentences
- [ ] Author credentials visible on authored content
- [ ] AGENTS.md present in repo (for developer tools/packages)
- [ ] Product listed on relevant directories (G2, Product Hunt, AlternativeTo, "Awesome" lists)
- [ ] GA4 custom channel grouping configured for AI referral sources (openai.com, perplexity.ai)
- [ ] npm/PyPI: `description` and `keywords` in package.json/setup.py are keyword-rich and accurate

## Related

- [ai-citation-content-structure.md](./ai-citation-content-structure.md) — Passage-level structure for LLM quotation (companion deep-dive)
- [ai-citation-measurement.md](./ai-citation-measurement.md) — How to track AI Overview presence and LLM citations
- [entity-authority-knowledge-graph.md](./entity-authority-knowledge-graph.md) — Wikidata, Wikipedia, brand disambiguation, founder entity
- [b2b-website-architecture.md](./b2b-website-architecture.md) — Site structure, hero psychology, navigation patterns
- [content-led-acquisition.md](./content-led-acquisition.md) — Content strategy that drives backlinks and authority
- [trust-building.md](./trust-building.md) — E-E-A-T signals, social proof, credibility

## References

- [Google: AI Features and Your Website](https://developers.google.com/search/docs/appearance/ai-features) — Official stance: no special AIO needed, standard SEO applies
- [llmstxt.org](https://llmstxt.org/) — llms.txt specification
- [Cloudflare: AI Crawlers 2025](https://blog.cloudflare.com/from-googlebot-to-gptbot-whos-crawling-your-site-in-2025/) — Comprehensive crawler user-agent reference
- [robotstxt.com/ai](https://robotstxt.com/ai) — AI crawler robots.txt guide
- [Sid Bharath: GEO Guide](https://sidbharath.com/blog/generative-engine-optimization/) — Seven-step GEO implementation with per-platform tactics
- [Shortlist.io: AAIO Guide](https://shortlist.io/blog/agentic-ai-optimization/) — Agentic AI Optimization: three readiness levels
- [Cassidy Williams: LLM Discoverability](https://cassidoo.co/post/ai-llm-discoverability/) — Real experiment proving llms.txt + /for-llms pages work
- [Fern: llms.txt Platforms Jan 2026](https://buildwithfern.com/post/best-llms-txt-implementation-platforms-ai-discoverable-apis) — Platform comparison for automated llms.txt generation
- [Passionfruit: GEO per-platform guide](https://www.getpassionfruit.com/blog/generative-engine-optimization-guide-for-chatgpt-perplexity-gemini-claude-copilot) — Platform-specific optimization tactics
- [npm: package.json docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) — name, description, keywords fields for discoverability

---

## Changelog

| Date       | Change                                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05-22 | v3: AI Overview coverage data (47-48 percent, 83 percent non-top-10 citation), brand-mentions-vs-backlinks shift, training-vs-retrieval bot split, expanded crawler table (5 new bots), three companion playbooks linked |
| 2026-03-27 | v2: GEO market data, per-platform optimization, AAIO, AGENTS.md, npm discoverability, third-party authority                                                                                                              |
| 2026-03-01 | Initial version. Synthesized from Google, llmstxt.org, Search Engine Land, Cloudflare, Semrush, Backlinko                                                                                                                |
