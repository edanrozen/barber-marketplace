variable "aws_region" {
  type    = string
  default = "eu-central-1" # closest low-latency region; confirm data-residency requirements for Israel
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro" # foundational sizing for staging; tune for prod
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.micro"
}
