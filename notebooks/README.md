# 📓 Trellis NIM Deployment Notebook

Simple Jupyter notebook to deploy Trellis NIM and the Lovable UI.

## Quick Start

```bash
cd notebooks
jupyter notebook
# Open deployment.ipynb
```

## Workflow

1. **Setup** - Install python-dotenv and initialize
2. **Configure API Key** - Set your NVIDIA API key
3. **Pull Trellis NIM** - Download the container image
4. **Deploy** - Start all services with docker-compose
5. **Check Status** - View running containers
6. **View Logs** - Debug if needed
7. **Access** - Open UI at http://localhost:5173

## Prerequisites

- Docker with NVIDIA runtime configured
- NVIDIA GPU (L40s or similar)
- NVIDIA API key from https://build.nvidia.com/microsoft/trellis

## Usage

Run cells sequentially from top to bottom:

1. Run cells 1-4 to setup
2. Edit cell 6 to add your API key
3. Run cell 8 to pull Trellis NIM
4. Run cell 10 to deploy everything
5. Run cell 12 to check status

## Getting API Key

1. Visit https://build.nvidia.com/microsoft/trellis
2. Sign in with NVIDIA account
3. Click "Get API Key"
4. Copy the key and paste in cell 6

## Access URLs

After deployment:
- **UI**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Trellis NIM**: http://localhost:8080

## Troubleshooting

View logs:
```python
run("docker-compose logs trellis-nim --tail=100")
run("docker-compose logs backend --tail=100")
```

Check GPU:
```python
run("nvidia-smi")
```

Restart services:
```python
run("docker-compose restart")
```

## Files

- `deployment.ipynb` - Main deployment notebook
- `trellis_nim_workflow.ipynb` - API workflow notebook
- `README.md` - This file
