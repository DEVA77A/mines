import React, { useState } from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Wind,
  Mountain,
  Clock,
  Eye,
  Info,
  Activity,
  Shield
} from 'lucide-react';
import { usePerfectData } from '../contexts/PerfectDataContext';

const PerfectMineCard = ({ mine, onClick, showDetails = false }) => {
  const { getRiskColor, getTypeColor, fetchMineDetails, fetchWeatherForMine } = usePerfectData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Get risk color
  const riskColor = getRiskColor(mine.risk_level);
  const typeColor = getTypeColor(mine.type);
  
  // Risk level styling
  const getRiskStyling = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-500',
          icon: 'text-red-600'
        };
      case 'Medium':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          badge: 'bg-orange-500',
          icon: 'text-orange-600'
        };
      case 'Low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-500',
          icon: 'text-green-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-500',
          icon: 'text-gray-600'
        };
    }
  };
  
  const styling = getRiskStyling(mine.risk_level);
  
  // Handle card click
  const handleCardClick = async () => {
    if (onClick) {
      onClick(mine);
    }
    
    if (showDetails) {
      setIsExpanded(!isExpanded);
      
      // Load weather data if expanding
      if (!isExpanded && !weatherData) {
        setLoadingWeather(true);
        try {
          const weather = await fetchWeatherForMine(mine.id);
          setWeatherData(weather);
        } catch (error) {
          console.error('Failed to load weather:', error);
        } finally {
          setLoadingWeather(false);
        }
      }
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };
  
  // Format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return formatDate(dateString);
    } catch {
      return 'N/A';
    }
  };
  
  return (
    <div 
      className={`${styling.bg} ${styling.border} border-2 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {mine.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{mine.district}</span>
            <span className="text-gray-400">•</span>
            <span>{mine.type}</span>
          </div>
        </div>
        
        {/* Risk Badge */}
        <div className={`${styling.badge} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1`}>
          <AlertTriangle className="w-3 h-3" />
          <span>{mine.risk_level}</span>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <TrendingUp className={`w-4 h-4 ${styling.icon}`} />
            <span className="text-sm text-gray-600">Risk Score</span>
          </div>
          <span className={`font-semibold ${styling.text}`}>
            {(mine.risk_score * 100).toFixed(0)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Safety</span>
          </div>
          <span className="font-semibold text-blue-800">
            {(mine.safety_score * 100).toFixed(0)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Status</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            mine.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : mine.status === 'Under Development'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {mine.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Mountain className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Elevation</span>
          </div>
          <span className="font-semibold text-gray-800">
            {mine.elevation?.toFixed(0)}m
          </span>
        </div>
      </div>
      
      {/* Weather Info */}
      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <Thermometer className="w-3 h-3 text-red-500" />
            <span>{mine.temperature?.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center space-x-1">
            <Droplets className="w-3 h-3 text-blue-500" />
            <span>{mine.humidity?.toFixed(0)}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wind className="w-3 h-3 text-gray-500" />
            <span>{mine.wind_speed?.toFixed(1)}km/h</span>
          </div>
        </div>
        {mine.weather_description && (
          <div className="mt-1 text-xs text-gray-600">
            {mine.weather_description}
          </div>
        )}
      </div>
      
      {/* Coordinates */}
      <div className="text-xs text-gray-500 mb-2">
        📍 {mine.latitude?.toFixed(4)}°N, {mine.longitude?.toFixed(4)}°E
      </div>
      
      {/* Last Updated */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Updated {getTimeAgo(mine.last_updated)}</span>
        </div>
        
        {showDetails && (
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>Click for details</span>
          </div>
        )}
      </div>
      
      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* Production Info */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Production Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <span className="ml-2 font-semibold">{mine.production_capacity?.toFixed(0)} tons/day</span>
                </div>
                <div>
                  <span className="text-gray-600">Slope:</span>
                  <span className="ml-2 font-semibold">{mine.slope_angle?.toFixed(1)}°</span>
                </div>
              </div>
            </div>
            
            {/* Weather Details */}
            {weatherData && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Current Weather</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Temperature:</span>
                    <span className="ml-2 font-semibold">{weatherData.temperature?.toFixed(1)}°C</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Humidity:</span>
                    <span className="ml-2 font-semibold">{weatherData.humidity?.toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Wind Speed:</span>
                    <span className="ml-2 font-semibold">{weatherData.wind_speed?.toFixed(1)} km/h</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rainfall:</span>
                    <span className="ml-2 font-semibold">{weatherData.rainfall?.toFixed(1)} mm</span>
                  </div>
                </div>
              </div>
            )}
            
            {loadingWeather && (
              <div className="text-sm text-gray-500 text-center py-2">
                Loading weather data...
              </div>
            )}
            
            {/* Description */}
            {mine.description && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{mine.description}</p>
              </div>
            )}
            
            {/* Inspection Info */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Inspection History</h4>
              <div className="text-sm">
                <div>
                  <span className="text-gray-600">Last Inspection:</span>
                  <span className="ml-2 font-semibold">{formatDate(mine.last_inspection)}</span>
                </div>
                <div className="mt-1">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 font-semibold">{formatDate(mine.last_updated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfectMineCard;