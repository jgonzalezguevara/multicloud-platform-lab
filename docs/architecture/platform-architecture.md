# Platform Architecture

## Overview

The Multicloud Platform Engineering Lab separates infrastructure provisioning, machine configuration, Kubernetes orchestration, artifact delivery and GitOps reconciliation into independent layers.

The objective is to make each layer reproducible and independently testable.

## Platform flow

    GitHub
       |
       v
      Flux
       |
       v
    RKE2 Kubernetes
       |
       +----------+
       |          |
       v          v
    Workload    Harbor
                  |
                  v
             Private OCI images


    Ansible
       |
       v
    Machine and platform configuration


    OpenTofu
       |
       v
    Proxmox VE
       |
       v
    Virtual infrastructure

## Infrastructure layer

Proxmox VE provides the virtualization substrate.

OpenTofu defines the virtual infrastructure required by the Kubernetes platform.

The current Kubernetes topology contains three control-plane nodes and one worker node.

A separate control VM provides the management and automation environment.

Harbor runs on a dedicated VM.

Infrastructure provisioning is intentionally separated from configuration inside the machines.

## Configuration layer

Ansible manages operating-system and platform configuration.

Current responsibilities include:

- RKE2 preparation
- RKE2 deployment
- platform prerequisites
- internal CA distribution
- Harbor certificate trust
- RKE2 private registry configuration
- Harbor recovery configuration

This separation allows OpenTofu to manage infrastructure lifecycle while Ansible manages configuration lifecycle.

## Kubernetes layer

RKE2 provides the Kubernetes platform.

The cluster contains three control-plane nodes and worker capacity.

Platform administration is performed from the multicloud control node.

The Kubernetes API connection uses TLS validation.

Administrative kubeconfig data is stored outside Git.

The current management API endpoint targets one control-plane node and is not presented as a highly available Kubernetes API endpoint.

## Registry layer

Harbor provides the private OCI registry.

    RKE2 nodes
        |
        | HTTPS
        | internal CA trust
        | pull-only credentials
        v
      Harbor
        |
        v
    Private images

RKE2 nodes trust the internal Certificate Authority.

Registry authentication uses restricted project robot credentials with repository pull permissions.

Registry credentials are maintained outside Git and supplied to automation through encrypted secret storage.

## PKI layer

The lab uses an internal Certificate Authority for Harbor TLS.

The CA explicitly provides the certificate-signing constraints and Key Usage required by strict TLS clients.

The public CA certificate is distributed to platform nodes.

The CA private key remains restricted to the registry infrastructure and is not distributed to Kubernetes nodes or committed to Git.

## GitOps layer

Flux watches the GitHub repository and reconciles Kubernetes desired state.

    GitHub main
        |
        v
    GitRepository
        |
        v
    Kustomization
        |
        v
    Kubernetes API
        |
        v
    Desired workload state

The platform-demo application is reconciled from:

    applications/platform-demo/k8s

The GitOps lifecycle has been validated with a real state transition:

    desired replicas = 2
             |
             | commit + push
             v
    desired replicas = 3
             |
             | Flux reconciliation
             v
    running replicas = 3
             |
             | commit + push
             v
    desired replicas = 2
             |
             | Flux reconciliation
             v
    running replicas = 2

No manual workload apply was performed during this validation.

## Application delivery

The platform-demo workload validates the complete container delivery path.

    Application source
          |
          v
      OCI image
          |
          v
        Harbor
          |
          v
    containerd / RKE2
          |
          v
    Kubernetes Deployment

The application runs as a non-root user and exposes health endpoints used by Kubernetes readiness and liveness probes.

Resource requests and limits are defined declaratively.

## Multicloud layer

The repository contains provider-specific infrastructure areas for AWS, Azure, GCP and OCI.

Floci provides local cloud API endpoints for development and infrastructure comparison.

This allows cloud-oriented OpenTofu configurations to be developed without requiring permanent billable cloud resources.

Local emulation and real public-cloud validation are treated as separate execution environments.

## Recovery architecture

Recovery behavior is considered part of the platform rather than a manual afterthought.

### Kubernetes resource pressure

An apparent Kubernetes networking failure affected kube-proxy and CNI operation.

Investigation identified severe memory pressure on control-plane nodes as the underlying cause.

Increasing control-plane memory to an appropriate minimum restored normal Kubernetes operation without changing the physical network.

### PKI compatibility

The original internal CA was accepted by some TLS tooling but rejected by Python and modern OpenSSL validation.

The root cause was incomplete CA Key Usage metadata.

The CA configuration was corrected to explicitly permit certificate signing and CRL signing.

Strict TLS verification then succeeded across the platform.

### Harbor cold boot

After a complete environment shutdown, Harbor could fail during Docker container restoration.

Harbor containers used a syslog logging endpoint provided by the Harbor logging container.

Docker attempted to restore dependent containers before that endpoint was ready.

A systemd recovery unit now waits for the logging endpoint before reconciling the Harbor Compose stack.

The recovery mechanism was validated through a controlled Harbor VM reboot.

## Security model

The current lab follows these principles:

1. Secrets remain outside Git.
2. Private keys are not committed.
3. Kubernetes administrative credentials remain outside the repository.
4. TLS verification remains enabled.
5. Registry workloads use restricted credentials.
6. Infrastructure credentials remain outside the repository.
7. Public documentation contains no customer-specific infrastructure data.

## Design principles

1. Infrastructure should be reproducible.
2. Configuration should be automated.
3. Git should represent Kubernetes desired state.
4. Recovery after restart should be predictable.
5. Failures should be investigated to root cause.
6. Workarounds must not weaken TLS or credential security.
7. Local development should avoid unnecessary cloud cost.
8. Provider implementations should remain comparable.
9. Validation should prove behavior rather than only configuration.
10. Portfolio documentation should distinguish implemented capabilities from planned work.


## Observability Layer

The platform includes a lightweight GitOps-managed observability layer.

Flow:

    Flux
      -> observability Kustomization
      -> Prometheus
      -> Grafana

Prometheus and Grafana are scheduled only on worker nodes so that the small RKE2 control-plane nodes remain focused on etcd and control-plane services.

The current implementation intentionally uses ephemeral storage. Persistent observability storage is deferred until a dedicated StorageClass is introduced.
