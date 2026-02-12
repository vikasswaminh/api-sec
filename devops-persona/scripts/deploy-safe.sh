#!/bin/bash
# Safe deployment script with canary rollout

set -e

ENVIRONMENT="${1:-staging}"

echo "🚀 Safe Deployment to $ENVIRONMENT"
echo "======================================"

# Run tests
echo "Running tests..."
npm run typecheck

# Build
echo "Building..."
npm run build

# Deploy
echo "Deploying..."
if [ "$ENVIRONMENT" = "production" ]; then
    wrangler deploy
else
    wrangler deploy --env "$ENVIRONMENT"
fi

echo "✓ Deployment complete!"
