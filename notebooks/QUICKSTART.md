# 🚀 Quick Start Guide - Notebook Deployment

This guide will help you deploy the Trellis NIM application using the Jupyter notebook on your VM.

## Prerequisites

Make sure your VM has:
- ✅ NVIDIA GPU (L40s or similar)
- ✅ Ubuntu 20.04+ (or similar Linux)
- ✅ Docker and Docker Compose installed
- ✅ NVIDIA drivers and Docker runtime configured
- ✅ Python 3.8+

## Method 1: Jupyter Notebook (Recommended for Interactive Use)

### Step 1: Install Dependencies

```bash
cd /path/to/trellis-image-vision/notebooks

# Install Python packages
pip install jupyter python-dotenv requests tabulate psutil ipywidgets
```

### Step 2: Start Jupyter

```bash
# Start Jupyter Notebook
jupyter notebook

# Or for remote access with SSH tunneling:
# On VM: jupyter notebook --no-browser --port=8888
# On Local: ssh -L 8888:localhost:8888 user@vm-ip
```

### Step 3: Run the Deployment Notebook

1. Open `deployment.ipynb` in your browser
2. Run cells 1-3 to setup (imports and utilities)
3. Run cell 6 to check prerequisites
4. **IMPORTANT**: Edit cell 10 to add your NVIDIA API key:
   ```python
   NVIDIA_API_KEY = "nvapi-your-actual-key-here"
   ```
5. Run remaining cells sequentially to deploy
6. Cell 17 will check if all services are healthy

### Step 4: Access the Application

Once deployed, open in your browser:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Trellis NIM**: http://localhost:8080

## Method 2: Standalone Python Script (Recommended for Automation)

### Step 1: Install Dependencies

```bash
cd /path/to/trellis-image-vision/notebooks

# Install Python packages
pip install python-dotenv requests
```

### Step 2: Set API Key

```bash
export NVIDIA_API_KEY="nvapi-your-actual-key-here"
```

### Step 3: Deploy with One Command

```bash
# Full deployment
./deploy_standalone.py deploy

# Or step by step:
./deploy_standalone.py check      # Check prerequisites
./deploy_standalone.py setup      # Setup environment
./deploy_standalone.py install    # Install dependencies
./deploy_standalone.py pull       # Pull Docker images
./deploy_standalone.py deploy     # Full deployment
```

### Step 4: Manage Services

```bash
# Check status
./deploy_standalone.py status

# View logs
./deploy_standalone.py logs
./deploy_standalone.py logs --service backend --lines 100

# Restart services
./deploy_standalone.py restart
./deploy_standalone.py restart --service backend

# Stop services
./deploy_standalone.py stop
```

## Method 3: Using Existing Shell Scripts

The project also includes bash scripts:

```bash
cd /path/to/trellis-image-vision

# Setup and deploy
./scripts/setup.sh
./scripts/start.sh

# Manage
./scripts/status.sh
./scripts/logs.sh
./scripts/stop.sh
```

## Getting Your NVIDIA API Key

1. Go to https://build.nvidia.com/microsoft/trellis
2. Sign in with your NVIDIA account
3. Click "Get API Key"
4. Generate and copy your API key
5. Add it to your deployment:
   - **Notebook**: Edit cell 10
   - **Script**: `export NVIDIA_API_KEY="your-key"`
   - **Manual**: Edit `.env` and `backend/.env` files

## Verification Steps

After deployment, verify everything works:

### 1. Check Service Health

**In Notebook:**
```python
check_all_services()
```

**In Terminal:**
```bash
./deploy_standalone.py status

# Or
curl http://localhost:8080/health      # Trellis NIM
curl http://localhost:3001/api/health  # Backend
curl http://localhost:5173             # Frontend
```

### 2. Check GPU Usage

```bash
nvidia-smi

# Or in notebook:
# monitor_gpu()
```

### 3. View Logs

**In Notebook:**
```python
view_logs(lines=50)
```

**In Terminal:**
```bash
./deploy_standalone.py logs --lines 50
```

### 4. Test the Application

1. Open http://localhost:5173
2. Upload a test image
3. Click "Generate 3D Model"
4. Wait for processing (2-3 minutes)
5. Download the GLB file

## Common Issues and Solutions

### Issue: "Docker not found"

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in
```

### Issue: "GPU not detected"

```bash
# Check GPU
nvidia-smi

# Install NVIDIA Docker runtime
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

### Issue: "Services not starting"

```bash
# Check Docker logs
docker-compose logs trellis-nim
docker-compose logs backend

# Restart Docker
sudo systemctl restart docker

# Try again
./deploy_standalone.py stop
./deploy_standalone.py deploy
```

### Issue: "API key not working"

1. Verify key format: Should start with `nvapi-`
2. Check key is set in both `.env` files:
   ```bash
   grep NVIDIA_API_KEY .env
   grep TRELLIS_NIM_API_KEY backend/.env
   ```
3. Regenerate key if needed from https://build.nvidia.com

### Issue: "Port already in use"

```bash
# Find what's using the port
sudo lsof -i :8080
sudo lsof -i :3001
sudo lsof -i :5173

# Kill the process or change ports in docker-compose.yml
```

## Monitoring and Management

### Continuous Monitoring

**Using watch (terminal):**
```bash
watch -n 5 './deploy_standalone.py status'
```

**Using Jupyter:**
Run this cell repeatedly:
```python
import time
while True:
    status_dashboard()
    time.sleep(30)  # Update every 30 seconds
```

### Log Monitoring

**Follow logs in real-time:**
```bash
docker-compose logs -f

# Or specific service:
docker-compose logs -f backend
docker-compose logs -f trellis-nim
```

### Resource Monitoring

```bash
# Docker stats
docker stats

# GPU monitoring
watch -n 1 nvidia-smi

# System resources
htop
```

## Next Steps

1. ✅ **Deploy**: Follow one of the methods above
2. ✅ **Verify**: Check all services are healthy
3. ✅ **Test**: Upload an image and generate 3D model
4. ✅ **Monitor**: Keep an eye on logs and resources
5. ✅ **Optimize**: Adjust parameters based on your needs

## Additional Resources

- **Full Documentation**: `../README.md`
- **Deployment Checklist**: `../DEPLOYMENT_CHECKLIST.md`
- **API Guide**: `../API_CREDENTIALS_GUIDE.md`
- **Notebooks README**: `README.md`

## Support

If you need help:
1. Check the troubleshooting section above
2. Review logs: `./deploy_standalone.py logs`
3. Check service status: `./deploy_standalone.py status`
4. Review the full README and documentation
5. Check NVIDIA NIM documentation

---

**Happy deploying! 🎉**

Need help? Run: `./deploy_standalone.py --help`

