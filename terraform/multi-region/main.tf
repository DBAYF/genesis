# =============================================================================
# GENESIS ENGINE - MULTI-REGION DEPLOYMENT
# =============================================================================

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "genesis-engine-terraform-multi-region-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

# Primary region (us-east-1)
provider "aws" {
  alias  = "primary"
  region = "us-east-1"
}

# Secondary region (eu-west-1)
provider "aws" {
  alias  = "secondary"
  region = "eu-west-1"
}

# Global resources
module "global_resources" {
  source = "../modules/global"

  providers = {
    aws = aws.primary
  }

  domain_name = var.domain_name
}

# Primary region deployment
module "primary_region" {
  source = "../modules/region"
  providers = {
    aws = aws.primary
  }

  region_name     = "primary"
  vpc_cidr        = "10.0.0.0/16"
  environment     = var.environment
  db_password     = var.db_password
  domain_name     = var.domain_name

  # Enable global resources in primary region
  create_global_resources = true
}

# Secondary region deployment
module "secondary_region" {
  source = "../modules/region"
  providers = {
    aws = aws.secondary
  }

  region_name     = "secondary"
  vpc_cidr        = "10.1.0.0/16"
  environment     = var.environment
  db_password     = var.db_password
  domain_name     = var.domain_name

  # Read-only replica in secondary region
  create_global_resources = false
}

# Global Route 53 configuration for multi-region failover
resource "aws_route53_health_check" "primary_region" {
  provider = aws.primary

  fqdn              = module.primary_region.alb_dns_name
  port              = 80
  type              = "HTTP"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name        = "genesis-primary-region-health-check"
    Environment = var.environment
  }
}

resource "aws_route53_health_check" "secondary_region" {
  provider = aws.secondary

  fqdn              = module.secondary_region.alb_dns_name
  port              = 80
  type              = "HTTP"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name        = "genesis-secondary-region-health-check"
    Environment = var.environment
  }
}

# Route 53 failover routing policy
resource "aws_route53_record" "genesis_failover" {
  provider = aws.primary

  zone_id = module.global_resources.route53_zone_id
  name    = var.domain_name
  type    = "A"

  failover_routing_policy {
    type = "PRIMARY"
  }

  set_identifier = "primary-${var.environment}"

  alias {
    name                   = module.primary_region.alb_dns_name
    zone_id                = module.primary_region.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "genesis_failover_secondary" {
  provider = aws.primary

  zone_id = module.global_resources.route53_zone_id
  name    = var.domain_name
  type    = "A"

  failover_routing_policy {
    type = "SECONDARY"
  }

  set_identifier = "secondary-${var.environment}"

  alias {
    name                   = module.secondary_region.alb_dns_name
    zone_id                = module.secondary_region.alb_zone_id
    evaluate_target_health = true
  }
}

# CloudFront distribution for global CDN
resource "aws_cloudfront_distribution" "genesis" {
  provider = aws.primary

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Genesis Engine Global CDN"
  default_root_object = "index.html"

  origin {
    domain_name = module.primary_region.alb_dns_name
    origin_id   = "genesis-primary"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = module.secondary_region.alb_dns_name
    origin_id   = "genesis-secondary"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "genesis-primary"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
      headers = ["Authorization", "Content-Type", "X-Requested-With"]
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

    # Lambda@Edge for routing to nearest region
    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.region_router.qualified_arn
      include_body = false
    }
  }

  # Custom error pages
  custom_error_response {
    error_code         = 500
    response_code      = 500
    response_page_path = "/500.html"
    error_caching_min_ttl = 300
  }

  custom_error_response {
    error_code         = 503
    response_code      = 503
    response_page_path = "/503.html"
    error_caching_min_ttl = 300
  }

  # Price class for global distribution
  price_class = "PriceClass_All"

  # SSL certificate
  viewer_certificate {
    acm_certificate_arn      = module.global_resources.ssl_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name        = "genesis-engine-cdn"
    Environment = var.environment
  }
}

# Lambda@Edge for intelligent routing
resource "aws_lambda_function" "region_router" {
  provider = aws.primary

  filename         = "lambda/region-router.zip"
  function_name    = "genesis-region-router-${var.environment}"
  role            = aws_iam_role.lambda_edge_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  publish         = true

  tags = {
    Name        = "genesis-region-router"
    Environment = var.environment
  }
}

# IAM role for Lambda@Edge
resource "aws_iam_role" "lambda_edge_role" {
  provider = aws.primary

  name = "genesis-lambda-edge-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com"
          ]
        }
      }
    ]
  })

  tags = {
    Name        = "genesis-lambda-edge-role"
    Environment = var.environment
  }
}

# Global monitoring dashboard
module "monitoring" {
  source = "../modules/monitoring"
  providers = {
    aws = aws.primary
  }

  environment         = var.environment
  primary_region     = "us-east-1"
  secondary_region   = "eu-west-1"
  primary_alb_dns    = module.primary_region.alb_dns_name
  secondary_alb_dns  = module.secondary_region.alb_dns_name
}

# Outputs
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.genesis.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.genesis.domain_name
}

output "primary_region_alb" {
  description = "Primary region ALB DNS name"
  value       = module.primary_region.alb_dns_name
}

output "secondary_region_alb" {
  description = "Secondary region ALB DNS name"
  value       = module.secondary_region.alb_dns_name
}