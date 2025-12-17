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
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-8 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Search & Filter Mines
            </h3>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Filters:</span>
              <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {filteredMines.length} / {mines.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Manual Monitoring Button */}
          <button
            onClick={handleManualMonitoring}
            disabled={isMonitoring}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isMonitoring ? 'animate-spin' : ''}`} />
            <span>{isMonitoring ? 'Updating...' : 'Update Monitoring'}</span>
          </button>
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={isExporting || filteredMines.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            
            {/* Export Options */}
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 overflow-hidden">
              <button
                onClick={() => handleExport('json')}
                className="block w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors border-b border-slate-50"
              >
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all shadow-sm ${
              showAdvancedFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-inner' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            Advanced Filters
          </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-6 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search mines by name, district, type, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="block w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange({ target: { value: '' } })}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <div className="bg-slate-200 rounded-full p-1 hover:bg-slate-300 transition-colors">
              <X className="w-3 h-3" />
            </div>
          </button>
        )}
      </div>
      
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => handleFilterChange('risk_level', localFilters.risk_level === 'High' ? '' : 'High')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
            localFilters.risk_level === 'High'
              ? 'bg-red-100 text-red-700 border border-red-200 shadow-red-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${localFilters.risk_level === 'High' ? 'fill-current' : ''}`} />
          <span>High Risk</span>
          {localFilters.risk_level === 'High' && <X className="w-3 h-3 ml-1" />}
        </button>
        
        <button
          onClick={() => handleFilterChange('risk_level', localFilters.risk_level === 'Medium' ? '' : 'Medium')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
            localFilters.risk_level === 'Medium'
              ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-orange-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <div className={`w-2 h-2 rounded-full bg-orange-500 ${localFilters.risk_level === 'Medium' ? 'ring-2 ring-orange-300' : ''}`} />
          <span>Medium Risk</span>
          {localFilters.risk_level === 'Medium' && <X className="w-3 h-3 ml-1" />}
        </button>
        
        <button
          onClick={() => handleFilterChange('risk_level', localFilters.risk_level === 'Low' ? '' : 'Low')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
            localFilters.risk_level === 'Low'
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-emerald-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <div className={`w-2 h-2 rounded-full bg-emerald-500 ${localFilters.risk_level === 'Low' ? 'ring-2 ring-emerald-300' : ''}`} />
          <span>Low Risk</span>
          {localFilters.risk_level === 'Low' && <X className="w-3 h-3 ml-1" />}
        </button>
        
        <button
          onClick={() => handleFilterChange('status', localFilters.status === 'Active' ? '' : 'Active')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
            localFilters.status === 'Active'
              ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-blue-100'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <div className={`w-2 h-2 rounded-full bg-blue-500 ${localFilters.status === 'Active' ? 'ring-2 ring-blue-300' : ''}`} />
          <span>Active Only</span>
          {localFilters.status === 'Active' && <X className="w-3 h-3 ml-1" />}
        </button>
      </div>
      
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-slate-200 pt-6 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* District Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                District
              </label>
              <select
                value={localFilters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mine Type
              </label>
              <select
                value={localFilters.mine_type}
                onChange={(e) => handleFilterChange('mine_type', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Risk Level
              </label>
              <select
                value={localFilters.risk_level}
                onChange={(e) => handleFilterChange('risk_level', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
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
        <div className="flex justify-center mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={handleClearFilters}
            className="group flex items-center space-x-2 px-5 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 font-medium text-sm"
          >
            <div className="bg-slate-200 group-hover:bg-red-200 rounded-full p-1 transition-colors">
              <X className="w-3 h-3" />
            </div>
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
      
      {/* Results Summary */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
        <div className="text-sm font-medium text-slate-500">
          {loading ? (
            <span className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>Updating results...</span>
            </span>
          ) : (
            <span>
              Found <strong className="text-slate-900">{filteredMines.length}</strong> mines matching criteria
            </span>
          )}
        </div>
        
        {/* Risk Distribution Summary */}
        <div className="flex items-center space-x-6 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></div>
            <span className="text-slate-600">High: <span className="text-slate-900">{filteredMines.filter(m => m.risk_level === 'High').length}</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50"></div>
            <span className="text-slate-600">Medium: <span className="text-slate-900">{filteredMines.filter(m => m.risk_level === 'Medium').length}</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50"></div>
            <span className="text-slate-600">Low: <span className="text-slate-900">{filteredMines.filter(m => m.risk_level === 'Low').length}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfectSearchFilters;