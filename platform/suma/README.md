# SUSE Multi-Linux Manager

This directory contains the SUSE Multi-Linux Manager branch of the Multicloud Platform Engineering Lab.

## Role in the lab

SUSE Multi-Linux Manager represents the Linux lifecycle management layer of the SUSE-oriented enterprise platform.

The laboratory separates two different management domains:

    Kubernetes platform lifecycle
        RKE2
        Rancher
        Fleet
        Harbor

    Linux operating system lifecycle
        SUSE Multi-Linux Manager

These domains are complementary and are not treated as competing products.

## Laboratory objectives

The SUMA phase will evaluate and document:

- server architecture and sizing
- repository and software content management
- managed Linux system registration
- lifecycle and staging concepts
- package and patch management
- system grouping
- remote operations
- configuration management
- automation integration
- reporting and operational visibility
- Day-2 administration
- backup and recovery considerations
- reproducible deployment and teardown
- resource consumption in the Proxmox laboratory

## Resource strategy

SUMA will not initially run permanently alongside every enterprise platform in the laboratory.

The physical Proxmox host has limited RAM and already runs the reference RKE2/Rancher/Harbor environment.

The SUMA environment will therefore be designed as an on-demand and reproducible workload.

Infrastructure provisioning should use the existing platform automation model wherever practical:

    OpenTofu
        -> Proxmox
        -> Linux VM
        -> automation
        -> SUMA
        -> managed Linux systems

No deployment will be performed until sizing has been validated against the available laboratory resources.

## Comparative scope

SUMA will later be compared with Red Hat Satellite in the Linux lifecycle management domain.

The comparison will focus on observable laboratory characteristics such as:

- architecture
- content lifecycle
- host registration
- repository management
- patch workflows
- grouping and targeting
- automation
- Day-2 operations
- resource consumption
- reproducibility

The comparison will be based on actual laboratory evidence rather than product ranking.

## Current laboratory capacity

The physical Proxmox host is a repurposed laptop with:

    14 logical CPUs
    30.7 GiB RAM
    349 GiB local-lvm storage
    294 GiB local-lvm currently available

At the capacity snapshot, approximately 12.4 GiB of physical RAM remained available.

RAM is therefore the primary constraint for the SUMA laboratory.

An initial planning candidate of:

    4 vCPU
    16 GiB RAM
    200 GiB disk

has been reserved for evaluation.

This laboratory profile was derived from the current SUSE Multi-Linux Manager server requirements.

The target design remains reproducible and on-demand.

## Validated product requirements

The current SUSE Multi-Linux Manager 5.2 server requirements used for laboratory sizing are:

    CPU
        Minimum 4 dedicated 64-bit CPU cores

    RAM
        Minimum 16 GB
        Recommended 32 GB

    Root filesystem
        40 GB

    Container volumes
        Minimum 150 GB
        Capacity depends on synchronized products and repositories

    PostgreSQL volume
        Minimum 50 GB

    Swap
        Recommended 8 to 12 GB

Supported container-host operating systems include:

    SL Micro 6.2
    SUSE Linux Enterprise Server 15 SP7

The physical Proxmox lab currently has approximately 12.4 GiB of free RAM while the existing enterprise Kubernetes environment is running.

Therefore a standards-aligned SUMA server cannot safely be added while preserving the complete current environment unchanged.

The SUMA server will use an on-demand lifecycle.

Initial laboratory VM profile:

    4 vCPU
    16 GiB RAM
    200 GiB disk

Before starting SUMA, sufficient physical memory must be released by stopping laboratory workloads that are not required for the SUMA validation phase.

The existing RKE2/Rancher/Fleet/Harbor environment remains reproducible and will not be destroyed merely to create SUMA.

## Official VM image acquisition

SUSE Multi-Linux Manager 5.2 Server VM images are distributed through the official SUSE download infrastructure.

The public download page exposes the product and architecture selection, but current installer images require authentication through SUSE Customer Center.

Laboratory target image:

    Product: SUSE Multi-Linux Manager 5.2 Server
    Base OS: SL Micro 6.2
    Architecture: x86_64 / AMD64
    Format: qcow2

The downloaded artifact and its published checksum must be validated before it is imported into Proxmox.

The image itself must never be committed to this repository.

Planned Proxmox template:

    Name: suma52-slmicro62-template
    VMID: 9130
    Storage: local-lvm
    Network bridge: vmbr1

The template VMID is intentionally separate from workload VMID 130.
