#!/usr/bin/env bash

IMAGE="${1:-}"
EXPECTED_SHA256="${2:-}"
TEMPLATE_VMID="${3:-9130}"

if [ -z "$IMAGE" ] || [ -z "$EXPECTED_SHA256" ]; then
    echo "Uso:"
    echo "  $0 /ruta/imagen.qcow2 SHA256 [template-vmid]"
    echo
    echo "Este script valida la imagen antes de cualquier importación."
    exit 2
fi

if [ ! -f "$IMAGE" ]; then
    echo "ERROR: no existe la imagen: $IMAGE"
    exit 1
fi

case "$IMAGE" in
    *.qcow2|*.qcow)
        ;;
    *)
        echo "ERROR: se esperaba una imagen qcow2/qcow"
        exit 1
        ;;
esac

echo "===== IMAGEN ====="
ls -lh "$IMAGE"

echo
echo "===== FORMATO ====="

if command -v qemu-img >/dev/null 2>&1; then
    qemu-img info "$IMAGE"
else
    echo "AVISO: qemu-img no está instalado en este host de control"
fi

echo
echo "===== SHA256 ====="

ACTUAL_SHA256="$(sha256sum "$IMAGE" | awk '{print $1}')"

if [ "$ACTUAL_SHA256" != "$EXPECTED_SHA256" ]; then
    echo "ERROR: checksum SHA256 incorrecto"
    echo "Esperado: $EXPECTED_SHA256"
    echo "Obtenido: $ACTUAL_SHA256"
    exit 1
fi

echo "OK: SHA256 verificado"

echo
echo "===== DESTINO PLANIFICADO ====="
echo "Template VMID: $TEMPLATE_VMID"
echo "Nombre: suma52-slmicro62-template"
echo "Storage: local-lvm"
echo "Bridge: vmbr1"

echo
echo "===== IMPORTACIÓN ====="
echo "Imagen validada."
echo "La importación en Proxmox se realizará en un paso separado."
echo "No se ha modificado Proxmox."

echo
echo "SUMA_IMAGE_VALIDATED"
