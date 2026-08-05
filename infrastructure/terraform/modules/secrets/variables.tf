variable "secret_names" {
  type = list(string)
  default = [
    "otp-sms-gateway",
    "payment-processor",
    "e-invoicing",
    "google-maps",
    "push-fcm-apns",
    "transactional-email",
    "app-jwt-signing"
  ]
}
