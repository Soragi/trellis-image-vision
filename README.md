# 🎨 Trellis NIM Deployment - Simplified Jupyter Notebook

A streamlined solution for deploying NVIDIA's Trellis NIM (Neural Image Models) for 3D model generation from 2D images. This project provides a single Jupyter notebook that handles everything from GPU setup to 3D model generation.

## 🌟 What This Does

Transform 2D images into stunning 3D GLB models using NVIDIA's Trellis NIM technology through a simple Jupyter notebook workflow:

- **🔍 GPU Detection**: Automatically checks for L40s GPU availability with nvidia-smi
- **🚀 NIM Deployment**: Follows NVIDIA's official blueprint for Trellis NIM deployment
- **🖼️ Image Processing**: Upload images and generate 3D models
- **📥 GLB Output**: Download generated 3D models in GLB format

## 📋 Prerequisites

### Hardware Requirements
- **GPU**: NVIDIA L40s (or compatible with >= 24GB VRAM)
- **RAM**: Minimum 32GB system RAM
- **Storage**: At least 50GB free space

### Software Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Python**: 3.8+ with Jupyter Notebook
- **Docker**: Version 20.10+ with NVIDIA Container Runtime
- **NVIDIA Drivers**: Latest GPU drivers installed

### NVIDIA Account Requirements
- Active [NVIDIA Developer](https://developer.nvidia.com/) account
- Access to [NGC (NVIDIA GPU Cloud)](https://ngc.nvidia.com/)
- NGC API key (get from https://ngc.nvidia.com/setup/api-key)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd trellis-image-vision
```

### 2. Install Jupyter
```bash
# Install Python dependencies
pip install jupyter requests python-dotenv pillow tqdm ipywidgets

# Start Jupyter Notebook
jupyter notebook
```

### 3. Run the Complete Deployment
Open `trellis_nim_complete_deployment.ipynb` and run all cells sequentially. The notebook will:

1. **Step 1**: Check GPU availability with nvidia-smi
2. **Step 2**: Install Docker and NVIDIA Container Toolkit
3. **Step 3**: Authenticate with NGC and deploy Trellis NIM
4. **Step 4**: Test API connectivity
5. **Step 5**: Run image-to-3D generation workflow

### 4. Generate 3D Models
The notebook includes a complete workflow to:
- Upload your images (PNG, JPG, JPEG, WEBP)
- Configure generation parameters
- Submit jobs to the deployed NIM
- Download GLB models and textures

## 📖 Detailed Workflow

### GPU Check
The notebook automatically detects your L40s GPU and verifies NVIDIA drivers:
```bash
nvidia-smi  # Checks GPU status and availability
```

### NIM Deployment
Follows NVIDIA's official blueprint from https://build.nvidia.com/microsoft/trellis/deploy:
- Pulls the official Trellis NIM container
- Configures GPU access
- Starts the NIM service on port 8000
- Verifies API connectivity

### Image-to-3D Generation
Complete workflow for generating 3D models:
- Base64 encode input images
- Submit generation jobs
- Poll for completion
- Download GLB models and PNG textures

## 🔧 Configuration Options

### Generation Parameters
- **Mesh Format**: GLB (default), OBJ, PLY
- **Texture Format**: PNG (default), JPG
- **Seed**: Random seed for reproducible results
- **CFG Scales**: Control generation quality and adherence
- **Sampling Steps**: Quality vs speed tradeoff

### Advanced Settings
- **No Texture**: Generate geometry-only models
- **Custom prompts**: Guide generation with text descriptions
- **Batch processing**: Handle multiple images simultaneously

## 🛠️ Troubleshooting

### Common Issues

#### "No GPU detected"
```bash
# Check NVIDIA drivers
nvidia-smi

# Install drivers if missing
sudo apt update
sudo apt install nvidia-driver-470  # or latest version
```

#### "Docker GPU access failed"
```bash
# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

#### "NGC Authentication failed"
- Verify your NGC API key at https://ngc.nvidia.com/setup/api-key
- Ensure the key starts with 'nvapi-'
- Check your NGC account has access to Trellis NIM

#### "Out of memory"
- Ensure no other processes are using GPU memory
- Reduce batch size or image resolution
- Check available GPU memory with `nvidia-smi`

## 📊 Monitoring

### Check NIM Status
```bash
# Check if container is running
docker ps | grep trellis-nim

# View container logs
docker logs trellis-nim

# Monitor GPU usage
watch -n 1 nvidia-smi
```

### Health Checks
The notebook includes built-in health checks:
- Container status verification
- API endpoint testing
- GPU memory monitoring
- Generation workflow validation

## 📁 Project Structure

```
trellis-image-vision/
├── 📓 trellis_nim_complete_deployment.ipynb  # Main deployment notebook
├── 📄 README.md                              # This documentation
├── 📄 .gitignore                             # Git ignore rules
└── 📁 .git/                                  # Git repository data
```

## 🔄 Updates

### Updating Trellis NIM
```bash
# Pull latest NIM image
docker pull nvcr.io/nim/microsoft/trellis:latest

# Restart with new image (run in notebook)
docker stop trellis-nim
docker rm trellis-nim
# Then re-run deployment cells in notebook
```

## 🤝 Support

For support and questions:
- 📧 Create an issue in this repository
- 📖 Check the troubleshooting section above
- 🔍 Review the notebook output for detailed error messages
- 📚 Consult NVIDIA's official Trellis documentation

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **NVIDIA** for the Trellis NIM technology and deployment blueprint
- **Jupyter** community for the excellent notebook environment
- **Docker** for containerization platform

---

**🎉 Ready to Generate 3D Models!** 

Simply open `trellis_nim_complete_deployment.ipynb` in Jupyter Notebook and run all cells to deploy Trellis NIM and start generating 3D models from your 2D images!