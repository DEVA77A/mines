import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { usePerfectData } from '../contexts/PerfectDataContext';

const PerfectSearchFilters = () => {
  const {
    mines,
    filteredMines,
    districts,
    filters,
    loading,
    applyFilters,
    clearFilters,
    exportMineData,
    triggerManualMonitoring
  } = usePerfectData();
  
  // Local state for form inputs
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const mineTypes = [...new Set(mines.map(mine => mine.type))].sort();
    const statuses = [...new Set(mines.map(mine => mine.status))].sort();
    const riskLevels = ['Low', 'Medium', 'High'];
    
    return {
      mineTypes,
      statuses,
      riskLevels,
      districts: districts.map(d => d.name).sort()
    };
  }, [mines, districts]);
  
  // Update local filters when context filters change
  useEffect(() => {
    setLocalFilters(filters);
    setSearchTerm(filters.search || '');
  }, [filters]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Apply search immediately
    const newFilters = { ...localFilters, search: value };
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };
  
  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };
  
  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setLocalFilters({
      district: '',
      risk_level: '',
      mine_type: '',
      status: '',
      search: ''
    });
    clearFilters();
  };
  
  // Handle export
  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await exportMineData(format, localFilters);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle manual monitoring
  const handleManualMonitoring = async () => {
    setIsMonitoring(true);
    try {
      await triggerManualMonitoring();
    } catch (error) {
      console.error('Manual monitoring failed:', error);
    } finally {
      setIsMonitoring(false);
    }
  };
  
  // Check if any filters are active
  const hasActiveFilters = Object.values(localFilters).some(value => value !== '');
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Search & Filter Mines
          </h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {filteredMines.length} of {mines.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Manual Monitoring Button */}
          <button
            onClick={handleManualMonitoring}
            disabled={isMonitoring}
            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isMonitoring ? 'animate-spin' : ''}`} />
            <span>{isMonitoring ? 'Updating...' : 'Update Monitoring'}</span>
          </button>
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={isExporting || filteredMines.length === 0}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            
            {/* Export Options */}
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleExport('json')}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                Export CSV
              </button>
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-lg border ${
              showAdvancedFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700'
            } hover:bg-blue-50 hover:border-blue-200`}
          >
            Advanced
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search mines by name, district, type, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange({ target: { value: '' } })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange('risk_level', localFilters.risk_level === 'High' ? '' : 'High')}
          className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm ${
            localFilters.risk_level === 'High'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>High Risk</span>
          {localFilters.risk_level === 'High' && <X className="w-3 h-3" />}
        </button>
        
        <button
          onClick={() => handleFilterChange('risk_level', localFilters.risk_level === 'Medium' ? '' : 'Medium')}
          className={`px-3 py-2 rounded-full text-sm ${
            localFilters.risk_level === 'Medium'
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
          }`}
        >
          Medium Risk
          {localFilters.risk_level === 'Medium' && <X className="w-3 h-3 ml-1" />}
        </button>
        
        <button
          onClick={() => handleFilterChange('risk_level', localFilters.risk_level === 'Low' ? '' : 'Low')}
          className={`px-3 py-2 rounded-full text-sm ${
            localFilters.risk_level === 'Low'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-green-50'
          }`}
        >
          Low Risk
          {localFilters.risk_level === 'Low' && <X className="w-3 h-3 ml-1" />}
        </button>
        
        <button
          onClick={() => handleFilterChange('status', localFilters.status === 'Active' ? '' : 'Active')}
          className={`px-3 py-2 rounded-full text-sm ${
            localFilters.status === 'Active'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
          }`}
        >
          Active Only
          {localFilters.status === 'Active' && <X className="w-3 h-3 ml-1" />}
        </button>
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                value={localFilters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Districts</option>
                {filterOptions.districts.map(district => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Mine Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mine Type
              </label>
              <select
                value={localFilters.mine_type}
                onChange={(e) => handleFilterChange('mine_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {filterOptions.mineTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Risk Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                value={localFilters.risk_level}
                onChange={(e) => handleFilterChange('risk_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Risk Levels</option>
                {filterOptions.riskLevels.map(level => (
                  <option key={level} value={level}>
                    {level} Risk
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
      
      {/* Results Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {loading ? (
            <span className="flex items-center space-x-1">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading mines...</span>
            </span>
          ) : (
            <span>
              Showing <strong>{filteredMines.length}</strong> of <strong>{mines.length}</strong> mines
              {hasActiveFilters && (
                <span className="text-blue-600 ml-1">(filtered)</span>
              )}
            </span>
          )}
        </div>
        
        {/* Risk Distribution Summary */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High: {filteredMines.filter(m => m.risk_level === 'High').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Medium: {filteredMines.filter(m => m.risk_level === 'Medium').length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low: {filteredMines.filter(m => m.risk_level === 'Low').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfectSearchFilters;