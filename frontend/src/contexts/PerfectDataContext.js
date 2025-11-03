import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import perfectApiService from '../services/perfectApiService';

// Create the Perfect Data Context
const PerfectDataContext = createContext();

// Custom hook to use the context
export const usePerfectData = () => {
  const context = useContext(PerfectDataContext);
  if (!context) {
    throw new Error('usePerfectData must be used within a PerfectDataProvider');
  }
  return context;
};

// Perfect Data Provider Component
export const PerfectDataProvider = ({ children }) => {
  // State management
  const [mines, setMines] = useState([]);
  const [filteredMines, setFilteredMines] = useState([]);
  const [selectedMine, setSelectedMine] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [mineColors, setMineColors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    district: '',
    risk_level: '',
    mine_type: '',
    status: '',
    search: ''
  });
  
  // Fetch all mines
  const fetchMines = useCallback(async (customFilters = null) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching mines with filters:', customFilters || filters);
      const mineData = await perfectApiService.getMines(customFilters || filters);
      
      setMines(mineData);
      setFilteredMines(mineData);
      
      console.log(`✅ Successfully loaded ${mineData.length} mines`);
      
      // Verify no mines are in the sea
      const landMines = mineData.filter(mine => 
        mine.latitude > 8.0 && mine.latitude < 14.0 && 
        mine.longitude > 76.0 && mine.longitude < 81.0
      );
      
      if (landMines.length !== mineData.length) {
        console.warn(`⚠️ Warning: ${mineData.length - landMines.length} mines may be in invalid locations`);
      } else {
        console.log('🎯 All mines verified to be within Tamil Nadu land boundaries');
      }
      
    } catch (err) {
      console.error('❌ Error fetching mines:', err);
      setError(`Failed to fetch mines: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Fetch specific mine details
  const fetchMineDetails = useCallback(async (mineId) => {
    try {
      console.log(`🔍 Fetching details for mine ${mineId}`);
      const mineDetails = await perfectApiService.getMineDetails(mineId);
      setSelectedMine(mineDetails);
      return mineDetails;
    } catch (err) {
      console.error(`❌ Error fetching mine ${mineId}:`, err);
      setError(`Failed to fetch mine details: ${err.message}`);
      return null;
    }
  }, []);
  
  // Fetch weather for a mine
  const fetchWeatherForMine = useCallback(async (mineId) => {
    try {
      console.log(`🌤️ Fetching weather for mine ${mineId}`);
      const weatherData = await perfectApiService.getWeatherForMine(mineId);
      return weatherData;
    } catch (err) {
      console.error(`❌ Error fetching weather for mine ${mineId}:`, err);
      return null;
    }
  }, []);
  
  // Fetch districts
  const fetchDistricts = useCallback(async () => {
    try {
      console.log('🏛️ Fetching districts data');
      const districtData = await perfectApiService.getDistricts();
      setDistricts(districtData);
      console.log(`✅ Loaded ${districtData.length} districts`);
    } catch (err) {
      console.error('❌ Error fetching districts:', err);
      setError(`Failed to fetch districts: ${err.message}`);
    }
  }, []);
  
  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      console.log('📊 Fetching system analytics');
      const analyticsData = await perfectApiService.getAnalytics();
      setAnalytics(analyticsData);
      console.log('✅ Analytics data loaded:', analyticsData);
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      setError(`Failed to fetch analytics: ${err.message}`);
    }
  }, []);
  
  // Fetch alerts
  const fetchAlerts = useCallback(async (alertFilters = {}) => {
    try {
      console.log('🚨 Fetching alerts');
      const alertData = await perfectApiService.getAlerts(alertFilters);
      setAlerts(alertData);
      console.log(`✅ Loaded ${alertData.length} alerts`);
    } catch (err) {
      console.error('❌ Error fetching alerts:', err);
      setError(`Failed to fetch alerts: ${err.message}`);
    }
  }, []);
  
  // Fetch mine colors
  const fetchMineColors = useCallback(async () => {
    try {
      console.log('🎨 Fetching mine colors');
      const colorData = await perfectApiService.getMineColors();
      setMineColors(colorData);
      console.log('✅ Mine colors loaded');
    } catch (err) {
      console.error('❌ Error fetching mine colors:', err);
    }
  }, []);
  
  // Search mines
  const searchMines = useCallback(async (query, limit = 20) => {
    try {
      console.log(`🔍 Searching mines for: "${query}"`);
      const searchResults = await perfectApiService.searchMines(query, limit);
      return searchResults;
    } catch (err) {
      console.error('❌ Error searching mines:', err);
      setError(`Search failed: ${err.message}`);
      return { query, results: [], count: 0 };
    }
  }, []);
  
  // Export mine data
  const exportMineData = useCallback(async (format = 'json', exportFilters = {}) => {
    try {
      console.log(`📤 Exporting mine data in ${format} format`);
      const exportData = await perfectApiService.exportMineData(format, exportFilters);
      
      // Create download link
      const dataStr = format === 'csv' 
        ? exportData.data.map(row => row.join(',')).join('\n')
        : JSON.stringify(exportData.data, null, 2);
      
      const dataBlob = new Blob([dataStr], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tamil_nadu_mines_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Export completed: ${exportData.count} mines`);
      return exportData;
      
    } catch (err) {
      console.error('❌ Error exporting data:', err);
      setError(`Export failed: ${err.message}`);
      throw err;
    }
  }, []);
  
  // Trigger manual monitoring
  const triggerManualMonitoring = useCallback(async () => {
    try {
      console.log('🔄 Triggering manual monitoring');
      const result = await perfectApiService.triggerManualMonitoring();
      console.log('✅ Manual monitoring completed:', result);
      
      // Refresh data after monitoring
      await fetchMines();
      await fetchAnalytics();
      await fetchAlerts();
      
      return result;
    } catch (err) {
      console.error('❌ Error triggering manual monitoring:', err);
      setError(`Manual monitoring failed: ${err.message}`);
      throw err;
    }
  }, [fetchMines, fetchAnalytics, fetchAlerts]);
  
  // Apply filters to mines
  const applyFilters = useCallback((newFilters) => {
    console.log('🔍 Applying filters:', newFilters);
    setFilters(newFilters);
    
    let filtered = [...mines];
    
    // Apply district filter
    if (newFilters.district) {
      filtered = filtered.filter(mine => 
        mine.district.toLowerCase().includes(newFilters.district.toLowerCase())
      );
    }
    
    // Apply risk level filter
    if (newFilters.risk_level) {
      filtered = filtered.filter(mine => mine.risk_level === newFilters.risk_level);
    }
    
    // Apply mine type filter
    if (newFilters.mine_type) {
      filtered = filtered.filter(mine => 
        mine.type.toLowerCase().includes(newFilters.mine_type.toLowerCase())
      );
    }
    
    // Apply status filter
    if (newFilters.status) {
      filtered = filtered.filter(mine => 
        mine.status.toLowerCase().includes(newFilters.status.toLowerCase())
      );
    }
    
    // Apply search filter
    if (newFilters.search) {
      const searchTerm = newFilters.search.toLowerCase();
      filtered = filtered.filter(mine => 
        mine.name.toLowerCase().includes(searchTerm) ||
        mine.district.toLowerCase().includes(searchTerm) ||
        mine.type.toLowerCase().includes(searchTerm) ||
        mine.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by risk score (highest first)
    filtered.sort((a, b) => b.risk_score - a.risk_score);
    
    setFilteredMines(filtered);
    console.log(`🎯 Filtered results: ${filtered.length} mines`);
  }, [mines]);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      district: '',
      risk_level: '',
      mine_type: '',
      status: '',
      search: ''
    };
    setFilters(clearedFilters);
    setFilteredMines(mines);
    console.log('🔄 Filters cleared, showing all mines');
  }, [mines]);
  
  // Get mine by ID
  const getMineById = useCallback((mineId) => {
    const mine = mines.find(m => m.id === parseInt(mineId));
    if (mine) {
      setSelectedMine(mine);
    }
    return mine;
  }, [mines]);
  
  // Get mines by district
  const getMinesByDistrict = useCallback((districtName) => {
    return mines.filter(mine => 
      mine.district.toLowerCase() === districtName.toLowerCase()
    );
  }, [mines]);
  
  // Get mines by risk level
  const getMinesByRiskLevel = useCallback((riskLevel) => {
    return mines.filter(mine => mine.risk_level === riskLevel);
  }, [mines]);
  
  // Get risk color for a mine
  const getRiskColor = useCallback((riskLevel) => {
    const colors = mineColors.risk_colors || {
      "High": "#FF0000",
      "Medium": "#FFA500", 
      "Low": "#00FF00"
    };
    return colors[riskLevel] || "#808080";
  }, [mineColors]);
  
  // Get type color for a mine
  const getTypeColor = useCallback((mineType) => {
    const colors = mineColors.type_colors || {};
    return colors[mineType]?.color || "#808080";
  }, [mineColors]);
  
  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing Perfect Data Context');
      
      // Fetch all initial data
      await Promise.all([
        fetchMines(),
        fetchDistricts(),
        fetchAnalytics(),
        fetchAlerts(),
        fetchMineColors()
      ]);
      
      console.log('✅ Perfect Data Context initialized successfully');
    };
    
    initializeData();
  }, [fetchMines, fetchDistricts, fetchAnalytics, fetchAlerts, fetchMineColors]);
  
  // Apply filters when filters change
  useEffect(() => {
    if (mines.length > 0) {
      applyFilters(filters);
    }
  }, [filters, mines, applyFilters]);
  
  // Context value
  const contextValue = {
    // Data
    mines,
    filteredMines,
    selectedMine,
    districts,
    analytics,
    alerts,
    mineColors,
    
    // State
    loading,
    error,
    filters,
    
    // Actions
    fetchMines,
    fetchMineDetails,
    fetchWeatherForMine,
    fetchDistricts,
    fetchAnalytics,
    fetchAlerts,
    searchMines,
    exportMineData,
    triggerManualMonitoring,
    
    // Filter actions
    applyFilters,
    clearFilters,
    
    // Utility functions
    getMineById,
    getMinesByDistrict,
    getMinesByRiskLevel,
    getRiskColor,
    getTypeColor,
    
    // Setters
    setSelectedMine,
    setError
  };
  
  return (
    <PerfectDataContext.Provider value={contextValue}>
      {children}
    </PerfectDataContext.Provider>
  );
};

export default PerfectDataContext;