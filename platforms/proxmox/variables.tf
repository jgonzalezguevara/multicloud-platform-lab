variable "ssh_public_key" {
  description = "SSH public key injected into Proxmox cloud-init guests."
  type        = string
  sensitive   = false
}

variable "suma_enabled" {
  description = "Enable creation of the SUSE Multi-Linux Manager VM"
  type        = bool
  default     = false
}

variable "suma_image_path" {
  description = "Local path on the OpenTofu control node to the official SUSE Multi-Linux Manager QCOW2 image"
  type        = string
  default     = "/opt/multicloud-images/suma/SUSE-Multi-Linux-Manager-Server.x86_64-5.2.0-Qcow-GM.qcow2"
}

variable "suma_image_sha256" {
  description = "Expected SHA256 checksum of the official SUSE Multi-Linux Manager 5.2 QCOW2 image"
  type        = string
  default     = "91cc2bab6da2c7cc4a064bbacbc0ca6931ababc0f33b16554953929558e18149"
}

variable "rke2_started" {
  description = "Desired runtime state of the RKE2 lab virtual machines"
  type        = bool
  default     = true
}
