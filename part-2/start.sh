#!/bin/bash

# Script to clean and restart the fleet-admin container

CONTAINER_NAME="fleet-admin"
IMAGE_NAME="fleet-admin"
PORT=4000

echo "🚀 Starting deployment for $CONTAINER_NAME..."

# Check if container exists and stop it
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME
    echo "🗑️  Removing existing container..."
    docker rm $CONTAINER_NAME
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Run the container in production mode
echo "🚀 Starting container on port $PORT..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:$PORT \
    --restart unless-stopped \
    $IMAGE_NAME

# Check if container started successfully
if [ $? -eq 0 ]; then
    echo "✅ Container $CONTAINER_NAME is running successfully!"
    echo "🌐 Access the application at: http://localhost:$PORT"
    echo ""
    echo "📊 Container logs:"
    docker logs $CONTAINER_NAME
else
    echo "❌ Failed to start container!"
    exit 1
fi
