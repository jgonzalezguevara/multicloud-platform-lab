# SUSE Multi-Linux Manager deployment contract

This document defines the reproducibility boundary for the SUSE Multi-Linux
Manager 5.2 environment in the Multicloud Platform Engineering Lab.

## Deployment model

The validated deployment chain is:

    Official SUSE MLM 5.2 QCOW2 appliance
        -> OpenTofu
        -> Proxmox
        -> cloud-init / NoCloud
        -> persistent MLM storage
        -> private runtime configuration
        -> mgradm installation
        -> functional validation

The official SUSE appliance is used as an immutable vendor-provided base image.

It is not patched or converted into a manually initialized template.

## Declarative infrastructure

OpenTofu declares:

- VMID 130
- hostname suma01
- FQDN suma01.multicloud.lab
- IPv4 address 10.20.0.31/24
- gateway 10.20.0.1
- 4 vCPU
- 16384 MiB RAM
- 50 GiB root disk
- 300 GiB data disk
- Proxmox bridge vmbr1
- NoCloud initialization
- DNS configuration
- SSH public-key injection
- desired VM runtime state

The official image is referenced with its expected SHA256 checksum.

Validated image:

    SUSE-Multi-Linux-Manager-Server.x86_64-5.2.0-Qcow-GM.qcow2

SHA256:

    91cc2bab6da2c7cc4a064bbacbc0ca6931ababc0f33b16554953929558e18149

The QCOW2 artifact itself is not stored in Git.

## Operating-system bootstrap

The official appliance supports cloud-init / NoCloud.

The validated deployment uses this mechanism to avoid interactive JeOS
firstboot configuration.

cloud-init configures the server identity and automation user.

OpenTofu and the Proxmox provider supply the remaining NoCloud metadata and
network configuration.

No Proxmox console interaction is required for normal VM provisioning.

## Persistent storage

The secondary 300 GiB disk is dedicated to MLM container volumes.

The validated preparation command is:

    sudo /usr/bin/mgr-storage-server /dev/sdb

Validated result:

    Filesystem: XFS
    Mountpoint: /var/lib/containers/storage/volumes
    Persistence: UUID entry in /etc/fstab

Storage preparation uses the vendor-supported MLM storage utility.

It is currently a documented bootstrap operation and is not executed
automatically by OpenTofu or cloud-init.

## MLM application bootstrap

MLM application deployment uses the vendor-supported mgradm tool.

Validated version:

    mgradm 5.2.16 for 5.2.0 image

The validated installation pattern is:

    sudo mgradm install suma01.multicloud.lab \
      --config /root/.config/uyuni-tools/config.yaml \
      --pullPolicy Never

The private configuration file contains runtime credentials and deployment
configuration.

It must:

- remain outside Git
- be owned by root
- use mode 0600
- never be printed in logs or documentation
- never be included in repository examples with real values

## Reproducibility boundary

The infrastructure and operating-system provisioning layers are declarative
and reproducible from source control.

The MLM application bootstrap is deterministic, vendor-supported and
documented, but is intentionally not described as fully zero-touch.

The following operations currently remain explicit bootstrap steps:

1. prepare /dev/sdb with mgr-storage-server
2. create the private mgradm configuration from externally supplied secrets
3. execute mgradm install
4. perform functional validation

This is an intentional laboratory boundary.

A future iteration may move these operations into an external secret-injection
and bootstrap automation workflow, but that is not required to consider the
current SUMA laboratory phase reproducible.

Therefore the environment must not be described as:

    fully unattended destroy/recreate
    zero-touch application deployment

It may be described as:

    declarative infrastructure with documented, deterministic application bootstrap

## Validated functional state

The deployed MLM 5.2 environment has been validated with:

- correct hostname and FQDN
- mgradm 5.2.16
- uyuni-db healthy
- uyuni-server healthy
- Tomcat active
- Salt Master active
- Salt API active
- Apache active
- Taskomatic active
- spacewalk.target active
- XFS persistent storage mounted correctly
- HTTPS responding by server IP
- HTTPS responding locally by FQDN
- certificate identifying suma01.multicloud.lab

The laboratory CA is locally generated.

Successful testing with curl -k proves HTTPS functionality only. It does not
prove that the client trusts the certificate authority.

Client CA trust is a separate concern.

## Runtime resource model

The physical Proxmox host has approximately 30.7 GiB RAM.

SUMA requires 16 GiB in the current laboratory profile and therefore operates
as an on-demand enterprise workload.

RKE2 and Harbor must not be started automatically merely because SUMA is
running or stopped.

Resource state must be checked before changing heavyweight laboratory
workloads.

## Acceptance status

The current deployment satisfies the laboratory acceptance criteria for the
SUMA phase:

- vendor image integrity is declared
- VM provisioning is declarative
- interactive JeOS firstboot is avoided
- network identity is declared
- SSH access is provisioned automatically
- persistent storage is validated
- application installation uses supported tooling
- secrets remain outside Git
- MLM functionality has been validated
- the manual bootstrap boundary is explicitly documented

The SUMA phase does not claim fully unattended application deployment.
