// API service for Tamil Nadu Rockfall Risk Prediction System
import axios from 'axios';

// API Configuration - Use relative URLs in development to leverage proxy
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:8000')
  : '';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to all requests
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access - redirecting to login');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Health Check
  async healthCheck() {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Mine Data Operations
  async getMines(params = {}) {
    try {
      const response = await apiClient.get('/api/mines', { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using fallback data');
      // Fallback to mock data if API fails
      return mockDataGenerators.generateMockMines(200);
    }
  }

  async getMineById(id) {
    try {
      const response = await apiClient.get(`/api/mines/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch mine ${id}: ${error.message}`);
    }
  }

  // Weather Data Operations
  async getWeatherForMine(mineId) {
    try {
      const response = await apiClient.get(`/api/weather/${mineId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch weather for mine ${mineId}: ${error.message}`);
    }
  }

  // Sensor Reading Operations
  async addSensorReading(mineId, readingData) {
    try {
      const response = await apiClient.post(`/api/mines/${mineId}/sensor-reading`, readingData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add sensor reading: ${error.message}`);
    }
  }

  async createMine(mineData) {
    try {
      const response = await apiClient.post('/mines', mineData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create mine: ${error.message}`);
    }
  }

  async updateMine(id, mineData) {
    try {
      const response = await apiClient.put(`/mines/${id}`, mineData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update mine ${id}: ${error.message}`);
    }
  }

  async deleteMine(id) {
    try {
      const response = await apiClient.delete(`/mines/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete mine ${id}: ${error.message}`);
    }
  }

  // Prediction Operations
  async getPrediction(mineData) {
    try {
      const response = await apiClient.post('/api/predict/temp', mineData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get prediction: ${error.message}`);
    }
  }

  async getBatchPredictions(minesData) {
    try {
      const response = await apiClient.post('/predict/batch', minesData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get batch predictions: ${error.message}`);
    }
  }

  // Statistics and Analytics
  async getStatistics() {
    try {
      const response = await apiClient.get('/api/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }

  async getAnalytics(timeRange = '30d') {
    try {
      const response = await apiClient.get('/analytics', {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  // Alert Operations
  async getAlerts(params = {}) {
    try {
      const response = await apiClient.get('/api/alerts', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch alerts: ${error.message}`);
    }
  }

  async createAlert(alertData) {
    try {
      const response = await apiClient.post('/alerts', alertData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create alert: ${error.message}`);
    }
  }

  async markAlertAsRead(alertId) {
    try {
      const response = await apiClient.patch(`/alerts/${alertId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to mark alert as read: ${error.message}`);
    }
  }

  async dismissAlert(alertId) {
    try {
      const response = await apiClient.delete(`/alerts/${alertId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to dismiss alert: ${error.message}`);
    }
  }

  // Environmental Data
  async getEnvironmentalData(mineId, dateRange = '7d') {
    try {
      const response = await apiClient.get(`/environmental/${mineId}`, {
        params: { date_range: dateRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch environmental data: ${error.message}`);
    }
  }

  async getWeatherData(latitude, longitude) {
    try {
      const response = await apiClient.get('/weather', {
        params: { lat: latitude, lon: longitude }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  // Satellite Imagery
  async getSatelliteImagery(mineId, date = null) {
    try {
      const response = await apiClient.get(`/imagery/${mineId}`, {
        params: date ? { date } : {}
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch satellite imagery: ${error.message}`);
    }
  }

  async getImageryHistory(mineId, limit = 10) {
    try {
      const response = await apiClient.get(`/imagery/${mineId}/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch imagery history: ${error.message}`);
    }
  }

  // Reports and Export
  async generateReport(mineId, reportType = 'comprehensive') {
    try {
      const response = await apiClient.post('/reports/generate', {
        mine_id: mineId,
        report_type: reportType
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  async exportData(format = 'csv', filters = {}) {
    try {
      const response = await apiClient.post('/export', {
        format,
        filters
      }, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  // Search and Filtering
  async searchMines(query, filters = {}) {
    try {
      const response = await apiClient.get('/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search mines: ${error.message}`);
    }
  }

  async getFilterOptions() {
    try {
      const response = await apiClient.get('/filters');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch filter options: ${error.message}`);
    }
  }

  // Model Management
  async getModelInfo() {
    try {
      const response = await apiClient.get('/model/info');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch model info: ${error.message}`);
    }
  }

  async retrainModel(trainingData = null) {
    try {
      const response = await apiClient.post('/model/retrain', trainingData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrain model: ${error.message}`);
    }
  }

  // User Management (if authentication is added)
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.common['Authorization'];
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  // Utility Methods
  async uploadFile(file, type = 'data') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async downloadFile(fileId) {
    try {
      const response = await apiClient.get(`/download/${fileId}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw new Error(`File download failed: ${error.message}`);
    }
  }

  // Real-time Updates (WebSocket simulation)
  subscribeToUpdates(callback) {
    // This would normally use WebSocket, but for now we'll use polling
    const interval = setInterval(async () => {
      try {
        const alerts = await this.getAlerts({ active: true });
        callback(alerts);
      } catch (error) {
        console.error('Failed to fetch updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

// Export singleton instance
const apiService = new ApiService();

// Mock data generators for development
export const mockDataGenerators = {
  generateMockMines: (count = 200) => {
    // Accurate Tamil Nadu district coordinates (avoiding sea areas)
    const district_coords = {
      'Salem': { lat_range: [11.5, 11.9], lon_range: [77.8, 78.5] },
      'Dharmapuri': { lat_range: [11.9, 12.5], lon_range: [77.5, 78.5] },
      'Krishnagiri': { lat_range: [12.3, 12.7], lon_range: [77.7, 78.3] },
      'Tiruvannamalai': { lat_range: [11.8, 12.3], lon_range: [78.5, 79.2] },
      'Vellore': { lat_range: [12.6, 13.0], lon_range: [78.8, 79.5] },
      'Cuddalore': { lat_range: [11.6, 12.0], lon_range: [79.6, 79.9] },
      'Chennai': { lat_range: [12.8, 13.2], lon_range: [80.1, 80.3] },
      'Villupuram': { lat_range: [11.9, 12.3], lon_range: [79.3, 79.7] },
      'Kanchipuram': { lat_range: [12.7, 13.0], lon_range: [79.7, 80.1] },
      'Tiruvallur': { lat_range: [13.0, 13.3], lon_range: [79.6, 80.0] }
    };
    
    const districts = Object.keys(district_coords);
    const mineralTypes = ['Iron Ore', 'Granite', 'Limestone', 'Bauxite', 'Magnesite', 'Garnet', 'Quartzite'];
    const statuses = ['Active', 'Inactive', 'Under Review', 'High Risk'];
    const riskLevels = ['Low', 'Medium', 'High'];

    return Array.from({ length: count }, (_, index) => {
      const district = districts[Math.floor(Math.random() * districts.length)];
      const coords = district_coords[district];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const riskScore = riskLevel === 'High' ? 60 + Math.random() * 40 : 
                       riskLevel === 'Medium' ? 30 + Math.random() * 30 : 
                       Math.random() * 30;
      
      return {
        mine_id: `TN_${(index + 1).toString().padStart(3, '0')}`,
        mine_name: `Mine_${(index + 1).toString().padStart(2, '0')}`,
        district: district,
        mine_type: mineralTypes[Math.floor(Math.random() * mineralTypes.length)],
        latitude: coords.lat_range[0] + Math.random() * (coords.lat_range[1] - coords.lat_range[0]),
        longitude: coords.lon_range[0] + Math.random() * (coords.lon_range[1] - coords.lon_range[0]),
        elevation: 200 + Math.random() * 1600,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        monitoring_status: Math.random() > 0.3 ? 'Online' : Math.random() > 0.5 ? 'Offline' : 'Maintenance',
        operational_data: {
          area_hectares: 10 + Math.random() * 140
        },
        risk_assessment: {
          risk_level: riskLevel,
          risk_score: riskScore,
          color: riskLevel === 'High' ? '#EF4444' : riskLevel === 'Medium' ? '#F59E0B' : '#10B981'
        },
        last_update: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        environmental_factors: {
          rainfall_mm: 400 + Math.random() * 1400,
          temperature_c: 18 + Math.random() * 20,
          humidity: 35 + Math.random() * 50,
          wind_speed: 3 + Math.random() * 17
        }
      };
    });
  },

  generateMockAlerts: (count = 10) => {
    const levels = ['low', 'medium', 'high', 'critical'];
    const types = ['weather', 'geological', 'equipment', 'environmental'];
    
    return Array.from({ length: count }, (_, index) => ({
      id: `alert_${index + 1}`,
      level: levels[Math.floor(Math.random() * levels.length)],
      type: types[Math.floor(Math.random() * types.length)],
      title: `Alert ${index + 1}`,
      message: `This is a mock alert message for testing purposes.`,
      mine_id: `mine_${Math.floor(Math.random() * 127) + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_read: Math.random() > 0.5,
      actions: ['monitor', 'inspect', 'evacuate'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  }
};

export default apiService;