# Rancher + Fleet

Status: architecture phase.

Objectives:

- Rancher lifecycle management
- Kubernetes cluster registration
- RBAC
- Fleet GitOps
- GitRepo resources
- cluster targeting
- multi-cluster delivery
- reconciliation testing
- Fleet versus Flux comparison

The existing Flux implementation remains operational.

## Validated GitOps workflow

The laboratory validates an end-to-end Rancher Fleet reconciliation workflow:

    GitHub
      -> Fleet GitRepo
      -> Bundle
      -> BundleDeployment
      -> Fleet Agent
      -> RKE2
      -> private Harbor registry
      -> workload

Validated behavior:

- Fleet tracks the `main` branch of the multicloud platform repository.
- The target cluster is selected through Fleet cluster labels.
- Fleet creates and manages the `fleet-demo` namespace and workload.
- The deployment pulls its image from the private Harbor registry.
- Registry authentication and CA trust are configured at the RKE2/containerd layer.
- No Kubernetes imagePullSecret is required by the workload.
- The running image digest matches the artifact stored in Harbor.
- Harbor Trivy scanning metadata is available for the artifact.
- Git-only reconciliation was validated by changing replicas from 2 to 3.
- Fleet detected the new Git commit and reconciled the deployment to 3/3.
- The desired state was then restored from 3 to 2 through Git.
- Fleet reconciled the deployment back to 2/2.
- Final GitRepo, Bundle and BundleDeployment state is Ready.
- Final workload state is 2/2 Ready with no Fleet drift.

Validated image:

    10.20.0.30/multicloud-platform/fleet-demo:0.1.0

Validated digest:

    sha256:f88a5764010d12b213a75219b281237846da6b341da11eebc1290dfafcf65569

The Trivy scan completed successfully. Scan completion is treated as supply-chain metadata and not as a security approval or vulnerability-policy pass.

This validation demonstrates declarative workload reconciliation from Git while keeping image distribution, authentication, TLS trust and vulnerability metadata under the private Harbor supply-chain boundary.
