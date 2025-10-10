#!/bin/bash

# Trellis NIM Application Setup Script
# This script helps you set up the complete Trellis NIM application

set -e

echo "🚀 Setting up Trellis NIM Application..."
echo "============================================="

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

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    print_warning "This script is optimized for Linux. Some commands may need adaptation for other OS."
fi

# Check for required commands
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

print_status "Checking required dependencies..."
check_command "docker"
check_command "docker-compose"
check_command "curl"
check_command "node"
check_command "npm"

# Check Docker daemon
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

# Check for NVIDIA Docker runtime
if ! docker info | grep -q nvidia; then
    print_warning "NVIDIA Docker runtime not detected. Make sure it's installed for GPU support."
    print_warning "Install with: sudo apt-get install nvidia-docker2"
fi

# Check for GPU
if ! command -v nvidia-smi &> /dev/null; then
    print_warning "nvidia-smi not found. Make sure NVIDIA drivers are installed."
else
    print_status "GPU Information:"
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
fi

# Create necessary directories
print_status "Creating required directories..."
mkdir -p backend/uploads/images
mkdir -p backend/uploads/models
mkdir -p backend/logs
mkdir -p trellis_nim_logs
mkdir -p nginx/ssl

print_success "Directories created successfully"

# Copy environment files
print_status "Setting up environment configuration..."

if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "⚠️  IMPORTANT: Edit .env file and add your NVIDIA API key!"
    else
        print_error "env.example file not found"
        exit 1
    fi
else
    print_warning ".env file already exists. Skipping..."
fi

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env file from template"
        print_warning "⚠️  IMPORTANT: Edit backend/.env file and add your NVIDIA API key!"
    else
        print_error "backend/env.example file not found"
        exit 1
    fi
else
    print_warning "backend/.env file already exists. Skipping..."
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
print_success "Backend dependencies installed"
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Build backend
print_status "Building backend..."
cd backend
npm run build
print_success "Backend built successfully"
cd ..

print_success "Setup completed successfully! 🎉"
echo ""
echo "============================================="
echo "📋 NEXT STEPS:"
echo "============================================="
echo ""
echo "1. 🔑 ADD YOUR API CREDENTIALS:"
echo "   Edit the following files and add your NVIDIA API key:"
echo "   - .env"
echo "   - backend/.env"
echo ""
echo '   """'
echo '   Insert API Credentials here'
echo '   Replace "your_nvidia_api_key_here" with your actual NVIDIA API key'
echo '   Get it from: https://build.nvidia.com/microsoft/trellis'
echo '   """'
echo ""
echo "2. 🚀 START THE APPLICATION:"
echo "   Run: ./scripts/start.sh"
echo ""
echo "3. 🔍 CHECK STATUS:"
echo "   Run: ./scripts/status.sh"
echo ""
echo "============================================="
