# Secret CONTAINERS only. Values are populated out-of-band (console/CI with least
# privilege), NEVER in Terraform code or state. Rotation is configured per secret.
resource "aws_secretsmanager_secret" "app" {
  for_each                = toset(var.secret_names)
  name                    = "barber-marketplace/staging/${each.value}"
  recovery_window_in_days = 7
}
