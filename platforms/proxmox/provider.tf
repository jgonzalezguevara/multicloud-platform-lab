provider "proxmox" {
  endpoint = "https://10.20.0.1:8006/"
  insecure = true

  ssh {
    username    = "root"
    private_key = file("/home/automation/.ssh/id_ed25519_multicloud")

    node {
      name    = "proxmox-lab"
      address = "10.20.0.1"
      port    = 22
    }
  }
}
