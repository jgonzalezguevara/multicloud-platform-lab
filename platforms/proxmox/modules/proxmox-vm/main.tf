resource "proxmox_virtual_environment_vm" "this" {
  name      = var.name
  node_name = var.node_name
  vm_id     = var.vm_id

  clone {
    vm_id = var.clone_vm_id
    full  = true
  }

  cpu {
    cores = var.cpu_cores
    type  = "host"
  }

  memory {
    dedicated = var.memory_mb
  }

  disk {
    datastore_id = var.datastore_id
    interface    = "scsi0"
    size         = var.disk_size_gb
  }

  initialization {
    datastore_id = var.datastore_id

    dynamic "dns" {
      for_each = length(var.dns_servers) > 0 || var.dns_domain != null ? [1] : []

      content {
        servers = var.dns_servers
        domain  = var.dns_domain
      }
    }

    ip_config {
      ipv4 {
        address = var.ipv4_address
        gateway = var.ipv4_gateway
      }
    }

    user_account {
      username = var.username
      keys = [
        var.ssh_public_key
      ]
    }
  }

  agent {
    enabled = true

    wait_for_ip {
      ipv4 = true
    }
  }

  network_device {
    bridge = var.bridge
  }

  serial_device {
    device = "socket"
  }

  operating_system {
    type = "l26"
  }

  started = var.started
}
