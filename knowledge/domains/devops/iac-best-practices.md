---
domain: devops
topic: iac-best-practices
tags: [infrastructure-as-code, aws-cdk, terraform, pulumi, devops]
complexity: intermediate
last_updated: 2026-01-29
---

# Infrastructure as Code Best Practices

> Decision framework for choosing IaC tools (CDK vs Terraform vs Pulumi), organizing code for teams and AI agents, construct-level decisions, multi-stack patterns, testing strategies, and compliance automation. AWS-focused with cross-cloud guidance from official sources (AWS Well-Architected, Google Cloud Terraform Docs, Azure Cloud Adoption Framework).

## TL;DR

- **CDK for AWS-only; Terraform for multi-cloud; Pulumi for polyglot dev teams** -- CDKTF was deprecated Dec 2025; CDK Refactor launched Sep 2025; OpenTofu is the license-safe Terraform fork; team composition predicts adoption success more than features
- **L2 constructs for 80% of work; custom L2 wrappers for enterprise governance** -- L1 for full control, L2 for sensible defaults, L3 for pre-built patterns; enterprise teams create `MyCompanyBucket` wrappers enforcing encryption + IAM by default
- **Split stacks by lifecycle, not by resource type** -- resources that change together stay together; cross-stack references create update deadlocks; maximum 500 resources per CloudFormation stack but split before hitting limits
- **Three-layer testing: fine-grained assertions + snapshots + integration tests** -- fine-grained assertions for TDD and regression; snapshots for refactoring safety; integ-runner for deployed resource validation; target 80%+ coverage
- **AI agents work better with YAML/JSON-based IaC than HCL** -- TerraFormer research: LLMs trained on more JSON/YAML produce fewer hallucinations; CDK (TypeScript) also works well since LLMs have strong TypeScript training data

## Decision Guide

### Tool Selection

| Scenario                                  | Best Tool                                         | Why                                                                                                                         | Official Source                |
| ----------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| AWS-only, TypeScript team                 | **AWS CDK**                                       | L2/L3 constructs reduce code 60-80%; tight AWS integration; CloudFormation drift detection + rollback                       | AWS CDK Best Practices Guide   |
| Multi-cloud (AWS + GCP + Azure)           | **Terraform**                                     | Only mature multi-provider ecosystem; 4,000+ providers; battle-tested at enterprise scale                                   | Google Cloud IaC Overview      |
| AWS-only, worried about license           | **CDK** (or OpenTofu for multi-cloud)             | CDK is Apache 2.0; OpenTofu is BUSL-free fork of Terraform; CDKTF deprecated Dec 2025                                       | OpenTofu Foundation            |
| Polyglot dev team (Python/Go/TypeScript)  | **Pulumi**                                        | Real programming languages; built-in secret management; ~30% faster onboarding for devs                                     | Pulumi comparison docs         |
| Serverless-first (Lambda, Next.js, Remix) | **SST**                                           | Built on CDK; live Lambda reload (`sst dev`); frontend/backend co-deployment; type-safe env vars                            | SST docs                       |
| Azure-first                               | **Bicep**                                         | No state files (stored in Azure); day-0 new resource support; simpler than ARM JSON                                         | Azure Cloud Adoption Framework |
| Google Cloud-first                        | **Terraform**                                     | Google maintains official Terraform modules + Cloud Foundation Toolkit; first-class support                                 | Google Cloud Terraform Docs    |
| Regulated enterprise (PCI-DSS, HIPAA)     | **CDK + cdk-nag** or **Terraform + Sentinel**     | CDK nag: 200+ rules, built-in packs; Terraform Sentinel: policy-as-code enforcement                                         | AWS CDK Prescriptive Guidance  |
| AI-agent-generated infrastructure         | **CDK (TypeScript)** or **CloudFormation (YAML)** | LLMs have strongest TypeScript training data; YAML/JSON = fewer syntax hallucinations than HCL (TerraFormer arxiv research) | arxiv: TerraFormer paper       |

### CDK Construct Levels

| Level         | Name               | Abstraction                                                                       | When to Use                                                                          | Example                                                                       |
| ------------- | ------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| **L1**        | CfnXxx             | Direct CloudFormation mapping; every property exposed                             | Need full control; new AWS features not yet in L2; specific CloudFormation behaviors | `CfnBucket`, `CfnFunction`                                                    |
| **L2**        | Curated            | Sensible defaults; security best practices; helper methods for permissions/events | **80% of daily work**; standard AWS resources with sane defaults                     | `Bucket`, `Function`, `Table`                                                 |
| **L3**        | Patterns           | Multi-resource architectures; opinionated integration                             | Complete patterns like "ALB → Fargate → RDS"                                         | `ApplicationLoadBalancedFargateService`                                       |
| **Custom L2** | Enterprise wrapper | Your organization's L2 with enforced governance                                   | Standard resource + mandatory encryption + org-specific IAM + tagging                | `MyCompanyBucket` (extends Bucket; adds KMS, access logging, lifecycle rules) |

**Decision flow:** Start with L2 → only drop to L1 if L2 doesn't expose a needed property → use L3 when the pattern matches exactly → create custom L2 wrappers for org-wide governance.

### Multi-Stack Patterns

| Pattern                           | When to Use                                                                                   | Risk                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Single stack**                  | Small projects; <50 resources; single team                                                    | Becomes unmaintainable at scale; all-or-nothing deploys                    |
| **Stack per service**             | Microservices; independent team ownership; different deploy cadences                          | Cross-stack references can create update deadlocks                         |
| **Stack per lifecycle**           | Resources with different change frequencies (networking rarely changes; Lambda changes daily) | Recommended by AWS; requires clear lifecycle classification                |
| **Parent + nested stacks**        | Orchestrating related stacks with shared config                                               | Parent coordinates; children are independently testable                    |
| **CDK Pipelines (self-mutating)** | CI/CD that deploys itself; cross-account deployments                                          | Most sophisticated; requires understanding of CodePipeline + CDK bootstrap |

**Cross-stack reference rules:**

- Stack B references Stack A → you cannot delete Stack A while Stack B exists (deadlock)
- Prefer SSM Parameter Store for loose coupling over direct Fn.importValue
- Never create circular references (Stack A → Stack B → Stack A)
- Protect stateful resource logical IDs: write unit tests asserting they don't change during refactoring

## Code Organization

### Folder Structure (CDK)

```
infrastructure/
├── bin/
│   └── app.ts                    # CDK app entry point; instantiate stacks
├── lib/
│   ├── constructs/               # Custom L2/L3 constructs
│   │   ├── secure-bucket.ts      # Enterprise-wrapped S3 bucket
│   │   └── api-lambda.ts         # Lambda + API Gateway pattern
│   ├── stacks/                   # Stack definitions
│   │   ├── networking-stack.ts   # VPC, subnets (rarely changes)
│   │   ├── data-stack.ts         # DynamoDB, S3 (moderate changes)
│   │   └── compute-stack.ts      # Lambda, ECS (frequent changes)
│   └── config/                   # Environment-specific config
│       ├── dev.ts
│       ├── staging.ts
│       └── prod.ts
├── test/                         # Tests mirror lib/ structure
│   ├── constructs/
│   └── stacks/
└── cdk.json
```

### Folder Structure (Terraform)

```
infrastructure/
├── modules/                      # Reusable modules
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   └── compute/
├── environments/                 # Environment-specific
│   ├── dev/
│   │   ├── main.tf              # Calls modules
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   └── prod/
└── .terraform-version
```

### AI-Agent-Friendly IaC

| Practice                                             | Why It Helps AI                                                           | Implementation                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Descriptive resource names                           | LLMs infer intent from names                                              | `userAuthTable` not `table1`; `apiLambda` not `fn`                         |
| Comments explaining "why"                            | AI reads comments to understand decisions                                 | `// Split into separate stack because networking changes quarterly`        |
| Type-safe config                                     | AI can validate types; prevents hallucinations                            | TypeScript interfaces for stack props; Terraform variable types            |
| Small, focused constructs                            | AI reasons better about bounded scope                                     | One construct = one logical unit; max 10-15 resources per construct        |
| Consistent patterns                                  | AI learns patterns faster from consistency                                | Same file structure, naming, export patterns across all stacks             |
| CDK (TypeScript) > Terraform (HCL) for AI generation | LLMs have far more TypeScript training data than HCL; fewer syntax errors | Use CDK if AI agents will modify infra; TerraFormer research confirms this |
| YAML CloudFormation as fallback                      | JSON/YAML = more training data = fewer hallucinations                     | For AI-generated templates, review YAML output before synth                |

## Testing Strategy

| Test Type                   | What It Tests                    | Speed  | When to Use                                         | Tool                           |
| --------------------------- | -------------------------------- | ------ | --------------------------------------------------- | ------------------------------ |
| **Fine-grained assertions** | Specific resource properties     | Fast   | TDD; regression detection; loop-generated resources | CDK assertions module + Jest   |
| **Snapshot tests**          | Full template against baseline   | Fast   | Refactoring safety; detect unintended changes       | Jest `toMatchSnapshot()`       |
| **Integration tests**       | Deployed resource behavior       | Slow   | Post-deploy validation; critical path verification  | `integ-tests` + `integ-runner` |
| **cdk-nag rules**           | Security/compliance violations   | Fast   | Every synth; CI/CD gate                             | `cdk-nag` (200+ rules)         |
| **Terraform validate**      | HCL syntax correctness           | Fast   | Pre-plan check                                      | `terraform validate`           |
| **Terraform plan**          | Drift detection + change preview | Medium | Every PR; scheduled drift checks                    | `terraform plan -out=tfplan`   |

**Testing pyramid:** Many fine-grained assertions → moderate snapshots → few integration tests → cdk-nag on every build.

## Compliance Automation

| Tool                         | Cloud                   | Approach                               | Rule Packs                                 |
| ---------------------------- | ----------------------- | -------------------------------------- | ------------------------------------------ |
| **cdk-nag**                  | AWS (CDK)               | CDK Aspects; runs at synth time        | AWS Solutions, PCI-DSS, HIPAA, NIST 800-53 |
| **Terraform Sentinel**       | Multi-cloud (Terraform) | Policy-as-code; runs before apply      | Custom policies; HashiCorp library         |
| **OPA (Open Policy Agent)**  | Multi-cloud             | General policy engine; JSON input      | Custom rego policies                       |
| **PSRule**                   | Azure (Bicep)           | PowerShell module; 250+ rules          | Microsoft best practices                   |
| **AWS Config Rules**         | AWS (any IaC)           | Post-deploy; continuous compliance     | 300+ managed rules                         |
| **Google Cloud Recommender** | GCP (Terraform)         | Post-deploy; AI-driven recommendations | Cost, security, performance                |

**CDK Aspects pattern for custom governance:**

- Aspects visit every construct during synthesis
- Apply cross-cutting concerns: tagging, naming, encryption enforcement, security group validation
- Order matters: security aspects before tagging aspects
- Create a shared library of aspects for org-wide use

## Official Source Summary

| Provider   | Official IaC Guide                                                                                                                                 | Key Recommendation                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **AWS**    | [CDK Best Practices (v2)](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)                                                            | Start simple; add complexity only when needed; organize by logical units                 |
| **AWS**    | [Prescriptive Guidance (TypeScript)](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/introduction.html) | TDD approach; 80%+ coverage; protect stateful resource IDs                               |
| **AWS**    | [Well-Architected: Operational Excellence](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)                              | "Perform operations as code"; automate as foundation, not advanced technique             |
| **Google** | [Terraform Best Practices](https://docs.cloud.google.com/docs/terraform/best-practices/general-style-structure)                                    | Standard module structure; main.tf + variables.tf + outputs.tf; avoid custom scripts     |
| **Google** | [Reusable Modules](https://docs.cloud.google.com/docs/terraform/best-practices/reusable-modules)                                                   | Shared modules must not configure providers/backends; use `moved` blocks for refactoring |
| **Azure**  | [Cloud Adoption Framework: IaC](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/considerations/infrastructure-as-code)      | Bicep over ARM for Azure-first; Terraform for multi-cloud; modular development           |
| **Azure**  | [Bicep Overview](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview)                                                    | No state files; day-0 resource support; idempotent; PSRule for 250+ validation rules     |

## Common Mistakes

| Mistake                                                       | Fix                                                                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Choosing IaC tool by feature comparison, not team composition | Team predicts success more than features; TypeScript team → CDK; Ops team → Terraform; polyglot → Pulumi                       |
| Using L1 constructs when L2 exists                            | L2 provides secure defaults, permissions helpers, event sources; L1 only when L2 doesn't expose a needed property              |
| Single monolithic stack for entire infrastructure             | Split by lifecycle: networking (quarterly), data (monthly), compute (daily); max 500 resources per CFN stack                   |
| Hardcoded resource names                                      | Prevents multi-env deployment; let CDK/Terraform generate unique names; pass environment as config                             |
| Not testing IaC                                               | Fine-grained assertions for TDD; snapshots for refactoring safety; integ-tests for critical paths; target 80%+ coverage        |
| Cross-stack refs creating deadlocks                           | Use SSM Parameter Store for loose coupling; never circular (A→B→A); protect stateful resource IDs                              |
| Ignoring drift detection                                      | Schedule `terraform plan` or CloudFormation drift detection every 6 hours; CloudTrail + Config Rules for continuous monitoring |
| Mixing ClickOps with IaC                                      | All infrastructure changes through code; console changes create drift; AWS Config can alert on non-IaC changes                 |
| Letting AI generate IaC without review                        | AI-generated IaC is a draft; always run cdk-nag/Sentinel before deploy; sandbox test environments for AI output                |
| Not version-pinning providers/modules                         | Pin Terraform providers, CDK version, and module versions; use Dependabot for automated updates; review before bumping         |

## Checklist

- [ ] IaC tool chosen based on team composition + cloud strategy (not feature comparison)
- [ ] Folder structure follows standard patterns (CDK: bin/lib/test; Terraform: modules/environments)
- [ ] Stacks split by lifecycle (networking/data/compute), not by resource type
- [ ] Custom L2 constructs created for org-wide governance (encryption, tagging, IAM)
- [ ] Testing pyramid implemented: fine-grained assertions > snapshots > integration tests
- [ ] cdk-nag (CDK) or Sentinel (Terraform) enabled in CI/CD pipeline
- [ ] No hardcoded resource names; environment passed as config
- [ ] Cross-stack references use SSM Parameter Store (loose coupling)
- [ ] Drift detection scheduled (every 6 hours minimum)
- [ ] AI-agent-friendly: descriptive names, comments, focused constructs, TypeScript for CDK
- [ ] Provider and module versions pinned; Dependabot enabled
- [ ] Stateful resource logical IDs protected by unit tests
- [ ] All infrastructure changes go through code (no ClickOps)

## References

- [AWS CDK Best Practices (Official v2)](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html) -- Organization, coding, construct, application best practices
- [AWS Prescriptive Guidance: CDK TypeScript](https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/introduction.html) -- TDD, construct creation, code organization for scale (Oct 2025)
- [AWS Well-Architected: Operational Excellence](https://docs.aws.amazon.com/wellarchitected/latest/devops-guidance/dl.eac.1-organize-infrastructure-as-code-for-scale.html) -- IaC organization for scale
- [Google Cloud: Terraform Best Practices](https://docs.cloud.google.com/docs/terraform/best-practices/general-style-structure) -- Module structure, reusable modules, operations
- [Azure Cloud Adoption Framework: IaC](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/considerations/infrastructure-as-code) -- Bicep vs Terraform vs ARM decision
- [sanj.dev: IaC 2025 Decision Framework](https://sanj.dev/post/terraform-pulumi-aws-cdk-2025-decision-framework) -- CDK vs Terraform vs Pulumi benchmark
- [alpacked.io: Detailed Comparison](https://alpacked.io/blog/pulumi-vs-terraform-vs-cdk-aws-detailed-comparison/) -- Feature-by-feature comparison
- [arxiv: TerraFormer](https://arxiv.org/html/2601.08734) -- LLM fine-tuned for IaC; YAML/JSON > HCL for LLM generation
- [Spacelift: AI + IaC Workflows](https://spacelift.io/blog/iac-workflows-with-ai) -- AI-agent guardrails and patterns
- [cdklabs/cdk-nag (GitHub)](https://github.com/cdklabs/cdk-nag) -- 200+ compliance rules; AWS Solutions, PCI-DSS, HIPAA packs
- [AWS CDK Testing Guide (Official)](https://docs.aws.amazon.com/cdk/v2/guide/testing.html) -- Fine-grained assertions, snapshots, integration tests
- [Towards The Cloud: CDK Best Practices 2026](https://towardsthecloud.com/blog/aws-cdk-best-practices) -- Enterprise patterns, L2 wrappers, naming conventions

## Related

- [Verification Checklist](./verification-checklist.md) -- Pre-PR quality gates
- [Serverless AWS Security](../security/serverless-aws-security.md) -- Lambda/API Gateway hardening
- [Architecture Decisions](../architecture/decisions.md) -- ADR format for infra decisions

---

## Changelog

| Date       | Change          |
| ---------- | --------------- |
| 2026-01-29 | Initial version |
