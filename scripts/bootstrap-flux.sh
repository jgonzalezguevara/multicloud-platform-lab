#!/usr/bin/env bash

set -u
set -o pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLUX_DIR="${ROOT_DIR}/clusters/lab/flux-system"
COMPONENTS="${FLUX_DIR}/gotk-components.yaml"
SYNC="${FLUX_DIR}/gotk-sync.yaml"

echo "===== FLUX BOOTSTRAP ====="

command -v kubectl >/dev/null 2>&1 || {
    echo "ERROR: kubectl no disponible"
    exit 1
}

command -v flux >/dev/null 2>&1 || {
    echo "ERROR: flux CLI no disponible"
    exit 1
}

kubectl cluster-info >/dev/null 2>&1 || {
    echo "ERROR: Kubernetes API no accesible"
    exit 1
}

test -f "${COMPONENTS}" || {
    echo "ERROR: no existe ${COMPONENTS}"
    exit 1
}

test -f "${SYNC}" || {
    echo "ERROR: no existe ${SYNC}"
    exit 1
}

echo
echo "===== 1/5 INSTALAR COMPONENTES Y CRDS ====="

kubectl apply -f "${COMPONENTS}" || exit 1

echo
echo "===== 2/5 ESPERAR CRDS ====="

for crd in \
    gitrepositories.source.toolkit.fluxcd.io \
    kustomizations.kustomize.toolkit.fluxcd.io
do
    echo "Esperando ${crd}"

    kubectl wait \
        --for=condition=Established \
        --timeout=120s \
        "crd/${crd}" || exit 1
done

echo
echo "===== 3/5 ESPERAR CONTROLADORES ====="

for deployment in \
    source-controller \
    kustomize-controller \
    helm-controller \
    notification-controller
do
    echo "Esperando ${deployment}"

    kubectl rollout status \
        "deployment/${deployment}" \
        -n flux-system \
        --timeout=180s || exit 1
done

echo
echo "===== 4/5 APLICAR CONFIGURACIÓN GITOPS ====="

kubectl apply -f "${SYNC}" || exit 1

echo
echo "===== 5/5 ESPERAR RECONCILIACIÓN ====="

kubectl wait \
    --for=condition=Ready \
    --timeout=180s \
    gitrepository/multicloud-platform-lab \
    -n flux-system || exit 1

kubectl wait \
    --for=condition=Ready \
    --timeout=180s \
    kustomization/platform-demo \
    -n flux-system || exit 1

echo
echo "===== VALIDACIÓN FINAL ====="

flux check || exit 1

echo
flux get sources git -A

echo
flux get kustomizations -A

echo
kubectl get deployment platform-demo \
    -n platform-demo

echo
echo "FLUX_BOOTSTRAP_OK"
