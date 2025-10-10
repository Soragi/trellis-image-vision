#!/bin/bash

# Trellis NIM Application Stop Script
# This script cleanly stops all services and containers

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

echo "🛑 Stopping Trellis NIM Application..."
echo "======================================"

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --clean, -c    Remove all containers, volumes, and networks"
    echo "  --logs, -l     Keep log files (default: keep logs)"
    echo "  --help, -h     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Stop all services, keep data"
    echo "  $0 --clean      # Stop services and remove all data"
}

# Parse command line arguments
CLEAN_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--clean)
            CLEAN_MODE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Stop frontend if running locally (find process by port)
print_status "Checking for local frontend process..."
FRONTEND_PID=$(lsof -ti:5173 2>/dev/null || echo "")
if [ -n "$FRONTEND_PID" ]; then
    print_status "Stopping local frontend process (PID: $FRONTEND_PID)..."
    kill -TERM $FRONTEND_PID 2>/dev/null || true
    sleep 2
    # Force kill if still running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill -KILL $FRONTEND_PID 2>/dev/null || true
    fi
    print_success "Local frontend stopped"
else
    print_status "No local frontend process found"
fi

# Stop Docker containers
print_status "Stopping Docker containers..."
if [ "$CLEAN_MODE" = true ]; then
    print_warning "Clean mode enabled - this will remove all containers, volumes, and networks"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down --volumes --remove-orphans
        
        # Remove any remaining containers
        print_status "Removing any remaining Trellis containers..."
        docker ps -a --filter "name=trellis" --format "{{.ID}}" | xargs -r docker rm -f
        
        # Remove any dangling images
        print_status "Cleaning up Docker images..."
        docker system prune -f
        
        # Optionally clean up stored models and uploads
        read -p "Remove uploaded files and generated models? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Removing uploaded files and generated models..."
            rm -rf backend/uploads/images/*
            rm -rf backend/uploads/models/*
            print_warning "All uploaded files and generated models have been deleted"
        fi
        
        print_success "Clean shutdown completed"
    else
        print_status "Clean mode cancelled, performing normal shutdown..."
        docker-compose down --remove-orphans
    fi
else
    docker-compose down --remove-orphans
    print_success "All containers stopped gracefully"
fi

# Show final status
print_status "Final status:"
REMAINING_CONTAINERS=$(docker ps -q --filter "name=trellis" | wc -l)
if [ "$REMAINING_CONTAINERS" -eq 0 ]; then
    print_success "All Trellis containers stopped"
else
    print_warning "$REMAINING_CONTAINERS Trellis containers still running"
    docker ps --filter "name=trellis"
fi

# Check for any processes still using the ports
print_status "Checking port usage..."
for port in 5173 3001 8080 80 443; do
    if lsof -ti:$port >/dev/null 2>&1; then
        print_warning "Port $port is still in use"
        lsof -ti:$port | head -5
    fi
done

print_success "Trellis NIM Application stopped! 🎉"
echo ""
echo "📋 Next Steps:"
echo "  • To start again: ./scripts/start.sh"
echo "  • To check status: ./scripts/status.sh"
if [ "$CLEAN_MODE" = true ]; then
    echo "  • To setup again: ./scripts/setup.sh"
fi
echo ""
