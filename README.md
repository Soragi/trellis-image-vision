# 🎨 Trellis NIM - Image & Text to 3D Generation

Complete NVIDIA Trellis NIM solution for generating 3D models from both images and text prompts. Includes automated container deployment, intelligent format detection, and seamless image-to-3D workflow.

## 🌟 What This Does

Deploy NVIDIA's Trellis NIM and generate 3D GLB models from:
- 📸 **Images** - Direct image-to-3D conversion with automatic fallback to text mode
- 📝 **Text prompts** - Traditional text-to-3D generation
- 🔄 **Auto-detection** - Automatically detects container capabilities and adjusts workflow

## 📋 Prerequisites

### Hardware Requirements
- **GPU**: NVIDIA L40s (or compatible with >= 24GB VRAM)
- **RAM**: Minimum 32GB system RAM

### Software Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Python**: 3.8+ with Jupyter Notebook
- **Docker**: Version 20.10+ with NVIDIA Container Runtime
- **NVIDIA Drivers**: Latest GPU drivers installed

### NVIDIA Account Requirements
- Active [NVIDIA Developer](https://developer.nvidia.com/) account
- NGC API key from https://ngc.nvidia.com/setup/api-key

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install Jupyter if you don't have it
pip install jupyter

# Install Docker with NVIDIA runtime (Ubuntu example)
sudo apt update
sudo apt install docker.io

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -fsSL https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt update && sudo apt install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### 2. Run the Notebook
```bash
# Start Jupyter Notebook
jupyter notebook

# Open: trellis_nim_simple.ipynb
```

### 3. Choose Your Workflow

**📝 For Text-to-3D:** Use `trellis_nim_simple.ipynb`
1. **Step 1**: Check GPU availability with `nvidia-smi`
2. **Step 2**: Deploy TRELLIS NIM container 
3. **Step 3**: Generate 3D models from text prompts

**🖼️ For Image-to-3D:** Use `trellis_nim_image_to_3d.ipynb`
1. **Step 1**: Verify container is running
2. **Step 2**: Upload your image (interactive interface)
3. **Step 3**: Generate 3D model (auto-detects container type)

## 🎯 Usage

### 📝 Text-to-3D Generation

1. Open `trellis_nim_simple.ipynb`
2. Deploy the container (Steps 1-2)
3. Change the prompt and generate

**Example Prompts:**
- `"A modern chair"` - Furniture and objects
- `"A futuristic car"` - Vehicles and machines  
- `"A cozy bedroom"` - Interior spaces
- `"A medieval castle"` - Architecture
- `"A space station interior"` - Sci-fi environments

### 🖼️ Image-to-3D Generation *(NEW!)*

1. **Deploy first:** Run `trellis_nim_simple.ipynb` Steps 1-2
2. **Process images:** Open `trellis_nim_image_to_3d.ipynb`
3. **Upload:** Interactive image selection in Step 2
4. **Generate:** Automatic 3D conversion in Step 3

**Features:**
- ✅ **Smart Upload**: Interactive file picker with preview
- ✅ **Auto-Detection**: Detects text-only vs image-capable containers  
- ✅ **Auto-Fallback**: Converts images to prompts if needed
- ✅ **Error Recovery**: Comprehensive troubleshooting and retry logic
- ✅ **TRELLIS Compliant**: Uses official NVIDIA API format

**Supported Images:** JPG, PNG, BMP, TIFF, WebP

## 📁 Project Structure

```
trellis-image-vision/
├── 📓 trellis_nim_simple.ipynb        # Container deployment & text-to-3D
├── 📓 trellis_nim_image_to_3d.ipynb   # Advanced image-to-3D workflow  
├── 📁 output/                          # Generated 3D models
├── 📄 README.md                        # This documentation
└── 📄 .gitignore                       # Git ignore rules
```

### Notebooks Overview

**🚀 trellis_nim_simple.ipynb**
- Deploy TRELLIS NIM container
- Text-to-3D generation
- Simple workflow for beginners

**🖼️ trellis_nim_image_to_3d.ipynb** *(NEW!)*
- Advanced image upload interface
- Automatic container capability detection
- Image-to-3D with text mode fallback
- Enhanced error handling and troubleshooting

## 🛠️ Troubleshooting

### "No GPU detected"
```bash
nvidia-smi  # Should show your L40s
```

### "Docker command not found"
```bash
sudo apt install docker.io
```

### "Permission denied" with Docker
```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

### "Container won't start"
```bash
# Check logs
docker logs nim-server

# Check if container exists
docker ps -a
```

### "API key invalid"
- Get a new key from https://ngc.nvidia.com/setup/api-key
- Make sure it starts with `nvapi-`
- Replace `<PASTE_API_KEY_HERE>` in the notebook

## 📊 Container Management

```bash
# Check if running
docker ps | grep nim-server

# View logs
docker logs nim-server

# Stop container
docker stop nim-server && docker rm nim-server
```

## 🚀 New Features (Latest Update)

### ✨ Enhanced Image-to-3D Workflow
- **Official TRELLIS API**: Full compliance with NVIDIA documentation
- **Smart Container Detection**: Auto-detects `base:text`, `large:text`, or `large:image` variants
- **Seamless Integration**: Step 2 uploads connect directly to Step 3 processing
- **Intelligent Fallback**: Automatic text mode retry for text-only containers
- **Error Recovery**: Comprehensive troubleshooting with auto-retry logic

### 🛠️ Technical Improvements
- **Fixed "Input type image not supported"** - Now handles text-only containers
- **Fixed "Argument list too long"** - Uses temporary files for large payloads  
- **Enhanced UI** - Simplified output with essential information
- **Better Error Messages** - Clear guidance for common issues

### 🎯 Container Variants Supported
| Variant | Type | Capabilities |
|---------|------|-------------|
| `base:text` | Text-only | Prompts → 3D models |
| `large:text` | Text-only | Enhanced prompts → 3D models |
| `large:image` | Both | Direct image → 3D + text support |

## 🎉 Quick Start Guide

### For Beginners (Text-to-3D)
1. Open `trellis_nim_simple.ipynb`
2. Deploy container, generate from prompts

### For Advanced Users (Image-to-3D)  
1. Deploy via `trellis_nim_simple.ipynb`
2. Process images via `trellis_nim_image_to_3d.ipynb`
3. Enjoy automatic format detection and error recovery!

---

🎯 **Ready to create 3D models?** 
- **Text prompts**: Start with `trellis_nim_simple.ipynb`
- **Image conversion**: Start with `trellis_nim_image_to_3d.ipynb`