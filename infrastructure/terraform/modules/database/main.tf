resource "aws_db_subnet_group" "this" {
  name       = "barber-db"
  subnet_ids = var.private_subnet_ids
}

resource "aws_db_instance" "this" {
  identifier     = "barber-marketplace-staging"
  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true

  db_name  = var.db_name
  username = "app"
  # Master password generated and stored in AWS Secrets Manager by RDS.
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [var.db_security_group]

  multi_az                = false # staging; enable for production
  backup_retention_period = 7
  deletion_protection     = false # staging; enable for production
  skip_final_snapshot     = true  # staging; disable for production
  apply_immediately       = true
}
