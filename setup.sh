#!/bin/bash

# Developer Portal - Quick Setup Script
# This script automates the setup of the Developer Portal

set -e

echo "================================"
echo "Developer Portal Setup Script"
echo "================================"
# Check prerequisites
echo "Checking prerequisites..."








if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create directories
echo "Creating necessary directories..."
mkdir -p ./uploads
mkdir -p ./backups
chmod 755 ./uploads ./backups
echo "✅ Directories created"
echo ""

# Setup backend environment
echo "Setting up backend environment..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/your_jwt_secret_key_change_in_production/$JWT_SECRET/" "backend/.env"
    echo "✅ Backend .env created with secure JWT_SECRET"
else
    echo "✅ Backend .env already exists"
fi
echo ""

# Build and start services
echo "Building and starting services..."
docker-compose build
docker-compose up -d

echo "✅ Services started"
echo ""

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Check if database is ready
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null; then
    echo "✅ Database is ready"
else
    echo "⚠️  Database startup may still be in progress..."
fi
echo ""

# Display service information
echo "================================"
echo "Setup Complete! 🎉"
echo "================================"
echo ""
echo "Services Running:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:5001"
echo "  - Database:  localhost:5432"
echo ""
echo "Demo Credentials:"
echo "  Email:    admin@example.com"
echo "  Password: password"
echo ""
echo "Next Steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Register a new account or login"
echo "  3. Start uploading packages!"
echo ""
echo "Documentation:"
echo "  - README:       ./README.md"
echo "  - API Docs:     ./docs/API.md"
echo "  - Deployment:   ./docs/DEPLOYMENT.md"
echo ""
echo "View logs:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
