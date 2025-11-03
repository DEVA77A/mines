import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  getMines, 
  getMineDetails, 
  getAnalytics, 
  getWeatherForMine, 
  exportData, 
  triggerManualMonitoring,
  getSearchSuggestions,
  getRiskColor,
  getStatusColor
} from '../services/enhancedApiService';

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
  const [selectedMine, setSelectedMine] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    district: '',
    risk_level: '',
    status: '',
    type: '',
    search: ''
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Fetch mines with filtering
  const fetchMines = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching mines with filters:', filterParams);
      const minesData = await getMines(filterParams);
      console.log('Received mines:', minesData.length);
      setMines(minesData);
    } catch (err) {
      console.error('Error fetching mines:', err);
      setError('Failed to fetch mines data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific mine details
  const fetchMineDetails = useCallback(async (mineId) => {
    setLoading(true);
    setError(null);
    
    try {
      const mineDetails = await getMineDetails(mineId);
      setSelectedMine(mineDetails);
      return mineDetails;
    } catch (err) {
      console.error('Error fetching mine details:', err);
      setError('Failed to fetch mine details');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch system statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await getAnalytics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to fetch statistics');
    }
  }, []);

  // Get weather data for specific mine
  const fetchWeatherData = useCallback(async (mineId) => {
    try {
      const weather = await getWeatherForMine(mineId);
      return weather;
    } catch (err) {
      console.error('Error fetching weather:', err);
      throw new Error('Failed to fetch weather data');
    }
  }, []);

  // Export mines data
  const exportMinesData = useCallback(async (format = 'json') => {
    try {
      const exportResult = await exportData(format);
      return exportResult;
    } catch (err) {
      console.error('Error exporting data:', err);
      throw new Error('Failed to export data');
    }
  }, []);

  // Trigger manual monitoring update
  const performManualMonitoring = useCallback(async () => {
    try {
      const result = await triggerManualMonitoring();
      // Refresh mines data after monitoring
      await fetchMines(filters);
      return result;
    } catch (err) {
      console.error('Error in manual monitoring:', err);
      throw new Error('Failed to perform manual monitoring');
    }
  }, [filters, fetchMines]);

  // Get search suggestions
  const fetchSearchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    try {
      const suggestions = await getSearchSuggestions(query);
      setSearchSuggestions(suggestions);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSearchSuggestions([]);
    }
  }, []);

  // Apply filters
  const applyFilters = useCallback(async (newFilters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    await fetchMines(newFilters);
  }, [fetchMines]);

  // Clear filters
  const clearFilters = useCallback(async () => {
    const emptyFilters = {
      district: '',
      risk_level: '',
      status: '',
      type: '',
      search: ''
    };
    setFilters(emptyFilters);
    await fetchMines(emptyFilters);
  }, [fetchMines]);

  // Filter mines by risk level
  const filterByRiskLevel = useCallback(async (riskLevel) => {
    const newFilters = { ...filters, risk_level: riskLevel };
    await applyFilters(newFilters);
  }, [filters, applyFilters]);

  // Search mines
  const searchMines = useCallback(async (searchTerm) => {
    const newFilters = { ...filters, search: searchTerm };
    await applyFilters(newFilters);
  }, [filters, applyFilters]);

  // Initial data load
  useEffect(() => {
    fetchMines();
    fetchStatistics();
  }, [fetchMines, fetchStatistics]);

  // Get mines by risk level for statistics
  const getMinesByRiskLevel = useCallback((riskLevel) => {
    return mines.filter(mine => mine.risk_level.toLowerCase() === riskLevel.toLowerCase());
  }, [mines]);

  // Get mines by district
  const getMinesByDistrict = useCallback((district) => {
    return mines.filter(mine => mine.district.toLowerCase() === district.toLowerCase());
  }, [mines]);

  // Get total mines count
  const getTotalMines = useCallback(() => {
    return mines.length;
  }, [mines]);

  // Get active mines count
  const getActiveMines = useCallback(() => {
    return mines.filter(mine => mine.status.toLowerCase() === 'active').length;
  }, [mines]);

  // Context value
  const contextValue = {
    // Data
    mines,
    selectedMine,
    statistics,
    loading,
    error,
    filters,
    searchSuggestions,
    
    // Actions
    fetchMines,
    fetchMineDetails,
    fetchStatistics,
    fetchWeatherData,
    exportMinesData,
    performManualMonitoring,
    fetchSearchSuggestions,
    applyFilters,
    clearFilters,
    filterByRiskLevel,
    searchMines,
    setSelectedMine,
    
    // Utilities
    getMinesByRiskLevel,
    getMinesByDistrict,
    getTotalMines,
    getActiveMines,
    getRiskColor,
    getStatusColor
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;