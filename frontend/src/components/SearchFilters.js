import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const SearchFilters = ({ 
  onSearch, 
  onFilterChange, 
  filters = {}, 
  mineData = [],
  isVisible = true 
}) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(filters);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate dynamic filter options from mine data
  const generateFilterOptions = () => {
    const defaultOptions = {
      riskLevel: [],
      district: [],
      mineType: [],
      operational: []
    };

    if (!mineData || mineData.length === 0) return defaultOptions;

    const districts = [...new Set(mineData.map(mine => mine.district))].sort();
    const mineTypes = [...new Set(mineData.map(mine => mine.mine_type))].sort();
    const statuses = [...new Set(mineData.map(mine => mine.status))].sort();
    const riskLevels = [...new Set(mineData.map(mine => mine.risk_assessment?.risk_level).filter(Boolean))].sort();

    return {
      riskLevel: riskLevels.map(level => ({
        value: level.toLowerCase(),
        label: level,
        color: level === 'High' ? 'red' : level === 'Medium' ? 'yellow' : 'green',
        count: mineData.filter(mine => mine.risk_assessment?.risk_level === level).length
      })),
      district: districts.map(district => ({
        value: district,
        label: district,
        count: mineData.filter(mine => mine.district === district).length
      })),
      mineType: mineTypes.map(type => ({
        value: type.toLowerCase().replace(' ', '_'),
        label: type,
        count: mineData.filter(mine => mine.mine_type === type).length
      })),
      operational: statuses.map(status => ({
        value: status.toLowerCase(),
        label: status,
        count: mineData.filter(mine => mine.status === status).length
      }))
    };
  };

  const dynamicFilterOptions = generateFilterOptions();

  // Generate search suggestions
  const generateSuggestions = (term) => {
    if (!term || term.length < 2 || !mineData) return [];
    
    const suggestions = [];
    
    // Add mine names
    const mineNames = [...new Set(mineData.map(mine => mine.mine_name))];
    mineNames.forEach(name => {
      if (name.toLowerCase().includes(term.toLowerCase())) {
        suggestions.push({ type: 'mine', value: name, icon: '🏔️' });
      }
    });
    
    // Add districts
    const districts = [...new Set(mineData.map(mine => mine.district))];
    districts.forEach(district => {
      if (district.toLowerCase().includes(term.toLowerCase())) {
        suggestions.push({ type: 'district', value: district, icon: '📍' });
      }
    });
    
    // Add mine types
    const mineTypes = [...new Set(mineData.map(mine => mine.mine_type))];
    mineTypes.forEach(type => {
      if (type.toLowerCase().includes(term.toLowerCase())) {
        suggestions.push({ type: 'type', value: type, icon: '⛏️' });
      }
    });
    
    return suggestions.slice(0, 6);
  };

  useEffect(() => {
    const newSuggestions = generateSuggestions(searchTerm);
    setSuggestions(newSuggestions);
  }, [searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleFilterChange = (category, value) => {
    const newFilters = {
      ...activeFilters,
      [category]: activeFilters[category] === value ? null : value
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    onFilterChange({});
    onSearch('');
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(Boolean).length;
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.value);
    onSearch(suggestion.value);
    setShowSuggestions(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`sticky top-16 z-30 backdrop-blur-md border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Section */}
        <div className="relative mb-4">
          <div className={`flex items-center space-x-4 p-4 rounded-xl transition-colors ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(searchTerm.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search mines, districts, coordinates..."
                className={`block w-full pl-10 pr-4 py-3 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white text-gray-900 placeholder-gray-500'
                }`}
              />
              
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute top-full left-0 right-0 mt-2 py-2 rounded-lg shadow-lg border z-50 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={`${suggestion.type}-${suggestion.value}`}
                      whileHover={{ backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full px-4 py-2 text-left flex items-center space-x-3 transition-colors ${
                        isDarkMode 
                          ? 'text-white hover:bg-gray-700' 
                          : 'text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{suggestion.icon}</span>
                      <span className="font-medium">{suggestion.value}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {suggestion.type}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
            
            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-4 py-3 rounded-lg transition-colors ${
                getActiveFilterCount() > 0 
                  ? 'bg-blue-500 text-white' 
                  : isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(dynamicFilterOptions).map(([category, options]) => (
            <div key={category} className="space-y-2">
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
              </h4>
              <div className="space-y-1">
                {options.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterChange(category, option.value)}
                    className={`w-full px-3 py-2 text-sm rounded-lg transition-all flex items-center justify-between ${
                      activeFilters[category] === option.value
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{option.label}</span>
                      {option.color && (
                        <div className={`w-2 h-2 rounded-full bg-${option.color}-500`} />
                      )}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeFilters[category] === option.value
                        ? 'bg-blue-600'
                        : isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}>
                      {option.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Active Filters & Clear */}
        {getActiveFilterCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Active Filters:
                </span>
                <div className="flex space-x-2">
                  {Object.entries(activeFilters).map(([category, value]) => 
                    value && (
                      <span
                        key={`${category}-${value}`}
                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200"
                      >
                        {category}: {value}
                        <button
                          onClick={() => handleFilterChange(category, null)}
                          className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Clear All
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchFilters;