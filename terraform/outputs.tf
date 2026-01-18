# =============================================================================
# GENESIS ENGINE - TERRAFORM OUTPUTS
# =============================================================================

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.genesis.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.genesis.zone_id
}

output "postgres_endpoint" {
  description = "PostgreSQL database endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.genesis.name
}

output "api_gateway_service_name" {
  description = "API Gateway ECS service name"
  value       = aws_ecs_service.api_gateway.name
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for API Gateway"
  value       = aws_cloudwatch_log_group.api_gateway.name
}

output "secrets" {
  description = "Secrets Manager ARNs"
  value = {
    jwt_secret   = aws_secretsmanager_secret.jwt_secret.arn
    openai_key   = aws_secretsmanager_secret.openai_key.arn
  }
  sensitive = true
}