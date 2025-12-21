#!/bin/bash

# Configuration
IMAGE_NAME="fleet-management"
CONTAINER_NAME="fleet-management-app"
PORT=3000

echo "🧹 Cleaning up existing containers and images..."

# Stop the container if it's running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "⏹️  Stopping running container: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
fi

# Remove the container if it exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🗑️  Removing existing container: $CONTAINER_NAME"
    docker rm $CONTAINER_NAME
fi

# Remove the image if it exists
if [ "$(docker images -q $IMAGE_NAME)" ]; then
    echo "🗑️  Removing existing image: $IMAGE_NAME"
    docker rmi $IMAGE_NAME
fi

echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting container on port $PORT..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:3000 \
        $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        echo "✅ Container started successfully!"
        echo "🌐 Application is running at http://localhost:$PORT"
        echo ""
        echo "📋 Useful commands:"
        echo "   View logs:    docker logs -f $CONTAINER_NAME"
        echo "   Stop:         docker stop $CONTAINER_NAME"
        echo "   Restart:      docker restart $CONTAINER_NAME"
    else
        echo "❌ Failed to start container"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi
