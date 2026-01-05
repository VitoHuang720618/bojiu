#!/bin/bash
set -e

echo "Building B9 Website Docker Image..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t b9-website:latest .

echo "Build completed successfully!"
echo ""
echo "Next steps:"
echo "  1. To run with Docker Compose: docker-compose up -d"
echo "  2. To run directly: docker run -p 80:80 -v ./uploads:/app/uploads -v ./data:/app/data b9-website:latest"
echo ""
echo "Access URLs:"
echo "  Demo site: http://localhost"
echo "  Admin panel: http://localhost/admin"
echo "  API health: http://localhost/health"