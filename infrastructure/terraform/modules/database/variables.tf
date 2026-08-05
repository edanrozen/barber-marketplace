variable "instance_class" { type = string }
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "db_security_group" { type = string }
variable "engine_version" {
  type    = string
  default = "16"
}
variable "db_name" {
  type    = string
  default = "barber_marketplace"
}
