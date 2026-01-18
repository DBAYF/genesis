#!/bin/bash

# =============================================================================
# GENESIS ENGINE - PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================

set -e

echo "🚀 Deploying Genesis Engine to production..."

# Check if required tools are installed
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl is required but not installed. Aborting."; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform is required but not installed. Aborting."; exit 1; }

# Function to print usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment to deploy to (dev|staging|prod)"
    echo "  -r, --region REGION      AWS region (default: us-east-1)"
    echo "  -d, --domain DOMAIN      Domain name for the application"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev -r us-east-1"
    echo "  $0 --environment prod --region eu-west-1 --domain api.genesisengine.com"
}

# Parse command line arguments
ENVIRONMENT="dev"
REGION="us-east-1"
DOMAIN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

echo "📋 Deployment Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Region: $REGION"
echo "  Domain: ${DOMAIN:-Not specified}"
echo ""

# Confirm deployment
read -p "⚠️  This will deploy to $ENVIRONMENT environment. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

# =============================================================================
# STEP 1: INFRASTRUCTURE PROVISIONING
# =============================================================================

echo ""
echo "🏗️  Step 1: Provisioning infrastructure with Terraform..."

cd terraform

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan \
    -var="environment=$ENVIRONMENT" \
    -var="aws_region=$REGION" \
    ${DOMAIN:+ -var="domain_name=$DOMAIN"} \
    -out=tfplan

# Apply the plan
terraform apply tfplan

# Get outputs
API_URL=$(terraform output -raw alb_dns_name)
DB_ENDPOINT=$(terraform output -raw postgres_endpoint)
REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)

cd ..

# =============================================================================
# STEP 2: BUILD DOCKER IMAGES
# =============================================================================

echo ""
echo "🏗️  Step 2: Building Docker images..."

# Build all services
docker-compose build

# Tag images for production
docker tag genesis-engine_api-gateway:latest genesis-engine/api-gateway:$ENVIRONMENT
docker tag genesis-engine_auth-service:latest genesis-engine/auth-service:$ENVIRONMENT
docker tag genesis-engine_user-service:latest genesis-engine/user-service:$ENVIRONMENT
docker tag genesis-engine_company-service:latest genesis-engine/company-service:$ENVIRONMENT
docker tag genesis-engine_financial-service:latest genesis-engine/financial-service:$ENVIRONMENT
docker tag genesis-engine_compliance-service:latest genesis-engine/compliance-service:$ENVIRONMENT
docker tag genesis-engine_crm-service:latest genesis-engine/crm-service:$ENVIRONMENT
docker tag genesis-engine_calendar-service:latest genesis-engine/calendar-service:$ENVIRONMENT
docker tag genesis-engine_billing-service:latest genesis-engine/billing-service:$ENVIRONMENT
docker tag genesis-engine_queue-service:latest genesis-engine/queue-service:$ENVIRONMENT
docker tag genesis-engine_frontend:latest genesis-engine/frontend:$ENVIRONMENT

# =============================================================================
# STEP 3: PUSH IMAGES TO REGISTRY
# =============================================================================

echo ""
echo "📤 Step 3: Pushing images to registry..."

# Login to AWS ECR (if using AWS)
if command -v aws >/dev/null 2>&1; then
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
fi

# Push images
docker push genesis-engine/api-gateway:$ENVIRONMENT
docker push genesis-engine/auth-service:$ENVIRONMENT
docker push genesis-engine/user-service:$ENVIRONMENT
docker push genesis-engine/company-service:$ENVIRONMENT
docker push genesis-engine/financial-service:$ENVIRONMENT
docker push genesis-engine/compliance-service:$ENVIRONMENT
docker push genesis-engine/crm-service:$ENVIRONMENT
docker push genesis-engine/calendar-service:$ENVIRONMENT
docker push genesis-engine/billing-service:$ENVIRONMENT
docker push genesis-engine/queue-service:$ENVIRONMENT
docker push genesis-engine/frontend:$ENVIRONMENT

# =============================================================================
# STEP 4: DEPLOY TO KUBERNETES
# =============================================================================

echo ""
echo "🚀 Step 4: Deploying to Kubernetes..."

# Update Kubernetes manifests with environment-specific values
sed -i "s|{{ENVIRONMENT}}|$ENVIRONMENT|g" k8s/*.yaml
sed -i "s|{{DB_ENDPOINT}}|$DB_ENDPOINT|g" k8s/*.yaml
sed -i "s|{{REDIS_ENDPOINT}}|$REDIS_ENDPOINT|g" k8s/*.yaml

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
# Apply other service deployments...

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment/api-gateway -n genesis-engine

# =============================================================================
# STEP 5: RUN DATABASE MIGRATIONS
# =============================================================================

echo ""
echo "🗄️  Step 5: Running database migrations..."

# Run migrations (this would need to be implemented based on your migration strategy)
kubectl exec -n genesis-engine deployment/api-gateway -- npm run db:migrate

# =============================================================================
# STEP 6: HEALTH CHECKS
# =============================================================================

echo ""
echo "🔍 Step 6: Running health checks..."

# Check if services are responding
HEALTH_CHECK_URL="http://$API_URL/health"

for i in {1..30}; do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
        echo "✅ Application is healthy!"
        break
    fi

    if [ $i -eq 30 ]; then
        echo "❌ Health check failed after 30 attempts"
        exit 1
    fi

    echo "⏳ Waiting for application to be ready... (attempt $i/30)"
    sleep 10
done

# =============================================================================
# STEP 7: DEPLOYMENT COMPLETE
# =============================================================================

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Region: $REGION"
echo "  API URL: http://$API_URL"
echo "  Health Check: http://$API_URL/health"
echo "  API Documentation: http://$API_URL/documentation"
if [ -n "$DOMAIN" ]; then
    echo "  Domain: $DOMAIN (configure DNS to point to $API_URL)"
fi
echo ""
echo "🔧 Useful commands:"
echo "  kubectl get pods -n genesis-engine"
echo "  kubectl logs -n genesis-engine deployment/api-gateway"
echo "  kubectl get services -n genesis-engine"
echo ""
echo "📞 Next steps:"
echo "  1. Configure your domain DNS (if applicable)"
echo "  2. Set up monitoring and alerting"
echo "  3. Configure SSL certificates"
echo "  4. Test all functionality"
echo "  5. Set up backup procedures"
echo ""
echo "🚀 Genesis Engine is now live in $ENVIRONMENT environment!"