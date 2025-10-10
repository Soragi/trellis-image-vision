# ✅ Deployment Checklist

Use this checklist to ensure your Trellis NIM application is properly deployed and configured.

## 🔧 Pre-Deployment Setup

### System Requirements
- [ ] **Linux VM** with Ubuntu 20.04+ running
- [ ] **NVIDIA L40s GPU** or compatible GPU with 24GB+ VRAM
- [ ] **32GB+ RAM** available on the system
- [ ] **100GB+ free storage** for models and assets
- [ ] **Docker** version 20.10+ installed
- [ ] **Docker Compose** version 2.0+ installed
- [ ] **NVIDIA Docker runtime** installed and configured
- [ ] **Node.js** version 18+ installed
- [ ] **npm** version 8+ installed

### Verify Prerequisites
```bash
# Check GPU
nvidia-smi

# Check Docker
docker --version
docker-compose --version

# Check NVIDIA Docker runtime
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# Check Node.js
node --version
npm --version
```

## 🏗️ Installation Steps

### 1. Repository Setup
- [ ] Repository cloned to target VM
- [ ] All files present in correct structure
- [ ] Scripts have executable permissions (`chmod +x scripts/*.sh`)

### 2. Automated Setup
- [ ] Run `./scripts/setup.sh` successfully
- [ ] All dependencies installed without errors
- [ ] Backend built successfully
- [ ] Required directories created

### 3. API Credentials Configuration
**CRITICAL STEP - Application will not work without this!**

- [ ] **NVIDIA API Key obtained** from https://build.nvidia.com/microsoft/trellis
- [ ] **Main .env file configured**:
  ```bash
  # Edit .env file
  NVIDIA_API_KEY=nvapi-your-actual-api-key-here
  ```
- [ ] **Backend .env file configured**:
  ```bash
  # Edit backend/.env file  
  TRELLIS_NIM_API_KEY=nvapi-your-actual-api-key-here
  ```
- [ ] **No placeholder text remaining** in either file
- [ ] **API key format verified** (starts with `nvapi-`)

### 4. First Deployment
- [ ] Run `./scripts/start.sh` for development mode
- [ ] All containers start successfully
- [ ] No error messages in startup logs
- [ ] Health checks pass

## 🧪 Verification Tests

### Service Health Checks
- [ ] **Overall status check**:
  ```bash
  ./scripts/status.sh
  ```
- [ ] **Trellis NIM health**: http://localhost:8080/health returns 200
- [ ] **Backend health**: http://localhost:3001/api/health returns 200
- [ ] **Frontend accessible**: http://localhost:5173 loads properly

### Container Status
- [ ] **Trellis NIM container**: Running and healthy
- [ ] **Backend container**: Running and healthy
- [ ] **Frontend container**: Running (if containerized) or accessible locally

### GPU Verification
- [ ] **GPU visible in containers**:
  ```bash
  docker exec trellis-nim nvidia-smi
  ```
- [ ] **GPU memory available** for processing
- [ ] **No GPU driver issues** in logs

### API Integration Test
- [ ] **Upload test image** through frontend
- [ ] **Submit generation job** successfully
- [ ] **Receive job ID** from backend
- [ ] **Monitor job progress** with status updates
- [ ] **Download generated GLB file** successfully

## 🔍 Common Issues to Check

### Configuration Issues
- [ ] **No "your_nvidia_api_key_here"** text remaining in config files
- [ ] **Same API key** used in both .env files
- [ ] **No extra spaces** around equals signs in config files
- [ ] **File permissions** correct for uploads directories

### Docker Issues
- [ ] **Docker daemon running** and accessible
- [ ] **NVIDIA runtime available** to Docker Compose
- [ ] **No port conflicts** with other services
- [ ] **Sufficient disk space** for Docker volumes

### Network Issues
- [ ] **Ports 3001, 5173, 8080** not blocked by firewall
- [ ] **Internal container networking** working properly
- [ ] **CORS configuration** allows frontend-backend communication

### GPU Issues
- [ ] **GPU drivers installed** and up to date
- [ ] **NVIDIA Docker runtime** properly configured
- [ ] **GPU not overheating** or throttling
- [ ] **Sufficient GPU memory** available

## 🚀 Production Deployment

### Additional Production Steps
- [ ] **SSL certificates** configured (if using HTTPS)
- [ ] **Nginx configuration** reviewed and customized
- [ ] **Rate limiting** configured appropriately
- [ ] **Log rotation** set up
- [ ] **Monitoring** configured
- [ ] **Backup strategy** implemented

### Security Checklist
- [ ] **API keys secured** and not in version control
- [ ] **Firewall rules** configured properly
- [ ] **Regular security updates** scheduled
- [ ] **Access logging** enabled

### Performance Optimization
- [ ] **GPU utilization** monitored and optimized
- [ ] **Memory usage** within acceptable limits
- [ ] **Disk space monitoring** configured
- [ ] **Log file cleanup** automated

## 📊 Monitoring Setup

### Health Monitoring
- [ ] **Automated health checks** scheduled
- [ ] **Alert system** configured for failures
- [ ] **Log monitoring** for errors and warnings
- [ ] **Resource monitoring** (CPU, RAM, GPU, disk)

### Maintenance Schedule
- [ ] **Regular log cleanup** scheduled
- [ ] **Old generated files cleanup** scheduled
- [ ] **Docker image updates** planned
- [ ] **System updates** scheduled

## ✅ Final Verification

### End-to-End Test
1. [ ] **Upload multiple images** (different formats)
2. [ ] **Configure advanced parameters**
3. [ ] **Submit generation job**
4. [ ] **Monitor real-time progress**
5. [ ] **Download all generated assets**
6. [ ] **Verify GLB files** open correctly in 3D viewers
7. [ ] **Check file sizes** are reasonable
8. [ ] **Confirm texture quality** (if enabled)

### Documentation
- [ ] **README.md reviewed** and customized if needed
- [ ] **API credentials guide** followed
- [ ] **Troubleshooting section** bookmarked
- [ ] **Scripts documentation** understood by ops team

## 🎉 Deployment Complete!

When all items above are checked ✅, your Trellis NIM application is ready for production use!

### Quick Reference Commands
```bash
# Start application
./scripts/start.sh

# Check status  
./scripts/status.sh

# View logs
./scripts/logs.sh

# Stop application
./scripts/stop.sh

# Health check URLs
curl http://localhost:3001/api/health
curl http://localhost:8080/health
```

### Support Resources
- **Main README**: Comprehensive documentation and troubleshooting
- **API Guide**: Step-by-step API credential setup
- **Scripts**: Automated management and monitoring tools
- **Logs**: Detailed error messages and debugging info
