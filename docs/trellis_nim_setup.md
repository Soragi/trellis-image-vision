# NVIDIA Trellis NIM End-to-End Setup Guide

This guide explains how to reproduce the NVIDIA Trellis web experience in this repository, run inference from a Jupyter Notebook on an NVIDIA L40S GPU, and host the Trellis NIM serving engine with NVIDIA NIM. Follow the steps sequentially to provision infrastructure, configure software, and connect the Lovable Web UI to your backend.

## 0. Prerequisites

- NVIDIA GPU instance with at least one **L40S** GPU (tested on Ubuntu 22.04).
- An [NVIDIA Developer](https://developer.nvidia.com/) account with access to [NGC](https://ngc.nvidia.com/) and a generated **NGC API key**.
- Docker 24+ with the NVIDIA container runtime (installed below).
- Node.js 20+, npm 9+, and git for the Lovable/Vite front-end.
- (Recommended) Miniconda or Anaconda for Python environment isolation when running notebooks.

## 1. Provision the GPU virtual machine

1. Launch a VM that exposes an L40S GPU (e.g., Azure NC-series, AWS G5/G6, GCP A3). Choose Ubuntu 22.04 LTS.
2. Attach at least 200 GB of disk space if you plan to store generated assets locally.
3. Enable inbound ports 22 (SSH), 8888 (Jupyter), and 8000 (NIM REST API) in your network security group/firewall rules.

SSH into the instance once it is running:

```bash
ssh -i <path-to-key> ubuntu@<public-ip>
```

## 2. Base system preparation

Update packages and install required tooling:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential git curl wget python3-pip
```

Install Docker Engine and the NVIDIA Container Toolkit (required for GPU passthrough into containers):

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable docker --now

# NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey |   sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list |   sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' |   sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt update
sudo apt install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

Verify GPU visibility:

```bash
nvidia-smi
```

## 3. Launch the NVIDIA NIM Trellis container

1. Authenticate to NGC using your API key. When prompted for a username, enter `$oauthtoken`.

   ```bash
   sudo docker login nvcr.io
   ```

2. Export the API key and start the Trellis NIM container (listens on port 8000 by default):

   ```bash
   export NGC_API_KEY=<your-ngc-api-key>
   sudo docker run --rm --gpus all      -e NGC_API_KEY=$NGC_API_KEY      -p 8000:8000      --name trellis-nim      nvcr.io/nim/microsoft/trellis:latest
   ```

   Leave this container running; it will serve the `/v1/images-to-3d` endpoint used in both the notebook and web UI.

## 4. Create the Python & Jupyter environment

Install Miniconda if needed, then create an isolated environment for experimentation:

```bash
# Optional: install Miniconda (skip if already installed)
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
source ~/.bashrc

# Environment with Trellis tooling
conda create -n trellis-nim python=3.10 -y
conda activate trellis-nim
pip install --upgrade pip
pip install jupyterlab requests python-dotenv pillow tqdm ipywidgets
```

Launch Jupyter Lab bound to all interfaces so you can access it remotely:

```bash
jupyter lab --ip 0.0.0.0 --port 8888 --NotebookApp.token='' --NotebookApp.password=''
```

(Use an SSH tunnel or a reverse proxy for security in production.)

## 5. Clone this repository

In a new SSH session:

```bash
cd ~
git clone <your-fork-or-this-repo-url>
cd trellis-image-vision
npm install
```

## 6. Run the inference notebook on the GPU

1. In Jupyter Lab, open `notebooks/trellis_nim_workflow.ipynb`.
2. Update the environment variables in the **Configuration** cell:

   ```python
   os.environ["NIM_BASE_URL"] = "http://<vm-public-ip>:8000"
   os.environ["NIM_API_KEY"] = "<optional-if-your-edge-proxy-requires-one>"
   ```

3. Provide one or more image paths (local to the VM) in the **Input images** cell.
4. Execute the notebook cells sequentially. They will:
   - Encode the images as Base64.
   - Submit a Trellis generation job to the NIM container.
   - Poll for completion.
   - Display returned asset metadata and optionally download artifacts.

The notebook can be adapted to call a hosted NIM endpoint by swapping `NIM_BASE_URL`.

## 7. Connect the Lovable Web UI to the NIM backend

1. Decide how the browser should reach the NIM API. Because the NIM container requires authentication and should not expose secrets directly to the browser, deploy a lightweight proxy (Edge Function, Cloud Run, or Express server) that injects the API key.

2. The front-end now looks for these Vite environment variables (create `./.env.local`):

   ```bash
   VITE_NIM_EDGE_URL=https://<your-edge-hostname>
   VITE_NIM_API_KEY=<optional-public-token-if-your-proxy-requires-it>
   ```

   If you host the proxy under the same domain, you can omit the protocol and use a relative path (defaults to `/api/nim`).

3. Example proxy implementation (Express):

   ```ts
   import express from "express";
   import fetch from "node-fetch";

   const app = express();
   app.use(express.json({ limit: "25mb" }));

   const NIM_URL = process.env.NIM_URL ?? "http://localhost:8000";
   const NGC_API_KEY = process.env.NGC_API_KEY!;

   app.post("/api/nim/jobs", async (req, res) => {
     const response = await fetch(`${NIM_URL}/v1/images-to-3d/jobs`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${NGC_API_KEY}`,
       },
       body: JSON.stringify(req.body),
     });
     res.status(response.status).send(await response.text());
   });

   app.get("/api/nim/jobs/:jobId", async (req, res) => {
     const response = await fetch(
       `${NIM_URL}/v1/images-to-3d/jobs/${req.params.jobId}`,
       {
         headers: {
           Authorization: `Bearer ${NGC_API_KEY}`,
         },
       }
     );
     res.status(response.status).send(await response.text());
   });

   app.listen(8787);
   ```

4. Start the Lovable/Vite development server:

   ```bash
   npm run dev -- --host
   ```

   Visit `http://<vm-public-ip>:5173` to interact with the UI. Upload images, click **Generate 3D Assets**, and watch the job status update in real time as it communicates with your proxy and the NIM backend.

## 8. Production considerations

- Protect your proxy with authentication (e.g., JWT, API Gateway) to avoid unauthorized usage.
- Configure HTTPS with a certificate (e.g., via Caddy, Nginx, or a managed load balancer).
- Persist generated assets by streaming them to object storage (S3, Azure Blob) instead of returning raw URLs.
- Monitor GPU utilization with `nvidia-smi dmon` and configure Docker health checks for the NIM container.

By following these steps you will have a fully functioning pipeline:

1. **Lovable Web UI** (this repo) uploads images and monitors job status.
2. **Edge proxy** protects your API keys and relays requests.
3. **NVIDIA Trellis NIM** running on an L40S GPU performs 3D asset generation.
4. **Jupyter Notebook** enables experimentation and offline batch generation on the same infrastructure.

Happy building!
