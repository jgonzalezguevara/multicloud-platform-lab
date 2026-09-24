variable "name" {
  description = "Virtual machine name"
  type        = string
}

variable "node_name" {
  description = "Proxmox node where the VM will run"
  type        = string
}

variable "vm_id" {
  description = "Proxmox VM ID"
  type        = number
}

variable "clone_vm_id" {
  description = "VM ID of the Proxmox template to clone"
  type        = number
}

variable "cpu_cores" {
  description = "Number of virtual CPU cores"
  type        = number
}

variable "memory_mb" {
  description = "Dedicated memory in MiB"
  type        = number
}

variable "disk_size_gb" {
  description = "Root disk size in GiB"
  type        = number
}

variable "datastore_id" {
  description = "Proxmox datastore used for VM disks and cloud-init"
  type        = string
}

variable "bridge" {
  description = "Proxmox network bridge"
  type        = string
}

variable "username" {
  description = "Cloud-init user"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key installed by cloud-init"
  type        = string
}

variable "started" {
  description = "Whether the VM should be running"
  type        = bool
  default     = true
}

variable "ipv4_address" {
  description = "IPv4 address in CIDR notation or dhcp"
  type        = string
  default     = "dhcp"
}

variable "ipv4_gateway" {
  description = "IPv4 default gateway"
  type        = string
  default     = null
  nullable    = true
}

variable "dns_servers" {
  description = "DNS servers for cloud-init"
  type        = list(string)
  default     = []
}

variable "dns_domain" {
  description = "DNS search domain for cloud-init"
  type        = string
  default     = null
  nullable    = true
}
