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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl transition-all duration-300 ${
            isDarkMode 
              ? 'bg-slate-900/90 border border-slate-700/50 backdrop-blur-xl' 
              : 'bg-white/90 border border-white/50 backdrop-blur-xl'
          }`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20 flex items-center justify-center">
                  <span className="text-white text-xl">📤</span>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    Export Data
                  </h2>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Generate comprehensive reports and export mining data
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-slate-800 text-slate-400' 
                    : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Export Format Selection */}
            <div>
              <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                <span>Export Format</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format) => (
                  <motion.div
                    key={format.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExportType(format.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group ${
                      exportType === format.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
                        : isDarkMode
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        : 'border-slate-100 hover:border-slate-200 bg-white/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-4 relative z-10">
                      <span className="text-3xl p-2 bg-white/50 dark:bg-slate-700/50 rounded-xl backdrop-blur-sm">{format.icon}</span>
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {format.name}
                        </h4>
                        <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {format.description}
                        </p>
                      </div>
                      {exportType === format.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30">
                          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
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
              <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                <span>Export Options</span>
              </h3>
              
              {/* Date Range */}
              <div className="mb-6">
                <label className={`block text-sm font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Date Range
                </label>
                <div className="relative">
                  <select
                    value={exportOptions.dateRange}
                    onChange={(e) => handleOptionChange('dateRange', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <option value="last_7_days">Last 7 days</option>
                    <option value="last_30_days">Last 30 days</option>
                    <option value="last_90_days">Last 90 days</option>
                    <option value="last_year">Last year</option>
                    <option value="all_time">All time</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Include Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'includeCharts', label: 'Charts & Visuals', description: 'Risk charts & trends' },
                  { key: 'includeMap', label: 'Map Data', description: 'Geo-coordinates & locations' },
                  { key: 'includeAlerts', label: 'Alert History', description: 'Past warnings & logs' },
                  { key: 'includeAnalytics', label: 'Analytics Data', description: 'Stats & predictions' }
                ].map((option) => (
                  <div
                    key={option.key}
                    onClick={() => handleOptionChange(option.key, !exportOptions[option.key])}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      exportOptions[option.key]
                        ? isDarkMode ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-200'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        exportOptions[option.key]
                          ? 'bg-blue-500 border-blue-500'
                          : isDarkMode
                          ? 'border-slate-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {exportOptions[option.key] && (
                        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <label className={`font-bold text-sm cursor-pointer ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                        {option.label}
                      </label>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Preview */}
            <div className={`p-5 rounded-xl border border-dashed ${isDarkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-50 border-slate-300'}`}>
              <h4 className={`font-bold text-sm uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Export Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Format</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{exportFormats.find(f => f.id === exportType)?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Time Period</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{exportOptions.dateRange.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Estimated Size</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>~{Math.floor(Math.random() * 5 + 1)}.{Math.floor(Math.random() * 9)}MB</p>
                </div>
                <div className="space-y-1">
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Data Points</p>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{mineData?.length || 127} sites</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'} bg-slate-50/50 dark:bg-slate-800/50`}>
            <div className="flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={isExporting}
                className={`px-8 py-3 text-sm font-bold text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all ${
                  isExporting 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/50 hover:-translate-y-0.5'
                }`}
              >
                {isExporting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
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