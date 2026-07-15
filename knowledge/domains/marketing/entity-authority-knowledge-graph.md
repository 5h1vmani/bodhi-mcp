---
domain: marketing
topic: entity-authority-knowledge-graph
tags: [entity-SEO, knowledge-graph, wikidata, brand-disambiguation]
complexity: advanced
last_updated: 2026-05-22
confidence: 0.8
source_refs:
  [
    Wikipedia NCORP notability guidelines 2026,
    Wikidata documentation 2026,
    Google Knowledge Graph documentation,
    Bing Entity Search 2026,
    Crunchbase profile guidelines,
    Schema.org Organization and Person types,
    Backlinko entity SEO study 2025-2026,
    Botify enterprise entity SEO 2026,
    SEO Land Knowledge Graph June 2025 pruning analysis,
    Andrea Volpini entity-based SEO 2025,
  ]
status: validated
review_by: 2026-11-22
author: opus-4.7 (multi-agent synthesis)
version: 1
---

# Entity Authority and Knowledge Graph

> Decision framework for being recognized as a known entity by Google, Bing, and LLMs. Determines whether AI assistants confidently cite you versus confusing you with a same-named entity.

## TL;DR

- **Brand mention density now outweighs backlinks for AI visibility.** Correlation with AI visibility: brand mentions 0.664, backlinks 0.218, domain authority 0.18. The bet shifts from link building to mention building plus entity work.
- **Wikidata before Wikipedia.** Wikidata's notability bar is far lower than Wikipedia's NCORP. Get a Wikidata item early, link via sameAs, and feed Google Knowledge Graph indirectly.
- **Wikipedia for startups is usually premature.** NCORP requires multiple major independent sources discussing the company in depth. Article-for-deletion is the default outcome for under-cited brands.
- **Founder entity transfers to company.** AI systems treat founder authority as a proxy for company authority. Off-domain founder presence (LinkedIn, Substack, podcasts, scholarly profiles) compounds the brand entity.
- **Same-name disambiguation is a real risk.** If "BrandX" is also the name of a missile system, a band, or a city neighborhood, AI assistants will conflate them. Always pair the brand with category context in public copy.

## Decision Guide

| Scenario                                                                   | Approach                                                                                                                                         | Why                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Brand new company, zero entity presence                                    | Crunchbase profile + LinkedIn company page + complete Organization JSON-LD with sameAs to social                                                 | Cheapest, fastest path to feed entity signals to Google and Bing                                 |
| 6 to 12 months in, modest press coverage                                   | Create Wikidata item with full property set + add sameAs reciprocally everywhere                                                                 | Wikidata flows into Google KG; lower notability bar than Wikipedia                               |
| Multiple major press features, named industry analyst coverage             | Pursue Wikipedia article via a paid Wikipedia editor or wait for organic creation                                                                | NCORP needs multiple independent in-depth sources; speculative creation is almost always deleted |
| Same-name collision with another entity (military, geographic, historical) | Always pair brand with category in public copy ("BrandX LSAT prep") + monitor branded SERP weekly + consider brand-extender modifier in metadata | LLMs conflate same-name entities without strong category co-occurrence                           |
| Founder is the public face                                                 | Build founder entity: LinkedIn, Substack, podcast guesting, Google Scholar if academic, GitHub if technical, schema.org Person with sameAs       | Founder authority transfers to company in AI systems                                             |
| B2B with thin consumer brand                                               | Niche directories (G2, Capterra, Crunchbase, AngelList, Product Hunt) + analyst recognition (Gartner Magic Quadrant, Forrester Wave)             | Industry-specific entity sources matter more than mainstream press                               |
| Local or regional brand                                                    | Google Business Profile + local citation building (Yelp, BBB, regional chamber) + LocalBusiness schema                                           | Local entity graph is separate from main KG and follows different signals                        |

## Wikidata: Minimum Property Set

Wikidata accepts items with as few as a name and one identifier. To feed Google Knowledge Graph meaningfully, populate:

| Property                     | What it captures                                         |
| ---------------------------- | -------------------------------------------------------- |
| P31 (instance of)            | Company, organization, nonprofit, etc.                   |
| P17 (country)                | Country of operation                                     |
| P571 (inception date)        | Founded date                                             |
| P856 (official website)      | Primary domain                                           |
| P159 (headquarters location) | City or region                                           |
| P452 (industry)              | Industry from Wikidata controlled vocabulary             |
| P112 (founded by)            | Founder Wikidata item if it exists                       |
| External identifiers         | Crunchbase ID, LinkedIn ID, X username, GitHub org, etc. |

Setup time: roughly 1 hour for a thorough item. After creation, reference the Wikidata URI in Organization JSON-LD `sameAs` on your own site. This is the canonical entity reciprocity loop.

## Wikipedia Reality Check

| Requirement                       | What it means                                                                                                                           |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| WP:GNG (General Notability)       | Significant coverage in multiple reliable independent secondary sources                                                                 |
| WP:NCORP (Company-specific)       | Stricter than GNG; requires sustained editorial coverage, not press releases or routine announcements                                   |
| Conflict of Interest (COI) policy | Direct employee editing is disclosed and discouraged; undisclosed COI editing leads to account blocking                                 |
| Deletion pathways                 | Speedy deletion (hours), PROD (7-day uncontested), AfD (7-day community discussion)                                                     |
| Indirect contribution             | Contribute neutral, sourced edits to adjacent articles (industry, category, related entities). Discloses COI on Talk page when relevant |

Practical rule: if a third-party journalist or analyst would not write a long-form profile of the company today, the company is not Wikipedia-notable yet.

## Schema.org Reciprocity

On the company site, the Organization JSON-LD must declare `sameAs` pointing to every entity record that exists:

| Target                       | Why                                                      |
| ---------------------------- | -------------------------------------------------------- |
| Wikidata URI                 | The single most important sameAs target; feeds Google KG |
| Wikipedia URL (if exists)    | Backup signal even if Wikidata exists                    |
| Crunchbase profile           | Tech industry entity source                              |
| LinkedIn company page        | Universal entity reference                               |
| X / GitHub / YouTube channel | Social and developer entity signals                      |
| Industry directory profiles  | G2, Capterra for SaaS; AngelList for startups            |

Bidirectional linking (you link to them, they reference you back via Wikidata external IDs or directory links) is what builds confident entity resolution.

## Brand Disambiguation Tactics

If the brand name collides with another entity, take all of these:

| Tactic                                            | Detail                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Category pairing in all public copy               | "BrandX LSAT prep" not just "BrandX". Repeated co-occurrence trains LLMs                                        |
| Dominate the branded category query               | Optimize for "BrandX [category]" specifically; this is the canonical disambiguator                              |
| Wikidata item with explicit description           | "BrandX is an LSAT preparation platform" leaves no ambiguity                                                    |
| Organization JSON-LD description matches Wikidata | Consistent description across surfaces                                                                          |
| Monitor branded SERP weekly                       | If the collision entity dominates, escalate to a brand-extender modifier (BrandX Inc., BrandX Labs) in metadata |
| Off-domain founder voice ties brand to category   | Founder posting about LSAT strategy under BrandX banner trains the association                                  |

## Founder Entity Authority

When the founder is the public voice and the company entity is young, build founder entity in parallel:

| Surface                                    | Effect                                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Personal LinkedIn with employment record   | Foundational; links founder to company in every professional graph                                                           |
| Personal Substack or blog                  | Long-form authority surface; archived and indexable                                                                          |
| Podcast guest appearances                  | Transcripts feed AI training; show-notes provide external references                                                         |
| Google Scholar (if academic background)    | Highest-authority external identifier for scholarly entity graph                                                             |
| GitHub org and personal profile            | Authority for technical founders                                                                                             |
| schema.org Person on founder page (if any) | Or no founder page if the brand explicitly keeps founders off-domain; in that case, all founder entity work stays off-domain |
| sameAs reciprocity Person → Organization   | Tie founder Person schema to the Organization schema on whatever surfaces exist                                              |

## Common Mistakes

| Mistake                                                              | Fix                                                                                                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Creating a Wikipedia article before notability                       | Speedy deletion or AfD; reputational scar. Earn the coverage first, then let an editor pick it up                                 |
| Direct editing of own Wikipedia article by employees                 | Undisclosed COI editing leads to account block. Use Talk page proposals with sourced edits                                        |
| Wikidata item with only name and website                             | Skeleton items get deprioritized. Populate at least 8 to 10 properties including industry and external IDs                        |
| Organization JSON-LD with no sameAs                                  | Loses the reciprocity loop; AI systems cannot confidently resolve the entity                                                      |
| Brand name collision ignored                                         | Same-name conflation in AI answers persists. Always pair brand with category in all public copy                                   |
| Founder voice on the company website without anti-feature discipline | Mixes founder personal authority into company surface; in brands that explicitly keep founders off-domain, this violates doctrine |
| Industry directory profiles incomplete                               | G2, Crunchbase, AngelList: a stub profile is worse than no profile because it serves as a stale entity record                     |
| Knowledge Panel claimed without verification                         | Unverified panel changes do not stick; verify ownership via Search Console first                                                  |

## Checklist

- [ ] Crunchbase profile complete with all key fields
- [ ] LinkedIn company page complete
- [ ] Founder LinkedIn profile reflects current company
- [ ] Wikidata item exists with at least 8 populated properties
- [ ] Wikidata external IDs reciprocally linked back to social and directory profiles
- [ ] Organization JSON-LD on the company site declares sameAs to Wikidata, Crunchbase, LinkedIn, X, social
- [ ] Industry directory profiles (G2, Capterra, AngelList as relevant) complete and consistent
- [ ] Brand name collisions identified; category pairing enforced in all public copy
- [ ] Branded SERP tracked weekly
- [ ] Founder entity surfaces (Substack, podcast guesting, GitHub) consistent in name and affiliation
- [ ] Knowledge Panel claim attempted once Wikidata plus press signals exist
- [ ] Quarterly review of entity data consistency across all surfaces

## References

- [Wikipedia NCORP](<https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)>) — Company notability bar
- [Wikidata Introduction](https://www.wikidata.org/wiki/Wikidata:Introduction) — How items work
- [Schema.org sameAs](https://schema.org/sameAs) — Reciprocity property
- [Google Knowledge Panels documentation](https://support.google.com/knowledgepanel/) — Claim and verification process

## Related

- [seo-aio-discoverability.md](./seo-aio-discoverability.md) — Companion site-level setup
- [ai-citation-content-structure.md](./ai-citation-content-structure.md) — Page-level structure for citation
- [ai-citation-measurement.md](./ai-citation-measurement.md) — How to track that entity work is paying off
- [founder-brand-identity.md](./founder-brand-identity.md) — Founder positioning that feeds entity authority
- [company-brand-identity.md](./company-brand-identity.md) — Company brand surface that anchors the entity

---

## Changelog

| Date       | Change                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 2026-05-22 | Initial version. Synthesized from Wikidata docs, NCORP guidelines, schema.org, and 2025-2026 entity SEO studies |
