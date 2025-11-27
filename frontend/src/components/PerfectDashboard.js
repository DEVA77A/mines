import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  MapPin,
  Grid,
  Map as MapIcon,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import MineMap from './MineMapClean';
import StatsCards from './StatsCards';
import PerfectSearchFilters from './PerfectSearchFilters';
import PerfectMineCard from './PerfectMineCard';
import AlertsPanel from './AlertsPanel';
import ExportModal from './ExportModal';
import { usePerfectData } from '../contexts/PerfectDataContext';
import toast from 'react-hot-toast';

const PerfectDashboard = () => {
  const { 
    mines, 
    filteredMines, 
    selectedMine, 
    analytics, 
    loading, 
    error, 
    filters,
    setSelectedMine,
    triggerManualMonitoring,
    exportMineData
  } = usePerfectData();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [showAlerts, setShowAlerts] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [sortBy, setSortBy] = useState('risk_score'); // 'risk_score', 'name', 'district', 'last_updated'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Handle mine selection
  const handleMineSelect = (mine) => {
    setSelectedMine(mine);
    toast.success(`Selected ${mine.name}`, {
      duration: 2000,
      icon: '📍'
    });
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    toast.success(`Switched to ${mode} view`, {
      duration: 1500,
      icon: mode === 'grid' ? '🗂️' : '🗺️'
    });
  };
  
  // Handle export
  const handleExport = async (format, exportFilters) => {
    setShowExport(false);
    try {
      await exportMineData(format, exportFilters);
      toast.success(`${format.toUpperCase()} export completed!`);
    } catch (error) {
      toast.error('Export failed');
    }
  };
  
  // Handle manual monitoring
  const handleManualMonitoring = async () => {
    try {
      await toast.promise(
        triggerManualMonitoring(),
        {
          loading: 'Updating monitoring data...',
          success: 'Monitoring data updated successfully!',
          error: 'Failed to update monitoring data'
        }
      );
    } catch (error) {
      console.error('Manual monitoring failed:', error);
    }
  };
  
  // Sort mines
  const sortedMines = React.useMemo(() => {
    if (!filteredMines) return [];
    
    const sorted = [...filteredMines].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'risk_score':
          valueA = a.risk_score || 0;
          valueB = b.risk_score || 0;
          break;
        case 'name':
          valueA = a.name || '';
          valueB = b.name || '';
          break;
        case 'district':
          valueA = a.district || '';
          valueB = b.district || '';
          break;
        case 'last_updated':
          valueA = new Date(a.last_updated || 0);
          valueB = new Date(b.last_updated || 0);
          break;
        default:
          valueA = a.risk_score || 0;
          valueB = b.risk_score || 0;
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
    
    return sorted;
  }, [filteredMines, sortBy, sortOrder]);
  
  // Paginate mines
  const paginatedMines = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedMines.slice(startIndex, endIndex);
  }, [sortedMines, currentPage, pageSize]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(sortedMines.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, sortedMines.length);
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Show error if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 5000 });
    }
  }, [error]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tamil Nadu Mine Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of {mines.length} mines across Tamil Nadu with perfect land placement
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Manual Monitoring Button */}
          <button
            onClick={handleManualMonitoring}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Data</span>
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => handleViewModeChange('map')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      {analytics && (
        <StatsCards 
          totalMines={analytics.total_mines}
          highRiskMines={analytics.risk_distribution?.high || 0}
          mediumRiskMines={analytics.risk_distribution?.medium || 0}
          lowRiskMines={analytics.risk_distribution?.low || 0}
          activeMines={analytics.status_distribution?.active || 0}
          districtsCount={analytics.districts_covered || 0}
          lastUpdated={analytics.last_updated}
        />
      )}
      
      {/* Search and Filters */}
      <PerfectSearchFilters />
      
      {/* Content Area */}
      <div className="space-y-4">
        {/* Sort and View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="risk_score">Risk Score</option>
                <option value="name">Name</option>
                <option value="district">District</option>
                <option value="last_updated">Last Updated</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-600 hover:text-gray-900"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  sortOrder === 'asc' ? 'rotate-180' : ''
                }`} />
              </button>
            </div>
            
            {/* Page Size */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
          
          {/* Results Info */}
          <div className="text-sm text-gray-600">
            Showing {startIndex}-{endIndex} of {sortedMines.length} mines
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading mines...</span>
            </div>
          </div>
        )}
        
        {/* Content Based on View Mode */}
        {!loading && (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Mine Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedMines.map((mine) => (
                    <PerfectMineCard
                      key={mine.id}
                      mine={mine}
                      onClick={handleMineSelect}
                      showDetails={true}
                    />
                  ))}
                </div>
                
                {/* No Results */}
                {paginatedMines.length === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No mines found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <MineMap
                  mines={sortedMines}
                  selectedMine={selectedMine}
                  onMineSelect={handleMineSelect}
                  showAllMines={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && viewMode === 'grid' && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
              if (pageNumber > totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 border rounded-lg ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showExport && (
          <ExportModal
            isOpen={showExport}
            onClose={() => setShowExport(false)}
            onExport={handleExport}
            totalMines={sortedMines.length}
            filters={filters}
          />
        )}
        
        {showAlerts && (
          <AlertsPanel
            isOpen={showAlerts}
            onClose={() => setShowAlerts(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerfectDashboard;