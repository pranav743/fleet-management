#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fleet Management System Startup ===${NC}\n"

# Clean up Docker containers and images with "fleet" in the name
echo -e "${YELLOW}[0/3] Cleaning up existing Docker resources...${NC}"

# Stop and remove containers with "fleet" in the name
FLEET_CONTAINERS=$(docker ps -a --filter "name=fleet" -q)
if [ ! -z "$FLEET_CONTAINERS" ]; then
    echo "Stopping and removing containers..."
    docker rm -f $FLEET_CONTAINERS
    echo -e "${GREEN}✓ Containers removed${NC}"
else
    echo "No fleet containers found"
fi

# Remove images with "fleet" in the name
FLEET_IMAGES=$(docker images --filter "reference=*fleet*" -q)
if [ ! -z "$FLEET_IMAGES" ]; then
    echo "Removing images..."
    docker rmi -f $FLEET_IMAGES
    echo -e "${GREEN}✓ Images removed${NC}\n"
else
    echo "No fleet images found"
fi

# Start the Admin Portal (Part-1)
echo -e "${YELLOW}[2/3] Starting Admin Portal...${NC}"
cd part-1 || { echo -e "${RED}Error: part-1 directory not found${NC}"; exit 1; }
chmod +x start.sh
./start.sh &
ADMIN_PID=$!
echo -e "${GREEN}✓ Admin Portal started (PID: $ADMIN_PID) on http://localhost:3000${NC}\n"
cd ..

# Wait for admin portal to initialize
sleep 3

# Start the User Dashboard (Part-2)
echo -e "${YELLOW}[3/3] Starting User Dashboard...${NC}"
cd part-2 || { echo -e "${RED}Error: part-2 directory not found${NC}"; exit 1; }
chmod +x start.sh
./start.sh &
USER_PID=$!
echo -e "${GREEN}✓ User Dashboard started (PID: $USER_PID)${NC}\n"
cd ..

echo -e "${GREEN}=== All services started successfully ===${NC}"
echo -e "Backend: http://localhost:5000"
echo -e "Admin Portal: http://localhost:3000"
echo -e "User Dashboard: (check part-2 logs for port)"
echo -e "\nPress Ctrl+C to stop all services"

# Wait for all background processes

# Start the Backend
echo -e "${YELLOW}[1/3] Starting Backend...${NC}"
cd backend || { echo -e "${RED}Error: backend directory not found${NC}"; exit 1; }
chmod +x start.sh
./start.sh

wait