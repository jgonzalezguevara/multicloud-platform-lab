variable "ssh_public_key" {
  description = "SSH public key injected into Proxmox cloud-init guests."
  type        = string
  sensitive   = false
}
