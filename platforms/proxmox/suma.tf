locals {
  suma = {
    name              = "suma01"
    vm_id             = 130
    fqdn              = "suma01.multicloud.lab"
    ipv4_address      = "10.20.0.31/24"
    ipv4_gateway      = "10.20.0.1"
    cpu_cores         = 4
    memory_mb         = 16384
    root_disk_size_gb = 50
    data_disk_size_gb = 300
  }

  suma_cloud_init_dir = "${path.root}/../../platform/suma/cloud-init"
}

resource "proxmox_virtual_environment_file" "suma_image" {
  count = var.suma_enabled ? 1 : 0

  content_type = "import"
  datastore_id = "local"
  node_name    = "proxmox-lab"
  overwrite    = false

  source_file {
    path      = var.suma_image_path
    file_name = "SUSE-Multi-Linux-Manager-Server.x86_64-5.2.0-Qcow-GM.qcow2"
    checksum  = var.suma_image_sha256
  }
}

resource "proxmox_virtual_environment_file" "suma_user_data" {
  count = var.suma_enabled ? 1 : 0

  content_type = "snippets"
  datastore_id = "local"
  node_name    = "proxmox-lab"
  overwrite    = true
  upload_mode  = "stream"

  source_raw {
    data = replace(
      file("${local.suma_cloud_init_dir}/user-data.yaml"),
      "    lock_passwd: true",
      "    ssh_authorized_keys:\n      - ${var.ssh_public_key}\n    lock_passwd: true"
    )
    file_name = "suma01-user-data.yaml"
  }
}



resource "proxmox_virtual_environment_vm" "suma" {
  count = var.suma_enabled ? 1 : 0

  name      = local.suma.name
  node_name = "proxmox-lab"
  vm_id     = local.suma.vm_id

  cpu {
    cores = local.suma.cpu_cores
    type  = "host"
  }

  memory {
    dedicated = local.suma.memory_mb
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi0"
    import_from  = proxmox_virtual_environment_file.suma_image[0].id
    size         = local.suma.root_disk_size_gb
  }

  disk {
    datastore_id = "local-lvm"
    interface    = "scsi1"
    size         = local.suma.data_disk_size_gb
  }

  initialization {
    datastore_id = "local-lvm"

    user_data_file_id = proxmox_virtual_environment_file.suma_user_data[0].id

    dns {
      servers = [
        "1.1.1.1",
        "8.8.8.8",
      ]
      domain = "multicloud.lab"
    }

    ip_config {
      ipv4 {
        address = local.suma.ipv4_address
        gateway = local.suma.ipv4_gateway
      }
    }
  }

  agent {
    enabled = true

    wait_for_ip {
      ipv4 = true
    }
  }

  network_device {
    bridge = "vmbr1"
  }

  serial_device {
    device = "socket"
  }

  operating_system {
    type = "l26"
  }

  started = true
}

output "suma_design" {
  description = "Declarative SUSE Multi-Linux Manager deployment"

  value = var.suma_enabled ? {
    vm_id        = proxmox_virtual_environment_vm.suma[0].vm_id
    name         = local.suma.name
    fqdn         = local.suma.fqdn
    ipv4_address = local.suma.ipv4_address
    root_disk_gb = local.suma.root_disk_size_gb
    data_disk_gb = local.suma.data_disk_size_gb
  } : null
}
