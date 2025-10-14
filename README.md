# 🎨 Trellis NIM - Simple Deployment

A streamlined Jupyter notebook for deploying NVIDIA Trellis NIM and generating 3D models from text prompts on L40s GPU.

## 🌟 What This Does

Deploy NVIDIA's Trellis NIM with just a few simple steps and generate 3D GLB models from text prompts.

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

### 3. Follow the Notebook Steps

1. **Step 1**: Check GPU availability with `nvidia-smi`
2. **Step 2**: Deploy Trellis NIM container 
   - Set your NGC API key
   - Login to NGC registry
   - Start the container
3. **Step 3**: Generate 3D models
   - Change the prompt
   - Run the generation cell
   - Download GLB files

## 🎯 Usage

### Generate Your First 3D Model

1. Open `trellis_nim_simple.ipynb`
2. Run all cells in **Step 1** and **Step 2** to deploy NIM
3. In **Step 3**, change this line:
   ```python
   PROMPT = "A simple coffee shop interior"  # Change this!
   ```
4. Run the generation cells to create your GLB file

### Example Prompts
- `"A modern chair"`
- `"A futuristic car"`
- `"A wooden table"`
- `"A cozy bedroom"`
- `"A space station interior"`

## 📁 Project Structure

```
trellis-image-vision/
├── 📓 trellis_nim_simple.ipynb    # Main notebook - everything you need
├── 📄 README.md                   # This documentation
├── 📄 .gitignore                  # Git ignore rules
└── 📁 .git/                       # Git repository
```

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

## 🎉 That's It!

Your workflow is now:

1. **Deploy once**: Run notebook Steps 1-2
2. **Generate many**: Change prompt in Step 3, run cells
3. **Download GLB**: Use generated 3D models anywhere

**Total files needed**: Just 1 Jupyter notebook!

---

🎯 **Ready to create 3D models?** Open `trellis_nim_simple.ipynb` and start generating!