#!/bin/bash

# Tamil Nadu Rockfall Risk Prediction System - Linux/macOS Deployment Script
# This script sets up the complete system for production deployment

set -e  # Exit on any error

echo "🚀 Starting Tamil Nadu Rockfall Risk Prediction System Deployment"
echo "================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo
print_info "Checking Prerequisites..."

# Check if Docker is installed
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    print_status "Docker: $docker_version"
else
    print_error "Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is available
if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version)
    print_status "Docker Compose: $compose_version"
elif docker compose version &> /dev/null; then
    compose_version=$(docker compose version)
    print_status "Docker Compose V2: $compose_version"
else
    print_error "Docker Compose not found. Please install Docker Compose"
    exit 1
fi

# Check if Python is installed
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version)
    print_status "Python: $python_version"
else
    print_error "Python 3.8+ not found. Please install Python from https://python.org"
    exit 1
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    node_version=$(node --version)
    print_status "Node.js: $node_version"
else
    print_error "Node.js not found. Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

print_info "Setting up Environment..."

# Create necessary directories
directories=(
    "data"
    "data/raw"
    "data/processed"
    "data/imagery"
    "models"
    "logs"
    "monitoring/prometheus"
    "monitoring/grafana/dashboards"
    "monitoring/grafana/datasources"
    "ssl"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_info "Created directory: $dir"
    fi
done

print_info "Setting up Python Environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install Python dependencies
print_info "Installing Python dependencies..."
pip install -r requirements.txt

print_info "Setting up Frontend..."

# Setup frontend
cd frontend
print_info "Installing Node.js dependencies..."
npm install

print_info "Building production frontend..."
npm run build

cd ..

# Setup monitoring configuration
print_info "Setting up Monitoring..."

# Create Prometheus configuration
cat > monitoring/prometheus.yml << EOF
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
EOF
print_status "Prometheus configuration created"

# Create Grafana datasource configuration
cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
print_status "Grafana datasource configuration created"

# Create sample dashboard
cat > monitoring/grafana/dashboards/rockfall-dashboard.json << EOF
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
EOF
print_status "Grafana dashboard configuration created"

# Setup Nginx configuration
print_info "Setting up Nginx Reverse Proxy..."

cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

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
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            # CORS headers
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

            if (\$request_method = 'OPTIONS') {
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
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF
print_status "Nginx configuration created"

# Create environment file
print_info "Creating Environment Configuration..."

cat > .env << EOF
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
EOF
print_status "Environment configuration created"

# Setup database
print_info "Setting up Database..."
python3 scripts/setup_database.py

# Build and start services
print_info "Building and Starting Services..."

print_info "Building Docker images..."
if command -v docker-compose &> /dev/null; then
    docker-compose build --no-cache
else
    docker compose build --no-cache
fi

print_info "Starting all services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# Wait for services to be ready
print_info "Waiting for services to start..."
sleep 30

# Health checks
print_info "Running Health Checks..."

# Check backend health
if curl -f http://localhost/api/health &> /dev/null; then
    print_status "Backend API: Healthy"
else
    print_warning "Backend API: Not responding"
fi

# Check frontend health
if curl -f http://localhost &> /dev/null; then
    print_status "Frontend: Healthy"
else
    print_warning "Frontend: Not responding"
fi

# Check monitoring services
if curl -f http://localhost:9090 &> /dev/null; then
    print_status "Prometheus: Running on port 9090"
else
    print_warning "Prometheus: Not responding"
fi

if curl -f http://localhost:3001 &> /dev/null; then
    print_status "Grafana: Running on port 3001"
else
    print_warning "Grafana: Not responding"
fi

echo
print_status "Deployment Complete!"
echo "================================================================="
print_info "Application URLs:"
echo "   Frontend:     http://localhost"
echo "   Backend API:  http://localhost/api"
echo "   API Docs:     http://localhost/api/docs"
echo "   Prometheus:   http://localhost:9090"
echo "   Grafana:      http://localhost:3001"
echo
print_info "Management Commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop all:     docker-compose down"
echo "   Restart:      docker-compose restart"
echo
print_info "Default Credentials:"
echo "   Grafana: admin / admin123"
echo
print_info "Next Steps:"
echo "   1. Open http://localhost in your browser"
echo "   2. Explore the dashboard and mine data"
echo "   3. Check monitoring dashboards"
echo "   4. Customize configurations as needed"
echo
print_warning "For help, check the logs with: docker-compose logs -f"