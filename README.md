# 🎨 Trellis NIM 3D Model Generation Application

A complete end-to-end application that transforms 2D images into stunning 3D models using NVIDIA's Trellis NIM (Neural Image Models) technology. This application features a modern React frontend with a robust Node.js backend, all deployable on a GPU-equipped VM with Docker.

## 🌟 Features

- **🖼️ Multi-Image Upload**: Drag-and-drop interface supporting PNG, JPG, JPEG, and WEBP formats
- **🎛️ Advanced Parameters**: Fine-tune generation with configurable sampling steps, CFG scales, and more
- **🔄 Real-time Processing**: Live status updates and progress tracking
- **📥 Asset Downloads**: Direct download of generated GLB models and textures
- **🚀 GPU Acceleration**: Optimized for NVIDIA L40s GPU with Docker deployment
- **📊 Health Monitoring**: Comprehensive health checks and status monitoring
- **🔒 Production Ready**: Security headers, rate limiting, and error handling

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │    │   Node.js       │    │   NVIDIA        │
│   Frontend      │────│   Backend       │────│   Trellis NIM   │
│   (Port 5173)   │    │   (Port 3001)   │    │   (Port 8080)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx         │
                    │   Reverse Proxy │
                    │   (Port 80/443) │
                    └─────────────────┘
```

## 📋 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **GPU**: NVIDIA L40s or compatible GPU with >= 24GB VRAM
- **RAM**: Minimum 32GB system RAM
- **Storage**: At least 100GB free space for models and assets
- **CPU**: Modern multi-core processor (8+ cores recommended)

### Software Dependencies
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **NVIDIA Docker Runtime**: For GPU support
- **Node.js**: Version 18+ (for local development)
- **npm**: Version 8+
- **curl**: For health checks
- **git**: For cloning the repository

## 🚀 Quick Start Deployment

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd trellis-image-vision

# Run the automated setup script
./scripts/setup.sh
```

The setup script will:
- ✅ Check all required dependencies
- ✅ Create necessary directories
- ✅ Copy configuration templates
- ✅ Install all dependencies
- ✅ Build the backend application

### Step 2: Configure API Credentials

**🔑 CRITICAL: You must add your NVIDIA API key before the application will work!**

#### """
**Insert API Credentials here**

1. **Get your NVIDIA API Key:**
   - Visit https://build.nvidia.com/microsoft/trellis
   - Sign in with your NVIDIA developer account
   - Navigate to the Trellis model page
   - Click "Get API Key" and generate a new key
   - Copy your API key

2. **Add the API key to configuration files:**

   Edit `.env` file:
   ```bash
   nano .env
   ```
   Replace `your_nvidia_api_key_here` with your actual API key:
   ```
   NVIDIA_API_KEY=nvapi-your-actual-api-key-here
   ```

   Edit `backend/.env` file:
   ```bash
   nano backend/.env
   ```
   Replace `your_nvidia_api_key_here` with your actual API key:
   ```
   TRELLIS_NIM_API_KEY=nvapi-your-actual-api-key-here
   ```
#### """

### Step 3: Start the Application

```bash
# Start in development mode (recommended for first-time setup)
./scripts/start.sh

# OR start in production mode with Nginx
./scripts/start.sh prod
```

### Step 4: Verify Deployment

```bash
# Check the status of all services
./scripts/status.sh

# View application logs
./scripts/logs.sh
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5173 (development) or http://localhost (production)
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health
- **Trellis NIM**: http://localhost:8080 (internal use)

## 📖 Detailed Installation Guide

### Manual Installation Steps

If you prefer manual installation or the automated script fails:

#### 1. Install NVIDIA Docker Runtime

```bash
# Install NVIDIA Docker runtime
sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker

# Verify NVIDIA runtime
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

#### 2. Install Dependencies

```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker and Docker Compose
sudo apt-get install -y docker.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 3. Build and Configure

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
npm run build
cd ..

# Create required directories
mkdir -p backend/uploads/{images,models}
mkdir -p backend/logs
mkdir -p trellis_nim_logs
mkdir -p nginx/ssl
```

#### 4. Configure Environment Files

Copy and edit configuration files:

```bash
# Main environment file
cp env.example .env
nano .env  # Add your NVIDIA API key

# Backend environment file
cp backend/env.example backend/.env
nano backend/.env  # Add your NVIDIA API key
```

#### 5. Start Services

```bash
# Pull required Docker images
docker pull nvcr.io/nim/microsoft/trellis:1.0.0

# Start the stack
docker-compose up -d

# Check status
docker-compose ps
```

## 🔧 Configuration Options

### Environment Variables

#### Main Configuration (`.env`)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NVIDIA_API_KEY` | Your NVIDIA API key | `your_nvidia_api_key_here` | **Yes** |
| `TRELLIS_NIM_URL` | Trellis NIM service URL | `http://localhost:8080` | No |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` | No |
| `VITE_BACKEND_URL` | Backend API URL for frontend | `http://localhost:3001` | No |

#### Backend Configuration (`backend/.env`)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TRELLIS_NIM_API_KEY` | API key for Trellis NIM | `your_nvidia_api_key_here` | **Yes** |
| `TRELLIS_NIM_URL` | Trellis NIM service URL | `http://localhost:8080` | No |
| `PORT` | Backend server port | `3001` | No |
| `NODE_ENV` | Runtime environment | `production` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Advanced Configuration

#### GPU Configuration
```bash
# Specify which GPU to use (if multiple GPUs available)
CUDA_VISIBLE_DEVICES=0

# Advanced NIM settings
NIM_MAX_BATCH_SIZE=4
NIM_MAX_SEQUENCE_LENGTH=2048
```

#### Security Configuration
```bash
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS settings
FRONTEND_URL=https://yourdomain.com
```

## 🛠️ Usage Guide

### Basic Image-to-3D Generation

1. **Upload Images**: 
   - Drag and drop images or click to select
   - Supports PNG, JPG, JPEG, WEBP formats
   - Up to 10 images, 10MB each

2. **Configure Parameters**:
   - **Seed**: Set to 0 for random or specific value for reproducible results
   - **CFG Scales**: Control adherence strength (SLAT: 1-10, SS: 1-15)
   - **Sampling Steps**: Higher values = better quality but slower processing
   - **No Texture**: Generate geometry-only models

3. **Generate**: Click "Generate 3D Assets" and monitor progress

4. **Download**: Once complete, download GLB models and textures

### Advanced Parameters Explained

- **Structured Latent CFG Scale (1-10)**: Controls how closely the model follows the input images in structured latent space
- **Sparse Structure CFG Scale (1-15)**: Controls adherence in sparse structure diffusion
- **Sampling Steps (10-50)**: Number of diffusion steps; higher = better quality but longer processing time
- **Seed**: Random seed for reproducible results; 0 = random
- **No Texture**: Skip texture generation for faster geometry-only output

## 📊 Monitoring and Maintenance

### Health Monitoring

```bash
# Check overall system status
./scripts/status.sh

# Check specific service health
curl http://localhost:3001/api/health
curl http://localhost:8080/health
```

### Log Management

```bash
# View all logs
./scripts/logs.sh

# Follow specific service logs
./scripts/logs.sh backend -f
./scripts/logs.sh trellis-nim -f

# View only errors
./scripts/logs.sh backend -e
```

### Performance Monitoring

```bash
# Monitor GPU usage
nvidia-smi -l 1

# Monitor Docker container resources
docker stats

# Check disk usage
df -h
du -sh backend/uploads/
```

### Maintenance Tasks

```bash
# Clean up old generated files (run periodically)
find backend/uploads/models -name "*.glb" -mtime +7 -delete
find backend/uploads/models -name "*.png" -mtime +7 -delete

# Clean up old logs
find backend/logs -name "*.log" -mtime +30 -delete

# Update Docker images
docker-compose pull
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "API key not configured" Error
**Problem**: NVIDIA API key not set or incorrect
**Solution**:
```bash
# Check if API key is properly set
grep NVIDIA_API_KEY .env
grep TRELLIS_NIM_API_KEY backend/.env

# Verify API key format (should start with 'nvapi-')
# Re-run setup if needed
./scripts/setup.sh
```

#### 2. "Trellis NIM service not accessible" Error
**Problem**: Docker container not running or GPU issues
**Solution**:
```bash
# Check container status
docker-compose ps

# Check NVIDIA runtime
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# Restart Trellis NIM container
docker-compose restart trellis-nim

# Check logs
./scripts/logs.sh trellis-nim
```

#### 3. "Out of memory" Error
**Problem**: Insufficient GPU memory
**Solution**:
```bash
# Check GPU memory usage
nvidia-smi

# Reduce batch size in configuration
# Stop other GPU-intensive processes
# Consider using smaller images or fewer images per request
```

#### 4. "Permission denied" Errors
**Problem**: Docker permissions or file permissions
**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER backend/uploads/
sudo chown -R $USER:$USER backend/logs/
```

#### 5. Frontend Not Loading
**Problem**: Frontend service issues
**Solution**:
```bash
# Check if frontend is running
curl http://localhost:5173

# Restart frontend (development mode)
npm run dev

# Check backend connectivity
curl http://localhost:3001/api/health
```

#### 6. Slow Generation Times
**Problem**: Performance optimization needed
**Solution**:
- Reduce sampling steps (25 → 15-20)
- Use smaller input images (< 2MB each)
- Ensure GPU is not being used by other processes
- Check GPU temperature and throttling

### Debug Mode

Enable verbose logging for debugging:

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Restart services
docker-compose restart backend

# View detailed logs
./scripts/logs.sh backend -f
```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**: `./scripts/logs.sh` for detailed error messages
2. **Verify configuration**: Ensure all API keys and URLs are correct
3. **Check GPU status**: `nvidia-smi` to verify GPU availability
4. **Test individual components**: Use health check endpoints
5. **Check Docker status**: `docker-compose ps` and `docker stats`

## 🔄 Updates and Upgrades

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install
cd backend && npm install && cd ..

# Rebuild backend
cd backend && npm run build && cd ..

# Update Docker images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d
```

### Updating Trellis NIM

```bash
# Check for new NIM versions
docker pull nvcr.io/nim/microsoft/trellis:latest

# Update docker-compose.yml with new version
# Restart with new image
docker-compose up -d trellis-nim
```

## 📁 Project Structure

```
trellis-image-vision/
├── 📁 backend/                 # Node.js backend service
│   ├── 📁 src/                 # Source code
│   │   ├── 📁 routes/          # API route handlers
│   │   ├── 📁 services/        # Business logic services
│   │   └── 📁 utils/           # Utility functions
│   ├── 📁 uploads/             # File storage
│   │   ├── 📁 images/          # Uploaded images
│   │   └── 📁 models/          # Generated 3D models
│   ├── 📁 logs/                # Application logs
│   ├── Dockerfile              # Backend container config
│   ├── package.json            # Backend dependencies
│   └── env.example             # Backend environment template
├── 📁 src/                     # React frontend source
│   ├── 📁 components/          # React components
│   ├── 📁 pages/               # Page components
│   └── 📁 lib/                 # Frontend utilities
├── 📁 scripts/                 # Deployment and management scripts
│   ├── setup.sh                # Automated setup script
│   ├── start.sh                # Application startup script
│   ├── status.sh               # Health check script
│   └── logs.sh                 # Log viewing script
├── 📁 nginx/                   # Nginx configuration
│   └── nginx.conf              # Reverse proxy config
├── docker-compose.yml          # Multi-container orchestration
├── Dockerfile.frontend         # Frontend container config
├── env.example                 # Main environment template
└── README.md                   # This documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NVIDIA** for the powerful Trellis NIM technology
- **React** and **Node.js** communities for excellent frameworks
- **Docker** for containerization capabilities
- **Tailwind CSS** and **shadcn/ui** for beautiful UI components

## 📞 Support

For support and questions:
- 📧 Create an issue in this repository
- 📖 Check the troubleshooting section above
- 🔍 Review the logs using `./scripts/logs.sh`

---

**🎉 Happy 3D Generating!** Transform your 2D images into stunning 3D models with the power of NVIDIA's Trellis NIM!