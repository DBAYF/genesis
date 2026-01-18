# =============================================================================
# GENESIS ENGINE - TERRAFORM INFRASTRUCTURE
# =============================================================================

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "genesis-engine-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# =============================================================================
# VPC AND NETWORKING
# =============================================================================

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "genesis-engine-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false

  tags = {
    Environment = var.environment
    Project     = "genesis-engine"
  }
}

# =============================================================================
# SECURITY GROUPS
# =============================================================================

resource "aws_security_group" "api_gateway" {
  name_prefix = "genesis-api-gateway-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "genesis-api-gateway-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "database" {
  name_prefix = "genesis-database-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway.id]
  }

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.api_gateway.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "genesis-database-sg"
    Environment = var.environment
  }
}

# =============================================================================
# DATABASES
# =============================================================================

resource "aws_db_subnet_group" "genesis" {
  name       = "genesis-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "genesis-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "genesis-postgres-${var.environment}"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  storage_type           = "gp2"
  db_name                = "genesis_db"
  username               = "genesis_user"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.genesis.name
  vpc_security_group_ids = [aws_security_group.database.id]
  skip_final_snapshot    = true

  tags = {
    Name        = "genesis-postgres"
    Environment = var.environment
  }
}

resource "aws_elasticache_subnet_group" "genesis" {
  name       = "genesis-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "genesis-redis-${var.environment}"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  subnet_group_name    = aws_elasticache_subnet_group.genesis.name
  security_group_ids   = [aws_security_group.database.id]

  tags = {
    Name        = "genesis-redis"
    Environment = var.environment
  }
}

# =============================================================================
# ECS CLUSTER AND SERVICES
# =============================================================================

resource "aws_ecs_cluster" "genesis" {
  name = "genesis-engine-cluster-${var.environment}"

  tags = {
    Name        = "genesis-engine-cluster"
    Environment = var.environment
  }
}

resource "aws_ecs_cluster_capacity_providers" "genesis" {
  cluster_name       = aws_ecs_cluster.genesis.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# API Gateway Service
resource "aws_ecs_service" "api_gateway" {
  name            = "api-gateway"
  cluster         = aws_ecs_cluster.genesis.id
  task_definition = aws_ecs_task_definition.api_gateway.arn
  desired_count   = 3

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.api_gateway.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_gateway.arn
    container_name   = "api-gateway"
    container_port   = 3001
  }

  tags = {
    Name        = "genesis-api-gateway"
    Environment = var.environment
  }
}

# =============================================================================
# LOAD BALANCER
# =============================================================================

resource "aws_lb" "genesis" {
  name               = "genesis-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.api_gateway.id]
  subnets            = module.vpc.public_subnets

  tags = {
    Name        = "genesis-alb"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "api_gateway" {
  name        = "genesis-api-gateway-${var.environment}"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
  }

  tags = {
    Name        = "genesis-api-gateway-tg"
    Environment = var.environment
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.genesis.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gateway.arn
  }
}

# =============================================================================
# ECS TASK DEFINITIONS
# =============================================================================

resource "aws_ecs_task_definition" "api_gateway" {
  family                   = "genesis-api-gateway-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "api-gateway"
      image = "${var.ecr_repository_url}/api-gateway:latest"

      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3001"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.cache_nodes[0].port}"
        }
      ]

      secrets = [
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        },
        {
          name      = "OPENAI_API_KEY"
          valueFrom = aws_secretsmanager_secret.openai_key.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api_gateway.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "genesis-api-gateway-task"
    Environment = var.environment
  }
}

# =============================================================================
# IAM ROLES
# =============================================================================

resource "aws_iam_role" "ecs_execution_role" {
  name = "genesis-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]

  tags = {
    Name        = "genesis-ecs-execution-role"
    Environment = var.environment
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name = "genesis-ecs-task-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  inline_policy {
    name = "genesis-secrets-access"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Action = [
            "secretsmanager:GetSecretValue"
          ]
          Resource = [
            aws_secretsmanager_secret.jwt_secret.arn,
            aws_secretsmanager_secret.openai_key.arn
          ]
        }
      ]
    })
  }

  tags = {
    Name        = "genesis-ecs-task-role"
    Environment = var.environment
  }
}

# =============================================================================
# SECRETS MANAGEMENT
# =============================================================================

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "genesis/jwt-secret-${var.environment}"
  description             = "JWT secret for Genesis Engine"
  recovery_window_in_days = 0

  tags = {
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret" "openai_key" {
  name                    = "genesis/openai-key-${var.environment}"
  description             = "OpenAI API key for Genesis Engine"
  recovery_window_in_days = 0

  tags = {
    Environment = var.environment
  }
}

# =============================================================================
# LOGGING
# =============================================================================

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/ecs/genesis-api-gateway-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "genesis-api-gateway-logs"
    Environment = var.environment
  }
}

# =============================================================================
# MONITORING
# =============================================================================

resource "aws_cloudwatch_dashboard" "genesis" {
  dashboard_name = "genesis-engine-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "api-gateway", "ClusterName", aws_ecs_cluster.genesis.name]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "API Gateway CPU Utilization"
        }
      }
    ]
  })
}

# =============================================================================
# ROUTE 53 (Optional - Uncomment if you have a domain)
# =============================================================================

# resource "aws_route53_record" "api" {
#   zone_id = var.route53_zone_id
#   name    = "api.genesisengine.com"
#   type    = "A"

#   alias {
#     name                   = aws_lb.genesis.dns_name
#     zone_id                = aws_lb.genesis.zone_id
#     evaluate_target_health = true
#   }
# }