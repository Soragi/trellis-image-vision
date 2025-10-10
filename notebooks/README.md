# 📓 Trellis NIM Notebooks

This directory contains Jupyter notebooks for deploying and working with the Trellis NIM 3D Model Generation Application.

## Available Notebooks

### 1. `deployment.ipynb` - Complete Deployment & Management

A comprehensive notebook for deploying and managing the entire Trellis NIM application from your VM.

**Features:**
- ✅ System prerequisites checking (Docker, GPU, resources)
- 🔧 Environment configuration and API key setup
- 🐳 Docker compose deployment
- 📊 Real-time health monitoring
- 📝 Log viewing and debugging
- 🔄 Service management (start/stop/restart)
- 💻 Resource monitoring (CPU, RAM, GPU, Disk)
- 📱 Complete status dashboard

**Use Cases:**
- Initial deployment on a new VM
- Day-to-day operations and monitoring
- Troubleshooting and debugging
- Resource management

**How to Use:**
1. Start Jupyter on your VM:
   ```bash
   jupyter notebook
   ```
2. Open `deployment.ipynb`
3. Run cells sequentially from top to bottom
4. Update the API key cell with your NVIDIA API key
5. Execute deployment cells

**Important:** Make sure to set your NVIDIA API key in cell #10 before deploying!

### 2. `trellis_nim_workflow.ipynb` - API Workflow

A workflow-focused notebook for submitting images to the Trellis NIM API and retrieving generated 3D models.

**Features:**
- Direct API interaction with Trellis NIM
- Image encoding and submission
- Job polling and status tracking
- Asset downloading

**Use Cases:**
- Testing the Trellis NIM API
- Batch processing images
- API integration development
- Debugging generation issues

## Prerequisites

### System Requirements
- Linux VM with NVIDIA GPU (L40s recommended)
- Docker and Docker Compose installed
- NVIDIA Docker runtime configured
- Python 3.8+ with Jupyter

### Install Jupyter

```bash
# Install Jupyter
pip install jupyter notebook

# Or with conda
conda install -c conda-forge jupyter notebook
```

### Python Dependencies

For the deployment notebook:
```bash
pip install python-dotenv requests tabulate psutil ipywidgets
```

For the workflow notebook:
```bash
pip install requests python-dotenv pillow tqdm
```

## Quick Start

### Option 1: Using Jupyter Notebook

```bash
# Navigate to the notebooks directory
cd /path/to/trellis-image-vision/notebooks

# Start Jupyter
jupyter notebook

# Open deployment.ipynb in your browser
# Run all cells or execute them one by one
```

### Option 2: Using JupyterLab

```bash
# Install JupyterLab
pip install jupyterlab

# Start JupyterLab
jupyter lab

# Navigate to notebooks/deployment.ipynb
```

### Option 3: Using VS Code

1. Install the Jupyter extension in VS Code
2. Open the notebook file
3. Select Python kernel
4. Run cells interactively

## Deployment Workflow

When using `deployment.ipynb`, follow this workflow:

### Phase 1: Preparation (Cells 1-6)
1. **Setup** - Install Python packages and import dependencies
2. **Prerequisites Check** - Verify system requirements
3. **Environment Configuration** - Setup .env files
4. **API Key Configuration** - Configure NVIDIA API key (⚠️ Required!)

### Phase 2: Build (Cells 7-12)
5. **Directory Creation** - Create necessary directories
6. **Dependencies** - Install npm packages for frontend and backend
7. **Build** - Compile TypeScript backend

### Phase 3: Deployment (Cells 13-15)
8. **Pull Images** - Download required Docker images
9. **Start Services** - Launch all services with docker-compose
10. **Health Checks** - Verify all services are running

### Phase 4: Monitoring (Cells 16-26)
11. **Service Status** - Check Docker container status
12. **Logs** - View application logs
13. **Resources** - Monitor CPU, RAM, GPU, and Disk
14. **Dashboard** - Complete status overview

### Phase 5: Management (Cells 21-22)
15. **Restart/Stop/Rebuild** - Service management commands

## Common Commands

After deployment, use these commands in the notebook:

```python
# Check if all services are healthy
check_all_services()

# View complete status dashboard
status_dashboard()

# View logs from all services
view_logs(lines=50)

# View logs from specific service
view_logs('backend', lines=100)
view_logs('trellis-nim', lines=100)

# Monitor GPU usage
monitor_gpu()

# Monitor Docker resource usage
monitor_resources()

# System resource summary
system_resource_summary()

# Restart services
restart_services()  # All services
restart_services('backend')  # Specific service

# Stop services
stop_services()

# Rebuild and restart
rebuild_services()
```

## Troubleshooting

### Services Not Starting

Run this in a notebook cell:
```python
# Check Docker status
!systemctl status docker

# Check logs for errors
view_logs('trellis-nim', lines=100)
view_logs('backend', lines=100)
```

### API Key Issues

```python
# Verify API key is set
load_dotenv()
api_key = os.getenv('NVIDIA_API_KEY')
print(f"API Key set: {api_key is not None and len(api_key) > 0}")

# Reconfigure if needed
configure_api_key("your-actual-api-key-here")
```

### GPU Not Detected

```python
# Check GPU availability
!nvidia-smi

# Check NVIDIA Docker runtime
!docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

### Port Conflicts

```python
# Check if ports are available
!sudo lsof -i :8080
!sudo lsof -i :3001
!sudo lsof -i :5173
```

## Remote Access

If running Jupyter on a remote VM, you can access it via SSH tunneling:

```bash
# On your local machine
ssh -L 8888:localhost:8888 user@your-vm-ip

# On the VM
jupyter notebook --no-browser --port=8888
```

Then open http://localhost:8888 on your local machine.

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Keys**: Never commit notebooks with API keys to git
2. **Jupyter Access**: Use token/password authentication for Jupyter
3. **Network Access**: Limit who can access Jupyter server
4. **SSL**: Use HTTPS for Jupyter in production
5. **Firewall**: Only expose necessary ports

### Secure Jupyter Setup

```bash
# Generate Jupyter config
jupyter notebook --generate-config

# Set password
jupyter notebook password

# Start with specific IP and port
jupyter notebook --ip=0.0.0.0 --port=8888 --no-browser
```

## Tips and Best Practices

1. **Run Sequentially**: Execute cells in order, especially during initial deployment
2. **Check Prerequisites**: Always run the prerequisites check first
3. **Monitor Resources**: Keep an eye on GPU and system resources
4. **Save Often**: Save the notebook frequently, especially after adding notes
5. **Use Dashboard**: Run `status_dashboard()` periodically for overview
6. **Document Issues**: Add markdown cells with notes about issues encountered
7. **Clean Outputs**: Clear outputs before committing notebooks to git

## Additional Resources

- **Main Documentation**: `../README.md`
- **Deployment Guide**: `../DEPLOYMENT_CHECKLIST.md`
- **API Credentials**: `../API_CREDENTIALS_GUIDE.md`
- **Trellis NIM Setup**: `../docs/trellis_nim_setup.md`

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs using `view_logs()`
3. Check service health with `check_all_services()`
4. Review the main README.md
5. Check NVIDIA NIM documentation

## Contributing

To add new notebooks:

1. Create notebook in this directory
2. Add clear documentation and comments
3. Include error handling
4. Update this README with notebook description
5. Test thoroughly before committing

## License

Same as the main project license.

---

Happy deploying! 🚀✨

