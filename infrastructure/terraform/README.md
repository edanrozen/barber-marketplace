# infrastructure/terraform

Infrastructure-as-code (AWS, managed-first — **no self-managed Kubernetes**, per the locked Technology Stack).

## Layout
- `versions.tf` — Terraform + AWS provider version constraints
- `environments/staging/` — the staging root: providers, remote state (S3), variables, module wiring
- `modules/` — `network` (VPC/subnets/security groups), `database` (RDS Postgres), `cache` (ElastiCache Redis), `storage` (S3 media + segregated verification-docs + CloudFront), `compute` (ECS Fargate + ALB), `secrets` (Secrets Manager containers)

## Usage (real environment only)
```bash
cd environments/staging
terraform init -backend-config=... # remote-state bucket/table bootstrapped out of band
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

## Honest status (Sprint 1, Epic E2)
This HCL was **authored to convention but NOT validated** in the build sandbox (no terraform binary or provider plugins there). It is **foundational** and requires, before production use: `terraform fmt/validate/plan`; the CloudFront↔S3 **OAC bucket policy**; an **HTTPS/ACM** listener (currently HTTP:80 only); production hardening (Multi-AZ, deletion protection, final snapshots, autoscaling); and confirmation of **Israeli data-residency** requirements for the chosen region. Secret **values** are never stored here — only containers; values are injected out of band with least privilege.
