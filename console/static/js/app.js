const clouds = {
 aws:{
   name:"Amazon Web Services",short:"AWS",class:"aws",
   description:"AWS-compatible local cloud control plane",
   regions:["eu-west-1","eu-central-1","us-east-1"],
   services:[
    ["EC2","Instances, images, volumes and compute"],
    ["VPC","Networks, subnets, routes and gateways"],
    ["Security Groups","Instance-level network security"],
    ["Elastic Load Balancing","Application and network load balancing"],
    ["S3","Object storage and buckets"],
    ["EKS","Managed Kubernetes"],
    ["ECR","Container registry"],
    ["IAM","Users, roles and policies"],
    ["Secrets Manager","Application secrets"],
    ["RDS","Relational databases"],
    ["DynamoDB","NoSQL database"],
    ["Lambda","Serverless functions"],
    ["CloudWatch","Metrics, logs and monitoring"]
   ]
 },
 azure:{
   name:"Microsoft Azure",short:"Azure",class:"azure",
   description:"Azure-compatible local cloud control plane",
   regions:["West Europe","North Europe","East US"],
   services:[
    ["Resource Groups","Logical resource containers"],
    ["Virtual Machines","Azure compute instances"],
    ["Virtual Networks","VNets, subnets and routing"],
    ["Network Security Groups","Network access policies"],
    ["Public IP addresses","Public network endpoints"],
    ["AKS","Azure Kubernetes Service"],
    ["Container Registry","Azure container registry"],
    ["Container Instances","Container workloads"],
    ["Container Apps","Managed application containers"],
    ["Storage Accounts","Blob, Queue and Table storage"],
    ["Key Vault","Secrets and keys"],
    ["Managed Identities","Workload identities"],
    ["Cosmos DB","Distributed database"],
    ["PostgreSQL","Managed PostgreSQL"],
    ["MySQL","Managed MySQL"],
    ["Redis","Managed cache"],
    ["Event Hubs","Event streaming"],
    ["Service Bus","Messaging"],
    ["API Management","API gateway"],
    ["Azure Monitor","Monitoring and telemetry"]
   ]
 },
 gcp:{
   name:"Google Cloud",short:"GCP",class:"gcp",
   description:"Google Cloud-compatible local control plane",
   regions:["europe-west1","europe-west4","us-central1"],
   services:[
    ["Compute Engine","Virtual machine instances"],
    ["VPC Network","Global cloud networking"],
    ["Firewall","Network firewall rules"],
    ["Cloud Load Balancing","Application traffic distribution"],
    ["Cloud Storage","Object storage"],
    ["GKE","Google Kubernetes Engine"],
    ["Artifact Registry","Container and artifact registry"],
    ["Cloud IAM","Identity and access management"],
    ["Secret Manager","Application secrets"],
    ["Cloud SQL","Managed relational databases"],
    ["Cloud Functions","Serverless functions"],
    ["Pub/Sub","Messaging and event distribution"],
    ["Cloud Monitoring","Metrics and observability"]
   ]
 },
 oci:{
   name:"Oracle Cloud Infrastructure",short:"OCI",class:"oci",
   description:"OCI-compatible local cloud control plane",
   regions:["eu-frankfurt-1","eu-amsterdam-1","us-ashburn-1"],
   services:[
    ["Compute","Compute instances"],
    ["VCN","Virtual cloud networks"],
    ["Subnets","Network segmentation"],
    ["Network Security Groups","Network security policies"],
    ["Load Balancer","Traffic distribution"],
    ["Object Storage","Buckets and objects"],
    ["Block Volumes","Persistent block storage"],
    ["OKE","Oracle Kubernetes Engine"],
    ["Container Registry","OCI container registry"],
    ["IAM","Users, groups and policies"],
    ["Vault","Secrets and keys"],
    ["Autonomous Database","Managed database"],
    ["Monitoring","Metrics and alarms"]
   ]
 }
};

let currentCloud="aws";
let currentResource="";

function sidebar(items){
 const s=document.getElementById("sidebar");
 s.innerHTML='<div class="side-title">Services</div>'+
 items.map(x=>`<div class="side-item" onclick="selectResource('${x[0].replace(/'/g,"")}')">
 <strong>${x[0]}</strong><small>${x[1]}</small></div>`).join("");
}

function openCloud(id,btn){
 document.querySelectorAll(".topnav button").forEach(x=>x.classList.remove("active"));
 if(btn) btn.classList.add("active");

 document.getElementById("dashboard").classList.add("hidden");
 document.getElementById("cloud").classList.add("hidden");
 document.getElementById("builder").classList.add("hidden");

 if(id==="dashboard"){
   document.getElementById("dashboard").classList.remove("hidden");
   document.getElementById("sidebar").innerHTML=
    '<div class="side-title">Platform</div>'+
    '<div class="side-item active">Overview</div>'+
    '<div class="side-item">Deployments</div>'+
    '<div class="side-item">OpenTofu State</div>'+
    '<div class="side-item">Drift Detection</div>'+
    '<div class="side-item">Observability</div>';
   return;
 }

 currentCloud=id;
 const c=clouds[id];

 document.getElementById("cloud").classList.remove("hidden");
 const hero=document.getElementById("cloudHero");
 hero.className="cloud-hero "+c.class;
 document.getElementById("breadcrumb").textContent="Multicloud Platform / "+c.short;
 document.getElementById("cloudTitle").textContent=c.name;
 document.getElementById("cloudDescription").textContent=c.description;

 sidebar(c.services);

 document.getElementById("services").innerHTML=c.services.map(x=>`
  <div class="service" onclick="selectResource('${x[0].replace(/'/g,"")}')">
   <strong>${x[0]}</strong><span>${x[1]}</span>
  </div>`).join("");
}

const computeResources = {
 aws: ["EC2"],
 azure: ["Virtual Machines"],
 gcp: ["Compute Engine"],
 oci: ["Compute"]
};

function field(label,type,id,options,value){
 if(type==="select"){
   return `<div><label>${label}</label><select id="${id}" onchange="generatePreview()">${
     options.map(x=>`<option>${x}</option>`).join("")
   }</select></div>`;
 }
 return `<div><label>${label}</label><input id="${id}" value="${value||""}" oninput="generatePreview()"></div>`;
}

function commonFields(c){
 return field("Resource name","text","resourceName",[],"platform-lab")+
        field("Region","select","region",c.regions);
}

function awsComputeForm(c){
 return commonFields(c)+
   field("AMI / Image","text","image",[],"ami-linux-lab")+
   field("Instance type","select","size",["t3.micro","t3.small","t3.medium","m6i.large"])+
   field("VPC","select","network",["vpc-platform","default"])+
   field("Subnet","select","subnet",["private-a","public-a","private-b"])+
   field("Security group","text","security",[],"sg-platform")+
   field("Key pair","text","ssh",[],"platform-admin")+
   field("Root volume (GiB)","select","disk",["20","40","80","100"])+
   field("Public IPv4","select","publicip",["Disabled","Enabled"]);
}

function azureComputeForm(c){
 return commonFields(c)+
   field("Subscription","text","subscription",[],"00000000-0000-0000-0000-000000000001")+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Image","select","image",["Ubuntu Server 24.04 LTS","Debian 13","RHEL 9","Windows Server 2025"])+
   field("VM size","select","size",["Standard_B1s","Standard_B2s","Standard_D2s_v5","Standard_D4s_v5"])+
   field("Virtual network","text","network",[],"vnet-platform")+
   field("Subnet","text","subnet",[],"snet-workloads")+
   field("Network security group","text","security",[],"nsg-platform")+
   field("Authentication","select","ssh",["SSH public key","Password"])+
   field("OS disk size (GiB)","select","disk",["30","64","128","256"])+
   field("Public IP","select","publicip",["Disabled","Enabled"])+
   field("Managed identity","select","identity",["System assigned","None"]);
}

function gcpComputeForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Zone","select","zone",["europe-west1-b","europe-west1-c","europe-west4-a"])+
   field("Machine type","select","size",["e2-micro","e2-small","e2-medium","n2-standard-2"])+
   field("Boot image","select","image",["debian-13","ubuntu-2404-lts","rocky-linux-9"])+
   field("VPC network","text","network",[],"vpc-platform")+
   field("Subnet","text","subnet",[],"subnet-workloads")+
   field("Boot disk (GiB)","select","disk",["20","40","80","100"])+
   field("External IPv4","select","publicip",["Disabled","Enabled"])+
   field("Service account","text","identity",[],"platform-workload")+
   field("Firewall tags","text","security",[],"allow-platform");
}

function ociComputeForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Availability domain","select","zone",["AD-1","AD-2","AD-3"])+
   field("Shape","select","size",["VM.Standard.E2.1.Micro","VM.Standard.E4.Flex","VM.Standard3.Flex"])+
   field("OCPUs (Flex shapes)","select","ocpus",["1","2","4","8","16"])+
   field("Memory GB (Flex shapes)","select","memoryGb",["8","16","32","64","128"])+
   field("Image","select","image",["Oracle Linux 9","Ubuntu 24.04","Rocky Linux 9"])+
   field("VCN","text","network",[],"vcn-platform")+
   field("Subnet","text","subnet",[],"subnet-workloads")+
   field("Network Security Group","text","security",[],"nsg-platform")+
   field("Boot volume (GiB)","select","disk",["50","100","200"])+
   field("Public IPv4","select","publicip",["Disabled","Enabled"])+
   field("SSH public key","text","ssh",[],"~/.ssh/id_ed25519.pub");
}


function awsVpcForm(c){
 return commonFields(c)+
   field("IPv4 CIDR","text","cidr",[],"10.10.0.0/16")+
   field("Tenancy","select","tenancy",["default","dedicated"])+
   field("DNS resolution","select","dnsSupport",["Enabled","Disabled"])+
   field("DNS hostnames","select","dnsHostnames",["Enabled","Disabled"])+
   field("Public subnet CIDR","text","publicSubnet",[],"10.10.10.0/24")+
   field("Private subnet CIDR","text","privateSubnet",[],"10.10.20.0/24")+
   field("Internet Gateway","select","internetGateway",["Create","None"])+
   field("NAT Gateway","select","natGateway",["None","Create"])+
   field("Route tables","select","routeTables",["Public + Private","Single"])+
   field("Flow Logs","select","flowLogs",["Disabled","Enabled"]);
}

function azureVnetForm(c){
 return commonFields(c)+
   field("Subscription","text","subscription",[],"00000000-0000-0000-0000-000000000001")+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Address space","text","cidr",[],"10.20.0.0/16")+
   field("Workload subnet","text","privateSubnet",[],"10.20.10.0/24")+
   field("Public subnet","text","publicSubnet",[],"10.20.20.0/24")+
   field("Network Security Group","text","security",[],"nsg-platform")+
   field("DDoS protection","select","ddos",["Disabled","Enabled"])+
   field("Private DNS","select","privateDns",["Disabled","Enabled"])+
   field("NAT Gateway","select","natGateway",["None","Create"])+
   field("Network Watcher","select","flowLogs",["Enabled","Disabled"]);
}

function gcpVpcForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Routing mode","select","routingMode",["REGIONAL","GLOBAL"])+
   field("Subnet mode","select","subnetMode",["CUSTOM","AUTO"])+
   field("Primary subnet CIDR","text","privateSubnet",[],"10.30.10.0/24")+
   field("Secondary range","text","secondaryCidr",[],"10.30.20.0/24")+
   field("Private Google Access","select","privateAccess",["Enabled","Disabled"])+
   field("Cloud NAT","select","natGateway",["None","Create"])+
   field("Firewall policy","text","security",[],"platform-firewall")+
   field("VPC Flow Logs","select","flowLogs",["Disabled","Enabled"])+
   field("MTU","select","mtu",["1460","1500"]);
}

function ociVcnForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("IPv4 CIDR","text","cidr",[],"10.40.0.0/16")+
   field("DNS label","text","dnsLabel",[],"platform")+
   field("Public subnet CIDR","text","publicSubnet",[],"10.40.10.0/24")+
   field("Private subnet CIDR","text","privateSubnet",[],"10.40.20.0/24")+
   field("Internet Gateway","select","internetGateway",["Create","None"])+
   field("NAT Gateway","select","natGateway",["Create","None"])+
   field("Service Gateway","select","serviceGateway",["Create","None"])+
   field("Network Security Group","text","security",[],"nsg-platform")+
   field("VCN Flow Logs","select","flowLogs",["Disabled","Enabled"]);
}


function awsEksForm(c){
 return commonFields(c)+
   field("Kubernetes version","select","k8sVersion",["1.34","1.33","1.32"])+
   field("VPC","text","network",[],"vpc-platform")+
   field("Private subnets","text","subnet",[],"private-a, private-b")+
   field("API endpoint access","select","apiAccess",["Public + Private","Private","Public"])+
   field("Node group name","text","nodePool",[],"platform-workers")+
   field("Node instance type","select","size",["t3.medium","t3.large","m6i.large","m6i.xlarge"])+
   field("Desired nodes","select","desiredNodes",["2","3","4","5"])+
   field("Minimum nodes","select","minNodes",["1","2","3"])+
   field("Maximum nodes","select","maxNodes",["3","5","10","20"])+
   field("Node disk (GiB)","select","disk",["20","40","80","100"])+
   field("Cluster IAM role","text","identity",[],"eks-platform-cluster-role")+
   field("Control plane logging","select","logging",["Enabled","Disabled"]);
}

function azureAksForm(c){
 return commonFields(c)+
   field("Subscription","text","subscription",[],"00000000-0000-0000-0000-000000000001")+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Kubernetes version","select","k8sVersion",["1.34","1.33","1.32"])+
   field("Cluster type","select","clusterType",["Standard","Automatic"])+
   field("System node pool","text","nodePool",[],"system")+
   field("VM size","select","size",["Standard_D2s_v5","Standard_D4s_v5","Standard_B4ms"])+
   field("Node count","select","desiredNodes",["2","3","4","5"])+
   field("Autoscaling","select","autoscaling",["Enabled","Disabled"])+
   field("Minimum nodes","select","minNodes",["1","2","3"])+
   field("Maximum nodes","select","maxNodes",["3","5","10","20"])+
   field("Virtual network","text","network",[],"vnet-platform")+
   field("AKS subnet","text","subnet",[],"snet-aks")+
   field("Network plugin","select","networkPlugin",["Azure CNI","kubenet"])+
   field("Network policy","select","networkPolicy",["Azure","Calico","None"])+
   field("API server","select","apiAccess",["Public","Private"])+
   field("Identity","select","identity",["System assigned","User assigned"])+
   field("Azure Monitor","select","logging",["Enabled","Disabled"]);
}

function gcpGkeForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Cluster mode","select","clusterType",["Standard","Autopilot"])+
   field("Release channel","select","releaseChannel",["REGULAR","STABLE","RAPID"])+
   field("Location type","select","locationType",["Regional","Zonal"])+
   field("Zone","select","zone",["europe-west1-b","europe-west1-c","europe-west4-a"])+
   field("VPC network","text","network",[],"vpc-platform")+
   field("Subnet","text","subnet",[],"subnet-gke")+
   field("Node pool","text","nodePool",[],"platform-workers")+
   field("Machine type","select","size",["e2-medium","e2-standard-2","n2-standard-2","n2-standard-4"])+
   field("Initial nodes","select","desiredNodes",["2","3","4","5"])+
   field("Autoscaling","select","autoscaling",["Enabled","Disabled"])+
   field("Minimum nodes","select","minNodes",["1","2","3"])+
   field("Maximum nodes","select","maxNodes",["3","5","10","20"])+
   field("Private nodes","select","privateNodes",["Enabled","Disabled"])+
   field("Control plane endpoint","select","apiAccess",["Public","Private"])+
   field("Workload Identity","select","identity",["Enabled","Disabled"])+
   field("Logging + Monitoring","select","logging",["Enabled","Disabled"]);
}

function ociOkeForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Cluster type","select","clusterType",["Enhanced","Basic"])+
   field("Kubernetes version","select","k8sVersion",["v1.34","v1.33","v1.32"])+
   field("VCN","text","network",[],"vcn-platform")+
   field("Kubernetes API subnet","text","apiSubnet",[],"subnet-api")+
   field("Worker subnet","text","subnet",[],"subnet-workers")+
   field("Load balancer subnet","text","lbSubnet",[],"subnet-lb")+
   field("API endpoint","select","apiAccess",["Private","Public"])+
   field("Node pool","text","nodePool",[],"platform-workers")+
   field("Node shape","select","size",["VM.Standard.E4.Flex","VM.Standard3.Flex","VM.Standard.E5.Flex"])+
   field("Node count","select","desiredNodes",["2","3","4","5"])+
   field("Boot volume (GiB)","select","disk",["50","100","200"])+
   field("Network Security Groups","select","security",["Enabled","Disabled"]);
}


/* ==================== STORAGE ==================== */

function awsS3Form(c){
 return commonFields(c)+
   field("Bucket name","text","bucket",[],"platform-lab-storage")+
   field("Versioning","select","versioning",["Enabled","Disabled"])+
   field("Encryption","select","encryption",["SSE-S3","SSE-KMS","None"])+
   field("Block public access","select","publicAccess",["Enabled","Disabled"])+
   field("Object ownership","select","ownership",["BucketOwnerEnforced","BucketOwnerPreferred","ObjectWriter"])+
   field("Lifecycle policy","select","lifecycle",["None","Standard → IA → Glacier","Delete after 90 days"])+
   field("Access logging","select","logging",["Disabled","Enabled"]);
}

function azureStorageForm(c){
 return commonFields(c)+
   field("Subscription","text","subscription",[],"00000000-0000-0000-0000-000000000001")+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Storage account name","text","storageAccount",[],"platformlabstorage")+
   field("Performance","select","performance",["Standard","Premium"])+
   field("Redundancy","select","redundancy",["LRS","ZRS","GRS","GZRS"])+
   field("Account kind","select","accountKind",["StorageV2","BlobStorage","BlockBlobStorage"])+
   field("Blob container","text","containerName",[],"platform-data")+
   field("Container access","select","publicAccess",["Private","Blob","Container"])+
   field("Secure transfer","select","secureTransfer",["Required","Disabled"])+
   field("Blob versioning","select","versioning",["Enabled","Disabled"]);
}

function gcpStorageForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Bucket name","text","bucket",[],"platform-lab-storage")+
   field("Location type","select","locationType",["Region","Dual-region","Multi-region"])+
   field("Storage class","select","storageClass",["STANDARD","NEARLINE","COLDLINE","ARCHIVE"])+
   field("Uniform bucket access","select","uniformAccess",["Enabled","Disabled"])+
   field("Public access prevention","select","publicAccess",["Enforced","Inherited"])+
   field("Object versioning","select","versioning",["Enabled","Disabled"])+
   field("Lifecycle","select","lifecycle",["None","Delete after 90 days","Move to Coldline"]);
}

function ociObjectStorageForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Bucket name","text","bucket",[],"platform-lab-storage")+
   field("Storage tier","select","storageClass",["Standard","Archive"])+
   field("Visibility","select","publicAccess",["NoPublicAccess","ObjectRead","ObjectReadWithoutList"])+
   field("Versioning","select","versioning",["Enabled","Disabled"])+
   field("Auto-tiering","select","autoTiering",["Disabled","InfrequentAccess"])+
   field("Object events","select","events",["Disabled","Enabled"]);
}


/* ==================== REGISTRY ==================== */

function awsEcrForm(c){
 return commonFields(c)+
   field("Repository name","text","repository",[],"platform/workloads")+
   field("Tag mutability","select","tagMutability",["IMMUTABLE","MUTABLE"])+
   field("Encryption","select","encryption",["AES256","KMS"])+
   field("Image scanning","select","scanning",["Scan on push","Disabled"])+
   field("Lifecycle policy","select","lifecycle",["Keep last 20 images","Keep last 50 images","None"]);
}

function azureAcrForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Registry name","text","repository",[],"platformlabacr")+
   field("SKU","select","sku",["Basic","Standard","Premium"])+
   field("Admin user","select","adminUser",["Disabled","Enabled"])+
   field("Public network access","select","publicAccess",["Enabled","Disabled"])+
   field("Zone redundancy","select","zoneRedundancy",["Disabled","Enabled"])+
   field("Retention policy","select","retention",["7 days","30 days","Disabled"]);
}

function gcpArtifactForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Repository ID","text","repository",[],"platform-images")+
   field("Format","select","format",["DOCKER","MAVEN","NPM","PYTHON","APT","YUM"])+
   field("Repository mode","select","repoMode",["STANDARD","REMOTE","VIRTUAL"])+
   field("Immutable tags","select","tagMutability",["Enabled","Disabled"])+
   field("Cleanup policy","select","lifecycle",["Keep last 20 versions","Delete untagged","None"]);
}

function ociRegistryForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Repository name","text","repository",[],"platform/workloads")+
   field("Access","select","publicAccess",["Private","Public"])+
   field("Immutable images","select","tagMutability",["Enabled","Disabled"])+
   field("Image scanning","select","scanning",["Enabled","Disabled"]);
}


/* ==================== SECRETS ==================== */

function awsSecretsForm(c){
 return commonFields(c)+
   field("Secret name","text","secretName",[],"platform/application")+
   field("Description","text","description",[],"Application secret managed by platform")+
   field("Encryption key","select","encryption",["aws/secretsmanager","Custom KMS key"])+
   field("Automatic rotation","select","rotation",["Disabled","30 days","60 days","90 days"])+
   field("Replica region","select","replica",["None","eu-central-1","us-east-1"]);
}

function azureKeyVaultForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Vault name","text","vaultName",[],"kv-platform-lab")+
   field("SKU","select","sku",["standard","premium"])+
   field("Permission model","select","permissionModel",["Azure RBAC","Vault access policy"])+
   field("Soft delete","select","softDelete",["Enabled","Disabled"])+
   field("Purge protection","select","purgeProtection",["Enabled","Disabled"])+
   field("Public network access","select","publicAccess",["Enabled","Disabled"])+
   field("Secret name","text","secretName",[],"application-secret");
}

function gcpSecretForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Secret ID","text","secretName",[],"application-secret")+
   field("Replication","select","replication",["Automatic","User managed"])+
   field("Rotation","select","rotation",["Disabled","30 days","60 days","90 days"])+
   field("Labels","text","labels",[],"environment=lab");
}

function ociVaultForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Vault name","text","vaultName",[],"platform-vault")+
   field("Vault type","select","vaultType",["DEFAULT","VIRTUAL_PRIVATE"])+
   field("Encryption key","text","keyName",[],"platform-master-key")+
   field("Key algorithm","select","algorithm",["AES","RSA","ECDSA"])+
   field("Secret name","text","secretName",[],"application-secret")+
   field("Rotation","select","rotation",["Disabled","30 days","90 days"]);
}


/* ==================== IDENTITY ==================== */

function awsIamForm(c){
 return commonFields(c)+
   field("Identity type","select","identityType",["Role","User","Group","Policy"])+
   field("Name","text","identityName",[],"platform-workload-role")+
   field("Trusted service","select","trustedService",["EC2","EKS","Lambda","None"])+
   field("Policy","select","policy",["ReadOnlyAccess","AmazonS3ReadOnlyAccess","Custom policy"])+
   field("Permissions boundary","select","boundary",["None","Custom boundary"])+
   field("Session duration","select","sessionDuration",["1 hour","4 hours","8 hours","12 hours"]);
}

function azureIdentityForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Identity name","text","identityName",[],"id-platform-workload")+
   field("Identity type","select","identityType",["User assigned managed identity","Service principal"])+
   field("RBAC scope","select","scope",["Resource group","Subscription","Resource"])+
   field("Role","select","role",["Reader","Contributor","Storage Blob Data Contributor","Custom role"]);
}

function gcpIamForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Principal type","select","identityType",["Service Account","User","Group"])+
   field("Service account ID","text","identityName",[],"platform-workload")+
   field("IAM role","select","role",["roles/viewer","roles/editor","roles/storage.objectViewer","Custom role"])+
   field("Scope","select","scope",["Project","Folder","Organization"])+
   field("Service account key","select","keyCreation",["Disabled","Create"]);
}

function ociIamForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Identity type","select","identityType",["Dynamic Group","Group","User","Policy"])+
   field("Name","text","identityName",[],"platform-workloads")+
   field("Policy verb","select","policyVerb",["inspect","read","use","manage"])+
   field("Resource family","select","resourceFamily",["all-resources","instance-family","object-family","cluster-family"])+
   field("Policy scope","select","scope",["Compartment","Tenancy"]);
}


/* ==================== AWS EXTENDED SERVICES ==================== */

function awsSecurityGroupForm(c){
 return commonFields(c)+
   field("VPC","text","network",[],"vpc-platform")+
   field("Description","text","description",[],"Platform workload security group")+
   field("Ingress protocol","select","protocol",["TCP","UDP","ICMP","All"])+
   field("Ingress port","text","port",[],"443")+
   field("Ingress source","text","source",[],"10.0.0.0/8")+
   field("Outbound access","select","egress",["Allow all","Restricted"]);
}

function awsElbForm(c){
 return commonFields(c)+
   field("Load balancer type","select","lbType",["Application","Network"])+
   field("Scheme","select","scheme",["internet-facing","internal"])+
   field("VPC","text","network",[],"vpc-platform")+
   field("Subnets","text","subnet",[],"public-a, public-b")+
   field("Listener protocol","select","protocol",["HTTPS","HTTP","TCP"])+
   field("Listener port","text","port",[],"443")+
   field("Target port","text","targetPort",[],"8080")+
   field("Health check","text","healthCheck",[],"/health");
}

function awsRdsForm(c){
 return commonFields(c)+
   field("Engine","select","engine",["PostgreSQL","MySQL","MariaDB"])+
   field("Instance class","select","size",["db.t4g.micro","db.t4g.small","db.m6g.large"])+
   field("Storage (GiB)","select","disk",["20","50","100","200"])+
   field("Multi-AZ","select","multiAz",["Disabled","Enabled"])+
   field("Subnet group","text","subnet",[],"db-private")+
   field("Encryption","select","encryption",["Enabled","Disabled"])+
   field("Backup retention","select","backup",["7 days","14 days","35 days"]);
}

function awsDynamoForm(c){
 return commonFields(c)+
   field("Table name","text","tableName",[],"platform-data")+
   field("Partition key","text","partitionKey",[],"id")+
   field("Billing mode","select","billingMode",["PAY_PER_REQUEST","PROVISIONED"])+
   field("Point-in-time recovery","select","backup",["Enabled","Disabled"])+
   field("Encryption","select","encryption",["Enabled","Disabled"]);
}

function awsLambdaForm(c){
 return commonFields(c)+
   field("Runtime","select","runtime",["python3.13","nodejs22.x","java21","provided.al2023"])+
   field("Architecture","select","architecture",["arm64","x86_64"])+
   field("Memory (MB)","select","memory",["128","256","512","1024","2048"])+
   field("Timeout (seconds)","select","timeout",["3","10","30","60","300"])+
   field("IAM role","text","identity",[],"lambda-platform-role")+
   field("VPC integration","select","vpcIntegration",["Disabled","Enabled"]);
}

function awsCloudWatchForm(c){
 return commonFields(c)+
   field("Component","select","monitorType",["Log Group","Metric Alarm","Dashboard"])+
   field("Retention","select","retention",["7 days","14 days","30 days","90 days"])+
   field("Metric","text","metric",[],"CPUUtilization")+
   field("Threshold","text","threshold",[],"80")+
   field("Notification target","text","notification",[],"platform-alerts");
}


/* ==================== AZURE EXTENDED SERVICES ==================== */

function azureResourceGroupForm(c){
 return commonFields(c)+
   field("Subscription","text","subscription",[],"00000000-0000-0000-0000-000000000001")+
   field("Tags","text","tags",[],"environment=lab,managed-by=opentofu");
}

function azureNsgForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Priority","text","priority",[],"100")+
   field("Direction","select","direction",["Inbound","Outbound"])+
   field("Access","select","access",["Allow","Deny"])+
   field("Protocol","select","protocol",["Tcp","Udp","Icmp","*"])+
   field("Source","text","source",[],"10.0.0.0/8")+
   field("Destination port","text","port",[],"443");
}

function azurePublicIpForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("SKU","select","sku",["Standard","Basic"])+
   field("Allocation","select","allocation",["Static","Dynamic"])+
   field("IP version","select","ipVersion",["IPv4","IPv6"])+
   field("Availability zone","select","zone",["Zone-redundant","1","2","3"]);
}

function azureContainerForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Image","text","image",[],"nginx:latest")+
   field("CPU","select","cpu",["1","2","4"])+
   field("Memory (GB)","select","memory",["1.5","2","4","8"])+
   field("OS type","select","osType",["Linux","Windows"])+
   field("Restart policy","select","restartPolicy",["Always","OnFailure","Never"]);
}

function azureContainerAppsForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Environment","text","environmentName",[],"cae-platform")+
   field("Image","text","image",[],"platform/app:latest")+
   field("CPU","select","cpu",["0.25","0.5","1","2"])+
   field("Memory","select","memory",["0.5Gi","1Gi","2Gi","4Gi"])+
   field("Minimum replicas","select","minNodes",["0","1","2"])+
   field("Maximum replicas","select","maxNodes",["1","3","5","10"])+
   field("Ingress","select","ingress",["External","Internal","Disabled"]);
}

function azureCosmosForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("API","select","api",["NoSQL","MongoDB","Cassandra","Gremlin","Table"])+
   field("Capacity mode","select","capacity",["Serverless","Provisioned throughput"])+
   field("Consistency","select","consistency",["Session","Eventual","Strong","Bounded Staleness"])+
   field("Geo redundancy","select","geo",["Disabled","Enabled"]);
}

function azureDatabaseForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Engine","text","engine",[],currentResource)+
   field("Compute tier","select","size",["Burstable","General Purpose","Memory Optimized"])+
   field("Storage (GiB)","select","disk",["32","64","128","256"])+
   field("High availability","select","ha",["Disabled","Zone redundant"])+
   field("Backup retention","select","backup",["7 days","14 days","35 days"]);
}

function azureRedisForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("SKU","select","sku",["Basic","Standard","Premium"])+
   field("Capacity","select","capacity",["C0","C1","C2","C3"])+
   field("TLS","select","tls",["Required","Optional"])+
   field("Public access","select","publicAccess",["Enabled","Disabled"]);
}

function azureMessagingForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Namespace","text","namespace",[],"platform-messaging")+
   field("SKU","select","sku",["Basic","Standard","Premium"])+
   field("Entity name","text","entityName",[],"platform-events")+
   field("Partitions","select","partitions",["1","2","4","8"]);
}

function azureApiManagementForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("SKU","select","sku",["Consumption","Developer","Basic","Standard","Premium"])+
   field("Publisher name","text","publisher",[],"Platform Engineering")+
   field("Protocol","select","protocol",["HTTPS","HTTP"])+
   field("Backend URL","text","backend",[],"https://backend.internal");
}

function azureMonitorForm(c){
 return commonFields(c)+
   field("Resource group","text","resourceGroup",[],"rg-multicloud-lab")+
   field("Component","select","monitorType",["Log Analytics Workspace","Metric Alert","Action Group"])+
   field("Retention","select","retention",["30 days","90 days","180 days"])+
   field("Metric","text","metric",[],"Percentage CPU")+
   field("Threshold","text","threshold",[],"80");
}


/* ==================== GCP EXTENDED SERVICES ==================== */

function gcpFirewallForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("VPC","text","network",[],"vpc-platform")+
   field("Direction","select","direction",["INGRESS","EGRESS"])+
   field("Action","select","action",["ALLOW","DENY"])+
   field("Protocol","select","protocol",["tcp","udp","icmp","all"])+
   field("Ports","text","port",[],"443")+
   field("Source ranges","text","source",[],"10.0.0.0/8")+
   field("Priority","text","priority",[],"1000");
}

function gcpLoadBalancerForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Type","select","lbType",[
     "External Application",
     "Internal Application",
     "External Network",
     "Internal Network"
   ])+
   field("Protocol","select","protocol",["HTTPS","HTTP","TCP"])+
   field("Backend","text","backend",[],"platform-backend")+
   field("Health check","text","healthCheck",[],"/health")+
   field("Frontend port","text","port",[],"443");
}

function gcpSqlForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Engine","select","engine",["PostgreSQL","MySQL","SQL Server"])+
   field("Machine tier","select","size",[
     "db-f1-micro",
     "db-g1-small",
     "db-custom-2-7680"
   ])+
   field("Storage (GB)","select","disk",["10","50","100","250"])+
   field("Availability","select","ha",["Zonal","Regional"])+
   field("Automated backups","select","backup",["Enabled","Disabled"])+
   field("Private IP","select","privateIp",["Enabled","Disabled"]);
}

function gcpFunctionsForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Runtime","select","runtime",[
     "python313",
     "nodejs22",
     "java21",
     "go123"
   ])+
   field("Memory","select","memory",["256Mi","512Mi","1Gi","2Gi"])+
   field("Timeout","select","timeout",["60s","300s","540s"])+
   field("Trigger","select","trigger",["HTTP","Pub/Sub","Cloud Storage"])+
   field("Ingress","select","ingress",["Allow all","Internal only"]);
}

function gcpPubSubForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Topic name","text","topic",[],"platform-events")+
   field("Subscription","text","subscriptionName",[],"platform-consumer")+
   field("Message retention","select","retention",[
     "1 day",
     "7 days",
     "31 days"
   ])+
   field("Message ordering","select","ordering",["Disabled","Enabled"]);
}

function gcpMonitoringForm(c){
 return commonFields(c)+
   field("Project","text","project",[],"multicloud-platform-lab")+
   field("Component","select","monitorType",[
     "Alert Policy",
     "Dashboard",
     "Log Metric"
   ])+
   field(
     "Metric",
     "text",
     "metric",
     [],
     "compute.googleapis.com/instance/cpu/utilization"
   )+
   field("Threshold","text","threshold",[],"0.8")+
   field("Notification channel","text","notification",[],"platform-alerts");
}


/* ==================== OCI EXTENDED SERVICES ==================== */

function ociSubnetForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("VCN","text","network",[],"vcn-platform")+
   field("CIDR","text","cidr",[],"10.40.10.0/24")+
   field("Type","select","subnetType",["Private","Public"])+
   field("DNS label","text","dnsLabel",[],"workload")+
   field("Route table","text","routeTable",[],"rt-platform")+
   field("Security list","text","securityList",[],"sl-platform");
}

function ociNsgForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("VCN","text","network",[],"vcn-platform")+
   field("Direction","select","direction",["INGRESS","EGRESS"])+
   field("Protocol","select","protocol",["TCP","UDP","ICMP","All"])+
   field("Source / Destination","text","source",[],"10.0.0.0/8")+
   field("Port","text","port",[],"443")+
   field("Stateless","select","stateless",["Disabled","Enabled"]);
}

function ociLoadBalancerForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Shape","select","lbShape",["flexible","10Mbps","100Mbps"])+
   field("Visibility","select","visibility",["Public","Private"])+
   field("Subnet","text","subnet",[],"subnet-public")+
   field("Listener protocol","select","protocol",["HTTP","HTTPS","TCP"])+
   field("Listener port","text","port",[],"443")+
   field("Backend port","text","targetPort",[],"8080")+
   field("Health check","text","healthCheck",[],"/health");
}

function ociBlockVolumeForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Availability domain","select","zone",["AD-1","AD-2","AD-3"])+
   field("Size (GB)","select","disk",["50","100","250","500","1024"])+
   field("Performance","select","performance",[
     "Lower Cost",
     "Balanced",
     "Higher Performance"
   ])+
   field("Encryption","select","encryption",[
     "Oracle-managed key",
     "Customer-managed key"
   ])+
   field("Backup policy","select","backup",[
     "None",
     "Bronze",
     "Silver",
     "Gold"
   ]);
}

function ociDatabaseForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Workload type","select","workload",[
     "Transaction Processing",
     "Data Warehouse",
     "JSON"
   ])+
   field("Database version","select","dbVersion",["23ai","19c"])+
   field("Compute model","select","computeModel",[
     "ECPU",
     "OCPU"
   ])+
   field("Compute count","select","cpu",["1","2","4","8"])+
   field("Storage (TB)","select","storage",["1","2","4","8"])+
   field("Auto scaling","select","autoscaling",["Enabled","Disabled"])+
   field("Network access","select","networkAccess",[
     "Private endpoint",
     "Secure access from everywhere"
   ]);
}

function ociMonitoringForm(c){
 return commonFields(c)+
   field("Compartment","text","compartment",[],"platform-lab")+
   field("Component","select","monitorType",[
     "Alarm",
     "Service Connector",
     "Logging"
   ])+
   field("Namespace","text","namespace",[],"oci_computeagent")+
   field("Metric","text","metric",[],"CpuUtilization")+
   field("Statistic","select","statistic",[
     "Mean",
     "Max",
     "Min",
     "Sum"
   ])+
   field("Threshold","text","threshold",[],"80")+
   field("Destination","text","notification",[],"platform-alerts");
}

function genericForm(c){
 return commonFields(c)+
   field("Environment","select","environment",["lab","development","staging","production"])+
   field("Managed by","text","managed",[],"OpenTofu");
}

function value(id){
 const el=document.getElementById(id);
 return el ? el.value : "";
}


const pricingCatalog = {
  metadata:{
    currency:"EUR",
    monthlyHours:730,
    status:"bootstrap",
    updated:"2026-09-22"
  },

  /*
   * IMPORTANT:
   *
   * Prices are NOT guessed.
   *
   * Entries will be added only from provider pricing sources,
   * with region, SKU/shape and assumptions recorded explicitly.
   *
   * Local execution remains €0 because resources run in Floci.
   */
  aws:{},
  azure:{},
  gcp:{},

  oci:{
    /*
     * OCI Flex shapes are priced from OCPU + memory.
     * We will activate these calculations when the builder exposes
     * OCPU and RAM explicitly.
     */
    "VM.Standard.E4.Flex":{
      sourceCurrency:"USD",
      ocpuHour:0.032765,
      memoryGbHour:0.0019659,
      source:"Oracle Cloud public pricing"
    },
    "VM.Standard.E5.Flex":{
      sourceCurrency:"USD",
      ocpuHour:0.039318,
      memoryGbHour:0.0026212,
      source:"Oracle Cloud public pricing"
    },
    "VM.Standard3.Flex":{
      sourceCurrency:"USD",
      ocpuHour:0.052424,
      memoryGbHour:0.0019659,
      source:"Oracle Cloud public pricing"
    }
  }
};

function euro(n){
  if(n===null || n===undefined || Number.isNaN(n))
    return "—";

  return new Intl.NumberFormat("en-IE",{
    style:"currency",
    currency:"EUR",
    minimumFractionDigits:n < 1 ? 4 : 2,
    maximumFractionDigits:n < 1 ? 4 : 2
  }).format(n);
}

function updateCostEstimate(){
  const region=value("region") || "—";

  const regionEl=document.getElementById("costRegion");
  const hourlyEl=document.getElementById("costHourly");
  const monthlyEl=document.getElementById("costMonthly");
  const catalogEl=document.getElementById("costCatalog");
  const modelEl=document.getElementById("costModel");
  const noteEl=document.getElementById("costNote");

  if(!regionEl) return;

  regionEl.textContent=region;
  modelEl.textContent="On-demand";
  hourlyEl.textContent="—";
  monthlyEl.textContent="—";
  catalogEl.textContent="Pending price catalog";

  noteEl.textContent=
    "No estimate is shown unless the selected provider, region and "+
    "resource have an explicit pricing entry. Local Floci execution remains €0.";

  /*
   * OCI Flex:
   * catalog exists, but OCPU/RAM are not yet explicit builder inputs.
   * Therefore we deliberately do NOT calculate a misleading value.
   */
  if(
    currentCloud==="oci" &&
    currentResource==="Compute" &&
    pricingCatalog.oci[value("size")]
  ){
    const price=pricingCatalog.oci[value("size")];
    const ocpus=Number(value("ocpus"));
    const memory=Number(value("memoryGb"));

    if(ocpus > 0 && memory > 0){
      const hourlyUSD =
        (ocpus * price.ocpuHour) +
        (memory * price.memoryGbHour);

      const monthlyUSD =
        hourlyUSD * pricingCatalog.metadata.monthlyHours;

      hourlyEl.textContent =
        "$" + hourlyUSD.toFixed(4) + " USD";

      monthlyEl.textContent =
        "$" + monthlyUSD.toFixed(2) + " USD";

      catalogEl.textContent =
        price.source + " · " + pricingCatalog.metadata.updated;

      modelEl.textContent = "On-demand Flex";

      noteEl.textContent =
        ocpus + " OCPU + " + memory + " GB RAM · " +
        pricingCatalog.metadata.monthlyHours +
        " hours/month. Estimate excludes boot volume, traffic, taxes and discounts.";

      return;
    }
  }

  if(
    currentCloud==="oci" &&
    currentResource==="Compute" &&
    value("size")==="VM.Standard.E2.1.Micro"
  ){
    modelEl.textContent="Fixed shape";
    catalogEl.textContent="Price entry pending";

    noteEl.textContent=
      "VM.Standard.E2.1.Micro is a fixed shape. Flex OCPU/RAM selections "+
      "do not apply to this shape.";

    return;
  }

  /*
   * Provider calculators are populated incrementally from official
   * pricing sources. Unknown combinations remain intentionally N/A.
   */
}

function generatePreview(){
 const preview=document.getElementById("tofuPreview");
 if(!preview) return;

 updateCostEstimate();

 const name=value("resourceName") || "platform-lab";




/* ==================== STORAGE PREVIEWS ==================== */

 if(currentCloud==="aws" && currentResource==="S3"){
   preview.textContent =
`# AWS / S3

resource "aws_s3_bucket" "storage" {
  bucket = "${value("bucket")}"

  tags = {
    Name = "${name}"
  }
}

resource "aws_s3_bucket_versioning" "storage" {
  bucket = aws_s3_bucket.storage.id

  versioning_configuration {
    status = "${value("versioning")==="Enabled" ? "Enabled" : "Suspended"}"
  }
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Storage Accounts"){
   preview.textContent =
`# Azure / Storage Account

resource "azurerm_storage_account" "storage" {
  name                     = "${value("storageAccount")}"
  resource_group_name      = "${value("resourceGroup")}"
  location                 = "${value("region")}"
  account_tier             = "${value("performance")}"
  account_replication_type = "${value("redundancy")}"
  account_kind             = "${value("accountKind")}"
}

resource "azurerm_storage_container" "data" {
  name                  = "${value("containerName")}"
  storage_account_id    = azurerm_storage_account.storage.id
  container_access_type = "${value("publicAccess").toLowerCase()}"
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Cloud Storage"){
   preview.textContent =
`# Google Cloud / Cloud Storage

resource "google_storage_bucket" "storage" {
  name          = "${value("bucket")}"
  location      = "${value("region")}"
  storage_class = "${value("storageClass")}"

  uniform_bucket_level_access =
    ${value("uniformAccess")==="Enabled"}

  versioning {
    enabled = ${value("versioning")==="Enabled"}
  }
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Object Storage"){
   preview.textContent =
`# OCI / Object Storage

resource "oci_objectstorage_bucket" "storage" {
  compartment_id = "${value("compartment")}"
  name           = "${value("bucket")}"
  storage_tier   = "${value("storageClass")}"
  access_type    = "${value("publicAccess")}"
  versioning     = "${value("versioning")==="Enabled" ? "Enabled" : "Disabled"}"
}`;
   return;
 }


/* ==================== REGISTRY PREVIEWS ==================== */

 if(currentCloud==="aws" && currentResource==="ECR"){
   preview.textContent =
`# AWS / Elastic Container Registry

resource "aws_ecr_repository" "registry" {
  name                 = "${value("repository")}"
  image_tag_mutability = "${value("tagMutability")}"

  image_scanning_configuration {
    scan_on_push = ${value("scanning")==="Scan on push"}
  }

  encryption_configuration {
    encryption_type = "${value("encryption")}"
  }
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Container Registry"){
   preview.textContent =
`# Azure / Container Registry

resource "azurerm_container_registry" "registry" {
  name                = "${value("repository")}"
  resource_group_name = "${value("resourceGroup")}"
  location            = "${value("region")}"
  sku                 = "${value("sku")}"
  admin_enabled       = ${value("adminUser")==="Enabled"}
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Artifact Registry"){
   preview.textContent =
`# Google Cloud / Artifact Registry

resource "google_artifact_registry_repository" "registry" {
  location      = "${value("region")}"
  repository_id = "${value("repository")}"
  format        = "${value("format")}"
  mode          = "${value("repoMode")}_REPOSITORY"
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Container Registry"){
   preview.textContent =
`# OCI / Container Registry

resource "oci_artifacts_container_repository" "registry" {
  compartment_id = "${value("compartment")}"
  display_name   = "${value("repository")}"
  is_public      = ${value("publicAccess")==="Public"}
  is_immutable   = ${value("tagMutability")==="Enabled"}
}`;
   return;
 }


/* ==================== SECRET PREVIEWS ==================== */

 if(currentCloud==="aws" && currentResource==="Secrets Manager"){
   preview.textContent =
`# AWS / Secrets Manager

resource "aws_secretsmanager_secret" "application" {
  name        = "${value("secretName")}"
  description = "${value("description")}"
}

# Secret VALUE is intentionally not embedded in IaC.`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Key Vault"){
   preview.textContent =
`# Azure / Key Vault

resource "azurerm_key_vault" "platform" {
  name                = "${value("vaultName")}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  sku_name            = "${value("sku")}"

  purge_protection_enabled =
    ${value("purgeProtection")==="Enabled"}

  enable_rbac_authorization =
    ${value("permissionModel")==="Azure RBAC"}
}

# Secret VALUE is intentionally not embedded in IaC.`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Secret Manager"){
   preview.textContent =
`# Google Cloud / Secret Manager

resource "google_secret_manager_secret" "application" {
  secret_id = "${value("secretName")}"

  replication {
    auto {}
  }
}

# Secret VALUE is intentionally not embedded in IaC.`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Vault"){
   preview.textContent =
`# OCI / Vault

resource "oci_kms_vault" "platform" {
  compartment_id = "${value("compartment")}"
  display_name   = "${value("vaultName")}"
  vault_type     = "${value("vaultType")}"
}

resource "oci_kms_key" "platform" {
  display_name = "${value("keyName")}"
  key_shape {
    algorithm = "${value("algorithm")}"
  }
}

# Secret VALUE is intentionally not embedded in IaC.`;
   return;
 }


/* ==================== IDENTITY PREVIEWS ==================== */

 if(currentCloud==="aws" && currentResource==="IAM"){
   preview.textContent =
`# AWS / IAM

resource "aws_iam_role" "workload" {
  name = "${value("identityName")}"

  # Trust relationship:
  # ${value("trustedService")}
}

# Policy: ${value("policy")}
# Session duration: ${value("sessionDuration")}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Managed Identities"){
   preview.textContent =
`# Azure / Managed Identity

resource "azurerm_user_assigned_identity" "workload" {
  name                = "${value("identityName")}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
}

resource "azurerm_role_assignment" "workload" {
  scope                = "${value("scope")}"
  role_definition_name = "${value("role")}"
  principal_id         = azurerm_user_assigned_identity.workload.principal_id
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Cloud IAM"){
   preview.textContent =
`# Google Cloud / IAM

resource "google_service_account" "workload" {
  account_id   = "${value("identityName")}"
  display_name = "${name}"
}

resource "google_project_iam_member" "workload" {
  project = "${value("project")}"
  role    = "${value("role")}"
  member  = "serviceAccount:\${google_service_account.workload.email}"
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="IAM"){
   preview.textContent =
`# OCI / IAM

resource "oci_identity_dynamic_group" "workload" {
  compartment_id = "${value("compartment")}"
  name           = "${value("identityName")}"
  description    = "Platform workload identity"
  matching_rule  = "ALL {instance.compartment.id = '${value("compartment")}'}"
}

resource "oci_identity_policy" "workload" {
  compartment_id = "${value("compartment")}"
  name           = "${value("identityName")}-policy"

  statements = [
    "Allow dynamic-group ${value("identityName")} to ${value("policyVerb")} ${value("resourceFamily")} in compartment ${value("compartment")}"
  ]
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="EKS"){
   preview.textContent =
`# AWS / Elastic Kubernetes Service

resource "aws_eks_cluster" "platform" {
  name     = "${name}"
  version  = "${value("k8sVersion")}"
  role_arn = "${value("identity")}"

  vpc_config {
    subnet_ids              = ["${value("subnet")}"]
    endpoint_public_access  = ${value("apiAccess")!=="Private"}
    endpoint_private_access = ${value("apiAccess")!=="Public"}
  }
}

resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.platform.name
  node_group_name = "${value("nodePool")}"
  instance_types  = ["${value("size")}"]
  disk_size       = ${value("disk")}

  scaling_config {
    desired_size = ${value("desiredNodes")}
    min_size     = ${value("minNodes")}
    max_size     = ${value("maxNodes")}
  }
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="AKS"){
   preview.textContent =
`# Azure / Kubernetes Service

resource "azurerm_kubernetes_cluster" "platform" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  kubernetes_version  = "${value("k8sVersion")}"

  private_cluster_enabled = ${value("apiAccess")==="Private"}

  default_node_pool {
    name                = "${value("nodePool")}"
    vm_size             = "${value("size")}"
    node_count          = ${value("desiredNodes")}
    auto_scaling_enabled = ${value("autoscaling")==="Enabled"}
    min_count           = ${value("minNodes")}
    max_count           = ${value("maxNodes")}
    vnet_subnet_id      = "${value("subnet")}"
  }

  identity {
    type = "${value("identity")==="System assigned" ? "SystemAssigned" : "UserAssigned"}"
  }

  network_profile {
    network_plugin = "${value("networkPlugin")==="Azure CNI" ? "azure" : "kubenet"}"
  }
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="GKE"){
   preview.textContent =
`# Google Cloud / Kubernetes Engine

resource "google_container_cluster" "platform" {
  name     = "${name}"
  location = "${value("locationType")==="Regional" ? value("region") : value("zone")}"

  network    = "${value("network")}"
  subnetwork = "${value("subnet")}"

  release_channel {
    channel = "${value("releaseChannel")}"
  }

  private_cluster_config {
    enable_private_nodes = ${value("privateNodes")==="Enabled"}
  }

  remove_default_node_pool = true
  initial_node_count       = 1
}

resource "google_container_node_pool" "workers" {
  name       = "${value("nodePool")}"
  cluster    = google_container_cluster.platform.name
  node_count = ${value("desiredNodes")}

  node_config {
    machine_type = "${value("size")}"
  }

  autoscaling {
    min_node_count = ${value("minNodes")}
    max_node_count = ${value("maxNodes")}
  }
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="OKE"){
   preview.textContent =
`# OCI / Container Engine for Kubernetes

resource "oci_containerengine_cluster" "platform" {
  name           = "${name}"
  compartment_id = "${value("compartment")}"
  vcn_id         = "${value("network")}"
  kubernetes_version = "${value("k8sVersion")}"

  endpoint_config {
    is_public_ip_enabled = ${value("apiAccess")==="Public"}
    subnet_id            = "${value("apiSubnet")}"
  }
}

resource "oci_containerengine_node_pool" "workers" {
  name           = "${value("nodePool")}"
  compartment_id = "${value("compartment")}"
  cluster_id     = oci_containerengine_cluster.platform.id
  node_shape     = "${value("size")}"
  kubernetes_version = "${value("k8sVersion")}"
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="VPC"){
   preview.textContent =
`# AWS / VPC
resource "aws_vpc" "platform" {
  cidr_block           = "${value("cidr")}"
  instance_tenancy     = "${value("tenancy")}"
  enable_dns_support   = ${value("dnsSupport")==="Enabled"}
  enable_dns_hostnames = ${value("dnsHostnames")==="Enabled"}

  tags = {
    Name = "${name}"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.platform.id
  cidr_block = "${value("publicSubnet")}"
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.platform.id
  cidr_block = "${value("privateSubnet")}"
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Virtual Networks"){
   preview.textContent =
`# Azure / Virtual Network
resource "azurerm_virtual_network" "platform" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  address_space       = ["${value("cidr")}"]
}

resource "azurerm_subnet" "workloads" {
  name                 = "snet-workloads"
  resource_group_name  = "${value("resourceGroup")}"
  virtual_network_name = azurerm_virtual_network.platform.name
  address_prefixes     = ["${value("privateSubnet")}"]
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="VPC Network"){
   preview.textContent =
`# Google Cloud / VPC
resource "google_compute_network" "platform" {
  name                    = "${name}"
  auto_create_subnetworks = ${value("subnetMode")==="AUTO"}
  routing_mode            = "${value("routingMode")}"
  mtu                     = ${value("mtu")}
}

resource "google_compute_subnetwork" "workloads" {
  name          = "subnet-workloads"
  network       = google_compute_network.platform.id
  ip_cidr_range = "${value("privateSubnet")}"
  region        = "${value("region")}"
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="VCN"){
   preview.textContent =
`# OCI / Virtual Cloud Network
resource "oci_core_vcn" "platform" {
  compartment_id = "${value("compartment")}"
  display_name   = "${name}"
  cidr_blocks    = ["${value("cidr")}"]
  dns_label      = "${value("dnsLabel")}"
}

resource "oci_core_subnet" "private" {
  vcn_id         = oci_core_vcn.platform.id
  cidr_block     = "${value("privateSubnet")}"
  display_name   = "subnet-workloads"
  compartment_id = "${value("compartment")}"
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="EC2"){
   preview.textContent =
`# AWS / EC2
resource "aws_instance" "workload" {
  ami           = "${value("image")}"
  instance_type = "${value("size")}"

  subnet_id              = "${value("subnet")}"
  vpc_security_group_ids = ["${value("security")}"]
  key_name               = "${value("ssh")}"

  root_block_device {
    volume_size = ${value("disk")}
  }

  tags = {
    Name = "${name}"
  }
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Virtual Machines"){
   preview.textContent =
`# Azure / Virtual Machine
resource "azurerm_linux_virtual_machine" "workload" {
  name                = "${name}"
  resource_group_name = "${value("resourceGroup")}"
  location            = "${value("region")}"
  size                = "${value("size")}"

  network_interface_ids = [
    azurerm_network_interface.workload.id
  ]

  os_disk {
    disk_size_gb = ${value("disk")}
    caching      = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  identity {
    type = "${value("identity")==="System assigned" ? "SystemAssigned" : "None"}"
  }
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Compute Engine"){
   preview.textContent =
`# Google Cloud / Compute Engine
resource "google_compute_instance" "workload" {
  name         = "${name}"
  machine_type = "${value("size")}"
  zone         = "${value("zone")}"

  boot_disk {
    initialize_params {
      image = "${value("image")}"
      size  = ${value("disk")}
    }
  }

  network_interface {
    network    = "${value("network")}"
    subnetwork = "${value("subnet")}"
  }
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Compute"){
   preview.textContent =
`# OCI / Compute
resource "oci_core_instance" "workload" {
  display_name        = "${name}"
  availability_domain = "${value("zone")}"
  shape               = "${value("size")}"

  create_vnic_details {
    subnet_id        = "${value("subnet")}"
    assign_public_ip = ${value("publicip")==="Enabled"}
  }

  source_details {
    source_type = "image"
    source_id   = "${value("image")}"
  }
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="Security Groups"){
   preview.textContent =
`# AWS / Security Group
resource "aws_security_group" "workload" {
  name        = "${name}"
  description = "${value("description")}"
  vpc_id      = "${value("network")}"

  ingress {
    protocol    = "${value("protocol").toLowerCase()}"
    from_port   = ${value("port") || 0}
    to_port     = ${value("port") || 0}
    cidr_blocks = ["${value("source")}"]
  }
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="Elastic Load Balancing"){
   preview.textContent =
`# AWS / Elastic Load Balancing
resource "aws_lb" "workload" {
  name               = "${name}"
  internal           = ${value("scheme")==="internal"}
  load_balancer_type = "${value("lbType")==="Network" ? "network" : "application"}"
  subnets            = ["${value("subnet").split(",").map(x=>x.trim()).join('", "')}"]
}

resource "aws_lb_target_group" "workload" {
  name     = "${name}-targets"
  port     = ${value("targetPort")}
  protocol = "${value("protocol")==="HTTPS" ? "HTTP" : value("protocol")}"
  vpc_id   = "${value("network")}"
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="RDS"){
   preview.textContent =
`# AWS / RDS
resource "aws_db_instance" "workload" {
  identifier        = "${name}"
  engine            = "${value("engine").toLowerCase()}"
  instance_class    = "${value("size")}"
  allocated_storage = ${value("disk")}
  multi_az          = ${value("multiAz")==="Enabled"}
  storage_encrypted = ${value("encryption")==="Enabled"}

  backup_retention_period = ${parseInt(value("backup")) || 7}

  username = "platform_admin"
  password = var.database_password

  skip_final_snapshot = true
}

variable "database_password" {
  type      = string
  sensitive = true
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="DynamoDB"){
   preview.textContent =
`# AWS / DynamoDB
resource "aws_dynamodb_table" "workload" {
  name         = "${value("tableName") || name}"
  billing_mode = "${value("billingMode")}"
  hash_key     = "${value("partitionKey")}"

  attribute {
    name = "${value("partitionKey")}"
    type = "S"
  }

  point_in_time_recovery {
    enabled = ${value("backup")==="Enabled"}
  }
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="Lambda"){
   preview.textContent =
`# AWS / Lambda
resource "aws_lambda_function" "workload" {
  function_name = "${name}"
  role          = "${value("identity")}"
  runtime       = "${value("runtime")}"
  handler       = "app.handler"
  architectures = ["${value("architecture")}"]
  memory_size   = ${value("memory")}
  timeout       = ${value("timeout")}

  filename = "function.zip"
}`;
   return;
 }

 if(currentCloud==="aws" && currentResource==="CloudWatch"){
   preview.textContent =
`# AWS / CloudWatch
resource "aws_cloudwatch_metric_alarm" "workload" {
  alarm_name          = "${name}"
  namespace           = "AWS/EC2"
  metric_name         = "${value("metric")}"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  comparison_operator = "GreaterThanThreshold"
  threshold           = ${value("threshold")}
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Resource Groups"){
   preview.textContent =
`# Azure / Resource Group
resource "azurerm_resource_group" "workload" {
  name     = "${name}"
  location = "${value("region")}"
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Network Security Groups"){
   preview.textContent =
`# Azure / Network Security Group
resource "azurerm_network_security_group" "workload" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"

  security_rule {
    name                       = "${name}-rule"
    priority                   = ${value("priority")}
    direction                  = "${value("direction")}"
    access                     = "${value("access")}"
    protocol                   = "${value("protocol")}"
    source_port_range          = "*"
    destination_port_range     = "${value("port")}"
    source_address_prefix      = "${value("source")}"
    destination_address_prefix = "*"
  }
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Public IP addresses"){
   preview.textContent =
`# Azure / Public IP
resource "azurerm_public_ip" "workload" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  allocation_method   = "${value("allocation")}"
  sku                 = "${value("sku")}"
  ip_version          = "${value("ipVersion")}"
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Container Instances"){
   preview.textContent =
`# Azure / Container Instance
resource "azurerm_container_group" "workload" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  os_type             = "${value("osType")}"
  restart_policy      = "${value("restartPolicy")}"

  container {
    name   = "${name}"
    image  = "${value("image")}"
    cpu    = "${value("cpu")}"
    memory = "${value("memory")}"
  }
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Container Apps"){
   preview.textContent =
`# Azure / Container App
resource "azurerm_container_app" "workload" {
  name                         = "${name}"
  resource_group_name          = "${value("resourceGroup")}"
  container_app_environment_id = "\${azurerm_container_app_environment.workload.id}"
  revision_mode                = "Single"

  template {
    min_replicas = ${value("minNodes")}
    max_replicas = ${value("maxNodes")}

    container {
      name   = "${name}"
      image  = "${value("image")}"
      cpu    = ${value("cpu")}
      memory = "${value("memory")}"
    }
  }
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Cosmos DB"){
   preview.textContent =
`# Azure / Cosmos DB
resource "azurerm_cosmosdb_account" "workload" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  offer_type          = "Standard"
  kind                = "${value("api")==="MongoDB" ? "MongoDB" : "GlobalDocumentDB"}"

  consistency_policy {
    consistency_level = "${value("consistency")}"
  }

  geo_location {
    location          = "${value("region")}"
    failover_priority = 0
  }
}`;
   return;
 }

 if(currentCloud==="azure" &&
   (currentResource==="PostgreSQL" || currentResource==="MySQL")){
   const dbResource = currentResource==="PostgreSQL"
     ? "azurerm_postgresql_flexible_server"
     : "azurerm_mysql_flexible_server";

   preview.textContent =
`# Azure / ${currentResource}
resource "${dbResource}" "workload" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"

  administrator_login    = "platformadmin"
  administrator_password = var.database_password

  storage_mb = ${parseInt(value("disk")) * 1024}

  backup_retention_days = ${parseInt(value("backup")) || 7}
}

variable "database_password" {
  type      = string
  sensitive = true
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Redis"){
   preview.textContent =
`# Azure / Redis
resource "azurerm_redis_cache" "workload" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  capacity            = ${parseInt((value("capacity") || "C0").replace("C",""))}
  family              = "${value("sku")==="Premium" ? "P" : "C"}"
  sku_name            = "${value("sku")}"
  non_ssl_port_enabled = false
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Event Hubs"){
   preview.textContent =
`# Azure / Event Hubs
resource "azurerm_eventhub_namespace" "workload" {
  name                = "${value("namespace")}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  sku                 = "${value("sku")}"
  capacity            = 1
}

resource "azurerm_eventhub" "workload" {
  name              = "${value("entityName")}"
  namespace_id      = azurerm_eventhub_namespace.workload.id
  partition_count   = ${value("partitions")}
  message_retention = 1
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Service Bus"){
   preview.textContent =
`# Azure / Service Bus
resource "azurerm_servicebus_namespace" "workload" {
  name                = "${value("namespace")}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  sku                 = "${value("sku")}"
}

resource "azurerm_servicebus_queue" "workload" {
  name         = "${value("entityName")}"
  namespace_id = azurerm_servicebus_namespace.workload.id
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="API Management"){
   preview.textContent =
`# Azure / API Management
resource "azurerm_api_management" "workload" {
  name                = "${name}"
  location            = "${value("region")}"
  resource_group_name = "${value("resourceGroup")}"
  publisher_name      = "${value("publisher")}"
  publisher_email     = "platform@example.invalid"
  sku_name            = "${value("sku")}_1"
}`;
   return;
 }

 if(currentCloud==="azure" && currentResource==="Azure Monitor"){
   preview.textContent =
`# Azure / Monitor
resource "azurerm_monitor_metric_alert" "workload" {
  name                = "${name}"
  resource_group_name = "${value("resourceGroup")}"
  scopes              = []

  criteria {
    metric_namespace = "Microsoft.Compute/virtualMachines"
    metric_name      = "${value("metric")}"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = ${value("threshold")}
  }
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Firewall"){
   preview.textContent =
`# Google Cloud / Firewall
resource "google_compute_firewall" "workload" {
  name      = "${name}"
  network   = "${value("network")}"
  direction = "${value("direction")}"
  priority  = ${value("priority")}

  ${value("action")==="DENY" ? "deny" : "allow"} {
    protocol = "${value("protocol")}"
    ports    = ["${value("port")}"]
  }

  source_ranges = ["${value("source")}"]
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Cloud Load Balancing"){
   preview.textContent =
`# Google Cloud / Load Balancing
resource "google_compute_health_check" "workload" {
  name = "${name}-health"

  http_health_check {
    request_path = "${value("healthCheck")}"
    port         = ${value("port")}
  }
}

resource "google_compute_backend_service" "workload" {
  name          = "${name}-backend"
  protocol      = "${value("protocol")==="HTTPS" ? "HTTPS" : "HTTP"}"
  health_checks = [google_compute_health_check.workload.id]
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Cloud SQL"){
   const engine =
     value("engine")==="PostgreSQL" ? "POSTGRES_17" :
     value("engine")==="MySQL" ? "MYSQL_8_0" :
     "SQLSERVER_2022_STANDARD";

   preview.textContent =
`# Google Cloud / Cloud SQL
resource "google_sql_database_instance" "workload" {
  name             = "${name}"
  region           = "${value("region")}"
  database_version = "${engine}"

  settings {
    tier              = "${value("size")}"
    availability_type = "${value("ha")==="Regional" ? "REGIONAL" : "ZONAL"}"
    disk_size         = ${value("disk")}

    backup_configuration {
      enabled = ${value("backup")==="Enabled"}
    }

    ip_configuration {
      ipv4_enabled = ${value("privateIp")!=="Enabled"}
    }
  }
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Cloud Functions"){
   preview.textContent =
`# Google Cloud / Cloud Functions
resource "google_cloudfunctions2_function" "workload" {
  name     = "${name}"
  location = "${value("region")}"

  build_config {
    runtime     = "${value("runtime")}"
    entry_point = "handler"
  }

  service_config {
    available_memory = "${value("memory")}"
    timeout_seconds  = ${parseInt(value("timeout")) || 60}
    ingress_settings = "${value("ingress")==="Internal only"
      ? "ALLOW_INTERNAL_ONLY"
      : "ALLOW_ALL"}"
  }
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Pub/Sub"){
   preview.textContent =
`# Google Cloud / Pub/Sub
resource "google_pubsub_topic" "workload" {
  name = "${value("topic") || name}"
}

resource "google_pubsub_subscription" "workload" {
  name  = "${value("subscriptionName")}"
  topic = google_pubsub_topic.workload.name

  enable_message_ordering = ${value("ordering")==="Enabled"}
}`;
   return;
 }

 if(currentCloud==="gcp" && currentResource==="Cloud Monitoring"){
   preview.textContent =
`# Google Cloud / Monitoring
resource "google_monitoring_alert_policy" "workload" {
  display_name = "${name}"
  combiner     = "OR"

  conditions {
    display_name = "${value("metric")}"

    condition_threshold {
      filter          = "metric.type=\\"${value("metric")}\\""
      comparison      = "COMPARISON_GT"
      threshold_value = ${value("threshold")}
      duration        = "300s"
    }
  }
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Subnets"){
   preview.textContent =
`# OCI / Subnet
resource "oci_core_subnet" "workload" {
  compartment_id    = "${value("compartment")}"
  vcn_id            = "${value("network")}"
  display_name      = "${name}"
  cidr_block        = "${value("cidr")}"
  dns_label         = "${value("dnsLabel")}"
  route_table_id    = "${value("routeTable")}"
  prohibit_public_ip_on_vnic = ${value("subnetType")==="Private"}
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Network Security Groups"){
   preview.textContent =
`# OCI / Network Security Group
resource "oci_core_network_security_group" "workload" {
  compartment_id = "${value("compartment")}"
  vcn_id         = "${value("network")}"
  display_name   = "${name}"
}

resource "oci_core_network_security_group_security_rule" "workload" {
  network_security_group_id = oci_core_network_security_group.workload.id
  direction                 = "${value("direction")}"
  protocol                  = "${value("protocol")==="TCP" ? "6" : value("protocol")==="UDP" ? "17" : value("protocol")==="ICMP" ? "1" : "all"}"
  stateless                 = ${value("stateless")==="Enabled"}

  ${value("direction")==="INGRESS"
    ? `source      = "${value("source")}"
  source_type = "CIDR_BLOCK"`
    : `destination      = "${value("source")}"
  destination_type = "CIDR_BLOCK"`}
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Load Balancer"){
   preview.textContent =
`# OCI / Load Balancer
resource "oci_load_balancer_load_balancer" "workload" {
  compartment_id = "${value("compartment")}"
  display_name   = "${name}"
  shape          = "${value("lbShape")}"
  is_private     = ${value("visibility")==="Private"}
  subnet_ids     = ["${value("subnet")}"]
}

resource "oci_load_balancer_backend_set" "workload" {
  name             = "${name}-backends"
  load_balancer_id = oci_load_balancer_load_balancer.workload.id
  policy           = "ROUND_ROBIN"

  health_checker {
    protocol = "HTTP"
    port     = ${value("targetPort")}
    url_path = "${value("healthCheck")}"
  }
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Block Volumes"){
   preview.textContent =
`# OCI / Block Volume
resource "oci_core_volume" "workload" {
  compartment_id      = "${value("compartment")}"
  availability_domain = "${value("zone")}"
  display_name        = "${name}"
  size_in_gbs         = ${value("disk")}
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Autonomous Database"){
   preview.textContent =
`# OCI / Autonomous Database
resource "oci_database_autonomous_database" "workload" {
  compartment_id           = "${value("compartment")}"
  display_name             = "${name}"
  db_name                  = "${name.replace(/[^A-Za-z0-9]/g,"").slice(0,14) || "platformdb"}"
  db_workload              = "${value("workload")==="Data Warehouse" ? "DW" : value("workload")==="JSON" ? "AJD" : "OLTP"}"
  compute_model            = "${value("computeModel")}"
  compute_count            = ${value("cpu")}
  data_storage_size_in_tbs = ${value("storage")}
  is_auto_scaling_enabled  = ${value("autoscaling")==="Enabled"}

  admin_password = var.database_password
}

variable "database_password" {
  type      = string
  sensitive = true
}`;
   return;
 }

 if(currentCloud==="oci" && currentResource==="Monitoring"){
   preview.textContent =
`# OCI / Monitoring
resource "oci_monitoring_alarm" "workload" {
  compartment_id        = "${value("compartment")}"
  display_name          = "${name}"
  metric_compartment_id = "${value("compartment")}"
  namespace             = "${value("namespace")}"

  query = "${value("metric")}[5m].${value("statistic")}() > ${value("threshold")}"

  severity        = "WARNING"
  is_enabled      = true
  destinations    = ["${value("notification")}"]
  pending_duration = "PT5M"
}`;
   return;
 }

 preview.textContent =
`# ${clouds[currentCloud].name} / ${currentResource}

# PREVIEW NOT IMPLEMENTED
#
# This resource does not yet have a provider-specific
# OpenTofu generator in the Multicloud Platform Lab.
#
# No generic infrastructure code is generated because
# that could incorrectly represent provider support.`;
}

function selectResource(name){
 currentResource=name;
 showBuilder();
}

function showBuilder(){
 const c=clouds[currentCloud];

 if(!currentResource) currentResource=c.services[0][0];

 document.getElementById("cloud").classList.add("hidden");
 document.getElementById("builder").classList.remove("hidden");

 document.getElementById("builderBreadcrumb").textContent=
   c.short+" / "+currentResource+" / Create";

 document.getElementById("builderTitle").textContent=
   "Create "+currentResource;

 document.getElementById("summaryProvider").textContent=c.name;
 document.getElementById("summaryResource").textContent=currentResource;
 document.getElementById("formProviderHint").textContent=c.short;

 let html;

 if(currentCloud==="aws" && currentResource==="EC2")
   html=awsComputeForm(c);
 else if(currentCloud==="aws" && currentResource==="VPC")
   html=awsVpcForm(c);
 else if(currentCloud==="aws" && currentResource==="EKS")
   html=awsEksForm(c);

 else if(currentCloud==="azure" && currentResource==="Virtual Machines")
   html=azureComputeForm(c);
 else if(currentCloud==="azure" && currentResource==="Virtual Networks")
   html=azureVnetForm(c);
 else if(currentCloud==="azure" && currentResource==="AKS")
   html=azureAksForm(c);

 else if(currentCloud==="gcp" && currentResource==="Compute Engine")
   html=gcpComputeForm(c);
 else if(currentCloud==="gcp" && currentResource==="VPC Network")
   html=gcpVpcForm(c);
 else if(currentCloud==="gcp" && currentResource==="GKE")
   html=gcpGkeForm(c);

 else if(currentCloud==="oci" && currentResource==="Compute")
   html=ociComputeForm(c);
 else if(currentCloud==="oci" && currentResource==="VCN")
   html=ociVcnForm(c);
 else if(currentCloud==="oci" && currentResource==="OKE")
   html=ociOkeForm(c);

 else if(currentCloud==="aws" && currentResource==="S3")
   html=awsS3Form(c);
 else if(currentCloud==="aws" && currentResource==="ECR")
   html=awsEcrForm(c);
 else if(currentCloud==="aws" && currentResource==="Secrets Manager")
   html=awsSecretsForm(c);
 else if(currentCloud==="aws" && currentResource==="IAM")
   html=awsIamForm(c);

 else if(currentCloud==="azure" && currentResource==="Storage Accounts")
   html=azureStorageForm(c);
 else if(currentCloud==="azure" && currentResource==="Container Registry")
   html=azureAcrForm(c);
 else if(currentCloud==="azure" && currentResource==="Key Vault")
   html=azureKeyVaultForm(c);
 else if(currentCloud==="azure" && currentResource==="Managed Identities")
   html=azureIdentityForm(c);

 else if(currentCloud==="gcp" && currentResource==="Cloud Storage")
   html=gcpStorageForm(c);
 else if(currentCloud==="gcp" && currentResource==="Artifact Registry")
   html=gcpArtifactForm(c);
 else if(currentCloud==="gcp" && currentResource==="Secret Manager")
   html=gcpSecretForm(c);
 else if(currentCloud==="gcp" && currentResource==="Cloud IAM")
   html=gcpIamForm(c);

 else if(currentCloud==="oci" && currentResource==="Object Storage")
   html=ociObjectStorageForm(c);
 else if(currentCloud==="oci" && currentResource==="Container Registry")
   html=ociRegistryForm(c);
 else if(currentCloud==="oci" && currentResource==="Vault")
   html=ociVaultForm(c);
 else if(currentCloud==="oci" && currentResource==="IAM")
   html=ociIamForm(c);

 else if(currentCloud==="aws" && currentResource==="Security Groups")
   html=awsSecurityGroupForm(c);
 else if(currentCloud==="aws" && currentResource==="Elastic Load Balancing")
   html=awsElbForm(c);
 else if(currentCloud==="aws" && currentResource==="RDS")
   html=awsRdsForm(c);
 else if(currentCloud==="aws" && currentResource==="DynamoDB")
   html=awsDynamoForm(c);
 else if(currentCloud==="aws" && currentResource==="Lambda")
   html=awsLambdaForm(c);
 else if(currentCloud==="aws" && currentResource==="CloudWatch")
   html=awsCloudWatchForm(c);

 else if(currentCloud==="azure" && currentResource==="Resource Groups")
   html=azureResourceGroupForm(c);
 else if(currentCloud==="azure" && currentResource==="Network Security Groups")
   html=azureNsgForm(c);
 else if(currentCloud==="azure" && currentResource==="Public IP addresses")
   html=azurePublicIpForm(c);
 else if(currentCloud==="azure" && currentResource==="Container Instances")
   html=azureContainerForm(c);
 else if(currentCloud==="azure" && currentResource==="Container Apps")
   html=azureContainerAppsForm(c);
 else if(currentCloud==="azure" && currentResource==="Cosmos DB")
   html=azureCosmosForm(c);
 else if(currentCloud==="azure" && (currentResource==="PostgreSQL" || currentResource==="MySQL"))
   html=azureDatabaseForm(c);
 else if(currentCloud==="azure" && currentResource==="Redis")
   html=azureRedisForm(c);
 else if(currentCloud==="azure" && (currentResource==="Event Hubs" || currentResource==="Service Bus"))
   html=azureMessagingForm(c);
 else if(currentCloud==="azure" && currentResource==="API Management")
   html=azureApiManagementForm(c);
 else if(currentCloud==="azure" && currentResource==="Azure Monitor")
   html=azureMonitorForm(c);

 else if(currentCloud==="gcp" && currentResource==="Firewall")
   html=gcpFirewallForm(c);
 else if(currentCloud==="gcp" && currentResource==="Cloud Load Balancing")
   html=gcpLoadBalancerForm(c);
 else if(currentCloud==="gcp" && currentResource==="Cloud SQL")
   html=gcpSqlForm(c);
 else if(currentCloud==="gcp" && currentResource==="Cloud Functions")
   html=gcpFunctionsForm(c);
 else if(currentCloud==="gcp" && currentResource==="Pub/Sub")
   html=gcpPubSubForm(c);
 else if(currentCloud==="gcp" && currentResource==="Cloud Monitoring")
   html=gcpMonitoringForm(c);

 else if(currentCloud==="oci" && currentResource==="Subnets")
   html=ociSubnetForm(c);
 else if(currentCloud==="oci" && currentResource==="Network Security Groups")
   html=ociNsgForm(c);
 else if(currentCloud==="oci" && currentResource==="Load Balancer")
   html=ociLoadBalancerForm(c);
 else if(currentCloud==="oci" && currentResource==="Block Volumes")
   html=ociBlockVolumeForm(c);
 else if(currentCloud==="oci" && currentResource==="Autonomous Database")
   html=ociDatabaseForm(c);
 else if(currentCloud==="oci" && currentResource==="Monitoring")
   html=ociMonitoringForm(c);

 else
   html=`
     <div style="
       padding:24px;
       border:1px solid #7f1d1d;
       border-radius:10px;
       background:rgba(127,29,29,.12);
     ">
       <strong>Builder not implemented</strong>
       <p style="margin:8px 0 0 0">
         ${c.name} / ${currentResource} does not have a
         provider-specific resource builder yet.
       </p>
     </div>
   `;

 document.getElementById("resourceForm").innerHTML=html;

 generatePreview();
}

openCloud("dashboard",document.querySelector(".topnav button"));
