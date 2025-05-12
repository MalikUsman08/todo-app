#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo "Running migrations..."
npm run migration:run

# Start the application
echo "Starting application..."
node dist/src/main.js 