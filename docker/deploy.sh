#!/bin/bash
set -e

echo "Deploying B9 Website..."

# Create required directories
echo "Creating required directories..."
mkdir -p uploads data

# Set proper permissions
chmod 755 uploads data

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "Error: docker-compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Deploy with Docker Compose
echo "Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "B9 Website deployed successfully!"
echo ""
echo "Services status:"
docker-compose ps

echo ""
echo "Access URLs:"
echo "  Demo site: http://localhost"
echo "  Admin panel: http://localhost/admin"
echo "  API health: http://localhost/health"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"