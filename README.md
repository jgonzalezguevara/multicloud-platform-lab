# Multicloud Platform Lab

Practical multicloud Platform Engineering lab focused on reproducible infrastructure, automation and cross-cloud comparison.

## Core technologies

- Proxmox
- OpenTofu
- Floci
- AWS, Azure, GCP and OCI APIs
- Kubernetes
- Flux GitOps
- Observability
- Automated validation

## Current status

The AWS local environment has completed its first validated Infrastructure as Code lifecycle:

1. OpenTofu plan
2. Infrastructure deployment
3. Independent validation with AWS CLI
4. OpenTofu state validation
5. Idempotency validation
6. Infrastructure destruction
7. Post-destroy validation

Current AWS flow:

OpenTofu -> AWS Provider -> Floci AWS -> S3 API

## Project goal

Build a reproducible multicloud Platform Engineering environment that can be developed and tested locally without requiring billable cloud resources.

Real cloud validation may be added separately when suitable accounts or credits are available.

## Status

Active development.
