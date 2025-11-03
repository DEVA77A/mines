import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InstagramDashboard = () => {
  const [mines, setMines] = useState([]);
  const [filteredMines, setFilteredMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMine, setSelectedMine] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'map', 'list'
  const [statistics, setStatistics] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Districts and types for filters
  const [districts, setDistricts] = useState([]);
  const [mineTypes, setMineTypes] = useState([]);
  const [mineStatuses, setMineStatuses] = useState([]);

  // Fetch data
  useEffect(() => {
    fetchMines();
    fetchStatistics();
    fetchDistricts();
  }, []);

  const fetchMines = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/mines');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setMines(Array.isArray(data) ? data : []);
      
      // Extract unique types and statuses
      if (Array.isArray(data)) {
        const types = [...new Set(data.map(mine => mine.type))];
        const statuses = [...new Set(data.map(mine => mine.status))];
        setMineTypes(types);
        setMineStatuses(statuses);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching mines:', err);
      setError(`Failed to load mines: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/districts');
      const data = await response.json();
      setDistricts(data);
    } catch (err) {
      console.error('Error fetching districts:', err);
    }
  };

  // Filter and sort mines
  useEffect(() => {
    let filtered = mines.filter(mine => {
      const matchesSearch = searchTerm === '' || 
        mine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mine.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mine.type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDistrict = selectedDistrict === '' || mine.district === selectedDistrict;
      const matchesRisk = selectedRisk === '' || mine.risk_level === selectedRisk;
      const matchesType = selectedType === '' || mine.type === selectedType;
      const matchesStatus = selectedStatus === '' || mine.status === selectedStatus;
      
      return matchesSearch && matchesDistrict && matchesRisk && matchesType && matchesStatus;
    });

    // Sort mines
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'risk_score':
          aValue = a.risk_score || 0;
          bValue = b.risk_score || 0;
          break;
        case 'likes_count':
          aValue = a.likes_count || 0;
          bValue = b.likes_count || 0;
          break;
        case 'views_count':
          aValue = a.views_count || 0;
          bValue = b.views_count || 0;
          break;
        case 'last_updated':
          aValue = new Date(a.last_updated || 0);
          bValue = new Date(b.last_updated || 0);
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    setFilteredMines(filtered);
  }, [mines, searchTerm, selectedDistrict, selectedRisk, selectedType, selectedStatus, sortBy, sortOrder]);

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Medium': return '#d97706';
      case 'Low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getRiskBadgeClass = (risk) => {
    switch(risk) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-orange-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleLikeMine = async (mineId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/mines/${mineId}/like`, {
        method: 'POST'
      });
      if (response.ok) {
        // Update the mine in the local state
        setMines(prev => prev.map(mine => 
          mine.id === mineId 
            ? { ...mine, likes_count: (mine.likes_count || 0) + 1 }
            : mine
        ));
      }
    } catch (err) {
      console.error('Error liking mine:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Loading Tamil Nadu Mines
          </h2>
          <p className="text-gray-600">Fetching enhanced mine data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      {/* Instagram-like Header */}
      <div className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                🏔️ MineGram
              </div>
              <div className="hidden md:flex space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full text-sm font-medium">
                  ✅ Live
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full text-sm font-medium">
                  {mines.length} Mines
                </span>
              </div>
            </div>
            
            {/* View Mode Buttons */}
            <div className="flex space-x-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                📱 Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'map' 
                    ? 'bg-white shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.total_mines || mines.length}</div>
              <div className="text-sm text-gray-600">Total Mines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.risk_distribution?.Critical || 0}</div>
              <div className="text-sm text-gray-600">Critical Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.risk_distribution?.High || 0}</div>
              <div className="text-sm text-gray-600">High Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.risk_distribution?.Low || 0}</div>
              <div className="text-sm text-gray-600">Low Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.active_monitoring || 0}</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="🔍 Search mines by name, district, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:bg-white transition-all text-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="">All Risk Levels</option>
              <option value="Critical">🔴 Critical</option>
              <option value="High">🟠 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="">All Types</option>
              {mineTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="">All Statuses</option>
              {mineStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all"
            >
              <option value="name">Sort by Name</option>
              <option value="risk_score">Sort by Risk</option>
              <option value="likes_count">Sort by Likes</option>
              <option value="views_count">Sort by Views</option>
              <option value="last_updated">Sort by Updated</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredMines.length} of {mines.length} mines
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMines.map((mine) => (
              <div key={mine.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Instagram-like Image Header */}
                <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getRiskBadgeClass(mine.risk_level)}`}>
                      {mine.risk_level}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                      {mine.district}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold truncate">{mine.name}</h3>
                    <p className="text-sm opacity-90">{mine.type} • {mine.status}</p>
                  </div>
                </div>

                {/* Instagram-like Content */}
                <div className="p-4">
                  {/* Social Stats */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>👁️ {formatNumber(mine.views_count)}</span>
                      <span>💬 {formatNumber(mine.comments_count)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLikeMine(mine.id)}
                        className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <span>❤️</span>
                        <span className="text-sm">{formatNumber(mine.likes_count)}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mine Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Score:</span>
                      <span className="font-semibold" style={{color: getRiskColor(mine.risk_level)}}>
                        {(mine.risk_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Safety Score:</span>
                      <span className="font-semibold text-green-600">
                        {(mine.safety_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Incidents:</span>
                      <span className="font-semibold text-orange-600">
                        {mine.incidents_count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="text-gray-500 text-xs">
                        {formatDate(mine.last_updated)}
                      </span>
                    </div>
                  </div>

                  {/* Weather Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-600">Weather: </span>
                        <span className="font-medium">{mine.weather_description}</span>
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        {mine.temperature?.toFixed(1)}°C
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      💧 {mine.recent_rainfall?.toFixed(1)}mm • 💨 {mine.wind_speed?.toFixed(1)}km/h
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => setSelectedMine(mine)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200 transition-colors">
                      📍
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{height: '80vh'}}>
            <MapContainer
              center={[11.1271, 78.6569]} // Tamil Nadu center
              zoom={7}
              style={{height: '100%', width: '100%'}}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredMines.map((mine) => (
                <Marker
                  key={mine.id}
                  position={[mine.latitude, mine.longitude]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg mb-2">{mine.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div><strong>District:</strong> {mine.district}</div>
                        <div><strong>Type:</strong> {mine.type}</div>
                        <div><strong>Status:</strong> {mine.status}</div>
                        <div>
                          <strong>Risk Level:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getRiskBadgeClass(mine.risk_level)}`}>
                            {mine.risk_level}
                          </span>
                        </div>
                        <div><strong>Risk Score:</strong> {(mine.risk_score * 100).toFixed(1)}%</div>
                        <div><strong>Incidents:</strong> {mine.incidents_count || 0}</div>
                        <div><strong>Weather:</strong> {mine.weather_description}, {mine.temperature?.toFixed(1)}°C</div>
                      </div>
                      <button
                        onClick={() => setSelectedMine(mine)}
                        className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        View Full Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {filteredMines.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No mines found</h3>
            <p className="text-gray-500 text-lg mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDistrict('');
                setSelectedRisk('');
                setSelectedType('');
                setSelectedStatus('');
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Mine Detail Modal */}
      {selectedMine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedMine.name}</h2>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskBadgeClass(selectedMine.risk_level)}`}>
                      {selectedMine.risk_level} Risk
                    </span>
                    <span className="text-gray-600">{selectedMine.district}, Tamil Nadu</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMine(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">📊 Risk Assessment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className="font-bold" style={{color: getRiskColor(selectedMine.risk_level)}}>
                          {(selectedMine.risk_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safety Score:</span>
                        <span className="font-bold text-green-600">
                          {(selectedMine.safety_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Incidents:</span>
                        <span className="font-bold text-orange-600">
                          {selectedMine.incidents_count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downtime Hours:</span>
                        <span className="font-bold text-red-600">
                          {selectedMine.total_downtime_hours?.toFixed(1) || 0}h
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">🌤️ Current Weather</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Condition:</span>
                        <span className="font-bold">{selectedMine.weather_description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temperature:</span>
                        <span className="font-bold">{selectedMine.temperature?.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Humidity:</span>
                        <span className="font-bold">{selectedMine.humidity?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wind Speed:</span>
                        <span className="font-bold">{selectedMine.wind_speed?.toFixed(1)} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Rainfall:</span>
                        <span className="font-bold">{selectedMine.recent_rainfall?.toFixed(1)} mm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">ℹ️ Mine Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-bold">{selectedMine.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-bold">{selectedMine.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Production Capacity:</span>
                        <span className="font-bold">{selectedMine.production_capacity?.toFixed(0)} tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Elevation:</span>
                        <span className="font-bold">{selectedMine.elevation?.toFixed(0)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slope Angle:</span>
                        <span className="font-bold">{selectedMine.slope_angle?.toFixed(1)}°</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">📅 Monitoring Schedule</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Last Inspection:</span>
                        <span className="font-bold">{formatDate(selectedMine.last_inspection)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Inspection:</span>
                        <span className="font-bold">{formatDate(selectedMine.next_inspection)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monitoring Active:</span>
                        <span className={`font-bold ${selectedMine.monitoring_active ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedMine.monitoring_active ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-bold">{formatDate(selectedMine.last_updated)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags and Social */}
              <div className="mt-8 space-y-4">
                <div>
                  <h3 className="text-lg font-bold mb-3">🏷️ Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMine.tags?.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center py-4 border-t">
                  <div className="flex space-x-6 text-gray-600">
                    <span>👁️ {formatNumber(selectedMine.views_count)} views</span>
                    <span>💬 {formatNumber(selectedMine.comments_count)} comments</span>
                  </div>
                  <button
                    onClick={() => handleLikeMine(selectedMine.id)}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl hover:from-red-500 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    <span>❤️</span>
                    <span>{formatNumber(selectedMine.likes_count)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramDashboard;