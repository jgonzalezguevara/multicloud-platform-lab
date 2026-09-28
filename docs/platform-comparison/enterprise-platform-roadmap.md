# Enterprise Platform Engineering Roadmap

## Objective

Extend the Multicloud Platform Engineering Lab with several enterprise
platform operating models while preserving the existing RKE2 environment
as the stable reference platform.

The new tracks are:

- Rancher + Fleet
- OpenShift
- Red Hat Satellite

The objective is not simply to install products. Each track must demonstrate
architecture, automation, lifecycle management, security, GitOps,
observability, failure diagnosis and recovery.

## Current reference platform

    Proxmox
       |
    OpenTofu
       |
      RKE2
       |
    +-- Harbor
    +-- Flux
    +-- GitHub Actions
    +-- Prometheus
    +-- Grafana

The existing RKE2 + Flux environment remains operational while the new
platform tracks are developed.

## Rancher + Fleet

Purpose:

- centralized Kubernetes management
- downstream cluster management
- RBAC
- Fleet GitOps
- GitRepo resources
- bundles
- cluster groups
- label-based targeting
- drift reconciliation
- multi-cluster application delivery
- Fleet versus Flux operational comparison

Target concept:

    GitHub
      |
      +-------- Flux --------> RKE2 reference
      |
      +-------- Fleet -------> Rancher managed clusters

Flux will remain operational. Fleet will be introduced as an additional
GitOps model rather than replacing the existing implementation.

## OpenShift

Purpose:

Build a second enterprise Kubernetes platform with a different operating
model.

Areas to validate:

- cluster architecture
- Operators and OLM
- Projects
- Routes
- RBAC
- Security Context Constraints
- storage
- OpenShift GitOps
- monitoring
- upgrades
- Day-2 operations
- application lifecycle

The platform-demo workload should eventually be adapted to OpenShift where
technically appropriate.

## Red Hat Satellite

Purpose:

Add enterprise Linux lifecycle management.

Areas to validate:

- organizations and locations
- products and repositories
- content views
- composite content views
- lifecycle environments
- activation keys
- host groups
- registration
- provisioning
- patch lifecycle
- remote execution
- content promotion

This track provides a Linux lifecycle-management dimension alongside the
Kubernetes platforms.

## Resource strategy

The Proxmox host has limited physical resources.

Heavy enterprise platforms must therefore not all remain active
simultaneously.

Strategy:

1. preserve the existing RKE2 reference platform;
2. measure resource consumption before every new deployment;
3. introduce Rancher/Fleet first;
4. design OpenShift as an independently reproducible environment;
5. start and destroy heavyweight environments on demand where appropriate;
6. introduce Satellite only after resource sizing;
7. prefer reproducibility over permanently running every platform.

## Target architecture

    Infrastructure
         |
    +----+--------------------------+
    |                               |
 Proxmox                       Public Cloud
    |                         AWS Azure GCP
    |
 OpenTofu
    |
    +-------------------+
    |                   |
   RKE2              OpenShift
    |                   |
 Rancher             Operators
    |                   |
 Fleet            OpenShift GitOps
    |
   Flux
    |
   Git
    |
 GitHub Actions

Shared platform services:

- Harbor
- internal PKI
- Ansible
- Prometheus
- Grafana

Linux lifecycle:

- Red Hat Satellite
- SUSE Multi-Linux Manager concepts

## Implementation phases

### Phase A
Rancher resource sizing and topology.

### Phase B
Rancher deployment and validation.

### Phase C
Fleet GitOps and real Git-to-cluster reconciliation.

### Phase D
Fleet versus Flux operational comparison.

### Phase E
OpenShift sizing and topology.

### Phase F
Reproducible OpenShift environment.

### Phase G
OpenShift GitOps and workload validation.

### Phase H
Satellite sizing and architecture.

### Phase I
Satellite lifecycle-management environment.

### Phase J
Cross-platform architecture documentation.
