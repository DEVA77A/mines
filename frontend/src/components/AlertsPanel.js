import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const AlertsPanel = ({ alerts = [], onAlertDismiss, onAlertAction }) => {
  const { isDarkMode } = useTheme();
  const [filteredAlerts, setFilteredAlerts] = useState(alerts);
  const [filterType, setFilterType] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.level === filterType));
    }
  }, [alerts, filterType]);

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const mockAlerts = alerts.length === 0 ? [
    {
      id: 1,
      level: 'critical',
      title: 'High Rockfall Risk Detected',
      message: 'Mine site MN-001 in Salem district shows critical risk indicators due to recent rainfall and unstable geological conditions.',
      timestamp: Date.now() - 1000 * 60 * 5,
      mineId: 'MN-001',
      location: 'Salem District',
      actions: ['evacuate', 'inspect', 'monitor']
    },
    {
      id: 2,
      level: 'high',
      title: 'Weather Alert',
      message: 'Heavy rainfall expected in Dharmapuri region. Increased monitoring recommended for 3 active mine sites.',
      timestamp: Date.now() - 1000 * 60 * 15,
      mineId: 'Multiple',
      location: 'Dharmapuri District',
      actions: ['monitor', 'prepare']
    },
    {
      id: 3,
      level: 'medium',
      title: 'Equipment Maintenance',
      message: 'Monitoring sensors at MN-007 require calibration. Last maintenance was 30 days ago.',
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      mineId: 'MN-007',
      location: 'Krishnagiri District',
      actions: ['maintain', 'calibrate']
    },
    {
      id: 4,
      level: 'low',
      title: 'Data Update',
      message: 'Satellite imagery updated for 15 mine locations. New risk assessments available.',
      timestamp: Date.now() - 1000 * 60 * 60 * 6,
      mineId: 'Multiple',
      location: 'Tamil Nadu',
      actions: ['review', 'update']
    }
  ] : alerts;

  const activeAlerts = mockAlerts.filter(alert => alert.level === 'critical' || alert.level === 'high');

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed right-4 top-20 z-40 w-96 max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-slate-700/50' 
          : 'bg-white/80 border-white/50'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center">
              <span className="text-white text-lg">🚨</span>
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Active Alerts
              </h3>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeAlerts.length} critical alerts requiring attention
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-400' 
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <svg 
              className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'critical', 'high', 'medium', 'low'].map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                  : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {type}
              {type !== 'all' && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                  filterType === type ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {mockAlerts.filter(alert => alert.level === type).length}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <AnimatePresence>
        {(isExpanded || activeAlerts.length > 0) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: isExpanded ? 'auto' : Math.min(200, activeAlerts.length * 100) }}
            exit={{ height: 0 }}
            className="overflow-y-auto custom-scrollbar"
          >
            <div className="p-3 space-y-3">
              {(isExpanded ? filteredAlerts : activeAlerts).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' 
                      : 'bg-white/60 border-white/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${getAlertColor(alert.level)} rounded-xl shadow-lg flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-lg">{getAlertIcon(alert.level)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {alert.title}
                        </h4>
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                          alert.level === 'critical' ? 'bg-red-100 text-red-700' :
                          alert.level === 'high' ? 'bg-orange-100 text-orange-700' :
                          alert.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.level}
                        </span>
                      </div>
                      
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {alert.message}
                      </p>
                      
                      <div className={`flex items-center justify-between mt-3 text-[10px] font-medium uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <div className="flex items-center space-x-1">
                          <span>📍</span>
                          <span>{alert.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🕒</span>
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                        {alert.actions?.map((action) => (
                          <motion.button
                            key={action}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAlertAction?.(alert.id, action)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all shadow-sm ${
                              action === 'evacuate' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30' :
                              action === 'inspect' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-orange-500/30' :
                              action === 'monitor' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30' :
                              isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' :
                              'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </motion.button>
                        ))}
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onAlertDismiss?.(alert.id)}
                          className={`ml-auto p-1.5 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'hover:bg-slate-700 text-slate-500' 
                              : 'hover:bg-slate-100 text-slate-400'
                          }`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className={`p-3 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
        >
          <span>View All Alerts</span>
          <span className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
            {mockAlerts.length}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AlertsPanel;