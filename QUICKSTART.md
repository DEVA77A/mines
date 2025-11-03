# 🚀 QUICKSTART GUIDE
## Tamil Nadu Rockfall Risk Prediction System

### 🎯 One-Command Startup

**Windows:**
```bash
start_system.bat
```

**Mac/Linux:**
```bash
chmod +x start_system.sh
./start_system.sh
```

**Cross-Platform:**
```bash
python run_system.py
```

### 📋 Prerequisites Check

- ✅ Python 3.8+
- ✅ Node.js 16+
- ✅ 2GB free disk space
- ✅ Internet connection (for initial setup)

### ⚡ What Happens When You Run

1. **Environment Setup** (2-3 minutes)
   - Creates Python virtual environment
   - Installs all dependencies
   - Sets up React frontend

2. **Data Pipeline** (1-2 minutes)
   - Processes Tamil Nadu mines data
   - Generates synthetic environmental data
   - Trains machine learning models

3. **System Launch** (30 seconds)
   - Starts FastAPI backend on port 8000
   - Starts React frontend on port 3000
   - Opens browser automatically

### 🌐 Access URLs

- **Dashboard:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 🎨 Dashboard Features

- **Interactive Map:** Tamil Nadu mines with risk indicators
- **Instagram-Style Cards:** Swipe through mine details
- **Real-Time Predictions:** AI-powered risk assessment
- **Dark/Light Mode:** Toggle theme
- **Responsive Design:** Works on all devices

### 🔧 Manual Installation

If automatic setup fails:

```bash
# Backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 🐳 Docker Deployment

```bash
docker-compose up -d
```

### 📞 Support

- **Issues:** Check logs in terminal
- **Config:** Edit `config.py`
- **Documentation:** See `README.md`

### 🎉 Success Indicators

✅ "SYSTEM STARTED SUCCESSFULLY!" message
✅ Browser opens to dashboard
✅ Map shows Tamil Nadu with mine markers
✅ API documentation accessible

---
**Ready in under 5 minutes!** 🚀