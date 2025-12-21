#!/bin/bash

# Fleet Management Backend Startup Script
# Supports: macOS, Linux, Windows (Git Bash/WSL)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Darwin*)    echo "mac";;
        Linux*)     echo "linux";;
        MINGW*|MSYS*|CYGWIN*)    echo "windows";;
        *)          echo "unknown";;
    esac
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install MongoDB
check_mongodb() {
    local os=$1
    log_info "Checking MongoDB installation..."
    
    if command_exists mongod; then
        log_success "MongoDB is already installed"
        return 0
    fi
    
    log_warning "MongoDB not found. Installing..."
    
    case $os in
        mac)
            if ! command_exists brew; then
                log_error "Homebrew not found. Please install from https://brew.sh"
                exit 1
            fi
            brew tap mongodb/brew
            brew install mongodb-community
            ;;
        linux)
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y mongodb-org
            elif command_exists yum; then
                sudo yum install -y mongodb-org
            else
                log_error "Package manager not supported. Please install MongoDB manually"
                exit 1
            fi
            ;;
        windows)
            log_error "Please install MongoDB from https://www.mongodb.com/try/download/community"
            exit 1
            ;;
    esac
    
    log_success "MongoDB installed successfully"
}

# Check and install Redis
check_redis() {
    local os=$1
    log_info "Checking Redis installation..."
    
    if command_exists redis-server; then
        log_success "Redis is already installed"
        return 0
    fi
    
    log_warning "Redis not found. Installing..."
    
    case $os in
        mac)
            if ! command_exists brew; then
                log_error "Homebrew not found. Please install from https://brew.sh"
                exit 1
            fi
            brew install redis
            ;;
        linux)
            if command_exists apt-get; then
                sudo apt-get update
                sudo apt-get install -y redis-server
            elif command_exists yum; then
                sudo yum install -y redis
            else
                log_error "Package manager not supported. Please install Redis manually"
                exit 1
            fi
            ;;
        windows)
            log_error "Please install Redis from https://github.com/microsoftarchive/redis/releases"
            exit 1
            ;;
    esac
    
    log_success "Redis installed successfully"
}

# Start MongoDB
start_mongodb() {
    local os=$1
    log_info "Starting MongoDB..."
    
    case $os in
        mac)
            if brew services list | grep mongodb-community | grep started >/dev/null; then
                log_success "MongoDB is already running"
            else
                brew services start mongodb-community
                log_success "MongoDB started"
            fi
            ;;
        linux)
            if systemctl is-active --quiet mongod; then
                log_success "MongoDB is already running"
            else
                sudo systemctl start mongod
                sudo systemctl enable mongod
                log_success "MongoDB started"
            fi
            ;;
        windows)
            net start MongoDB 2>/dev/null || log_warning "Please start MongoDB manually"
            ;;
    esac
}

# Start Redis
start_redis() {
    local os=$1
    log_info "Starting Redis..."
    
    case $os in
        mac)
            if brew services list | grep redis | grep started >/dev/null; then
                log_success "Redis is already running"
            else
                brew services start redis
                log_success "Redis started"
            fi
            ;;
        linux)
            if systemctl is-active --quiet redis-server || systemctl is-active --quiet redis; then
                log_success "Redis is already running"
            else
                sudo systemctl start redis-server 2>/dev/null || sudo systemctl start redis
                sudo systemctl enable redis-server 2>/dev/null || sudo systemctl enable redis
                log_success "Redis started"
            fi
            ;;
        windows)
            net start Redis 2>/dev/null || log_warning "Please start Redis manually"
            ;;
    esac
}

# Docker cleanup
cleanup_docker() {
    log_info "Cleaning up existing Docker containers and images..."
    
    docker-compose down 2>/dev/null || true
    docker rm -f fleet-backend 2>/dev/null || true
    docker rmi -f fleet-backend 2>/dev/null || true
    docker images -q 'fleet-backend' | xargs -r docker rmi -f 2>/dev/null || true
    
    log_success "Docker cleanup complete"
}

# Main execution
main() {
    echo ""
    log_info "🚀 Fleet Management Backend Startup"
    echo ""
    
    OS=$(detect_os)
    log_info "Detected OS: $OS"
    
    if [ "$OS" = "unknown" ]; then
        log_error "Unsupported operating system"
        exit 1
    fi
    
    # Check Docker
    if ! command_exists docker; then
        log_error "Docker not found. Please install Docker first"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        log_error "docker-compose not found. Please install docker-compose first"
        exit 1
    fi
    
    # Check and install dependencies
    check_mongodb "$OS"
    check_redis "$OS"
    
    # Start services
    start_mongodb "$OS"
    start_redis "$OS"
    
    # Docker operations
    cleanup_docker
    
    log_info "Building and starting Docker containers..."
    docker-compose up -d --build
    log_success "Docker containers started"
    
    echo ""
    log_info "📋 Showing container logs (Ctrl+C to exit)..."
    echo ""
    docker-compose logs -f --tail 50
}

# Run main function
main "$@"