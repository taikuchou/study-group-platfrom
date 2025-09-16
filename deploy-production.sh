#!/bin/bash

# Study Group Platform - Production Deployment Script
# This script deploys the application to production using docker-compose

set -e

echo "🚀 Study Group Platform - Production Deployment"
echo "================================================"

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
    echo "❌ Error: .env.prod file not found!"
    echo "   Please copy .env.production to .env.prod and configure it with your production values."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.prod | xargs)

echo "📋 Pre-deployment checks..."

# Check required environment variables
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET" "DEFAULT_ADMIN_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set in .env.prod"
        exit 1
    fi
done

# Check if using default/insecure values
if [ "$POSTGRES_PASSWORD" = "secure_production_password_change_me" ]; then
    echo "❌ Error: Please change POSTGRES_PASSWORD from default value"
    exit 1
fi

if [ "$JWT_SECRET" = "your_super_secure_jwt_secret_at_least_32_characters_long" ]; then
    echo "❌ Error: Please change JWT_SECRET from default value"
    exit 1
fi

if [ "$DEFAULT_ADMIN_PASSWORD" = "secure_admin_password_change_me" ]; then
    echo "❌ Error: Please change DEFAULT_ADMIN_PASSWORD from default value"
    exit 1
fi

echo "✅ Environment configuration validated"

# Build and start services
echo "🏗️  Building production images..."
docker compose -f docker-compose.prod.yml --env-file .env.prod build --no-cache

echo "🔄 Starting production services..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

echo "⏳ Waiting for database to be ready..."
timeout=60
while ! docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T database pg_isready -U postgres -d study_group_platform; do
    sleep 2
    timeout=$((timeout - 2))
    if [ $timeout -le 0 ]; then
        echo "❌ Database failed to start within 60 seconds"
        exit 1
    fi
done

echo "📊 Running database migrations..."
docker compose -f docker-compose.prod.yml --env-file .env.prod exec server npx prisma migrate deploy

echo "🌱 Seeding database with initial data..."
docker compose -f docker-compose.prod.yml --env-file .env.prod exec server npx prisma db seed

echo "🏥 Running health checks..."
sleep 10

# Check server health
if curl -f http://localhost:${API_PORT:-3000}/api/health > /dev/null 2>&1; then
    echo "✅ Server is healthy"
else
    echo "❌ Server health check failed"
    docker compose -f docker-compose.prod.yml --env-file .env.prod logs server --tail=20
    exit 1
fi

# Check client health
if curl -f http://localhost:${CLIENT_PORT:-3001}/health > /dev/null 2>&1; then
    echo "✅ Client is healthy"
else
    echo "❌ Client health check failed"
    docker compose -f docker-compose.prod.yml --env-file .env.prod logs client --tail=20
    exit 1
fi

echo ""
echo "🎉 Production deployment successful!"
echo "================================================"
echo "📱 Frontend:     http://localhost:${CLIENT_PORT:-3001}"
echo "🔌 API Server:   http://localhost:${API_PORT:-3000}"
echo "📊 API Health:   http://localhost:${API_PORT:-3000}/api/health"
echo "👤 Admin Login:  ${DEFAULT_ADMIN_EMAIL:-admin@studygroup.com}"
echo ""
echo "📝 Management commands:"
echo "  View logs:     docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f"
echo "  Stop services: docker compose -f docker-compose.prod.yml --env-file .env.prod down"
echo "  Restart:       docker compose -f docker-compose.prod.yml --env-file .env.prod restart"
echo ""
echo "⚠️  Remember to:"
echo "  - Configure your reverse proxy/load balancer"
echo "  - Set up SSL/TLS certificates"
echo "  - Configure firewall rules"
echo "  - Set up monitoring and backups"
echo "  - Review and update CORS origins for your domain"