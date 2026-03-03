#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Production Boot Sequence..."

# 1. Navigate to database package and run migrations
echo "🐘 Running Prisma Database Migrations..."
cd packages/database
npx prisma migrate deploy

# 2. Return to backend directory and start the application
echo "⚡ Starting NestJS Application..."
cd ../../apps/backend
# Assuming the build has already been performed by Coolify (Nixpacks)
node dist/main
