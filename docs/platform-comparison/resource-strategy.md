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

## Physical Proxmox lab capacity snapshot

The Proxmox laboratory runs on a repurposed laptop used as the dedicated physical virtualization host.

Measured capacity:

    CPU
        14 logical CPUs
        Intel Core Ultra 5 125U

    Memory
        30.7 GiB physical RAM
        18.3 GiB used
        12.4 GiB available
        8 GiB swap
        0 GiB swap used

    Storage
        local
            94 GiB total
            80 GiB available

        local-lvm
            349 GiB total
            294 GiB available

Current running virtual machines:

    VM 100  multicloud-control   4 vCPU   8 GiB configured
    VM 101  harbor               4 vCPU   8 GiB configured
    VM 111  rke2-cp01            2 vCPU   3 GiB
    VM 112  rke2-cp02            2 vCPU   3 GiB
    VM 113  rke2-cp03            2 vCPU   3 GiB
    VM 121  rke2-worker01        4 vCPU   4 GiB

Total configured memory for running VMs:

    29 GiB

Measured VM memory consumption during the snapshot:

    16.2 GiB

The limiting physical resource for additional enterprise platforms is RAM.

CPU and local-lvm storage currently provide substantially more headroom than memory.

Heavy enterprise environments must therefore be reproducible and capable of being started and stopped on demand rather than permanently coexisting.

## SUMA initial sizing candidate

Before validating the current official product requirements, the laboratory reserves the following planning candidate only:

    4 vCPU
    16 GiB RAM
    200 GiB disk

This laboratory profile satisfies the minimum CPU and RAM requirements and provides storage above the documented minimum container-volume requirement.

The candidate must be checked against the current SUSE Multi-Linux Manager requirements before infrastructure is provisioned.

No existing RKE2, Rancher, Fleet or Harbor virtual machine will be resized or removed merely to accommodate SUMA.
