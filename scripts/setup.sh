#!/bin/bash

# =============================================================================
# GENESIS ENGINE - DEVELOPMENT SETUP SCRIPT
# =============================================================================

set -e

echo "🚀 Setting up Genesis Engine development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/neo4j
mkdir -p data/redis

# Create environment files
echo "📝 Creating environment configuration files..."
./scripts/create-env.sh

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm run install:all

# Build Docker images
echo "🏗️ Building Docker images..."
docker-compose build

# Start databases first
echo "🗄️ Starting database services..."
docker-compose up -d postgres neo4j redis

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 30

# Run database migrations
echo "🗃️ Running database migrations..."
docker-compose exec postgres psql -U genesis_user -d genesis_db -f /docker-entrypoint-initdb.d/schema.sql || true

# Seed database with initial data
echo "🌱 Seeding database..."
npm run db:seed || echo "Seeding not yet implemented - skipping..."

echo ""
echo "✅ Genesis Engine development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Start all services: make dev"
echo "2. Open your browser to http://localhost:3000"
echo "3. API Gateway available at http://localhost:3001"
echo "4. API documentation at http://localhost:3001/docs"
echo ""
echo "Useful commands:"
echo "- make dev          : Start all services"
echo "- make status       : Check service status"
echo "- make logs         : Show service logs"
echo "- make health       : Check service health"
echo "- make clean        : Clean up everything"