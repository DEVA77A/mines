# Tamil Nadu Rockfall Risk Prediction System - Deployment Script
# This script sets up the complete system for production deployment

Write-Host "🚀 Starting Tamil Nadu Rockfall Risk Prediction System Deployment" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Yellow

# Check prerequisites
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Cyan

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    try {
        $composeVersion = docker compose version
        Write-Host "✅ Docker Compose V2: $composeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker Compose not found. Please install Docker Compose" -ForegroundColor Red
        exit 1
    }
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ from https://python.org" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Setting up Environment..." -ForegroundColor Cyan

# Create necessary directories
$directories = @(
    "data",
    "data/raw",
    "data/processed",
    "data/imagery",
    "models",
    "logs",
    "monitoring/prometheus",
    "monitoring/grafana/dashboards",
    "monitoring/grafana/datasources",
    "ssl"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Created directory: $dir" -ForegroundColor Gray
    }
}

# Setup Python environment
Write-Host "`n🐍 Setting up Python Environment..." -ForegroundColor Cyan

if (!(Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Gray
    python -m venv venv
}

Write-Host "Activating virtual environment and installing dependencies..." -ForegroundColor Gray
& ".\venv\Scripts\Activate.ps1"
pip install --upgrade pip
pip install -r requirements.txt

# Setup Frontend
Write-Host "`n⚛️ Setting up Frontend..." -ForegroundColor Cyan

Set-Location frontend
Write-Host "Installing Node.js dependencies..." -ForegroundColor Gray
npm install

Write-Host "Building production frontend..." -ForegroundColor Gray
npm run build

Set-Location ..

# Generate SSL certificates (optional)
Write-Host "`n🔒 Setting up SSL Certificates (Optional)..." -ForegroundColor Cyan

$sslDir = "ssl"
if (!(Test-Path "$sslDir\server.crt")) {
    Write-Host "Generating self-signed SSL certificates..." -ForegroundColor Gray
    openssl req -x509 -newkey rsa:4096 -keyout "$sslDir\server.key" -out "$sslDir\server.crt" -days 365 -nodes -subj "/C=IN/ST=Tamil Nadu/L=Chennai/O=Rockfall Prediction/CN=localhost"
    Write-Host "✅ SSL certificates generated" -ForegroundColor Green
} else {
    Write-Host "✅ SSL certificates already exist" -ForegroundColor Green
}

# Setup monitoring configuration
Write-Host "`n📊 Setting up Monitoring..." -ForegroundColor Cyan

# Create Prometheus configuration
$prometheusConfig = @"
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'rockfall-backend'
    static_configs:
      - targets: ['backend:8000']

  - job_name: 'rockfall-frontend'
    static_configs:
      - targets: ['frontend:3000']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
"@

$prometheusConfig | Out-File -FilePath "monitoring/prometheus.yml" -Encoding UTF8
Write-Host "✅ Prometheus configuration created" -ForegroundColor Green

# Create Grafana datasource configuration
$grafanaDatasource = @"
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
"@

$grafanaDatasource | Out-File -FilePath "monitoring/grafana/datasources/prometheus.yml" -Encoding UTF8
Write-Host "✅ Grafana datasource configuration created" -ForegroundColor Green

# Create sample dashboard
$grafanaDashboard = @"
{
  "dashboard": {
    "title": "Rockfall Risk Prediction System",
    "tags": ["rockfall", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "Response Time"
          }
        ]
      },
      {
        "title": "Active Mines",
        "type": "stat",
        "targets": [
          {
            "expr": "rockfall_active_mines",
            "legendFormat": "Active Mines"
          }
        ]
      }
    ]
  }
}
"@

$grafanaDashboard | Out-File -FilePath "monitoring/grafana/dashboards/rockfall-dashboard.json" -Encoding UTF8
Write-Host "✅ Grafana dashboard configuration created" -ForegroundColor Green

# Setup Nginx configuration
Write-Host "`n🌐 Setting up Nginx Reverse Proxy..." -ForegroundColor Cyan

$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Upstream servers
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Main server
    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS headers
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

            if ($request_method = 'OPTIONS') {
                return 204;
            }
        }

        # Static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # SSL server (optional)
    server {
        listen 443 ssl http2;
        server_name localhost;

        ssl_certificate /etc/nginx/ssl/server.crt;
        ssl_certificate_key /etc/nginx/ssl/server.key;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Same configuration as HTTP server
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
"@

$nginxConfig | Out-File -FilePath "nginx.conf" -Encoding UTF8
Write-Host "✅ Nginx configuration created" -ForegroundColor Green

# Create environment file
Write-Host "`n⚙️ Creating Environment Configuration..." -ForegroundColor Cyan

$envContent = @"
# Tamil Nadu Rockfall Risk Prediction System - Environment Configuration

# Database Configuration
DATABASE_URL=sqlite:///./data/rockfall_db.sqlite

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# ML Model Configuration
MODEL_PATH=./models/rockfall_model.pkl
SCALER_PATH=./models/scaler.pkl

# External API Keys (Optional)
# SENTINEL_USERNAME=your_username
# SENTINEL_PASSWORD=your_password
# GOOGLE_EARTH_ENGINE_KEY=your_key

# Monitoring
PROMETHEUS_MULTIPROC_DIR=/tmp
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Environment configuration created" -ForegroundColor Green

# Pre-populate database with sample data
Write-Host "`n🗄️ Setting up Database..." -ForegroundColor Cyan

Write-Host "Running database initialization..." -ForegroundColor Gray
python scripts/setup_database.py

# Build and start services
Write-Host "`n🏗️ Building and Starting Services..." -ForegroundColor Cyan

Write-Host "Building Docker images..." -ForegroundColor Gray
docker-compose build --no-cache

Write-Host "Starting all services..." -ForegroundColor Gray
docker-compose up -d

# Wait for services to be ready
Write-Host "`n⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Health checks
Write-Host "`n🔍 Running Health Checks..." -ForegroundColor Cyan

# Check backend health
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost/api/health" -TimeoutSec 10
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend API: Healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Backend API: Status $($backendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend API: Not responding" -ForegroundColor Red
}

# Check frontend health
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend: Healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend: Status $($frontendResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend: Not responding" -ForegroundColor Red
}

# Check monitoring services
try {
    $prometheusResponse = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 10
    Write-Host "✅ Prometheus: Running on port 9090" -ForegroundColor Green
} catch {
    Write-Host "❌ Prometheus: Not responding" -ForegroundColor Red
}

try {
    $grafanaResponse = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 10
    Write-Host "✅ Grafana: Running on port 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Grafana: Not responding" -ForegroundColor Red
}

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Yellow
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:     http://localhost" -ForegroundColor White
Write-Host "   Backend API:  http://localhost/api" -ForegroundColor White
Write-Host "   API Docs:     http://localhost/api/docs" -ForegroundColor White
Write-Host "   Prometheus:   http://localhost:9090" -ForegroundColor White
Write-Host "   Grafana:      http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Management Commands:" -ForegroundColor Cyan
Write-Host "   View logs:    docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop all:     docker-compose down" -ForegroundColor White
Write-Host "   Restart:      docker-compose restart" -ForegroundColor White
Write-Host ""
Write-Host "📊 Default Credentials:" -ForegroundColor Cyan
Write-Host "   Grafana: admin / admin123" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost in your browser" -ForegroundColor White
Write-Host "   2. Explore the dashboard and mine data" -ForegroundColor White
Write-Host "   3. Check monitoring dashboards" -ForegroundColor White
Write-Host "   4. Customize configurations as needed" -ForegroundColor White
Write-Host ""
Write-Host "🆘 For help, check the logs with: docker-compose logs -f" -ForegroundColor Yellow</content>
<parameter name="filePath">c:\Users\devan\OneDrive\Desktop\rockfall\deploy.ps1