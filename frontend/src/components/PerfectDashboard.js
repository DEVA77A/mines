import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  MapPin,
  Grid,
  Map as MapIcon,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import PredictTab from './PredictTab';
import MineMap from './MineMapClean';
import StatsCards from './StatsCards';
import PerfectSearchFilters from './PerfectSearchFilters';
import PerfectMineCard from './PerfectMineCard';
import AlertsPanel from './AlertsPanel';
import ExportModal from './ExportModal';
import { usePerfectData } from '../contexts/PerfectDataContext';
import toast from 'react-hot-toast';
import { ViewModeContext } from '../contexts/ViewModeContext';

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
  
  const { viewMode, setViewMode } = useContext(ViewModeContext);
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
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 -m-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 tracking-tight">
            Tamil Nadu Mine Monitoring
          </h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">
            Real-time AI surveillance of <span className="font-bold text-blue-700">{mines.length}</span> mines with precision land mapping
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Manual Monitoring Button */}
          <button
            onClick={handleManualMonitoring}
            className="group flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300 font-medium"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>Update Data</span>
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-xl border border-white/60 shadow-inner">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => handleViewModeChange('map')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                viewMode === 'map'
                  ? 'bg-white text-blue-700 shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map</span>
            </button>
            <button
              onClick={() => handleViewModeChange('predict')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                viewMode === 'predict'
                  ? 'bg-white text-blue-700 shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Predict</span>
            </button>
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      {analytics && (
        <div className="transform hover:scale-[1.01] transition-transform duration-500">
          <StatsCards 
            totalMines={analytics.total_mines}
            highRiskMines={analytics.risk_distribution?.high || 0}
            mediumRiskMines={analytics.risk_distribution?.medium || 0}
            lowRiskMines={analytics.risk_distribution?.low || 0}
            activeMines={analytics.status_distribution?.active || 0}
            districtsCount={analytics.districts_covered || 0}
            lastUpdated={analytics.last_updated}
          />
        </div>
      )}
      
      {/* Search and Filters */}
      <PerfectSearchFilters />
      
      {/* Content Area */}
      <div className="space-y-6">
        {/* Sort and View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
          <div className="flex items-center space-x-6">
            {/* Sort Controls */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-slate-600">Sort by:</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <option value="risk_score">Risk Score</option>
                  <option value="name">Name</option>
                  <option value="district">District</option>
                  <option value="last_updated">Last Updated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  sortOrder === 'asc' ? 'rotate-180' : ''
                }`} />
              </button>
            </div>
            
            {/* Page Size */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-slate-600">Show:</label>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-4 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              <span className="text-sm text-slate-500 font-medium">per page</span>
            </div>
          </div>
          
          {/* Results Info */}
          <div className="text-sm font-medium text-slate-500 bg-slate-100/50 px-4 py-2 rounded-lg">
            Showing <span className="text-slate-900">{startIndex}-{endIndex}</span> of <span className="text-slate-900">{sortedMines.length}</span> mines
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <span className="text-lg font-medium text-slate-600">Loading mine data...</span>
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
                transition={{ duration: 0.4, ease: "easeOut" }}
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
                  <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300">
                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      No mines found
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      We couldn't find any mines matching your current filters. Try adjusting your search criteria or clearing filters.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : viewMode === 'map' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="h-[700px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200"
              >
                <MineMap
                  mines={sortedMines}
                  selectedMine={selectedMine}
                  onMineSelect={handleMineSelect}
                  showAllMines={true}
                />
              </motion.div>
            ) : (
              <motion.div
                key="predict"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <PredictTab />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && viewMode === 'grid' && (
          <div className="flex items-center justify-center space-x-2 mt-10 pb-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
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
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
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