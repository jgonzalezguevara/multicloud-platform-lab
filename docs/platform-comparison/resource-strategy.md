# Enterprise Platform Resource Strategy

## Physical host

Proxmox host:

- CPU: 14 logical CPUs
- RAM: 30.6 GiB
- Current physical RAM usage: approximately 17.7 GiB
- Current available RAM: approximately 12.9 GiB
- local-lvm available storage: approximately 305 GiB

## Current virtual infrastructure

Running workloads include:

- multicloud-control
- Harbor
- three RKE2 control-plane nodes
- one RKE2 worker

Configured virtual memory across running VMs is approximately 29 GiB.

Memory ballooning allows actual host consumption to remain below the
configured total, but additional permanent heavyweight environments would
create unnecessary memory pressure.

## Rancher and Fleet

Rancher will initially be evaluated on the existing RKE2 cluster.

The lab deployment should begin with a resource-conscious topology rather
than an HA Rancher deployment.

Fleet will be evaluated after Rancher is operational.

The existing Flux installation remains active so both GitOps models can be
tested independently.

## OpenShift

OpenShift will be designed as a reproducible on-demand environment.

It is not intended to remain permanently active beside the complete RKE2
platform on the current physical host.

Infrastructure lifecycle should support:

    create
      |
    deploy
      |
    validate
      |
    experiment
      |
    document
      |
    destroy

## Red Hat Satellite

Satellite will also use an on-demand lifecycle if its validated resource
requirements cannot coexist safely with the reference platform.

## Engineering principle

The lab prioritizes:

- reproducibility
- controlled resource allocation
- measurable capacity
- recovery
- automation
- realistic operational constraints

over permanently running every supported platform.
