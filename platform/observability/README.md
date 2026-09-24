# Platform Observability

Lightweight observability stack for the Multicloud Platform Engineering Lab.

## Design goals

- Keep resource consumption appropriate for the lab.
- Schedule monitoring workloads on worker nodes.
- Avoid unnecessary control-plane pressure.
- Manage the stack declaratively through Flux.
- Start without persistent storage because the cluster currently has no StorageClass.
- Add persistence later as a separate storage-platform capability.

## Initial components

- Prometheus
- Grafana

Alertmanager, long-term metrics storage, logs and traces are intentionally deferred.

## Resource strategy

The RKE2 control-plane nodes are intentionally small and already carry the Kubernetes control-plane workload.

Observability workloads therefore target worker nodes using:

    node-role.kubernetes.io/control-plane: DoesNotExist

The initial deployment uses conservative CPU and memory requests and limits.

## Final lab state

The observability layer is reconciled by Flux and runs exclusively on the worker node.

Implemented components:

- Prometheus with Kubernetes node discovery
- Grafana with provisioned Prometheus datasource
- Provisioned platform overview dashboard
- Worker-only scheduling
- Conservative CPU and memory limits
- Ephemeral storage by design
- Runtime-only Grafana admin secret

The stack is intentionally lightweight and non-HA because the lab currently has a single worker node and no persistent StorageClass.
