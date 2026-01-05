#!/bin/bash
set -e

echo "Running Docker Container Property Tests..."

# Check if Node.js is available
if ! command -v node > /dev/null 2>&1; then
    echo "Error: Node.js is not installed. Please install Node.js to run tests."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Ensure Docker image is built
if ! docker image inspect b9-website:latest > /dev/null 2>&1; then
    echo "Docker image not found. Building image first..."
    ./docker/build.sh
fi

# Run container composition tests
echo "Running container composition property tests..."
node docker/tests/container-composition.test.js

# Run request routing tests
echo "Running request routing property tests..."
node docker/tests/request-routing.test.js

echo "All tests completed successfully!"