# Enterprise Platform Stack Map

The enterprise extension of the Multicloud Platform Engineering Lab separates Kubernetes platform management from Linux operating system lifecycle management.

## SUSE-oriented stack

    Kubernetes
        RKE2
          -> Rancher
          -> Fleet
          -> Harbor

    Linux lifecycle
        SUSE Multi-Linux Manager

## Red Hat-oriented stack

    Kubernetes
        OpenShift
          -> OpenShift GitOps

    Linux lifecycle
        Red Hat Satellite

## Comparison domains

### Kubernetes platform

    RKE2 + Rancher
        compared with
    OpenShift

### GitOps

    Fleet
        compared with
    OpenShift GitOps

### Linux lifecycle

    SUSE Multi-Linux Manager
        compared with
    Red Hat Satellite

### Container supply chain

Harbor is used by the current RKE2 platform as the private OCI registry and vulnerability-scanning boundary.

Registry and supply-chain behavior in the OpenShift environment will be documented from the implementation actually deployed in the laboratory.

## Laboratory principle

Products are compared by reproducible architecture, observable behavior, operational workflow and measured resource consumption.

Heavy enterprise environments are deployed on demand rather than kept simultaneously active on the resource-constrained Proxmox host.
