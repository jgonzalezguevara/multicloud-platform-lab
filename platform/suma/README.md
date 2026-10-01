# SUSE Multi-Linux Manager 5.2

This directory contains the SUSE Multi-Linux Manager branch of the Multicloud
Platform Engineering Lab.

## Role in the lab

SUSE Multi-Linux Manager provides the Linux lifecycle-management layer of the
SUSE-oriented enterprise platform.

The laboratory separates two management domains:

    Kubernetes platform lifecycle
        RKE2
        Rancher
        Fleet
        Harbor

    Linux operating-system lifecycle
        SUSE Multi-Linux Manager

These domains are complementary.

SUMA will later be compared with Red Hat Satellite using evidence gathered from
the laboratory.

## Validated architecture

The deployed server is:

    VMID:       130
    Hostname:   suma01
    FQDN:       suma01.multicloud.lab
    IPv4:       10.20.0.31/24
    Gateway:    10.20.0.1

Resources:

    CPU:        4 vCPU
    RAM:        16 GiB
    Root disk:  50 GiB
    Data disk:  300 GiB

The physical Proxmox host has approximately 30.7 GiB RAM.

SUMA therefore operates as an on-demand workload and is not intended to run
permanently alongside every heavyweight platform in the laboratory.

## Base image

The deployment uses the official SUSE Multi-Linux Manager 5.2 appliance:

    SUSE-Multi-Linux-Manager-Server.x86_64-5.2.0-Qcow-GM.qcow2

Validated SHA256:

    91cc2bab6da2c7cc4a064bbacbc0ca6931ababc0f33b16554953929558e18149

The vendor QCOW2 is treated as an immutable deployment artifact.

It is not patched and is not converted into a manually initialized template.

The image itself is not stored in Git.

## Infrastructure provisioning

The infrastructure path is:

    Git
      -> OpenTofu
      -> Proxmox
      -> official MLM appliance
      -> cloud-init / NoCloud

OpenTofu declares the VM resources, disks, networking, DNS configuration and
NoCloud initialization.

The deployment uses the bpg/proxmox provider.

The official appliance successfully detects:

    cloud-id: nocloud
    datasource: DataSourceNoCloud

No interactive JeOS firstboot configuration is required.

## cloud-init

The custom user-data is stored in:

    platform/suma/cloud-init/user-data.yaml

It declares:

- hostname
- FQDN
- automation user
- passwordless sudo for the automation user
- disabled SSH password authentication
- disabled direct root login
- timezone

The SSH public key is injected by OpenTofu at deployment time and is not stored
directly in the template.

Network configuration is supplied through the Proxmox initialization
configuration rather than being coupled to a guest interface name.

## Persistent storage

MLM container storage uses the dedicated second disk:

    Device:      /dev/sdb
    Size:        300 GiB
    Filesystem:  XFS
    Mountpoint:  /var/lib/containers/storage/volumes

The disk was initialized using the vendor-supported utility:

    sudo /usr/bin/mgr-storage-server /dev/sdb

The mount is persistent through a UUID-based /etc/fstab entry.

At final validation approximately 294 GiB remained available.

The disk must not be reformatted during normal lifecycle operations.

## MLM installation

The validated administration tooling is:

    mgradm 5.2.16 for 5.2.0 image
    mgrctl 5.2.16

The application was installed using the supported mgradm workflow.

Installation pattern:

    sudo mgradm install suma01.multicloud.lab \
      --config /root/.config/uyuni-tools/config.yaml \
      --pullPolicy Never

The runtime configuration is private and must never be committed to Git.

It contains deployment credentials and other sensitive configuration.

## Validated functional state

Final functional validation confirmed:

    uyuni-db       healthy
    uyuni-server   healthy

Core MLM services are active, including:

- Tomcat
- Salt Master
- Salt API
- Apache
- Taskomatic
- Spacewalk target

HTTPS responds successfully on the server.

The presented certificate identifies:

    suma01.multicloud.lab

The laboratory uses a locally generated CA.

Testing with curl -k validates HTTPS functionality but deliberately bypasses
client CA verification. Certificate trust must therefore be treated separately
from HTTPS availability.

## Reproducibility model

The current SUMA environment deliberately separates declarative infrastructure
from application bootstrap.

Declarative/reproducible:

- official image identity and checksum
- Proxmox VM
- CPU and RAM
- root and data disks
- network identity
- cloud-init / NoCloud
- automation account
- SSH public-key injection

Documented deterministic bootstrap:

- storage initialization with mgr-storage-server
- private runtime configuration creation
- mgradm application installation
- functional validation

The environment is therefore described as:

    declarative infrastructure with documented, deterministic application bootstrap

It is not currently described as fully zero-touch application deployment.

See:

    platform/suma/DEPLOYMENT-CONTRACT.md

for the exact reproducibility boundary.

## Runtime strategy

The heavyweight enterprise platforms in this laboratory are operated on demand.

When SUMA is active, RKE2 and Harbor may remain stopped to preserve physical
memory.

The OpenTofu variable:

    rke2_started

is used to keep the declared RKE2 runtime state aligned with the intended lab
state.

Heavy workloads must not be started automatically without first checking
available host resources.

## Next lifecycle work

With the SUMA deployment and functional validation complete, remaining closure
work is:

1. validate repository formatting and OpenTofu configuration
2. inspect the final OpenTofu plan
3. scan pending changes for accidental secrets
4. commit the completed SUMA phase
5. stop SUMA cleanly when its validation work is finished
6. release resources for the OpenShift design phase

The next enterprise platform phase is OpenShift.

OpenShift sizing and topology must be designed from current official Red Hat
requirements before infrastructure is created.
