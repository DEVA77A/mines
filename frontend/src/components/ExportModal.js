import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ExportModal = ({ isOpen, onClose, data, mineData, onExport }) => {
  const { isDarkMode } = useTheme();
  const [exportType, setExportType] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeMap: true,
    includeAlerts: true,
    includeAnalytics: true,
    dateRange: 'last_30_days'
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { id: 'pdf', name: 'PDF Report', icon: '📄', description: 'Comprehensive report with charts and analysis' },
    { id: 'excel', name: 'Excel Spreadsheet', icon: '📊', description: 'Raw data for further analysis' },
    { id: 'csv', name: 'CSV Data', icon: '📋', description: 'Comma-separated values for data processing' },
    { id: 'json', name: 'JSON Export', icon: '🔧', description: 'Structured data for developers and APIs' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // If parent provided an onExport handler, call it (this will use the real API export)
      if (typeof onExport === 'function') {
        await onExport(exportType, exportOptions);
        setIsExporting(false);
        onClose();
        return;
      }

      // Fallback: simulate export (keeps existing behavior for contexts that don't pass onExport)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const exportData = {
        timestamp: new Date().toISOString(),
        type: exportType,
        options: exportOptions,
        mineCount: mineData?.length || 0,
        data: exportType === 'json' ? data : 'Binary data...'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: exportType === 'json' ? 'application/json' : 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rockfall_report_${Date.now()}.${exportType === 'excel' ? 'xlsx' : exportType}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📤</span>
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Export Data
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Generate reports and export mining data
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Export Format Selection */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Export Format
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportFormats.map((format) => (
                  <motion.div
                    key={format.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportType(format.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      exportType === format.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isDarkMode
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{format.icon}</span>
                      <div className="flex-1">
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {format.name}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {format.description}
                        </p>
                      </div>
                      {exportType === format.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Export Options
              </h3>
              
              {/* Date Range */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Range
                </label>
                <select
                  value={exportOptions.dateRange}
                  onChange={(e) => handleOptionChange('dateRange', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="last_7_days">Last 7 days</option>
                  <option value="last_30_days">Last 30 days</option>
                  <option value="last_90_days">Last 90 days</option>
                  <option value="last_year">Last year</option>
                  <option value="all_time">All time</option>
                </select>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                {[
                  { key: 'includeCharts', label: 'Include Charts & Visualizations', description: 'Risk charts, trend graphs, and visual analytics' },
                  { key: 'includeMap', label: 'Include Map Data', description: 'Geographic coordinates and location information' },
                  { key: 'includeAlerts', label: 'Include Alert History', description: 'Past alerts and warning notifications' },
                  { key: 'includeAnalytics', label: 'Include Analytics Data', description: 'Statistical analysis and predictions' }
                ].map((option) => (
                  <div
                    key={option.key}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOptionChange(option.key, !exportOptions[option.key])}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        exportOptions[option.key]
                          ? 'bg-blue-500 border-blue-500'
                          : isDarkMode
                          ? 'border-gray-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {exportOptions[option.key] && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </motion.button>
                    <div className="flex-1">
                      <label className={`font-medium cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {option.label}
                      </label>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Preview */}
            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Export Preview
              </h4>
              <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Format: {exportFormats.find(f => f.id === exportType)?.name}</p>
                <p>Date Range: {exportOptions.dateRange.replace(/_/g, ' ')}</p>
                <p>Estimated Size: ~{Math.floor(Math.random() * 5 + 1)}.{Math.floor(Math.random() * 9)}MB</p>
                <p>Mine Locations: {mineData?.length || 127} sites</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={isExporting}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  isExporting 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {isExporting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </div>
                ) : (
                  'Export Data'
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;