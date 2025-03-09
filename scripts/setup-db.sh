#!/bin/bash

# Exit on error
set -e

echo "Setting up the database..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push the schema to the database
echo "Pushing schema to database..."
npx prisma db push

# Run the seed script
echo "Seeding the database..."
npx prisma db seed

echo "Database setup complete!" 