#!/bin/sh
set -eu

cd /app

# Ensure shared volume has writeable media dirs (survives container recreate)
mkdir -p /app/uploads/news /app/uploads/videos

echo "Running database migrations..."
pnpm --filter @news-platform/api migration:run:prod

echo "Starting API..."
exec pnpm --filter @news-platform/api start:prod
