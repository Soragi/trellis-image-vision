#!/usr/bin/env python3
"""
Trellis NIM Standalone Deployment Script

This script provides a command-line interface for deploying and managing
the Trellis NIM 3D Model Generation Application. It can be used as an
alternative to the Jupyter notebook for automated deployments.

Usage:
    python deploy_standalone.py --help
    python deploy_standalone.py check           # Check prerequisites
    python deploy_standalone.py setup           # Setup environment
    python deploy_standalone.py deploy          # Full deployment
    python deploy_standalone.py status          # Check status
    python deploy_standalone.py logs            # View logs
    python deploy_standalone.py restart         # Restart services
    python deploy_standalone.py stop            # Stop services

Environment:
    Set NVIDIA_API_KEY environment variable before running:
    export NVIDIA_API_KEY="your-api-key-here"
"""

import os
import sys
import subprocess
import time
import argparse
import json
from pathlib import Path
from typing import Dict, Tuple
import shutil

# ANSI color codes
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_status(message: str, status: str = "info"):
    """Print colored status messages."""
    symbols = {
        "success": f"{Colors.GREEN}✓",
        "error": f"{Colors.RED}✗",
        "warning": f"{Colors.YELLOW}⚠",
        "info": f"{Colors.BLUE}ℹ"
    }
    symbol = symbols.get(status, symbols["info"])
    print(f"{symbol} {message}{Colors.RESET}")

def print_header(text: str):
    """Print a header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}")
    print(f"{text}")
    print(f"{'='*80}{Colors.RESET}\n")

def run_command(cmd: str, cwd: Path = None) -> Tuple[int, str, str]:
    """Execute a shell command and return exit code, stdout, stderr."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            cwd=cwd
        )
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return 1, "", str(e)

def check_command_exists(cmd: str) -> bool:
    """Check if a command exists in the system."""
    code, _, _ = run_command(f"which {cmd}")
    return code == 0

def check_prerequisites() -> bool:
    """Check all system prerequisites."""
    print_header("🔍 CHECKING PREREQUISITES")
    
    all_passed = True
    
    # Check Docker
    if check_command_exists('docker'):
        code, stdout, _ = run_command('docker --version')
        if code == 0:
            print_status(f"Docker: {stdout.strip()}", "success")
        else:
            print_status("Docker installed but not running", "error")
            all_passed = False
    else:
        print_status("Docker not found", "error")
        all_passed = False
    
    # Check Docker Compose
    if check_command_exists('docker-compose') or check_command_exists('docker compose'):
        print_status("Docker Compose: Available", "success")
    else:
        print_status("Docker Compose not found", "error")
        all_passed = False
    
    # Check GPU
    if check_command_exists('nvidia-smi'):
        code, stdout, _ = run_command('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader')
        if code == 0:
            print_status(f"GPU: {stdout.strip()}", "success")
        else:
            print_status("nvidia-smi found but GPU not accessible", "error")
            all_passed = False
    else:
        print_status("nvidia-smi not found (GPU check failed)", "error")
        all_passed = False
    
    # Check NVIDIA Docker Runtime
    code, _, _ = run_command('docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi')
    if code == 0:
        print_status("NVIDIA Docker Runtime: Configured", "success")
    else:
        print_status("NVIDIA Docker Runtime not configured", "error")
        all_passed = False
    
    if all_passed:
        print_status("\n✅ All prerequisites met!", "success")
    else:
        print_status("\n❌ Some prerequisites are missing", "error")
        print("\nPlease install missing dependencies:")
        print("  - Docker: https://docs.docker.com/engine/install/")
        print("  - Docker Compose: https://docs.docker.com/compose/install/")
        print("  - NVIDIA Drivers: https://www.nvidia.com/Download/index.aspx")
        print("  - NVIDIA Docker: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html")
    
    return all_passed

def setup_environment(project_root: Path, api_key: str = None) -> bool:
    """Setup environment files."""
    print_header("🔧 SETTING UP ENVIRONMENT")
    
    # Create directories
    directories = [
        'backend/uploads',
        'backend/logs',
        'trellis_nim_logs',
        'nginx/ssl'
    ]
    
    for dir_path in directories:
        full_path = project_root / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
        print_status(f"Created directory: {dir_path}", "success")
    
    # Copy environment files
    env_files = [
        ('.env.example', '.env'),
        ('backend/env.example', 'backend/.env')
    ]
    
    for example, target in env_files:
        example_path = project_root / example
        target_path = project_root / target
        
        if not target_path.exists():
            if example_path.exists():
                shutil.copy(example_path, target_path)
                print_status(f"Created {target}", "success")
            else:
                print_status(f"Example file {example} not found", "error")
                return False
        else:
            print_status(f"{target} already exists", "info")
    
    # Configure API key if provided
    if api_key:
        from dotenv import set_key
        
        env_file = project_root / '.env'
        backend_env = project_root / 'backend' / '.env'
        
        if env_file.exists():
            set_key(str(env_file), 'NVIDIA_API_KEY', api_key)
            print_status("Configured API key in .env", "success")
        
        if backend_env.exists():
            set_key(str(backend_env), 'TRELLIS_NIM_API_KEY', api_key)
            print_status("Configured API key in backend/.env", "success")
    else:
        print_status("No API key provided. Set NVIDIA_API_KEY environment variable", "warning")
    
    return True

def install_dependencies(project_root: Path) -> bool:
    """Install npm dependencies."""
    print_header("📦 INSTALLING DEPENDENCIES")
    
    # Backend dependencies
    print("Installing backend dependencies...")
    code, _, stderr = run_command('npm install', cwd=project_root / 'backend')
    if code == 0:
        print_status("Backend dependencies installed", "success")
    else:
        print_status("Failed to install backend dependencies", "error")
        print(stderr)
        return False
    
    # Frontend dependencies
    print("Installing frontend dependencies...")
    code, _, stderr = run_command('npm install', cwd=project_root)
    if code == 0:
        print_status("Frontend dependencies installed", "success")
    else:
        print_status("Failed to install frontend dependencies", "error")
        print(stderr)
        return False
    
    # Build backend
    print("Building backend...")
    code, _, stderr = run_command('npm run build', cwd=project_root / 'backend')
    if code == 0:
        print_status("Backend built successfully", "success")
    else:
        print_status("Failed to build backend", "error")
        print(stderr)
        return False
    
    return True

def pull_images(project_root: Path) -> bool:
    """Pull required Docker images."""
    print_header("📥 PULLING DOCKER IMAGES")
    
    images = [
        'nvcr.io/nim/microsoft/trellis:1.0.0',
        'nginx:alpine'
    ]
    
    for image in images:
        print(f"Pulling {image}...")
        code, _, stderr = run_command(f'docker pull {image}', cwd=project_root)
        if code == 0:
            print_status(f"Pulled {image}", "success")
        else:
            print_status(f"Failed to pull {image}", "error")
            print(stderr)
            return False
    
    return True

def start_services(project_root: Path) -> bool:
    """Start all services."""
    print_header("🚀 STARTING SERVICES")
    
    code, _, stderr = run_command('docker-compose up -d', cwd=project_root)
    if code == 0:
        print_status("Services started successfully", "success")
        print("\n⏳ Services are initializing. This may take 2-3 minutes...")
        print("Run 'python deploy_standalone.py status' to check service health")
        return True
    else:
        print_status("Failed to start services", "error")
        print(stderr)
        return False

def check_status(project_root: Path):
    """Check service status."""
    print_header("📊 SERVICE STATUS")
    
    code, stdout, _ = run_command('docker-compose ps', cwd=project_root)
    print(stdout)
    
    # Health checks
    print("\n🏥 Health Checks:\n")
    
    import requests
    
    endpoints = [
        ('Trellis NIM', 'http://localhost:8080/health'),
        ('Backend API', 'http://localhost:3001/api/health'),
        ('Frontend', 'http://localhost:5173'),
    ]
    
    for name, url in endpoints:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print_status(f"{name}: Healthy", "success")
            else:
                print_status(f"{name}: HTTP {response.status_code}", "warning")
        except requests.exceptions.ConnectionError:
            print_status(f"{name}: Not responding", "error")
        except Exception as e:
            print_status(f"{name}: {str(e)}", "error")
    
    print("\n🔗 Access URLs:")
    print(f"  Frontend: http://localhost:5173")
    print(f"  Backend:  http://localhost:3001")
    print(f"  Trellis:  http://localhost:8080")

def view_logs(project_root: Path, service: str = None, lines: int = 50):
    """View service logs."""
    print_header(f"📋 LOGS ({service if service else 'all services'})")
    
    cmd = f'docker-compose logs --tail={lines}'
    if service:
        cmd += f' {service}'
    
    code, stdout, _ = run_command(cmd, cwd=project_root)
    print(stdout)

def restart_services(project_root: Path, service: str = None):
    """Restart services."""
    print_header("🔄 RESTARTING SERVICES")
    
    cmd = 'docker-compose restart'
    if service:
        cmd += f' {service}'
    
    code, _, stderr = run_command(cmd, cwd=project_root)
    if code == 0:
        print_status("Services restarted successfully", "success")
    else:
        print_status("Failed to restart services", "error")
        print(stderr)

def stop_services(project_root: Path, remove_volumes: bool = False):
    """Stop services."""
    print_header("🛑 STOPPING SERVICES")
    
    cmd = 'docker-compose down'
    if remove_volumes:
        cmd += ' -v'
        print_status("⚠️  Removing volumes and data", "warning")
    
    code, _, stderr = run_command(cmd, cwd=project_root)
    if code == 0:
        print_status("Services stopped successfully", "success")
    else:
        print_status("Failed to stop services", "error")
        print(stderr)

def full_deployment(project_root: Path, api_key: str = None):
    """Perform full deployment."""
    print_header("🎨 TRELLIS NIM FULL DEPLOYMENT")
    
    steps = [
        ("Prerequisites Check", lambda: check_prerequisites()),
        ("Environment Setup", lambda: setup_environment(project_root, api_key)),
        ("Install Dependencies", lambda: install_dependencies(project_root)),
        ("Pull Docker Images", lambda: pull_images(project_root)),
        ("Start Services", lambda: start_services(project_root)),
    ]
    
    for step_name, step_func in steps:
        print(f"\n{'─'*80}")
        print(f"Step: {step_name}")
        print(f"{'─'*80}")
        
        if not step_func():
            print_status(f"\n❌ Deployment failed at: {step_name}", "error")
            return False
        
        time.sleep(2)
    
    print_header("🎉 DEPLOYMENT COMPLETE")
    print("Your Trellis NIM application is now running!")
    print("\n🔗 Access URLs:")
    print("  Frontend: http://localhost:5173")
    print("  Backend:  http://localhost:3001")
    print("  Trellis:  http://localhost:8080")
    print("\n📊 Next steps:")
    print("  - Check status: python deploy_standalone.py status")
    print("  - View logs:    python deploy_standalone.py logs")
    print("  - Monitor:      watch -n 5 'python deploy_standalone.py status'")
    
    return True

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Trellis NIM Deployment Script',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        'command',
        choices=['check', 'setup', 'install', 'pull', 'deploy', 'status', 'logs', 'restart', 'stop'],
        help='Command to execute'
    )
    
    parser.add_argument(
        '--service',
        help='Specific service name (for logs, restart commands)'
    )
    
    parser.add_argument(
        '--lines',
        type=int,
        default=50,
        help='Number of log lines to display (default: 50)'
    )
    
    parser.add_argument(
        '--api-key',
        help='NVIDIA API key (or set NVIDIA_API_KEY env var)'
    )
    
    parser.add_argument(
        '--remove-volumes',
        action='store_true',
        help='Remove volumes when stopping (⚠️  deletes data)'
    )
    
    args = parser.parse_args()
    
    # Determine project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent if script_dir.name == 'notebooks' else script_dir
    
    # Get API key from args or environment
    api_key = args.api_key or os.getenv('NVIDIA_API_KEY')
    
    # Execute command
    try:
        if args.command == 'check':
            success = check_prerequisites()
            sys.exit(0 if success else 1)
        
        elif args.command == 'setup':
            success = setup_environment(project_root, api_key)
            sys.exit(0 if success else 1)
        
        elif args.command == 'install':
            success = install_dependencies(project_root)
            sys.exit(0 if success else 1)
        
        elif args.command == 'pull':
            success = pull_images(project_root)
            sys.exit(0 if success else 1)
        
        elif args.command == 'deploy':
            success = full_deployment(project_root, api_key)
            sys.exit(0 if success else 1)
        
        elif args.command == 'status':
            check_status(project_root)
        
        elif args.command == 'logs':
            view_logs(project_root, args.service, args.lines)
        
        elif args.command == 'restart':
            restart_services(project_root, args.service)
        
        elif args.command == 'stop':
            stop_services(project_root, args.remove_volumes)
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
        sys.exit(130)
    except Exception as e:
        print_status(f"Error: {str(e)}", "error")
        sys.exit(1)

if __name__ == '__main__':
    main()

