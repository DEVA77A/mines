import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  BarChart3,
  Layers,
  Thermometer,
  CloudRain,
  Mountain
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const MineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mines, getMineById, getPrediction } = useData();
  const { isDarkMode } = useTheme();
  const [mine, setMine] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadMineData = async () => {
      try {
        setLoading(true);
        const mineData = getMineById(id);
        setMine(mineData);
        
        if (mineData) {
          const predictionData = await getPrediction(mineData);
          setPrediction(predictionData);
        }
      } catch (error) {
        console.error('Error loading mine data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMineData();
  }, [id, getMineById, getPrediction]);

  // Mock data for demonstration
  const mockMine = {
    id: id,
    mine_name: "Tamil Nadu Granite Quarry #" + id,
    district: "Salem",
    mineral_type: "Granite",
    latitude: 11.664 + (Math.random() - 0.5) * 0.1,
    longitude: 78.146 + (Math.random() - 0.5) * 0.1,
    elevation: 450 + Math.random() * 200,
    area_hectares: 15.5,
    status: "Active",
    license_number: "TN/MIN/" + Math.floor(Math.random() * 10000),
    operator: "Tamil Nadu Mining Corp",
    established_date: "2018-03-15",
    last_inspection: "2024-09-15",
    risk_score: Math.random(),
    environmental_factors: {
      rainfall_mm: 850 + Math.random() * 300,
      temperature_avg: 28 + Math.random() * 8,
      humidity_percent: 65 + Math.random() * 20,
      wind_speed_kmh: 12 + Math.random() * 8,
      geological_stability: 0.7 + Math.random() * 0.3
    }
  };

  const currentMine = mine || mockMine;
  
  const getRiskLevel = (score) => {
    if (score < 0.3) return { level: 'Low', color: 'green', bg: 'bg-green-100 dark:bg-green-900/20' };
    if (score < 0.6) return { level: 'Medium', color: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
    if (score < 0.8) return { level: 'High', color: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/20' };
    return { level: 'Critical', color: 'red', bg: 'bg-red-100 dark:bg-red-900/20' };
  };

  const risk = getRiskLevel(currentMine.risk_score);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'environmental', label: 'Environmental', icon: CloudRain },
    { id: 'geological', label: 'Geological', icon: Mountain },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'history', label: 'History', icon: Calendar }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading mine details...
          </p>
        </div>
      </div>
    );
  }

  if (!currentMine) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Mine Not Found
          </h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            The requested mine could not be found.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentMine.mine_name}
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <div className="flex items-center space-x-1">
                <MapPin className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {currentMine.district}, Tamil Nadu
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Layers className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {currentMine.mineral_type}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${risk.bg} text-${risk.color}-800 dark:text-${risk.color}-300`}>
                {risk.level} Risk
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Trends
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Generate Report
          </motion.button>
        </div>
      </div>

      {/* Risk Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Current Risk Assessment
            </h3>
            <div className="flex items-center space-x-4">
              <div className={`text-4xl font-bold text-${risk.color}-600`}>
                {(currentMine.risk_score * 100).toFixed(1)}%
              </div>
              <div>
                <div className={`text-lg font-medium text-${risk.color}-600`}>
                  {risk.level} Risk
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Risk Gauge */}
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={`var(--color-${risk.color}-500)`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - currentMine.risk_score)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold text-${risk.color}-600`}>
                {Math.round(currentMine.risk_score * 100)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mine Information */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Mine Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>License Number:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{currentMine.license_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Operator:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{currentMine.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Area:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{currentMine.area_hectares} hectares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Elevation:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{currentMine.elevation}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Established:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {new Date(currentMine.established_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Last Inspection:</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {new Date(currentMine.last_inspection).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Map */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Location
                </h3>
                <div 
                  className={`h-64 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${currentMine.latitude},${currentMine.longitude}`, '_blank')}
                  title="Click to view on Google Maps"
                >
                  <div className="text-center">
                    <MapPin className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Lat: {currentMine.latitude.toFixed(6)}
                    </p>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Lng: {currentMine.longitude.toFixed(6)}
                    </p>
                    <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      View on Google Maps
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'environmental' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(currentMine.environmental_factors).map(([key, value]) => (
                <div
                  key={key}
                  className={`p-6 rounded-2xl border ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <Thermometer className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                    {key.includes('temperature') && '°C'}
                    {key.includes('rainfall') && 'mm'}
                    {key.includes('humidity') && '%'}
                    {key.includes('wind') && ' km/h'}
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((typeof value === 'number' ? value : 50) / 100 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add more tab content as needed */}
          {['geological', 'monitoring', 'history'].includes(activeTab) && (
            <div className={`p-12 rounded-2xl border text-center ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`text-6xl mb-4`}>🚧</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Data
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                This section is under development. More detailed {activeTab} information will be available soon.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MineDetails;