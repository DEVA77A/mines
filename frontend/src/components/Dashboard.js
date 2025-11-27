import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Calendar,
  Eye,
  Grid,
  Map as MapIcon
} from 'lucide-react';
import MineMap from './MineMapClean';
import { MineCardGrid } from './MineCard';
import StatsCards from './StatsCards';
import SearchFilters from './SearchFilters';
import AlertsPanel from './AlertsPanel';
import ExportModal from './ExportModal';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { mines, loading, error, fetchMines, statistics } = useData();
  const [filteredMines, setFilteredMines] = useState([]);
  const [selectedMine, setSelectedMine] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    district: '',
    mineralType: '',
    status: '',
    riskCategory: ''
  });

  // Initialize data on component mount
  useEffect(() => {
    fetchMines();
  }, [fetchMines]);

  // Apply filters and search
  useEffect(() => {
    if (!mines) return;

    let filtered = [...mines];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mine => 
        mine.mine_name.toLowerCase().includes(query) ||
        mine.district.toLowerCase().includes(query) ||
        mine.mine_type.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.district) {
      filtered = filtered.filter(mine => mine.district === filters.district);
    }
    if (filters.mineralType) {
      filtered = filtered.filter(mine => mine.mine_type === filters.mineralType);
    }
    if (filters.status) {
      filtered = filtered.filter(mine => mine.status === filters.status);
    }
    if (filters.riskCategory) {
      filtered = filtered.filter(mine => mine.risk_assessment?.risk_level === filters.riskCategory);
    }

    setFilteredMines(filtered);
  }, [mines, searchQuery, filters]);

  const handleMineSelect = (mine) => {
    setSelectedMine(mine);
    toast.success(`Selected ${mine.mine_name}`);
  };

  const handleExport = (format, exportOptions) => {
    toast.success(`Exporting ${filteredMines.length} mines as ${format?.toUpperCase()}`);
    // If a backend export API is added, call it here. For now we just close the modal.
    console.log('Export requested:', { format, exportOptions, count: filteredMines.length });
    setShowExport(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      district: '',
      mineralType: '',
      status: '',
      riskCategory: ''
    });
    toast.success('Filters cleared');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchMines()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            Tamil Nadu Mine Risk Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered rockfall risk assessment for open-pit mines
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAlerts(true)}
            className="relative btn-secondary"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts
            {statistics?.high_risk_mines > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {statistics.high_risk_mines}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards statistics={statistics} loading={loading} />

      {/* Search and Filters */}
      <div className="card-instagram p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-instagram pl-10"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-purple-50 text-purple-700 border-purple-300' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-purple-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'map' 
                    ? 'bg-white shadow-sm text-purple-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-6 border-t border-gray-200 mt-6">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClear={clearFilters}
                  mines={mines}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {loading ? 'Loading...' : `${filteredMines.length} of ${mines?.length || 0} mines`}
        </span>
        {selectedMine && (
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Selected: {selectedMine.mine_name}</span>
            <button
              onClick={() => setSelectedMine(null)}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="min-h-[500px]">
        {viewMode === 'grid' ? (
          <MineCardGrid 
            mines={filteredMines}
            onMineClick={handleMineSelect}
            loading={loading}
          />
        ) : (
          <div className="h-[600px]">
            <MineMap 
              mines={filteredMines}
              selectedMine={selectedMine}
              onMineSelect={handleMineSelect}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAlerts && (
          <AlertsPanel
            mines={filteredMines}
            onClose={() => setShowAlerts(false)}
            onMineSelect={handleMineSelect}
          />
        )}
        {showExport && (
          <ExportModal
            isOpen={showExport}
            mineData={filteredMines}
            onExport={handleExport}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;