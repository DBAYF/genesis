#!/bin/bash

# =============================================================================
# GENESIS ENGINE - ENVIRONMENT CREATION SCRIPT
# =============================================================================

set -e

echo "📝 Creating environment configuration files..."

# Function to create environment file
create_env_file() {
    local service=$1
    local port=$2
    local env_file="backend/${service}/.env"

    if [ ! -f "$env_file" ]; then
        cat > "$env_file" << EOF
# ${service^^} SERVICE ENVIRONMENT CONFIGURATION
NODE_ENV=development
PORT=${port}

# Database
DATABASE_URL=postgresql://genesis_user:genesis_password@postgres:5432/genesis_db

# Redis
REDIS_URL=redis://redis:6379

# JWT (inherited from main config)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-random
JWT_REFRESH_SECRET=your-refresh-token-secret-here-different-from-jwt-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Service URLs
AUTH_SERVICE_URL=http://auth-service:3002
USER_SERVICE_URL=http://user-service:3004
COMPANY_SERVICE_URL=http://company-service:3005
FINANCIAL_SERVICE_URL=http://financial-service:3006
COMPLIANCE_SERVICE_URL=http://compliance-service:3007
CRM_SERVICE_URL=http://crm-service:3008
CALENDAR_SERVICE_URL=http://calendar-service:3009
BILLING_SERVICE_URL=http://billing-service:3010
NEXUS_SERVICE_URL=http://nexus-service:3011
PULSE_SERVICE_URL=http://pulse-service:3012
KNOWLEDGE_GRAPH_SERVICE_URL=http://knowledge-graph-service:3013

# Logging
LOG_LEVEL=info
EOF
        echo "✅ Created ${env_file}"
    else
        echo "⚠️  ${env_file} already exists, skipping..."
    fi
}

# Create environment files for each service
create_env_file "api-gateway" "3001"
create_env_file "auth-service" "3002"
create_env_file "user-service" "3004"
create_env_file "company-service" "3005"
create_env_file "financial-service" "3006"
create_env_file "compliance-service" "3007"
create_env_file "crm-service" "3008"
create_env_file "calendar-service" "3009"
create_env_file "billing-service" "3010"

# Create frontend environment file
if [ ! -f "app/.env.local" ]; then
    cat > "app/.env.local" << EOF
# FRONTEND ENVIRONMENT CONFIGURATION
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FEATURE_NEXUS_ENABLED=true
NEXT_PUBLIC_FEATURE_COMPLIANCE_ENABLED=true
NEXT_PUBLIC_FEATURE_FINANCIAL_ENABLED=true
NEXT_PUBLIC_FEATURE_CRM_ENABLED=true
NEXT_PUBLIC_FEATURE_CALENDAR_ENABLED=true
NEXT_PUBLIC_FEATURE_PULSE_ENABLED=true
EOF
    echo "✅ Created app/.env.local"
else
    echo "⚠️  app/.env.local already exists, skipping..."
fi

echo ""
echo "✅ Environment configuration files created!"
echo ""
echo "⚠️  IMPORTANT: Please update the JWT secrets and API keys in the environment files"
echo "   with your actual values before running the application in production."