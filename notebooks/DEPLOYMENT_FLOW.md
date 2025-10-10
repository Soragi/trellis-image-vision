# 📊 Deployment Flow Diagram

## Complete Deployment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TRELLIS NIM DEPLOYMENT                          │
│                    Choose Your Method Below                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
        ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
        │   JUPYTER     │  │    PYTHON     │  │     SHELL     │
        │   NOTEBOOK    │  │    SCRIPT     │  │    SCRIPTS    │
        │  (Interactive)│  │ (Automated)   │  │ (Traditional) │
        └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   ▼
                    ┌──────────────────────────┐
                    │  1. PREREQUISITES CHECK  │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │  ✓ Docker Installed?     │
                    │  ✓ Docker Compose?       │
                    │  ✓ NVIDIA GPU Available? │
                    │  ✓ Docker GPU Runtime?   │
                    │  ✓ Disk Space (>50GB)?   │
                    │  ✓ RAM (>16GB)?          │
                    └────────────┬─────────────┘
                                 │
                                 ▼ YES
                    ┌──────────────────────────┐
                    │  2. ENVIRONMENT SETUP    │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │  • Create directories    │
                    │  • Copy .env files       │
                    │  • Set API key           │
                    │  • Verify configuration  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  3. INSTALL DEPENDENCIES │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │  • npm install (backend) │
                    │  • npm install (frontend)│
                    │  • npm run build         │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  4. PULL DOCKER IMAGES   │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │  • Trellis NIM image     │
                    │  • Nginx Alpine image    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  5. START SERVICES       │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │  docker-compose up -d    │
                    │                          │
                    │  Services Starting:      │
                    │  ├─ Trellis NIM :8080   │
                    │  ├─ Backend     :3001   │
                    │  ├─ Frontend    :5173   │
                    │  └─ Nginx       :80     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  6. HEALTH CHECKS        │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │  Wait for initialization │
                    │  Check all endpoints     │
                    │  Verify GPU access       │
                    └────────────┬─────────────┘
                                 │
                                 ▼ ALL HEALTHY
                    ┌──────────────────────────┐
                    │   ✅ DEPLOYMENT SUCCESS  │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │  Access URLs:            │
                    │  • Frontend: :5173       │
                    │  • Backend:  :3001       │
                    │  • Trellis:  :8080       │
                    └──────────────────────────┘
```

## Notebook Workflow Details

### Jupyter Notebook Path

```
┌─────────────────────────────────────────────────────────┐
│                  NOTEBOOK WORKFLOW                       │
└─────────────────────────────────────────────────────────┘

Cell 1-2: Install Python Packages
   │
   ▼
Cell 3-4: Import Dependencies & Setup
   │
   ▼
Cell 6: Prerequisites Check
   │
   ├─ Docker ✓
   ├─ Docker Compose ✓
   ├─ GPU ✓
   ├─ NVIDIA Docker ✓
   ├─ Disk Space ✓
   └─ RAM ✓
   │
   ▼
Cell 7-8: Setup Environment Files
   │
   ├─ Create .env
   └─ Create backend/.env
   │
   ▼
Cell 9-10: Configure API Key ⚠️ REQUIRED
   │
   └─ Set NVIDIA_API_KEY
   │
   ▼
Cell 11-12: Project Setup
   │
   ├─ Create directories
   ├─ Install backend deps
   ├─ Install frontend deps
   └─ Build backend
   │
   ▼
Cell 13-14: Pull Docker Images
   │
   ├─ Trellis NIM
   └─ Nginx Alpine
   │
   ▼
Cell 15: Start Services
   │
   └─ docker-compose up -d
   │
   ▼
Cell 16-18: Health Checks & Status
   │
   ├─ Check endpoints
   └─ Display status
   │
   ▼
Cell 19-20: View Logs (Optional)
   │
   └─ Check for errors
   │
   ▼
Cell 21-22: Management (As Needed)
   │
   ├─ Restart services
   ├─ Stop services
   └─ Rebuild services
   │
   ▼
Cell 23-24: Monitor Resources
   │
   ├─ System resources
   ├─ Docker stats
   └─ GPU usage
   │
   ▼
Cell 25-26: Status Dashboard
   │
   └─ Complete overview
```

## Python Script Path

```
┌─────────────────────────────────────────────────────────┐
│               PYTHON SCRIPT WORKFLOW                     │
└─────────────────────────────────────────────────────────┘

$ ./deploy_standalone.py check
   │
   ├─ Check Docker
   ├─ Check Docker Compose
   ├─ Check GPU
   └─ Check NVIDIA Runtime
   │
   ▼
$ export NVIDIA_API_KEY="nvapi-xxx"
   │
   ▼
$ ./deploy_standalone.py deploy
   │
   ├─ Prerequisites ✓
   ├─ Environment Setup
   ├─ Install Dependencies
   ├─ Pull Images
   └─ Start Services
   │
   ▼
$ ./deploy_standalone.py status
   │
   ├─ Service Status
   └─ Health Checks
   │
   ▼
$ ./deploy_standalone.py logs
   │
   └─ View Logs
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYED SERVICES                         │
└─────────────────────────────────────────────────────────────┘

                          Internet
                              │
                              ▼
                    ┌─────────────────┐
                    │  Nginx :80/443  │  (Optional - Production)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  Frontend   │  │   Backend   │  │ Trellis NIM │
    │  React/Vite │  │  Node.js    │  │   NVIDIA    │
    │   :5173     │  │   :3001     │  │   :8080     │
    └─────────────┘  └──────┬──────┘  └──────┬──────┘
                            │                 │
                            │    API Calls    │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │   NVIDIA GPU    │
                            │   (L40s/A100)   │
                            └─────────────────┘

Network: trellis-network (bridge)
Volumes: nim_cache, uploads, logs
```

## Health Check Flow

```
┌─────────────────────────────────────────────────────────┐
│                  HEALTH CHECK FLOW                       │
└─────────────────────────────────────────────────────────┘

Start Health Check
   │
   ├─ Check Frontend :5173
   │   ├─ HTTP 200? → ✓ Healthy
   │   └─ Else → ✗ Unhealthy
   │
   ├─ Check Backend :3001/api/health
   │   ├─ HTTP 200? → ✓ Healthy
   │   └─ Else → ✗ Unhealthy
   │
   └─ Check Trellis NIM :8080/health
       ├─ HTTP 200? → ✓ Healthy
       └─ Else → ✗ Unhealthy

All Healthy? → ✅ READY TO USE
Any Unhealthy? → ⚠️ NEEDS ATTENTION
```

## Troubleshooting Decision Tree

```
┌─────────────────────────────────────────────────────────┐
│              TROUBLESHOOTING FLOW                        │
└─────────────────────────────────────────────────────────┘

Services Not Starting?
   │
   ├─ Check Docker
   │   └─ systemctl status docker
   │
   ├─ Check Logs
   │   └─ view_logs() or docker-compose logs
   │
   └─ Check Ports
       └─ sudo lsof -i :8080,:3001,:5173

Services Unhealthy?
   │
   ├─ Wait 2-3 minutes
   │   └─ Re-check health
   │
   ├─ Check API Key
   │   └─ grep NVIDIA_API_KEY .env
   │
   └─ Check GPU
       └─ nvidia-smi

Generation Failing?
   │
   ├─ Check Backend Logs
   │   └─ view_logs('backend', 100)
   │
   ├─ Check NIM Logs
   │   └─ view_logs('trellis-nim', 100)
   │
   └─ Check GPU Memory
       └─ nvidia-smi

Out of Memory?
   │
   ├─ Check GPU Memory
   │   └─ nvidia-smi
   │
   └─ Restart Services
       └─ restart_services()

```

## Monitoring Loop

```
┌─────────────────────────────────────────────────────────┐
│              CONTINUOUS MONITORING                       │
└─────────────────────────────────────────────────────────┘

         ┌──────────────────────┐
         │  Monitor Services    │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │  All Healthy?        │
         └──────────┬───────────┘
                    │
         YES ◄──────┼──────► NO
          │         │         │
          │         │    ┌────▼────┐
          │         │    │  Alert  │
          │         │    │  User   │
          │         │    └────┬────┘
          │         │         │
          │    ┌────▼────┐    │
          │    │  Check  │    │
          │    │  Logs   │◄───┘
          │    └────┬────┘
          │         │
          │    ┌────▼────┐
          │    │ Restart │
          │    │ Service │
          │    └────┬────┘
          │         │
          └─────────┴──────┐
                           │
                      ┌────▼────┐
                      │  Wait   │
                      │  30s    │
                      └────┬────┘
                           │
                  ┌────────▼────────┐
                  │  Continue Loop  │
                  └─────────────────┘
```

## Quick Reference

### Notebook Cells Quick Reference

```
Cells 1-6   : Setup & Prerequisites
Cell 10     : ⚠️ SET API KEY HERE
Cells 11-15 : Deploy Application
Cells 16-18 : Check Health
Cells 19-20 : View Logs
Cells 21-22 : Manage Services
Cells 23-24 : Monitor Resources
Cells 25-26 : Status Dashboard
```

### Script Commands Quick Reference

```bash
# One-command deployment
./deploy_standalone.py deploy

# Step-by-step
./deploy_standalone.py check
./deploy_standalone.py setup
./deploy_standalone.py install
./deploy_standalone.py pull
./deploy_standalone.py deploy

# Management
./deploy_standalone.py status
./deploy_standalone.py logs
./deploy_standalone.py restart
./deploy_standalone.py stop
```

### Key Ports

```
8080  → Trellis NIM
3001  → Backend API
5173  → Frontend Dev Server
80    → Nginx (Production)
443   → Nginx SSL (Production)
```

### Important Files

```
.env                     → Root environment config
backend/.env             → Backend environment config
docker-compose.yml       → Service orchestration
notebooks/deployment.ipynb → Main deployment notebook
notebooks/deploy_standalone.py → CLI deployment script
```

---

**Need Help?** See [`QUICKSTART.md`](QUICKSTART.md) or [`README.md`](README.md)

