# Multicloud Platform Engineering Lab

A practical Platform Engineering laboratory focused on reproducible infrastructure, automation, Kubernetes, GitOps and multicloud engineering.

The project combines a real on-premises platform with locally emulated public-cloud APIs. Its purpose is to exercise complete engineering lifecycles rather than isolated technology examples.

## Architecture

    GitHub
       |
       | desired state
       v
      Flux
       |
       v
    RKE2 Kubernetes
       |
       +---- Platform Demo
       |
       +---- Harbor Private Registry
                  |
                  +---- Internal PKI / TLS

    Ansible
       |
       +---- RKE2 configuration
       +---- PKI trust
       +---- Registry integration
       +---- Harbor recovery

    OpenTofu
       |
       v
    Proxmox VE
       |
       v
    Virtual Infrastructure


    Multicloud development layer

    OpenTofu -> AWS   -> Floci
    OpenTofu -> Azure -> Floci
    OpenTofu -> GCP   -> Floci
    OpenTofu -> OCI   -> Floci

Detailed architecture:

docs/architecture/platform-architecture.md

## Platform stack

| Layer | Technology |
|---|---|
| Virtualization | Proxmox VE |
| Infrastructure as Code | OpenTofu |
| Configuration management | Ansible |
| Kubernetes | RKE2 |
| GitOps | Flux |
| Container registry | Harbor |
| Container runtime | containerd |
| PKI | Internal CA / TLS |
| Application packaging | OCI containers |
| Local cloud emulation | Floci |
| Cloud targets | AWS, Azure, GCP, OCI |
| Platform console | Flask / Gunicorn |
| Source of truth | GitHub |

## Infrastructure

The on-premises platform runs on Proxmox VE.

OpenTofu manages the virtual infrastructure used by the RKE2 platform.

The Kubernetes topology currently consists of:

- three RKE2 control-plane nodes
- one RKE2 worker node
- one platform control node
- one dedicated Harbor registry node

Infrastructure changes are validated through OpenTofu before application.

The lab also includes lifecycle, idempotency and drift validation.

## Kubernetes platform

RKE2 provides the Kubernetes platform.

Ansible automates platform configuration including:

- operating-system preparation
- RKE2 deployment
- platform prerequisites
- internal CA distribution
- Harbor trust
- private registry configuration
- recovery configuration

Kubernetes workloads are defined declaratively with Kustomize.

## Private container registry

Harbor provides the private OCI registry for platform workloads.

The registry uses an internal Certificate Authority and strict TLS verification.

RKE2 nodes authenticate to Harbor using restricted pull-only robot credentials instead of administrative credentials.

Implemented registry capabilities include:

- HTTPS
- internal PKI
- restricted robot authentication
- automated RKE2 registry configuration
- vulnerability scanning
- SBOM support
- automated cold-boot recovery

## GitOps

Flux continuously reconciles Kubernetes desired state from GitHub.

    Git commit
        |
        v
    GitHub main
        |
        v
    Flux GitRepository
        |
        v
    Flux Kustomization
        |
        v
    RKE2
        |
        v
    Application desired state

GitOps convergence has been validated end to end.

The platform-demo Deployment was changed from two replicas to three using only a Git commit and push.

Flux detected the new repository revision and automatically reconciled Kubernetes to three replicas.

A second Git commit restored the desired state to two replicas.

Flux again detected the change and returned the Deployment to two replicas without manual kubectl apply or forced Flux reconciliation.

## Platform demo workload

The platform includes a containerized application used to validate the complete delivery path.

    Application
        |
        v
    OCI image
        |
        v
    Harbor
        |
        v
    RKE2
        |
        v
    Flux-managed Deployment

The workload includes:

- non-root execution
- readiness probe
- liveness probe
- container health check
- resource requests and limits
- Kubernetes security context
- private registry image delivery

## Multicloud laboratory

The project contains provider-specific areas for:

- Amazon Web Services
- Microsoft Azure
- Google Cloud Platform
- Oracle Cloud Infrastructure

Floci provides local cloud APIs for development and comparison without requiring permanent billable public-cloud resources.

The AWS local environment has already completed a validated Infrastructure as Code lifecycle including:

1. OpenTofu planning
2. infrastructure deployment
3. independent API validation
4. OpenTofu state validation
5. idempotency validation
6. infrastructure destruction
7. post-destroy validation

Real public-cloud validation can be added separately when appropriate accounts or credits are available.

## Platform console

The project includes a web-based multicloud console backed by Flask and Gunicorn.

Its purpose is to expose provider-oriented infrastructure workflows while keeping the underlying infrastructure definitions reproducible through OpenTofu.

## Engineering and troubleshooting

The lab intentionally includes failure investigation and recovery.

Problems already diagnosed include:

- Kubernetes networking symptoms caused by control-plane memory pressure
- internal CA validation failure caused by incomplete X.509 Key Usage extensions
- Harbor startup failure caused by a race between Docker container restoration and the Harbor syslog endpoint
- private registry authentication and authorization validation
- GitOps convergence and desired-state restoration
- infrastructure drift and idempotency validation

These incidents are treated as engineering scenarios: symptom, investigation, root cause, remediation and validation.

## Security principles

- Secrets remain outside Git.
- Private keys are never committed.
- Kubernetes administrative credentials remain outside the repository.
- TLS verification is not disabled as a workaround.
- Harbor uses restricted credentials for workload image pulls.
- Infrastructure credentials remain outside the project tree.
- Public documentation contains no customer or proprietary production data.

## Repository structure

    applications/     Platform workloads
    automation/       Ansible automation
    clusters/         Cluster and Flux configuration
    console/          Multicloud platform console
    docs/             Architecture and provider documentation
    gitops/           GitOps resources
    kubernetes/       Kubernetes platform resources
    modules/          Reusable infrastructure modules
    observability/    Observability resources
    platforms/        Provider-specific OpenTofu configurations
    scripts/          Operational and validation tooling
    tests/            Platform validation

## Current development areas

The core platform foundation is operational.

Current and upcoming areas include:

- observability
- CI workflows
- deeper automated platform validation
- multicloud comparison scenarios
- provider-specific infrastructure patterns
- platform self-service capabilities
- additional architecture and troubleshooting documentation

## Project status

Active development.
