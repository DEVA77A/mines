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
  Shield,
  RefreshCw
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
      case 'Critical':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-900',
          badge: 'bg-gradient-to-r from-red-600 to-rose-600 shadow-lg shadow-red-500/30',
          icon: 'text-red-600',
          ring: 'hover:ring-red-200'
        };
      case 'High':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-orange-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/30',
          icon: 'text-red-600',
          ring: 'hover:ring-red-200'
        };
      case 'Medium':
        return {
          bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          badge: 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30',
          icon: 'text-orange-600',
          ring: 'hover:ring-orange-200'
        };
      case 'Low':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30',
          icon: 'text-emerald-600',
          ring: 'hover:ring-emerald-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-50 to-gray-50',
          border: 'border-slate-200',
          text: 'text-slate-800',
          badge: 'bg-gradient-to-r from-slate-500 to-gray-500 shadow-lg shadow-slate-500/30',
          icon: 'text-slate-600',
          ring: 'hover:ring-slate-200'
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
      className={`${styling.bg} ${styling.border} border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:ring-2 ${styling.ring} ring-offset-2 relative overflow-hidden group`}
      onClick={handleCardClick}
    >
      {/* Glass Shine Effect */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1 pr-2">
          <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 tracking-tight group-hover:text-blue-700 transition-colors">
            {mine.name}
          </h3>
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <div 
              className="flex items-center bg-white/50 px-2 py-0.5 rounded-md cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors group/location"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/maps/search/?api=1&query=${mine.latitude},${mine.longitude}`, '_blank');
              }}
              title="View on Google Maps"
            >
              <MapPin className="w-3 h-3 mr-1 group-hover/location:text-blue-600" />
              <span>{mine.district}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="bg-white/50 px-2 py-0.5 rounded-md">
              <span>{mine.type}</span>
            </div>
          </div>
        </div>
        
        {/* Risk Badge */}
        <div className={`${styling.badge} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 tracking-wide uppercase`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{mine.risk_level}</span>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className={`w-3.5 h-3.5 ${styling.icon}`} />
              <span className="text-xs font-medium text-slate-500">Risk Score</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className={`text-lg font-bold ${styling.text}`}>
              {(mine.risk_score * 100).toFixed(0)}%
            </span>
            <div className={`h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden`}>
              <div 
                className={`h-full rounded-full ${styling.badge.split(' ')[0]}`} 
                style={{ width: `${mine.risk_score * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">Safety</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-blue-700">
              {(mine.safety_score * 100).toFixed(0)}%
            </span>
            <div className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-blue-500" 
                style={{ width: `${mine.safety_score * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">Status</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
            mine.status === 'Active' 
              ? 'bg-emerald-100 text-emerald-700' 
              : mine.status === 'Under Development'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {mine.status}
          </span>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Mountain className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">Elev.</span>
          </div>
          <span className="text-sm font-bold text-slate-700">
            {mine.elevation?.toFixed(0)}m
          </span>
        </div>
      </div>
      
      {/* Weather Info */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/30 relative z-10">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-white/50 transition-colors">
            <div className="flex items-center space-x-1 mb-0.5">
              <Thermometer className="w-3 h-3 text-rose-500" />
              <span className="font-medium text-slate-600">Temp</span>
            </div>
            <span className="font-bold text-slate-800">{mine.temperature?.toFixed(1)}°C</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-white/50 transition-colors border-l border-r border-slate-200/50">
            <div className="flex items-center space-x-1 mb-0.5">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span className="font-medium text-slate-600">Humid</span>
            </div>
            <span className="font-bold text-slate-800">{mine.humidity?.toFixed(0)}%</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 rounded-lg hover:bg-white/50 transition-colors">
            <div className="flex items-center space-x-1 mb-0.5">
              <Wind className="w-3 h-3 text-slate-500" />
              <span className="font-medium text-slate-600">Wind</span>
            </div>
            <span className="font-bold text-slate-800">{mine.wind_speed?.toFixed(1)}km/h</span>
          </div>
        </div>
        {mine.weather_description && (
          <div className="mt-2 text-xs font-medium text-slate-500 text-center bg-white/30 rounded-md py-1">
            {mine.weather_description}
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 relative z-10 pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Updated {getTimeAgo(mine.last_updated)}</span>
        </div>
        
        <div className="flex items-center space-x-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>View Details</span>
          <Eye className="w-3 h-3" />
        </div>
      </div>
      
      {/* Expanded Details */}
      {isExpanded && showDetails && (
        <div className="mt-4 pt-4 border-t border-slate-200 animate-in slide-in-from-top-2 duration-300 relative z-10">
          <div className="space-y-4">
            {/* Production Info */}
            <div className="bg-slate-50/50 rounded-xl p-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Production Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Capacity</span>
                  <span className="font-bold text-slate-800">{mine.production_capacity?.toFixed(0)} tons/day</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Slope Angle</span>
                  <span className="font-bold text-slate-800">{mine.slope_angle?.toFixed(1)}°</span>
                </div>
              </div>
            </div>
            
            {/* Weather Details */}
            {weatherData && (
              <div className="bg-blue-50/50 rounded-xl p-3">
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Live Weather</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Temp:</span>
                    <span className="font-bold text-slate-800">{weatherData.temperature?.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Humidity:</span>
                    <span className="font-bold text-slate-800">{weatherData.humidity?.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wind:</span>
                    <span className="font-bold text-slate-800">{weatherData.wind_speed?.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rain:</span>
                    <span className="font-bold text-slate-800">{weatherData.rainfall?.toFixed(1)} mm</span>
                  </div>
                </div>
              </div>
            )}
            
            {loadingWeather && (
              <div className="flex items-center justify-center py-4 text-slate-500 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Loading live weather...
              </div>
            )}
            
            {/* Description */}
            {mine.description && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  {mine.description}
                </p>
              </div>
            )}
            
            {/* Inspection Info */}
            <div className="flex items-center justify-between text-xs bg-slate-100 rounded-lg p-2">
              <span className="text-slate-500">Last Inspection:</span>
              <span className="font-bold text-slate-700">{formatDate(mine.last_inspection)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfectMineCard;