#!/bin/bash

# Trellis NIM Application Start Script
# This script starts the complete Trellis NIM application stack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 Starting Trellis NIM Application..."
echo "======================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please run ./scripts/setup.sh first."
    exit 1
fi

# Check if API key is configured
if grep -q "your_nvidia_api_key_here" .env; then
    print_error "API key not configured in .env file."
    print_error "Please edit .env and add your NVIDIA API key."
    print_error 'Replace "your_nvidia_api_key_here" with your actual API key.'
    print_error "Get your API key from: https://build.nvidia.com/microsoft/trellis"
    exit 1
fi

# Check if backend .env file exists and is configured
if [ ! -f "backend/.env" ]; then
    print_error "backend/.env file not found. Please run ./scripts/setup.sh first."
    exit 1
fi

if grep -q "your_nvidia_api_key_here" backend/.env; then
    print_error "API key not configured in backend/.env file."
    print_error "Please edit backend/.env and add your NVIDIA API key."
    exit 1
fi

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

# Parse command line arguments
MODE="dev"
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    MODE="prod"
fi

print_status "Starting in $MODE mode..."

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Pull the latest Trellis NIM image
print_status "Pulling NVIDIA Trellis NIM image..."
docker pull nvcr.io/nim/microsoft/trellis:1.0.0

if [ "$MODE" = "prod" ]; then
    # Production mode with Nginx
    print_status "Starting production stack with Nginx..."
    docker-compose --profile production up -d
    
    echo ""
    print_success "Production stack started successfully! 🎉"
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend: http://localhost (port 80)"
    echo "   Backend API: http://localhost/api"
    echo "   Health Check: http://localhost/health"
    echo ""
else
    # Development mode
    print_status "Starting development stack..."
    docker-compose up -d trellis-nim backend
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
            break
        fi
        sleep 2
        attempt=$((attempt + 1))
        echo -n "."
    done
    echo ""
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Backend failed to start within timeout"
        exit 1
    fi
    
    print_success "Backend is ready!"
    
    # Start frontend in development mode
    print_status "Starting frontend in development mode..."
    VITE_BACKEND_URL=http://localhost:3001 npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for frontend to start
    sleep 3
    
    echo ""
    print_success "Development stack started successfully! 🎉"
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:3001/api"
    echo "   Backend Health: http://localhost:3001/api/health"
    echo "   Trellis NIM: http://localhost:8080"
    echo ""
    echo "📊 Monitoring:"
    echo "   Check status: ./scripts/status.sh"
    echo "   View logs: ./scripts/logs.sh"
    echo ""
    echo "🛑 To stop:"
    echo "   Press Ctrl+C to stop frontend"
    echo "   Run: docker-compose down"
    
    # Keep script running and handle Ctrl+C
    trap 'echo -e "\n${YELLOW}Stopping frontend...${NC}"; kill $FRONTEND_PID 2>/dev/null; exit 0' INT
    wait $FRONTEND_PID
fi

echo ""
print_status "Checking service health..."
./scripts/status.sh

echo ""
print_success "All services are running! 🚀"
echo ""
print_status "To stop all services run: docker-compose down"
