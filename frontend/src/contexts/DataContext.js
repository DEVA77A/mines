import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [mines, setMines] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use relative URLs in development to leverage the proxy, absolute URLs in production
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_API_URL || 'http://localhost:8000')
    : '';

  const fetchMines = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (filters.district) params.district = filters.district;
      if (filters.risk_level) params.risk_level = filters.risk_level;
      if (filters.status) params.status = filters.status;
      if (filters.limit) params.limit = filters.limit;

      const response = await axios.get(`${API_BASE_URL}/api/mines`, { params });
      setMines(response.data);
    } catch (err) {
      console.error('Error fetching mines:', err);
      setError(err.response?.data?.detail || 'Failed to fetch mines data');
      
      // Fallback to mock data for development
      setMines(generateMockMines());
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stats`);
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      
      // Fallback to mock statistics
      setStatistics(generateMockStatistics());
    }
  }, [API_BASE_URL]);

  const fetchMineDetails = useCallback(async (mineId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/mines/${mineId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching mine details:', err);
      throw new Error(err.response?.data?.detail || 'Failed to fetch mine details');
    }
  }, [API_BASE_URL]);

  const predictRisk = useCallback(async (features) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/predict`, features);
      return response.data;
    } catch (err) {
      console.error('Error predicting risk:', err);
      throw new Error(err.response?.data?.detail || 'Failed to predict risk');
    }
  }, [API_BASE_URL]);

  // Mock data generators for development/fallback
  const generateMockMines = () => {
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
    const riskCategories = ['Low', 'Medium', 'High'];
    const statuses = ['Active', 'Inactive', 'Under Review', 'High Risk'];

    return Array.from({ length: 200 }, (_, i) => {
      const district = districts[i % districts.length];
      const coords = district_coords[district];
      const riskLevel = riskCategories[Math.floor(Math.random() * 3)];
      const riskScore = riskLevel === 'High' ? 60 + Math.random() * 40 : 
                       riskLevel === 'Medium' ? 30 + Math.random() * 30 : 
                       Math.random() * 30;
      
      return {
        mine_id: `TN_${(i + 1).toString().padStart(3, '0')}`,
        mine_name: `Mine_${(i + 1).toString().padStart(2, '0')}`,
        district: district,
        mine_type: mineralTypes[i % mineralTypes.length],
        latitude: coords.lat_range[0] + Math.random() * (coords.lat_range[1] - coords.lat_range[0]),
        longitude: coords.lon_range[0] + Math.random() * (coords.lon_range[1] - coords.lon_range[0]),
        status: statuses[i % statuses.length],
        operational_data: {
          area_hectares: Math.round(10 + Math.random() * 140)
        },
        risk_assessment: {
          risk_level: riskLevel,
          risk_score: riskScore,
          color: riskLevel === 'High' ? '#EF4444' : riskLevel === 'Medium' ? '#F59E0B' : '#10B981'
        }
      };
    });
  };

  const generateMockStatistics = () => ({
    total_mines: 20,
    districts: 6,
    mineral_types: {
      'Granite': 5,
      'Limestone': 4,
      'Iron Ore': 3,
      'Marble': 3,
      'Sandstone': 3,
      'Silica Sand': 2
    },
    status_distribution: {
      'Active': 15,
      'Closed': 5
    },
    risk_distribution: {
      'Low': 8,
      'Medium': 7,
      'High': 5
    },
    active_mines: 15,
    total_lease_area: 1250.5,
    average_lease_area: 62.5,
    average_risk_score: 0.45,
    high_risk_mines: 5,
    last_updated: new Date().toISOString()
  });

  const value = {
    mines,
    statistics,
    loading,
    error,
    fetchMines,
    fetchStatistics,
    fetchMineDetails,
    predictRisk,
    API_BASE_URL
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};