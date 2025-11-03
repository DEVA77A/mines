import React, { useState } from 'react';
import { usePerfectData } from '../contexts/PerfectDataContext';
import { Search, Filter, Download, MapPin, Grid, Map as MapIcon } from 'lucide-react';

const SimpleDashboard = () => {
  const { mines, loading, error, filteredMines } = usePerfectData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Tamil Nadu Mines...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching 423 mines across 12 districts</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-red-600 mb-2">System Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter mines based on search and risk level
  const displayMines = mines.filter(mine => {
    const matchesSearch = mine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mine.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = !selectedRisk || mine.risk_level === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const riskStats = mines.reduce((acc, mine) => {
    acc[mine.risk_level] = (acc[mine.risk_level] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🏔️ Perfect AI-Powered Rockfall System
              </h1>
              <p className="text-lg text-gray-600">
                Tamil Nadu Mining Risk Assessment Dashboard
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last Updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600">{mines.length}</div>
            <div className="text-gray-600">Total Mines</div>
          </div>
          {Object.entries(riskStats).map(([risk, count]) => (
            <div key={risk} className="bg-white p-6 rounded-xl shadow-lg">
              <div className={`text-3xl font-bold ${risk === 'Critical' ? 'text-red-600' : 
                                                    risk === 'High' ? 'text-red-500' : 
                                                    risk === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>
                {count}
              </div>
              <div className="text-gray-600">{risk} Risk</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mines by name, location, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Risk Levels</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                {viewMode === 'grid' ? <Grid className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
                {viewMode === 'grid' ? 'Grid' : 'List'}
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {displayMines.length} of {mines.length} mines
          </div>
        </div>

        {/* Mines Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {displayMines.map((mine) => (
            <div key={mine.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{mine.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(mine.risk_level)}`}>
                    {mine.risk_level}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{mine.location}</span>
                  </div>
                  <div>
                    <span className="font-medium">District:</span> {mine.district}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {mine.mine_type}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                      mine.operational_status === 'Active' ? 'bg-green-100 text-green-700' :
                      mine.operational_status === 'Under Development' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {mine.operational_status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Coordinates: {mine.latitude.toFixed(4)}, {mine.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayMines.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl font-semibold text-gray-700 mb-2">No mines found</div>
            <div className="text-gray-500">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleDashboard;