# Bodhi MCP Evaluation Suite

A comprehensive multi-hop evaluation suite for the Bodhi MCP knowledge base server. This suite tests the agent's ability to combine multiple tools to answer complex questions requiring synthesis across multiple playbooks and domains.

## Overview

- **Version**: 1.0 (bodhi-mcp-v0.3)
- **Total Questions**: 12
- **Target Accuracy**: 80%
- **Created**: 2026-02-11

## Question Distribution

### By Difficulty
- **Easy**: 2 questions (Route + Read)
- **Medium**: 4 questions (Search + List)
- **Hard**: 6 questions (Multi-domain synthesis, discovery workflows, disambiguation)

### By Category
- **Route + Read** (2): Find correct playbook via routing, extract specific content via reading
- **Search + Cross-reference** (2): Search multiple topics, read both, identify connections across domains
- **List + Filter + Read** (2): List by domain/complexity, filter results, read multiple to identify patterns
- **Multi-domain Synthesis** (2): Route/search across 3+ domains, synthesize conflicting requirements into decisions
- **Discovery Workflow** (2): Use summary/diagnose to guide exploration, then search/read/synthesize
- **Disambiguation** (2): Search similar topics, read multiple playbooks, explain distinct scopes and applicability

## Tools Coverage

| Tool | Questions | Coverage |
|------|-----------|----------|
| `bodhi_read` | 12 | 100% (all questions require reading) |
| `bodhi_search` | 8 | 67% (core search capability) |
| `bodhi_list` | 4 | 33% (filtering/discovery) |
| `bodhi_route` | 5 | 42% (task routing) |
| `bodhi_summary` | 2 | 17% (knowledge base stats) |
| `bodhi_diagnose` | 1 | 8% (health checks) |

## Question Types

### Easy (Route + Read)
1. **Q1**: Octalysis framework in gamification - route to playbook, read specific section
2. **Q2**: Payment idempotency in payment integration - route to playbook, extract decision framework

### Medium (Search + Cross-Reference)
3. **Q3**: Checkout UX patterns vs payment gateway selection - search two topics, find relationship
4. **Q4**: DPDP Act constraints on learning analytics - search compliance and design playbooks, cross-reference

### Medium (List + Filter + Read)
5. **Q5**: UX playbooks by complexity - list domain, filter by complexity, identify engagement themes
6. **Q6**: Backend payment playbooks - list domain, filter by theme, compare recommendations

### Hard (Multi-Domain Synthesis)
7. **Q7**: Premium checkout design - synthesize 5 domains (UX, payment, compliance, pitch, psychology)
8. **Q8**: B2B SaaS GTM strategy - synthesize 7+ playbooks across 3 domains into coherent plan

### Hard (Discovery Workflow)
9. **Q9**: EdTech retention strategy - use summary → list → search → read → synthesize
10. **Q10**: EdTech security & compliance - use diagnose → search → read → synthesize

### Hard (Disambiguation)
11. **Q11**: Multiple "conversion" playbooks - distinguish micro vs macro perspectives on conversion
12. **Q12**: Multiple "security" playbooks - distinguish infrastructure vs application-level security

## Domains Covered

The evaluation references playbooks across all Bodhi domains:

| Domain | Playbooks Referenced |
|--------|----------------------|
| UX | gamification, india-checkout-patterns, premium-checkout-design, conversion, neurochemistry-engagement, gen-z-loyalty, etc. |
| Marketing | pitch-deck-strategy, gtm-strategy, gtm-pricing-packaging, b2b-sales-lifecycle, company-brand-identity, content-led-acquisition |
| Backend | payment-integration, cashfree-integration, b2b2c-payment-architecture, startup-financial-metrics, serverless-cost-modeling |
| Security | india-dpdp, india-saas-legal, children-data-protection, multi-tenant-isolation, dev-prod-separation, webapp-security, deception-detection |
| Architecture | decisions |

## Evaluation Criteria

### Scoring
- **Full Points**: Agent uses required tools AND synthesizes correct understanding
- **Partial Credit**: Agent finds correct playbooks but misses synthesis or connections
- **No Credit**: Agent fails to find relevant playbooks or demonstrates incorrect understanding

### Difficulty Progression
- **Easy** (0-2 points): 2-3 tools, 1 playbook, direct information extraction
- **Medium** (0-3 points): 2-3 tools, 2+ playbooks, requires identifying relationships
- **Hard** (0-5 points): 3+ tools, 2+ domains, synthesis of conflicting requirements or complex decision frameworks

## Usage

### Running the Evaluation

```bash
# Load the evaluation file
cat evaluation/evaluation.xml

# Validate XML structure
xmllint evaluation/evaluation.xml

# Parse and analyze (using Python)
python evaluation/analyze.py
```

### Interpreting Results

For each question:
1. **Tool Usage**: Did the agent use the required tools in a reasonable sequence?
2. **Playbook Discovery**: Did the agent find relevant playbooks?
3. **Content Extraction**: Did the agent correctly extract information from playbooks?
4. **Synthesis**: Did the agent connect information across multiple sources?
5. **Final Answer**: Does the answer address all parts of the question and synthesize constraints?

## Design Philosophy

This evaluation suite tests agent capabilities beyond simple retrieval:

1. **Multi-hop reasoning**: Requires combining multiple tools and sources
2. **Domain understanding**: Tests knowledge of how different domains relate
3. **Synthesis across constraints**: Hard questions require balancing competing priorities (e.g., compliance vs UX friction, cost vs quality)
4. **Discovery workflows**: Tests ability to use tools adaptively based on findings
5. **Disambiguation**: Tests ability to recognize when multiple playbooks apply and explain when each is most relevant

## File Structure

```
evaluation/
├── README.md                 (this file)
└── evaluation.xml           (12 multi-hop QA pairs in XML format)
```

## Related Resources

- **Knowledge Base**: `/knowledge/domains/` - 11 domains of synthesized playbooks
- **MCP Server**: Bodhi MCP server exposes `bodhi_route`, `bodhi_search`, `bodhi_list`, `bodhi_read`, `bodhi_summary`, `bodhi_diagnose` tools
- **Complexity Levels**: Playbooks tagged with `beginner`, `intermediate`, `advanced` complexity
