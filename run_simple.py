#!/usr/bin/env python3
"""
Tamil Nadu Rockfall Risk Prediction System - Simple Startup
Minimal dependencies version for quick testing
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
    print("Simplified startup mode - Core features only")
    print("=" * 70)
    print()

def install_core_dependencies():
    """Install only essential dependencies"""
    print("📦 Installing core dependencies...")
    
    core_packages = [
        "fastapi>=0.100.0",
        "uvicorn[standard]>=0.23.0",
        "pandas>=2.1.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "requests>=2.31.0",
        "python-dotenv>=1.0.0",
        "jinja2>=3.1.0"
    ]
    
    # Upgrade pip first
    subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                  capture_output=True)
    
    # Install each package individually
    for package in core_packages:
        print(f"Installing {package.split('>=')[0]}...")
        result = subprocess.run([sys.executable, "-m", "pip", "install", package], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print(f"⚠️  Warning: Failed to install {package}")
    
    print("✅ Core dependencies installation complete")

def setup_data_directories():
    """Create necessary data directories"""
    print("📁 Setting up data directories...")
    
    directories = ["data", "data/raw", "data/processed", "data/imagery", "models", "config"]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    
    print("✅ Data directories created")

def create_sample_data():
    """Create sample data for testing"""
    print("📊 Creating sample data...")
    
    # Create sample Tamil Nadu mines data
    sample_data = """import pandas as pd
import numpy as np
from pathlib import Path

# Create sample Tamil Nadu mines data
np.random.seed(42)

districts = ['Salem', 'Dharmapuri', 'Krishnagiri', 'Tiruvannamalai', 'Vellore', 
            'Kanchipuram', 'Tiruvallur', 'Chennai', 'Cuddalore', 'Villupuram',
            'Kallakurichi', 'Perambalur']

mine_types = ['Iron Ore', 'Limestone', 'Granite', 'Bauxite', 'Magnesite', 'Garnet']

# Generate 127 sample mines
n_mines = 127
data = {
    'mine_id': [f'TN_{i:03d}' for i in range(1, n_mines + 1)],
    'mine_name': [f'Mine_{i}' for i in range(1, n_mines + 1)],
    'district': np.random.choice(districts, n_mines),
    'mine_type': np.random.choice(mine_types, n_mines),
    'latitude': np.random.uniform(8.0, 13.5, n_mines),
    'longitude': np.random.uniform(77.0, 80.5, n_mines),
    'elevation': np.random.uniform(50, 2000, n_mines),
    'slope_angle': np.random.uniform(5, 85, n_mines),
    'rock_type': np.random.choice(['Granite', 'Limestone', 'Sandstone', 'Shale'], n_mines),
    'weathering_grade': np.random.randint(1, 6, n_mines),
    'joint_density': np.random.uniform(0.1, 1.0, n_mines),
    'rainfall_mm': np.random.uniform(500, 2000, n_mines),
    'temperature_c': np.random.uniform(20, 35, n_mines),
    'humidity': np.random.uniform(40, 90, n_mines),
    'wind_speed': np.random.uniform(2, 15, n_mines),
    'risk_score': np.random.uniform(0, 100, n_mines)
}

df = pd.DataFrame(data)
df.to_csv('data/processed/tamil_nadu_mines.csv', index=False)
print(f"Created sample data with {len(df)} mines")
"""
    
    # Write and execute the data creation script
    script_path = Path("temp_data_creator.py")
    script_path.write_text(sample_data)
    
    try:
        subprocess.run([sys.executable, str(script_path)], check=True)
        script_path.unlink()  # Delete temporary script
        print("✅ Sample data created")
    except Exception as e:
        print(f"⚠️  Warning: Could not create sample data: {e}")

def start_simple_backend():
    """Start a simple backend server"""
    print("🚀 Starting simple backend...")
    
    # Create minimal backend if it doesn't exist
    backend_path = Path("backend")
    backend_path.mkdir(exist_ok=True)
    
    simple_backend = '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from pathlib import Path
import uvicorn

app = FastAPI(title="Tamil Nadu Rockfall Risk API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Tamil Nadu Rockfall Risk Prediction API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": pd.Timestamp.now().isoformat()}

@app.get("/api/mines")
def get_mines():
    """Get all mines data"""
    try:
        data_file = Path("data/processed/tamil_nadu_mines.csv")
        if data_file.exists():
            df = pd.read_csv(data_file)
            return df.to_dict(orient="records")
        else:
            # Return sample data if file doesn't exist
            return [
                {
                    "mine_id": "TN_001",
                    "mine_name": "Sample Mine",
                    "district": "Salem",
                    "latitude": 11.664,
                    "longitude": 78.146,
                    "risk_score": 75.5,
                    "mine_type": "Iron Ore"
                }
            ]
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/predict/{mine_id}")
def predict_risk(mine_id: str):
    """Predict risk for a specific mine"""
    # Simple mock prediction
    risk_score = np.random.uniform(20, 95)
    risk_level = "Low" if risk_score < 40 else "Medium" if risk_score < 70 else "High"
    
    return {
        "mine_id": mine_id,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "prediction_time": pd.Timestamp.now().isoformat(),
        "factors": {
            "geological": round(np.random.uniform(10, 30), 2),
            "environmental": round(np.random.uniform(10, 30), 2),
            "operational": round(np.random.uniform(10, 30), 2)
        }
    }

@app.get("/api/stats")
def get_statistics():
    """Get system statistics"""
    return {
        "total_mines": 127,
        "high_risk_mines": 23,
        "medium_risk_mines": 54,
        "low_risk_mines": 50,
        "last_updated": pd.Timestamp.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
'''
    
    backend_file = backend_path / "simple_main.py"
    backend_file.write_text(simple_backend)
    
    # Start the backend
    process = subprocess.Popen(
        [sys.executable, str(backend_file)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    time.sleep(3)  # Wait for server to start
    
    if process.poll() is None:
        print("✅ Simple backend started on http://localhost:8000")
        return process
    else:
        print("❌ Failed to start backend")
        return None

def setup_simple_frontend():
    """Setup a minimal frontend if Node.js is available"""
    frontend_path = Path("frontend")
    
    if not frontend_path.exists():
        print("🎨 Creating simple frontend structure...")
        frontend_path.mkdir()
        
        # Create minimal package.json
        package_json = '''{
  "name": "rockfall-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}'''
        
        (frontend_path / "package.json").write_text(package_json)
        print("✅ Frontend structure created")
        return True
    
    return frontend_path.exists()

def main():
    """Main execution function"""
    print_banner()
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Install core dependencies
    install_core_dependencies()
    
    # Setup directories and data
    setup_data_directories()
    create_sample_data()
    
    # Start backend
    backend_process = start_simple_backend()
    if not backend_process:
        print("❌ Cannot start system without backend")
        sys.exit(1)
    
    # Setup frontend (optional)
    setup_simple_frontend()
    
    print("\n" + "=" * 70)
    print("🎉 SIMPLE SYSTEM STARTED!")
    print("=" * 70)
    print("🔗 Backend API: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🧪 Test API: http://localhost:8000/api/mines")
    print("=" * 70)
    print("\n💡 Tips:")
    print("- Visit http://localhost:8000/docs for interactive API documentation")
    print("- Use http://localhost:8000/api/mines to see sample mine data")
    print("- Install frontend dependencies with 'npm install' in the frontend folder")
    print("\n⌨️  Press Ctrl+C to stop the server")
    
    # Open browser
    Timer(2.0, lambda: webbrowser.open("http://localhost:8000/docs")).start()
    
    try:
        # Keep process running
        while backend_process.poll() is None:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down...")
        if backend_process and backend_process.poll() is None:
            backend_process.terminate()
        print("✅ Server stopped")
        print("👋 Thank you for using the system!")

if __name__ == "__main__":
    main()