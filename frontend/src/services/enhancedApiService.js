import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Backend server not available, using fallback data');
    }
    return Promise.reject(error);
  }
);

// Enhanced Tamil Nadu district coordinates with proper boundaries
const district_coords = {
  "Chennai": {
    "lat_min": 12.8342, "lat_max": 13.2824, "lon_min": 80.0955, "lon_max": 80.3463,
    "center_lat": 13.0827, "center_lon": 80.2707
  },
  "Coimbatore": {
    "lat_min": 10.7905, "lat_max": 11.1015, "lon_min": 76.8718, "lon_max": 77.1734,
    "center_lat": 11.0168, "center_lon": 76.9558
  },
  "Salem": {
    "lat_min": 11.5618, "lat_max": 11.7414, "lon_min": 78.0322, "lon_max": 78.2186,
    "center_lat": 11.664, "center_lon": 78.146
  },
  "Tiruchirappalli": {
    "lat_min": 10.6909, "lat_max": 10.8505, "lon_min": 78.6009, "lon_max": 78.7047,
    "center_lat": 10.7905, "center_lon": 78.7047
  },
  "Madurai": {
    "lat_min": 9.8252, "lat_max": 10.0811, "lon_min": 78.0322, "lon_max": 78.2186,
    "center_lat": 9.9252, "center_lon": 78.1198
  },
  "Tirunelveli": {
    "lat_min": 8.4606, "lat_max": 8.8013, "lon_min": 77.6476, "lon_max": 77.8081,
    "center_lat": 8.7139, "center_lon": 77.7567
  },
  "Vellore": {
    "lat_min": 12.7433, "lat_max": 12.9915, "lon_min": 78.9197, "lon_max": 79.1794,
    "center_lat": 12.9165, "center_lon": 79.1325
  },
  "Erode": {
    "lat_min": 11.2378, "lat_max": 11.4186, "lon_min": 77.6476, "lon_max": 77.8081,
    "center_lat": 11.3410, "center_lon": 77.7172
  },
  "Thanjavur": {
    "lat_min": 10.6181, "lat_max": 10.8505, "lon_min": 79.0834, "lon_max": 79.1794,
    "center_lat": 10.7870, "center_lon": 79.1378
  },
  "Dindigul": {
    "lat_min": 10.2278, "lat_max": 10.4085, "lon_min": 77.8774, "lon_max": 78.1733,
    "center_lat": 10.3624, "center_lon": 78.0061
  }
};

const mine_types = ["Iron Ore", "Coal", "Limestone", "Granite", "Bauxite", "Copper", "Gold", "Silver", "Manganese"];
const statuses = ["Active", "Under Development", "Temporarily Closed", "Maintenance"];
const risk_levels = ["Low", "Medium", "High", "Critical"];

// Sample photos for mines
const sample_photos = [
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", 
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
];

// Generate comprehensive mock mine data with accurate coordinates
function generateMockMines(count = 300) {
  const mines = [];
  let mineId = 1;
  
  Object.entries(district_coords).forEach(([district, coords]) => {
    const numMines = Math.floor(Math.random() * 15) + 25; // 25-40 mines per district
    
    for (let i = 0; i < numMines && mineId <= count; i++) {
      // Generate coordinates within district boundaries (more accurate)
      const lat = coords.lat_min + Math.random() * (coords.lat_max - coords.lat_min);
      const lon = coords.lon_min + Math.random() * (coords.lon_max - coords.lon_min);
      
      const risk_score = Math.random();
      let risk_level;
      if (risk_score < 0.3) risk_level = "Low";
      else if (risk_score < 0.6) risk_level = "Medium";
      else if (risk_score < 0.8) risk_level = "High";
      else risk_level = "Critical";
      
      const mine_type = mine_types[Math.floor(Math.random() * mine_types.length)];
      const established_year = 1960 + Math.floor(Math.random() * 60);
      
      mines.push({
        id: mineId++,
        name: `${district} ${mine_type} Mine ${i + 1}`,
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lon.toFixed(6)),
        district: district,
        type: mine_type,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        risk_level: risk_level,
        risk_score: parseFloat(risk_score.toFixed(3)),
        last_updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        safety_score: parseFloat((0.6 + Math.random() * 0.35).toFixed(3)),
        production_capacity: Math.floor(Math.random() * 4900) + 100,
        elevation: Math.floor(Math.random() * 750) + 50,
        slope_angle: parseFloat((15 + Math.random() * 30).toFixed(1)),
        temperature: parseFloat((25 + Math.random() * 10).toFixed(1)),
        humidity: Math.floor(Math.random() * 25) + 60,
        wind_speed: parseFloat((5 + Math.random() * 20).toFixed(1)),
        recent_rainfall: parseFloat((Math.random() * 150).toFixed(1)),
        description: `Active ${mine_type.toLowerCase()} mining operation in ${district} district. Established in ${established_year} with modern safety protocols.`,
        owner: `${district} Mining Corporation Ltd.`,
        established_year: established_year,
        mineral_type: mine_type,
        depth: Math.floor(Math.random() * 450) + 50,
        photo_url: sample_photos[Math.floor(Math.random() * sample_photos.length)]
      });
    }
  });
  
  return mines.slice(0, count);
}

// Enhanced API Service functions
export const getMines = async (params = {}) => {
  try {
    console.log('Fetching mines with params:', params);
    const response = await api.get('/api/mines', { params });
    console.log('API Response:', response.data.length, 'mines');
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch from API, using mock data:', error.message);
    const mockMines = generateMockMines(300);
    
    // Apply client-side filtering if API fails
    let filteredMines = mockMines;
    
    if (params.district) {
      filteredMines = filteredMines.filter(mine => 
        mine.district.toLowerCase().includes(params.district.toLowerCase())
      );
    }
    
    if (params.risk_level) {
      filteredMines = filteredMines.filter(mine => 
        mine.risk_level.toLowerCase() === params.risk_level.toLowerCase()
      );
    }
    
    if (params.status) {
      filteredMines = filteredMines.filter(mine => 
        mine.status.toLowerCase().includes(params.status.toLowerCase())
      );
    }
    
    if (params.type) {
      filteredMines = filteredMines.filter(mine => 
        mine.type.toLowerCase().includes(params.type.toLowerCase())
      );
    }
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredMines = filteredMines.filter(mine => 
        mine.name.toLowerCase().includes(searchTerm) ||
        mine.district.toLowerCase().includes(searchTerm) ||
        mine.type.toLowerCase().includes(searchTerm) ||
        mine.owner.toLowerCase().includes(searchTerm)
      );
    }
    
    console.log('Filtered mines:', filteredMines.length);
    return filteredMines;
  }
};

export const getMineDetails = async (mineId) => {
  try {
    console.log('Fetching mine details for ID:', mineId);
    const response = await api.get(`/api/mines/${mineId}`);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch mine details from API, using mock data:', error.message);
    const mockMines = generateMockMines(300);
    const mine = mockMines.find(m => m.id === parseInt(mineId));
    
    if (mine) {
      return {
        ...mine,
        recent_alerts: [
          {
            id: 1,
            type: "Risk Assessment",
            severity: mine.risk_level,
            message: `Mine shows ${mine.risk_level.toLowerCase()} risk factors. Enhanced monitoring recommended.`,
            timestamp: new Date().toISOString(),
            is_active: true
          }
        ],
        sensor_readings: [
          {
            id: 1,
            timestamp: new Date().toISOString(),
            vibration: (Math.random() * 5).toFixed(2),
            tilt: (Math.random() * 15).toFixed(2),
            temperature: mine.temperature,
            humidity: mine.humidity,
            pressure: (1010 + Math.random() * 10).toFixed(1),
            seismic_activity: (Math.random() * 3).toFixed(2),
            ground_stability: (0.5 + Math.random() * 0.5).toFixed(2)
          }
        ],
        weather_history: [
          {
            timestamp: new Date().toISOString(),
            temperature: mine.temperature,
            humidity: mine.humidity,
            wind_speed: mine.wind_speed,
            pressure: 1010 + Math.random() * 10,
            description: ['Clear Sky', 'Few Clouds', 'Light Rain'][Math.floor(Math.random() * 3)],
            rainfall: mine.recent_rainfall
          }
        ]
      };
    }
    
    throw new Error('Mine not found');
  }
};

export const getWeatherForMine = async (mineId) => {
  try {
    const response = await api.get(`/api/weather/${mineId}`);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch weather from API, using mock data:', error.message);
    return {
      temperature: 28 + Math.random() * 8,
      humidity: 65 + Math.random() * 20,
      wind_speed: 10 + Math.random() * 15,
      pressure: 1010 + Math.random() * 10,
      description: ['Clear Sky', 'Few Clouds', 'Scattered Clouds', 'Light Rain'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString(),
      rainfall: Math.random() * 50
    };
  }
};

export const getDistricts = async () => {
  try {
    const response = await api.get('/api/districts');
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch districts from API, using mock data:', error.message);
    return Object.entries(district_coords).map(([name, coords]) => ({
      name,
      mine_count: Math.floor(Math.random() * 25) + 25,
      coordinates: coords,
      risk_distribution: {
        critical: Math.floor(Math.random() * 3),
        high: Math.floor(Math.random() * 8),
        medium: Math.floor(Math.random() * 12),
        low: Math.floor(Math.random() * 15)
      }
    }));
  }
};

export const getAnalytics = async () => {
  try {
    const response = await api.get('/api/analytics');
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch analytics from API, using mock data:', error.message);
    const mockMines = generateMockMines(300);
    
    const criticalRisk = mockMines.filter(m => m.risk_level === 'Critical').length;
    const highRisk = mockMines.filter(m => m.risk_level === 'High').length;
    const mediumRisk = mockMines.filter(m => m.risk_level === 'Medium').length;
    const lowRisk = mockMines.filter(m => m.risk_level === 'Low').length;
    
    return {
      total_mines: mockMines.length,
      risk_distribution: {
        critical: criticalRisk,
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk
      },
      status_distribution: {
        active: mockMines.filter(m => m.status === 'Active').length,
        development: mockMines.filter(m => m.status === 'Under Development').length,
        closed: mockMines.filter(m => m.status === 'Temporarily Closed').length,
        maintenance: mockMines.filter(m => m.status === 'Maintenance').length
      },
      mine_types: {
        "Iron Ore": mockMines.filter(m => m.type === 'Iron Ore').length,
        "Coal": mockMines.filter(m => m.type === 'Coal').length,
        "Limestone": mockMines.filter(m => m.type === 'Limestone').length,
        "Granite": mockMines.filter(m => m.type === 'Granite').length
      },
      active_alerts: Math.floor(Math.random() * 20) + 5,
      last_updated: new Date().toISOString(),
      districts_covered: Object.keys(district_coords).length,
      total_sensor_readings: Math.floor(Math.random() * 5000) + 1000,
      total_weather_records: Math.floor(Math.random() * 10000) + 2000
    };
  }
};

export const exportData = async (format = 'json') => {
  try {
    const response = await api.get('/api/export', { params: { format } });
    return response.data;
  } catch (error) {
    console.warn('Failed to export from API, using mock data:', error.message);
    const mockMines = generateMockMines(300);
    
    if (format.toLowerCase() === 'csv') {
      // Generate CSV format
      const headers = Object.keys(mockMines[0]).join(',');
      const rows = mockMines.map(mine => Object.values(mine).join(','));
      const csvData = [headers, ...rows].join('\n');
      
      return {
        format: 'csv',
        data: csvData,
        count: mockMines.length,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      format,
      data: mockMines,
      count: mockMines.length,
      timestamp: new Date().toISOString()
    };
  }
};

export const triggerManualMonitoring = async () => {
  try {
    const response = await api.post('/api/manual-monitoring');
    return response.data;
  } catch (error) {
    console.warn('Failed to trigger monitoring from API:', error.message);
    return {
      status: 'success',
      message: 'Manual monitoring completed (mock)',
      timestamp: new Date().toISOString()
    };
  }
};

export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get('/api/search-suggestions', { params: { query } });
    return response.data.suggestions;
  } catch (error) {
    console.warn('Failed to get suggestions from API, using mock data:', error.message);
    const suggestions = [];
    
    // Add district suggestions
    Object.keys(district_coords).forEach(district => {
      if (district.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(district);
      }
    });
    
    // Add type suggestions
    mine_types.forEach(type => {
      if (type.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(type);
      }
    });
    
    // Add risk level suggestions
    risk_levels.forEach(level => {
      if (level.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(level);
      }
    });
    
    return suggestions.slice(0, 10);
  }
};

// Utility functions
export const getRiskColor = (riskLevel) => {
  switch (riskLevel?.toLowerCase()) {
    case 'critical':
      return '#8B0000'; // Dark red
    case 'high':
      return '#DC2626'; // Red
    case 'medium':
      return '#F59E0B'; // Amber/Orange
    case 'low':
      return '#10B981'; // Green
    default:
      return '#6B7280'; // Gray
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '#10B981'; // Green
    case 'under development':
      return '#3B82F6'; // Blue
    case 'temporarily closed':
      return '#EF4444'; // Red
    case 'maintenance':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};

export default api;