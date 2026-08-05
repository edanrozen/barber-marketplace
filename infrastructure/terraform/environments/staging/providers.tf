provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      project     = "barber-marketplace"
      environment = "staging"
      managed_by  = "terraform"
    }
  }
}
