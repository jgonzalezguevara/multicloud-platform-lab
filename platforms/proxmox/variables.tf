variable "ssh_public_key" {
  description = "SSH public key injected into Proxmox cloud-init guests."
  type        = string
  sensitive   = false
}

variable "suma_template_vm_id" {
  description = "Proxmox VM ID of the SUSE Multi-Linux Manager compatible SL Micro template"
  type        = number
  default     = 9130
}

variable "suma_enabled" {
  description = "Enable creation of the SUSE Multi-Linux Manager VM"
  type        = bool
  default     = false
}
