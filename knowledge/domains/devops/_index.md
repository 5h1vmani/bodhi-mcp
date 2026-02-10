# DevOps Domain

> CI/CD, infrastructure, deployment, and operations.

## Quick Summary

This domain covers getting code to production and keeping it running: pipelines, infrastructure, monitoring, and incident response.

## Files in This Domain

| File                        | When to Use                                                                                          | Complexity   |
| --------------------------- | ---------------------------------------------------------------------------------------------------- | ------------ |
| `ci-cd.md`                  | Setting up build and deployment pipelines                                                            | Intermediate |
| `verification-checklist.md` | Quality gate before PRs/commits                                                                      | Beginner     |
| `infrastructure.md`         | IaC, cloud resources, containers                                                                     | Advanced     |
| `monitoring.md`             | Observability, alerting, dashboards                                                                  | Intermediate |
| `deployment.md`             | Deployment strategies, rollbacks                                                                     | Intermediate |
| `iac-best-practices.md`     | CDK/Terraform/Pulumi tool selection, construct patterns, multi-stack, testing, AI-agent-friendly IaC | Intermediate |

## Key Principles

1. **Automate everything repeatable** - Humans make mistakes
2. **Infrastructure as code** - Version control your infra
3. **Monitor proactively** - Know before users tell you
4. **Easy rollbacks** - Deploy confidently
5. **Blameless postmortems** - Learn from failures

## When to Consult This Domain

- Setting up CI/CD pipelines
- Provisioning infrastructure
- Implementing monitoring and alerting
- Planning deployment strategies
- Responding to incidents
- Choosing IaC tool (CDK vs Terraform vs Pulumi vs Bicep)
- CDK construct levels and multi-stack patterns
- IaC testing strategies and compliance automation
- Making IaC AI-agent-friendly
- Cross-cloud IaC guidance (AWS, GCP, Azure official best practices)

## Related Domains

- `architecture/` - System design affecting ops
- `security/` - Infrastructure security
- `testing/` - Test automation in pipelines

---

Last updated: 2026-01-29
