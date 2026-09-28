#!/usr/bin/env bash

cd "$(dirname "$0")/../../.."

. platform/rancher-fleet/helm/versions.env

KUBE_VERSION="$(
    kubectl version -o json \
    | jq -r '.serverVersion.gitVersion' \
    | sed -E 's/^v([0-9]+\.[0-9]+\.[0-9]+).*/\1/'
)"

echo "Rancher chart: $RANCHER_VERSION"
echo "Kubernetes:    $KUBE_VERSION"

helm template rancher rancher-stable/rancher \
  --namespace cattle-system \
  --version "$RANCHER_VERSION" \
  --kube-version "$KUBE_VERSION" \
  -f platform/rancher-fleet/helm/rancher-values.yaml \
  >/dev/null

echo "RANCHER_CHART_VALIDATION_OK"
