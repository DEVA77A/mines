# Smart AI System for Rockfall Risk Prediction in Tamil Nadu Open-Pit Mines

A comprehensive end-to-end AI system for predicting rockfall risks in open-pit mines across Tamil Nadu, India. Features real-time risk assessment, interactive dashboard, and Instagram-inspired modern UI design.

## 🌟 Features

### 🔹 Data Processing
- **Automated Data Cleaning**: Tamil Nadu mining dataset processing with coordinate validation
- **Satellite Imagery Integration**: Sentinel-2 imagery download and processing
- **Environmental Data Fusion**: Rainfall, temperature, DEM, and geological data integration
- **Smart Coordinate Correction**: Automatic correction of erroneous mine locations

### 🔹 Machine Learning
- **Advanced Risk Prediction**: Multi-model ensemble (Random Forest, LightGBM, Gradient Boosting)
- **Feature Engineering**: 25+ engineered features including geological, environmental, and spatial factors
- **Real-time Inference**: FastAPI-powered prediction service
- **Model Persistence**: Trained models saved for production deployment

### 🔹 Interactive Dashboard
- **Instagram-Inspired Design**: Modern, responsive UI with smooth animations
- **Interactive Maps**: Leaflet-powered maps with risk-color-coded mine markers
- **Mine Cards**: Beautiful card-based mine information display
- **Advanced Filtering**: Search and filter by district, mineral type, risk level
- **Real-time Alerts**: High-risk mine notifications
- **Export Capabilities**: PDF reports and Excel exports
- **Dark/Light Mode**: Toggle between themes

### 🔹 Technical Stack
- **Backend**: Python, FastAPI, scikit-learn, LightGBM
- **Frontend**: React, Tailwind CSS, Leaflet, Framer Motion
- **Data Processing**: Pandas, GeoPandas, Rasterio
- **Satellite Data**: Sentinelsat, Google Earth Engine API
- **Visualization**: Recharts, Matplotlib, Seaborn

## 📁 Project Structure

```
rockfall/
├── data/
│   ├── raw/                    # Original mining datasets
│   ├── processed/              # Cleaned and processed data
│   ├── imagery/                # Satellite imagery
│   └── environmental/          # Weather, DEM, geological data
├── scripts/
│   ├── data_cleaner.py         # Data cleaning and validation
│   ├── imagery_downloader.py   # Sentinel-2 imagery processing
│   ├── environmental_integrator.py # Environmental data integration
│   └── model_trainer.py        # ML model training
├── models/
│   ├── rockfall_model.pkl      # Production ML model
│   ├── scaler.pkl              # Feature scaler
│   └── visualizations/         # Model performance plots
├── backend/
│   └── main.py                 # FastAPI server
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/           # React contexts
│   │   └── utils/              # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── config/
├── requirements.txt
└── README.md
```

## 🚀 Quick Start Guide

### Option 1: One-Click Deployment (Recommended)

```bash
# Windows PowerShell (run as Administrator)
.\deploy.ps1

# Linux/macOS
chmod +x deploy.sh && ./deploy.sh
```

This will:
- ✅ Check all prerequisites
- ✅ Setup Python environment
- ✅ Install dependencies
- ✅ Initialize database with sample data
- ✅ Build and deploy frontend
- ✅ Start all services with monitoring
- ✅ Open browser automatically

### Option 2: Manual Setup

#### Prerequisites
- Python 3.8+
- Node.js 16+
- Git
- VS Code (recommended)

#### Step 1: Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd rockfall

# Create Python virtual environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step 2: Database Setup

```bash
# Initialize database with sample data
python scripts/setup_database.py
```

#### Step 3: Frontend Setup

```bash
# Install Node.js dependencies
cd frontend
npm install

# Build production frontend
npm run build
cd ..
```

#### Step 4: Start System

```bash
# Start complete system (backend + frontend)
python run_system.py
```

The system will automatically:
- Start FastAPI backend on http://localhost:8000
- Serve React frontend on http://localhost:3000
- Open browser to the application
- Provide API documentation at http://localhost:8000/docs

## 🔧 VS Code Setup

### Recommended Extensions
- Python
- Python Extension Pack
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- GitLens
- Prettier - Code formatter
- Auto Rename Tag

### VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  }
}
```

### Launch Configuration
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/main.py",
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "Python: Data Processing",
      "type": "python",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

## 📊 Data Sources

### Primary Data Sources
- **Tamil Nadu Mining Data**: Government mining lease databases
- **Satellite Imagery**: Sentinel-2 (Copernicus)
- **Elevation Data**: SRTM, ISRO Bhuvan
- **Weather Data**: IMD, ERA5
- **Geological Data**: Geological Survey of India

### Data Processing Pipeline
1. **Raw Data Ingestion**: Load from various APIs and databases
2. **Quality Validation**: Remove invalid coordinates, check data consistency
3. **Spatial Processing**: Clip imagery to mine boundaries
4. **Feature Engineering**: Create risk-relevant features
5. **Model Training**: Train ensemble models on integrated dataset

## 🤖 Machine Learning Pipeline

### Model Architecture
- **Ensemble Approach**: Combines Random Forest, LightGBM, and Gradient Boosting
- **Feature Engineering**: 25+ features including geological, environmental, and spatial factors
- **Risk Categories**: Low, Medium, High risk classification
- **Confidence Scoring**: Model uncertainty quantification

### Key Features
- Geological stability indices
- Slope and elevation factors
- Weather stress indicators
- Historical patterns
- Mine characteristics

### Model Performance
- **Accuracy**: 85-92% across different models
- **Cross-validation**: 5-fold CV with stratified sampling
- **Feature Importance**: Automated feature ranking
- **Interpretability**: SHAP values for prediction explanation

## 🎨 Frontend Architecture

### Component Structure
- **Dashboard**: Main application interface
- **MineMap**: Interactive Leaflet map component
- **MineCard**: Instagram-style mine information cards
- **SearchFilters**: Advanced filtering system
- **AlertsPanel**: Risk alert notifications
- **ExportModal**: Data export functionality

### Design System
- **Instagram-Inspired**: Rounded corners, gradients, shadows
- **Responsive**: Mobile-first design approach
- **Animations**: Framer Motion for smooth interactions
- **Accessibility**: WCAG 2.1 compliance
- **Dark Mode**: System and manual theme switching

## 🔌 API Documentation

### Main Endpoints

#### GET /mines
Get list of mines with filtering options
```bash
curl "http://localhost:8000/mines?district=Salem&risk_category=High"
```

#### GET /mines/{mine_id}
Get detailed information for specific mine
```bash
curl "http://localhost:8000/mines/1"
```

#### POST /predict
Predict risk for new mine data
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 11.5,
    "longitude": 78.5,
    "elevation_m": 500,
    "slope_degrees": 25,
    "avg_rainfall_mm": 800,
    "avg_temp_c": 28,
    "mineral_type": "Granite",
    "lease_area_ha": 50
  }'
```

#### GET /statistics
Get overall system statistics
```bash
curl "http://localhost:8000/statistics"
```

## 🚀 Deployment Options

### Production Deployment with Docker

```bash
# Build and start all services
docker-compose up --build -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Production URLs
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **API Docs**: http://localhost/api/docs
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)

### Cloud Deployment

#### AWS/GCP/Azure Setup
1. **Container Registry**: Push Docker images to cloud registry
2. **Database**: Use managed PostgreSQL/RDS
3. **Storage**: Use cloud storage for models and data
4. **CDN**: Serve frontend via CloudFront/CloudFlare
5. **Monitoring**: Use cloud monitoring services

#### Environment Variables for Production
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
API_SECRET_KEY=your-secret-key
CORS_ORIGINS=https://yourdomain.com
```

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Database | SQLite | PostgreSQL |
| Frontend | npm start | Nginx/Docker |
| Backend | uvicorn reload | gunicorn |
| Monitoring | Basic logging | Prometheus/Grafana |
| Caching | None | Redis |
| SSL | None | Let's Encrypt |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=sqlite:///./data/rockfall_db.sqlite

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# ML Model Paths
MODEL_PATH=./models/rockfall_model.pkl
SCALER_PATH=./models/scaler.pkl

# External APIs (Optional)
SENTINEL_USERNAME=your_username
SENTINEL_PASSWORD=your_password
GOOGLE_EARTH_ENGINE_KEY=your_key

# Security
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

### VS Code Configuration

#### Recommended Extensions
- Python
- Python Extension Pack
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- GitLens
- Prettier - Code formatter
- Docker (for container development)

#### VS Code Settings (.vscode/settings.json)
```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## 🧪 Testing

### Backend Testing
```bash
# Run API tests
python -m pytest tests/

# Test individual components
python scripts/test_model_prediction.py
```

### Frontend Testing
```bash
# Run React tests
cd frontend
npm test

# Run end-to-end tests
npm run test:e2e
```

## 📈 Performance Optimization

### Backend Optimizations
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized query performance
- **Batch Processing**: Efficient bulk operations
- **Model Serving**: Optimized inference pipeline

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle optimization
- **CDN Integration**: Static asset delivery

## 🛠️ Troubleshooting

### Common Issues

#### 1. Python Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

#### 2. Node.js Dependency Issues
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 3. API Connection Issues
- Check if backend server is running on http://localhost:8000
- Verify CORS settings in backend/main.py
- Check network firewall settings

#### 4. Map Not Loading
- Verify internet connection for tile loading
- Check Leaflet CSS imports
- Ensure proper component mounting

### Performance Issues
- **Large Dataset**: Implement pagination for mine listings
- **Slow Predictions**: Consider model quantization or caching
- **Memory Usage**: Monitor and optimize data processing scripts

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- **Python**: Follow PEP 8 style guide
- **JavaScript**: Use ESLint and Prettier
- **Documentation**: Update README for new features
- **Testing**: Add tests for new functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Tamil Nadu Government for mining data access
- Copernicus Programme for Sentinel satellite data
- Indian Meteorological Department for weather data
- Open source community for excellent tools and libraries

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@rockfall-prediction.com
- Documentation: [Wiki](https://github.com/your-repo/rockfall/wiki)

---

**Built with ❤️ for safer mining operations in Tamil Nadu**