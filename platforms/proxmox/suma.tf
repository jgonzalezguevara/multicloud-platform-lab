locals {
  suma = {
    name              = "suma01"
    vm_id             = 130
    ipv4_address      = "10.20.0.31/24"
    cpu_cores         = 4
    memory_mb         = 16384
    root_disk_size_gb = 50
    data_disk_size_gb = 200
  }
}

module "suma" {
  source = "./modules/proxmox-vm"

  count = var.suma_enabled ? 1 : 0

  name           = local.suma.name
  node_name      = "proxmox-lab"
  vm_id          = local.suma.vm_id
  clone_vm_id    = var.suma_template_vm_id
  cpu_cores      = local.suma.cpu_cores
  memory_mb      = local.suma.memory_mb
  disk_size_gb   = local.suma.root_disk_size_gb
  datastore_id   = "local-lvm"
  bridge         = "vmbr1"
  username       = "automation"
  ssh_public_key = var.ssh_public_key

  data_disk_size_gb      = local.suma.data_disk_size_gb
  data_disk_datastore_id = "local-lvm"

  ipv4_address = local.suma.ipv4_address
  ipv4_gateway = "10.20.0.1"

  dns_servers = [
    "1.1.1.1",
    "8.8.8.8",
  ]

  dns_domain = "local"

  started = false
}

output "suma" {
  description = "SUSE Multi-Linux Manager VM information"
  value = var.suma_enabled ? {
    vm_id          = module.suma[0].vm_id
    ipv4_addresses = module.suma[0].ipv4_addresses
  } : null
}
