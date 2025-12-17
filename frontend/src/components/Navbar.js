import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Filter, Bell, Sun, Moon, X, ChevronDown } from 'lucide-react';

const Navbar = ({ onSearch, onFilterChange, filters }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-700/50 shadow-lg shadow-black/10' 
          : 'bg-white/80 border-white/50 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-xl">🏔️</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Rockfall AI
              </h1>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Tamil Nadu Mining Safety
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} group-focus-within:text-blue-500 transition-colors`} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search mines by name, district, or coordinates..."
                className={`block w-full pl-11 pr-4 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:bg-slate-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-200'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Filters Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition-all ${
                showFilters 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : isDarkMode 
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <Filter className="h-5 w-5" />
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2.5 rounded-xl transition-all ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode 
                  ? 'hover:bg-slate-800 text-yellow-400' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>

            {/* User Menu */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer ml-2"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-700">
                <span className="text-white text-xs font-bold">TN</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`overflow-hidden border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}`}
            >
              <div className="py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Risk Level Filter */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Risk Level
                    </label>
                    <div className="relative">
                      <select
                        value={filters.riskLevel || ''}
                        onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800/50 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="">All Levels</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                        <option value="critical">Critical Risk</option>
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                  </div>

                  {/* District Filter */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      District
                    </label>
                    <div className="relative">
                      <select
                        value={filters.district || ''}
                        onChange={(e) => handleFilterChange('district', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800/50 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="">All Districts</option>
                        <option value="Salem">Salem</option>
                        <option value="Dharmapuri">Dharmapuri</option>
                        <option value="Krishnagiri">Krishnagiri</option>
                        <option value="Tiruvannamalai">Tiruvannamalai</option>
                        <option value="Vellore">Vellore</option>
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                  </div>

                  {/* Mine Type Filter */}
                  <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Mine Type
                    </label>
                    <div className="relative">
                      <select
                        value={filters.mineType || ''}
                        onChange={(e) => handleFilterChange('mineType', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800/50 border-slate-600 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="">All Types</option>
                        <option value="granite">Granite</option>
                        <option value="limestone">Limestone</option>
                        <option value="sandstone">Sandstone</option>
                        <option value="iron_ore">Iron Ore</option>
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onFilterChange('clear', null)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span>Clear All Filters</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;