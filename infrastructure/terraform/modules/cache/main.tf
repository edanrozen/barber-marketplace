resource "aws_elasticache_subnet_group" "this" {
  name       = "barber-redis"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id = "barber-redis-staging"
  description          = "Redis: cache, holds, presence, BullMQ queue"
  engine               = "redis"
  node_type            = var.node_type
  num_cache_clusters   = 1 # staging; increase for HA in production

  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [var.security_group_id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  port                       = 6379
}
