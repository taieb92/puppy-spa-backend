#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

# Build the image
echo "Building Docker image..."
docker build -t puppy-spa-backend:test .

# Run the container
echo "Running Docker container..."
docker run -d \
    -p 3000:3000 \
    -e DATABASE_URL="$DATABASE_URL" \
    -e MYSQL_HOST="$MYSQL_HOST" \
    -e MYSQL_USER="$MYSQL_USER" \
    -e MYSQL_PASSWORD="$MYSQL_PASSWORD" \
    -e MYSQL_DATABASE="$MYSQL_DATABASE" \
    -e MYSQL_PORT="$MYSQL_PORT" \
    --name puppy-spa-backend-test \
    puppy-spa-backend:test

# Wait for the container to start
echo "Waiting for container to start..."
sleep 5

# Check if the container is running
if [ "$(docker ps -q -f name=puppy-spa-backend-test)" ]; then
    echo "Container is running!"
    
    # Test the API
    echo "Testing API..."
    curl -s http://localhost:3000/api/health || echo "API test failed"
    
    # Show logs
    echo "Container logs:"
    docker logs puppy-spa-backend-test
    
    # Cleanup
    echo "Cleaning up..."
    docker stop puppy-spa-backend-test
    docker rm puppy-spa-backend-test
    docker rmi puppy-spa-backend:test
else
    echo "Container failed to start"
    docker logs puppy-spa-backend-test
    docker rm puppy-spa-backend-test
    docker rmi puppy-spa-backend:test
    exit 1
fi 