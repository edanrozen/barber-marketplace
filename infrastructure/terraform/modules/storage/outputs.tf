output "media_bucket" { value = aws_s3_bucket.media.id }
output "verification_bucket" { value = aws_s3_bucket.verification.id }
output "cloudfront_domain" { value = aws_cloudfront_distribution.media.domain_name }
