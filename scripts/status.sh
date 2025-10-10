#!/bin/bash

# Trellis NIM Application Status Check Script
# This script checks the health status of all services

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
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo "🔍 Trellis NIM Application Status"
echo "=================================="

# Check Docker containers
print_status "Docker Container Status:"
echo ""
docker-compose ps --format "table {{.Name}}\t{{.State}}\t{{.Status}}"
echo ""

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_success "$name is healthy"
        return 0
    else
        print_error "$name is not responding"
        return 1
    fi
}

# Check individual services
print_status "Service Health Checks:"
echo ""

# Check Trellis NIM
if docker-compose ps trellis-nim | grep -q "Up"; then
    if check_endpoint "Trellis NIM" "http://localhost:8080/health"; then
        # Get NIM specific info if available
        print_status "Trellis NIM GPU Status:"
        docker exec trellis-nim nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits 2>/dev/null || print_warning "Cannot query GPU status"
    fi
else
    print_error "Trellis NIM container is not running"
fi

echo ""

# Check Backend
if docker-compose ps backend | grep -q "Up"; then
    if check_endpoint "Backend API" "http://localhost:3001/api/health"; then
        # Get backend specific info
        backend_info=$(curl -s http://localhost:3001/api/health 2>/dev/null)
        if [ $? -eq 0 ]; then
            print_status "Backend Details:"
            echo "$backend_info" | python3 -m json.tool 2>/dev/null || echo "$backend_info"
        fi
    fi
else
    print_error "Backend container is not running"
fi

echo ""

# Check Frontend (if running in container)
if docker-compose ps frontend | grep -q "Up" 2>/dev/null; then
    check_endpoint "Frontend" "http://localhost:5173"
else
    # Check if frontend is running locally
    if curl -s -o /dev/null http://localhost:5173; then
        print_success "Frontend is running (local development mode)"
    else
        print_warning "Frontend is not accessible on port 5173"
    fi
fi

echo ""

# Check Nginx (if running)
if docker-compose ps nginx | grep -q "Up" 2>/dev/null; then
    check_endpoint "Nginx Proxy" "http://localhost/health"
    echo ""
fi

# Resource usage
print_status "Resource Usage:"
echo ""
echo "Docker Container Resources:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""

# Disk usage for uploads
if [ -d "backend/uploads" ]; then
    uploads_size=$(du -sh backend/uploads 2>/dev/null | cut -f1)
    print_status "Upload Storage Used: $uploads_size"
fi

# Check log files
echo ""
print_status "Recent Log Activity:"
if [ -d "backend/logs" ]; then
    log_count=$(find backend/logs -name "*.log" -mtime -1 | wc -l)
    print_status "Log files modified in last 24h: $log_count"
fi

if [ -d "trellis_nim_logs" ]; then
    nim_log_count=$(find trellis_nim_logs -name "*.log" -mtime -1 2>/dev/null | wc -l)
    print_status "Trellis NIM log files modified in last 24h: $nim_log_count"
fi

echo ""
print_status "Status check completed at $(date)"

# Exit with error code if any critical service is down
if ! docker-compose ps trellis-nim | grep -q "Up" || ! docker-compose ps backend | grep -q "Up"; then
    exit 1
fi
