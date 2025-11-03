import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  MapPin,
  Calendar,
  BarChart3
} from 'lucide-react';

const MineCard = ({ mine, onClick, className = "" }) => {
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical': return 'text-white bg-red-700 border-red-700';
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical': return <AlertTriangle className="w-4 h-4 text-white" />;
      case 'High': return <TrendingUp className="w-4 h-4" />;
      case 'Medium': return <AlertTriangle className="w-4 h-4" />;
      case 'Low': return <TrendingDown className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getMineralIcon = (mineralType) => {
    // Simple mapping of mineral types to emojis
    const icons = {
      'Granite': '🗿',
      'Limestone': '🏔️',
      'Iron Ore': '⚡',
      'Marble': '💎',
      'Sandstone': '🧱',
      'Silica Sand': '⏳',
      'Sand': '🏖️',
      'Salt': '🧂'
    };
    return icons[mineralType] || '⛏️';
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`card-instagram cursor-pointer group ${className}`}
      onClick={() => onClick && onClick(mine)}
    >
      {/* Header with mine name and location */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 line-clamp-2">
              {mine.mine_name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {mine.district}
            </div>
          </div>
          <div className="text-2xl ml-2">
            {getMineralIcon(mine.mineral_type)}
          </div>
        </div>

        {/* Risk indicator */}
        {mine.risk_assessment?.risk_level && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(mine.risk_assessment.risk_level)}`}>
            {getRiskIcon(mine.risk_assessment.risk_level)}
            <span className="ml-1">{mine.risk_assessment.risk_level} Risk</span>
          </div>
        )}
      </div>

      {/* Stats section */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {mine.operational_data?.area_hectares || mine.lease_area_ha}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Hectares
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {mine.risk_assessment?.risk_score ? `${(mine.risk_assessment.risk_score).toFixed(1)}` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Risk Score
            </div>
          </div>
        </div>

        {/* Mine details */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Mineral Type:</span>
            <span className="font-medium text-gray-900">{mine.mineral_type}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              mine.status === 'Active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {mine.status}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Coordinates:</span>
            <span className="font-mono text-xs text-gray-700">
              {mine.latitude.toFixed(3)}, {mine.longitude.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer with action button */}
      <div className="px-4 pb-4">
        <div className="pt-3 border-t border-gray-100">
          <button className="w-full btn-primary text-sm py-2">
            View Details
          </button>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-instagram pointer-events-none" />
    </motion.div>
  );
};

// Grid container for mine cards
export const MineCardGrid = ({ mines, onMineClick, loading = false, className = "" }) => {
  if (loading) {
    return (
      <div className={`dashboard-grid ${className}`}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card-instagram">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded skeleton w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded skeleton w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded skeleton"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded skeleton w-1/3"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-16 bg-gray-200 rounded skeleton"></div>
                <div className="h-16 bg-gray-200 rounded skeleton"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded skeleton"></div>
                <div className="h-4 bg-gray-200 rounded skeleton"></div>
                <div className="h-4 bg-gray-200 rounded skeleton"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded skeleton"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!mines || mines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No mines found</h3>
        <p className="text-gray-500">Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-grid ${className}`}>
      {mines.map((mine) => (
        <MineCard
          key={mine.mine_id}
          mine={mine}
          onClick={onMineClick}
        />
      ))}
    </div>
  );
};

export default MineCard;