# Remote state (S3 + DynamoDB lock). Bucket/table are bootstrapped once, out of band,
# BEFORE first `terraform init`. Values are provided at init via -backend-config in the
# real environment/CI (never hard-coded here).
terraform {
  backend "s3" {
    key = "staging/terraform.tfstate"
  }
}
