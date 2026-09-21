provider "aws" {
  region = "eu-west-1"

  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  skip_region_validation      = true

  endpoints {
    s3 = "http://127.0.0.1:4566"
  }
}
