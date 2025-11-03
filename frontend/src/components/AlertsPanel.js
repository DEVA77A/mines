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
      className={`fixed right-4 top-20 z-40 w-96 max-h-[70vh] overflow-hidden rounded-2xl shadow-2xl backdrop-blur-lg border transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🚨</span>
            </div>
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Active Alerts
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeAlerts.length} critical alerts
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg 
              className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mt-3">
          {['all', 'critical', 'high', 'medium', 'low'].map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                filterType === type
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
              {type !== 'all' && (
                <span className="ml-1">
                  ({mockAlerts.filter(alert => alert.level === type).length})
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
            className="overflow-y-auto"
          >
            <div className="p-2 space-y-2">
              {(isExpanded ? filteredAlerts : activeAlerts).map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-xl border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' 
                      : 'bg-gray-50 border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${getAlertColor(alert.level)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-sm">{getAlertIcon(alert.level)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {alert.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full uppercase font-semibold ${
                          alert.level === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.level === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.level}
                        </span>
                      </div>
                      
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {alert.message}
                      </p>
                      
                      <div className={`flex items-center justify-between mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        <span>{alert.location}</span>
                        <span>{formatTime(alert.timestamp)}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-2">
                        {alert.actions?.map((action) => (
                          <motion.button
                            key={action}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAlertAction?.(alert.id, action)}
                            className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                              action === 'evacuate' ? 'bg-red-500 text-white hover:bg-red-600' :
                              action === 'inspect' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                              action === 'monitor' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' :
                              'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </motion.button>
                        ))}
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onAlertDismiss?.(alert.id)}
                          className={`ml-auto p-1 rounded-md transition-colors ${
                            isDarkMode 
                              ? 'hover:bg-gray-700 text-gray-500' 
                              : 'hover:bg-gray-200 text-gray-400'
                          }`}
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
        >
          View All Alerts ({mockAlerts.length})
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AlertsPanel;