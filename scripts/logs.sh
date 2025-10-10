#!/bin/bash

# Trellis NIM Application Log Viewer Script
# This script helps you view and monitor application logs

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

# Function to show usage
show_usage() {
    echo "📋 Trellis NIM Log Viewer"
    echo "========================="
    echo ""
    echo "Usage: $0 [SERVICE] [OPTIONS]"
    echo ""
    echo "Services:"
    echo "  all           - Show logs from all services (default)"
    echo "  trellis-nim   - Show Trellis NIM container logs"
    echo "  backend       - Show backend API logs"
    echo "  frontend      - Show frontend logs (if containerized)"
    echo "  nginx         - Show Nginx logs (if running)"
    echo ""
    echo "Options:"
    echo "  -f, --follow  - Follow log output (tail -f behavior)"
    echo "  -n, --lines   - Number of lines to show (default: 100)"
    echo "  -e, --errors  - Show only error logs"
    echo "  -h, --help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Show last 100 lines from all services"
    echo "  $0 backend -f           # Follow backend logs"
    echo "  $0 trellis-nim -n 50    # Show last 50 lines from Trellis NIM"
    echo "  $0 backend -e           # Show only backend errors"
}

# Parse command line arguments
SERVICE="all"
FOLLOW=false
LINES=100
ERRORS_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        all|trellis-nim|backend|frontend|nginx)
            SERVICE="$1"
            shift
            ;;
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -e|--errors)
            ERRORS_ONLY=true
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

# Function to show Docker container logs
show_docker_logs() {
    local container_name=$1
    local follow_flag=""
    local lines_flag="--tail $LINES"
    
    if [ "$FOLLOW" = true ]; then
        follow_flag="-f"
        lines_flag="--tail $LINES"
    fi
    
    if docker-compose ps "$container_name" | grep -q "Up"; then
        print_status "Showing logs for $container_name container..."
        docker-compose logs $follow_flag $lines_flag "$container_name"
    else
        print_warning "$container_name container is not running"
    fi
}

# Function to show file-based logs
show_file_logs() {
    local log_path=$1
    local service_name=$2
    
    if [ -d "$log_path" ]; then
        print_status "Showing $service_name file logs..."
        
        if [ "$ERRORS_ONLY" = true ]; then
            if [ -f "$log_path/error.log" ]; then
                if [ "$FOLLOW" = true ]; then
                    tail -f -n "$LINES" "$log_path/error.log"
                else
                    tail -n "$LINES" "$log_path/error.log"
                fi
            else
                print_warning "No error.log file found in $log_path"
            fi
        else
            # Show combined logs or most recent log file
            if [ -f "$log_path/combined.log" ]; then
                if [ "$FOLLOW" = true ]; then
                    tail -f -n "$LINES" "$log_path/combined.log"
                else
                    tail -n "$LINES" "$log_path/combined.log"
                fi
            else
                # Find most recent log file
                recent_log=$(find "$log_path" -name "*.log" -type f -exec ls -t {} + | head -n 1)
                if [ -n "$recent_log" ]; then
                    print_status "Showing most recent log file: $recent_log"
                    if [ "$FOLLOW" = true ]; then
                        tail -f -n "$LINES" "$recent_log"
                    else
                        tail -n "$LINES" "$recent_log"
                    fi
                else
                    print_warning "No log files found in $log_path"
                fi
            fi
        fi
    else
        print_warning "$service_name log directory not found: $log_path"
    fi
}

# Function to show all logs
show_all_logs() {
    if [ "$FOLLOW" = true ]; then
        print_status "Following logs from all services (Press Ctrl+C to stop)..."
        docker-compose logs -f --tail "$LINES"
    else
        print_status "Showing last $LINES lines from all services..."
        docker-compose logs --tail "$LINES"
    fi
}

# Main logic
case $SERVICE in
    "all")
        show_all_logs
        ;;
    "trellis-nim")
        show_docker_logs "trellis-nim"
        ;;
    "backend")
        # Show both container logs and file logs
        show_docker_logs "backend"
        echo ""
        show_file_logs "backend/logs" "Backend"
        ;;
    "frontend")
        show_docker_logs "frontend"
        ;;
    "nginx")
        show_docker_logs "nginx"
        ;;
    *)
        print_error "Unknown service: $SERVICE"
        show_usage
        exit 1
        ;;
esac

if [ "$FOLLOW" = true ]; then
    echo ""
    print_status "Log following stopped."
fi
