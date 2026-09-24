output "vm_id" {
  description = "Proxmox VM ID"
  value       = proxmox_virtual_environment_vm.this.vm_id
}

output "ipv4_addresses" {
  description = "IPv4 addresses reported by the QEMU Guest Agent"
  value       = proxmox_virtual_environment_vm.this.ipv4_addresses
}

output "mac_addresses" {
  description = "MAC addresses reported for the VM"
  value       = proxmox_virtual_environment_vm.this.mac_addresses
}
