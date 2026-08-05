# Staging environment: wires the foundational modules. Values/sizing are foundational
# and MUST be reviewed before production. This is authored HCL — run
# `terraform fmt/validate/plan` in the real environment; it is NOT validated in the
# authoring sandbox (no terraform binary/providers there).

module "network" {
  source   = "../../modules/network"
  vpc_cidr = var.vpc_cidr
}

module "secrets" {
  source = "../../modules/secrets"
}

module "database" {
  source             = "../../modules/database"
  instance_class     = var.db_instance_class
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  db_security_group  = module.network.db_security_group_id
}

module "cache" {
  source             = "../../modules/cache"
  node_type          = var.redis_node_type
  private_subnet_ids = module.network.private_subnet_ids
  security_group_id  = module.network.cache_security_group_id
}

module "storage" {
  source = "../../modules/storage"
}

module "compute" {
  source            = "../../modules/compute"
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  app_security_group = module.network.app_security_group_id
  alb_security_group = module.network.alb_security_group_id
}
