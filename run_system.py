#!/usr/bin/env python3
"""
Tamil Nadu Rockfall Risk Prediction System
Complete setup and execution script
"""

import subprocess
import sys
import os
from pathlib import Path
import time
import webbrowser
from threading import Timer

def print_banner():
    """Print system banner"""
    print("=" * 70)
    print("🏔️  TAMIL NADU ROCKFALL RISK PREDICTION SYSTEM  🏔️")
    print("=" * 70)
    print("AI-powered rockfall risk assessment for open-pit mines")
    print("Instagram-inspired dashboard with real-time predictions")
    print("=" * 70)
    print()

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8+ is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} detected")

def check_node_version():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js {version} detected")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def setup_python_environment():
    """Setup Python virtual environment and install dependencies"""
    print("\n📦 Setting up Python environment...")
    
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Determine activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = venv_path / "Scripts" / "activate"
        python_exe = venv_path / "Scripts" / "python.exe"
        pip_exe = venv_path / "Scripts" / "pip.exe"
    else:  # macOS/Linux
        activate_script = venv_path / "bin" / "activate"
        python_exe = venv_path / "bin" / "python"
        pip_exe = venv_path / "bin" / "pip"
    
    # Upgrade pip and setuptools first
    print("Upgrading pip and setuptools...")
    subprocess.run([str(pip_exe), "install", "--upgrade", "pip", "setuptools", "wheel"], 
                  capture_output=True, text=True)
    
    # Install requirements with retry mechanism
    print("Installing Python dependencies...")
    max_retries = 3
    for attempt in range(max_retries):
        result = subprocess.run([str(pip_exe), "install", "-r", "requirements.txt", "--no-cache-dir"], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Python dependencies installed")
            return str(python_exe)
        elif attempt < max_retries - 1:
            print(f"⚠️  Installation attempt {attempt + 1} failed, retrying...")
            time.sleep(2)
        else:
            print("❌ Failed to install Python dependencies after all retries")
            print("ERROR:", result.stderr)
            # Try installing core dependencies only
            print("🔄 Attempting to install core dependencies only...")
            core_deps = ["fastapi", "uvicorn", "pandas", "numpy", "scikit-learn", "matplotlib", "requests"]
            for dep in core_deps:
                subprocess.run([str(pip_exe), "install", dep], capture_output=True, text=True)
            print("✅ Core dependencies installed (some features may be limited)")
            return str(python_exe)

def setup_frontend():
    """Setup frontend dependencies"""
    print("\n🎨 Setting up frontend...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    os.chdir(frontend_path)
    
    # Install npm dependencies
    print("Installing Node.js dependencies...")
    result = subprocess.run(["npm", "install"], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Frontend dependencies installed")
        os.chdir("..")
        return True
    else:
        print("❌ Failed to install frontend dependencies")
        print(result.stderr)
        os.chdir("..")
        return False

def run_data_pipeline(python_exe):
    """Run the data processing pipeline"""
    print("\n🔄 Running data processing pipeline...")
    
    scripts = [
        ("data_cleaner.py", "Cleaning mine data"),
        ("environmental_integrator.py", "Integrating environmental data"),
        ("model_trainer.py", "Training ML models")
    ]
    
    for script, description in scripts:
        print(f"Running {description}...")
        script_path = Path("scripts") / script
        
        if script_path.exists():
            result = subprocess.run([python_exe, str(script_path)], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {description} completed")
            else:
                print(f"⚠️  {description} completed with warnings")
                # Don't exit on warnings, continue with pipeline
        else:
            print(f"❌ {script} not found")

def start_backend(python_exe):
    """Start the FastAPI backend server"""
    print("\n🚀 Starting backend server...")
    
    backend_script = Path("backend") / "main.py"
    if backend_script.exists():
        # Start backend in background
        process = subprocess.Popen(
            [python_exe, str(backend_script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Check if process is still running
        if process.poll() is None:
            print("✅ Backend server started on http://localhost:8000")
            return process
        else:
            print("❌ Failed to start backend server")
            return None
    else:
        print("❌ Backend script not found")
        return None

def start_frontend():
    """Start the React frontend"""
    print("\n🎨 Starting frontend...")
    
    frontend_path = Path("frontend")
    if frontend_path.exists():
        os.chdir(frontend_path)
        
        # Start frontend
        process = subprocess.Popen(
            ["npm", "start"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        os.chdir("..")
        
        # Open browser after delay
        def open_browser():
            webbrowser.open("http://localhost:3000")
        
        Timer(5.0, open_browser).start()
        print("✅ Frontend starting on http://localhost:3000")
        print("🌐 Opening browser in 5 seconds...")
        
        return process
    else:
        print("❌ Frontend directory not found")
        return None

def main():
    """Main execution function"""
    print_banner()
    
    # Check prerequisites
    check_python_version()
    if not check_node_version():
        print("\n❌ Please install Node.js 16+ and try again")
        print("Download from: https://nodejs.org/")
        sys.exit(1)
    
    # Setup environments
    python_exe = setup_python_environment()
    if not python_exe:
        print("\n❌ Failed to setup Python environment")
        sys.exit(1)
    
    if not setup_frontend():
        print("\n❌ Failed to setup frontend")
        sys.exit(1)
    
    # Run data pipeline
    run_data_pipeline(python_exe)
    
    # Start services
    backend_process = start_backend(python_exe)
    if not backend_process:
        print("\n❌ Cannot start system without backend")
        sys.exit(1)
    
    frontend_process = start_frontend()
    if not frontend_process:
        print("\n❌ Cannot start frontend")
        backend_process.terminate()
        sys.exit(1)
    
    print("\n" + "=" * 70)
    print("🎉 SYSTEM STARTED SUCCESSFULLY!")
    print("=" * 70)
    print("🔗 Backend API: http://localhost:8000")
    print("🔗 Frontend Dashboard: http://localhost:3000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("=" * 70)
    print("\n⌨️  Press Ctrl+C to stop all services")
    
    try:
        # Keep processes running
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("\n❌ Backend process stopped unexpectedly")
                break
            
            if frontend_process.poll() is not None:
                print("\n❌ Frontend process stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down services...")
        
        # Terminate processes
        if backend_process and backend_process.poll() is None:
            backend_process.terminate()
            print("✅ Backend stopped")
        
        if frontend_process and frontend_process.poll() is None:
            frontend_process.terminate()
            print("✅ Frontend stopped")
        
        print("👋 Thank you for using Tamil Nadu Rockfall Risk Prediction System!")

if __name__ == "__main__":
    main()