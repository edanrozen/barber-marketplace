variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "app_security_group" { type = string }
variable "alb_security_group" { type = string }
variable "app_port" {
  type    = number
  default = 3000
}
variable "container_image" {
  type    = string
  default = "public.ecr.aws/docker/library/hello-world:latest" # placeholder; replaced by CD with the built backend image
}
