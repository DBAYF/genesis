# =============================================================================
# GENESIS ENGINE - MAKEFILE
# =============================================================================
# Development and deployment commands for the Genesis Engine

.PHONY: help setup dev build test clean docker-up docker-down db-migrate db-seed

# Default target
help: ## Show this help message
	@echo "Genesis Engine - Development Commands"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

# =============================================================================
# DEVELOPMENT SETUP
# =============================================================================

setup: ## Setup development environment
	@echo "Setting up Genesis Engine development environment..."
	@./scripts/setup.sh

setup-env: ## Create environment configuration files
	@echo "Creating environment configuration files..."
	@./scripts/create-env.sh

install-deps: ## Install dependencies for all services
	@echo "Installing dependencies..."
	@npm run install:all

# =============================================================================
# DEVELOPMENT COMMANDS
# =============================================================================

dev: ## Start all services in development mode
	@echo "Starting Genesis Engine in development mode..."
	@docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

dev-frontend: ## Start only the frontend in development mode
	@echo "Starting frontend in development mode..."
	@cd app && npm run dev

dev-backend: ## Start all backend services in development mode
	@echo "Starting backend services in development mode..."
	@docker-compose -f docker-compose.yml -f docker-compose.override.yml up api-gateway auth-service user-service company-service financial-service compliance-service crm-service calendar-service billing-service --build

# =============================================================================
# BUILDING & TESTING
# =============================================================================

build: ## Build all services
	@echo "Building all services..."
	@docker-compose build

build-frontend: ## Build the frontend application
	@echo "Building frontend..."
	@cd app && npm run build

test: ## Run tests for all services
	@echo "Running tests..."
	@npm run test:all

lint: ## Run linting for all services
	@echo "Running linting..."
	@npm run lint:all

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

db-up: ## Start database services
	@echo "Starting database services..."
	@docker-compose up -d postgres neo4j redis

db-down: ## Stop database services
	@echo "Stopping database services..."
	@docker-compose down postgres neo4j redis

db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	@docker-compose exec postgres psql -U genesis_user -d genesis_db -f /docker-entrypoint-initdb.d/schema.sql

db-seed: ## Seed database with sample data
	@echo "Seeding database..."
	@npm run db:seed

db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "Resetting database..."
	@docker-compose down -v postgres neo4j redis
	@docker-compose up -d postgres neo4j redis
	@sleep 10
	@make db-migrate

# =============================================================================
# DOCKER COMMANDS
# =============================================================================

docker-up: ## Start all services with Docker Compose
	@echo "Starting all services with Docker Compose..."
	@docker-compose up -d

docker-down: ## Stop all services
	@echo "Stopping all services..."
	@docker-compose down

docker-logs: ## Show logs for all services
	@echo "Showing service logs..."
	@docker-compose logs -f

docker-clean: ## Clean up Docker resources
	@echo "Cleaning up Docker resources..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f

# =============================================================================
# PRODUCTION COMMANDS
# =============================================================================

prod-build: ## Build for production
	@echo "Building for production..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-deploy: ## Deploy to production
	@echo "Deploying to production..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

clean: ## Clean up generated files
	@echo "Cleaning up generated files..."
	@find . -name "node_modules" -type d -exec rm -rf {} +
	@find . -name ".next" -type d -exec rm -rf {} +
	@find . -name "dist" -type d -exec rm -rf {} +
	@find . -name "*.log" -type f -delete

status: ## Show status of all services
	@echo "Service Status:"
	@docker-compose ps

health: ## Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:3001/health && echo " - API Gateway: OK" || echo " - API Gateway: DOWN"
	@curl -f http://localhost:3002/health && echo " - Auth Service: OK" || echo " - Auth Service: DOWN"
	@curl -f http://localhost:3004/health && echo " - User Service: OK" || echo " - User Service: DOWN"
	@curl -f http://localhost:3005/health && echo " - Company Service: OK" || echo " - Company Service: DOWN"
	@curl -f http://localhost:3006/health && echo " - Financial Service: OK" || echo " - Financial Service: DOWN"
	@curl -f http://localhost:3007/health && echo " - Compliance Service: OK" || echo " - Compliance Service: DOWN"
	@curl -f http://localhost:3008/health && echo " - CRM Service: OK" || echo " - CRM Service: DOWN"
	@curl -f http://localhost:3009/health && echo " - Calendar Service: OK" || echo " - Calendar Service: DOWN"
	@curl -f http://localhost:3010/health && echo " - Billing Service: OK" || echo " - Billing Service: DOWN"
	@curl -f http://localhost:3000 && echo " - Frontend: OK" || echo " - Frontend: DOWN"

# =============================================================================
# DEVELOPMENT WORKFLOWS
# =============================================================================

full-setup: setup install-deps build dev ## Complete development setup
	@echo "Genesis Engine is ready for development!"

restart: ## Restart all services
	@echo "Restarting all services..."
	@docker-compose restart

logs-%: ## Show logs for a specific service (e.g., make logs-api-gateway)
	@echo "Showing logs for $*..."
	@docker-compose logs -f $*

shell-%: ## Open shell in a specific service container (e.g., make shell-api-gateway)
	@echo "Opening shell in $* container..."
	@docker-compose exec $* sh