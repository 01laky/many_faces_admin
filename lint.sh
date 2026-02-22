#!/bin/bash

# Lint admin_demo (ESLint + Prettier check)
# Usage: ./lint.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔍 Linting admin_demo..."
echo ""

yarn lint
yarn format:check

echo ""
echo "✅ admin_demo lint passed"
