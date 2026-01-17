#!/bin/bash

# Script to completely remove Admin Docker containers and volumes
# Usage: ./clear-dev.sh

set -e

cd "$(dirname "$0")"

echo "🧹 Clearing Admin containers and volumes..."

# Stop and remove containers from root docker-compose
cd "$(dirname "$0")/.."
docker-compose -f docker-compose.dev.yml stop admin-demo-dev 2>/dev/null || true
docker-compose -f docker-compose.dev.yml rm -f admin-demo-dev 2>/dev/null || true

# Remove container by name if it still exists
docker rm -f admin-demo-dev 2>/dev/null || true

# Remove volumes
docker volume rm admin-demo-node-modules 2>/dev/null || true
docker volume rm admin-demo-yarn-cache 2>/dev/null || true

# Also try local docker-compose if exists
cd "$(dirname "$0")"
if [ -f "docker-compose.yml" ]; then
    docker-compose down -v 2>/dev/null || true
fi

echo "✅ Admin containers and volumes cleared"
