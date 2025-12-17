import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const StatsCards = ({ statistics = {}, loading = false }) => {
  const { isDarkMode } = useTheme();

  const defaultStats = {
    total_mines: 127,
    active_mines: 98,
    high_risk_mines: 8,
    medium_risk_mines: 22,
    low_risk_mines: 68,
    critical_alerts: 3,
    avg_risk_score: 0.34,
    last_updated: new Date().toISOString()
  };

  const stats = { ...defaultStats, ...statistics };

  const statCards = [
    {
      title: 'Total Mines',
      value: stats.total_mines,
      change: '+2.1%',
      changeType: 'positive',
      icon: '🏔️',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Operations',
      value: stats.active_mines,
      change: '+1.3%',
      changeType: 'positive',
      icon: '⚡',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'High Risk Sites',
      value: stats.high_risk_mines,
      change: '-5.2%',
      changeType: 'negative',
      icon: '⚠️',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      title: 'Critical Alerts',
      value: stats.critical_alerts,
      change: '-12.3%',
      changeType: 'negative',
      icon: '🚨',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Average Risk Score',
      value: (stats.avg_risk_score * 100).toFixed(1) + '%',
      change: '-3.1%',
      changeType: 'negative',
      icon: '📊',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Districts Covered',
      value: '12',
      change: 'stable',
      changeType: 'neutral',
      icon: '📍',
      gradient: 'from-teal-500 to-blue-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border animate-pulse ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
              <div className="w-12 h-4 bg-gray-300 rounded" />
            </div>
            <div className="w-16 h-8 bg-gray-300 rounded mb-2" />
            <div className="w-24 h-4 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.05, y: -5 }}
          className={`relative p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80 shadow-lg shadow-black/20' 
              : 'bg-white/60 border-white/60 hover:bg-white/80 shadow-xl shadow-blue-100/50'
          } group overflow-hidden`}
        >
          {/* Background Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          {/* Glass Reflection Effect */}
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 to-transparent rotate-45 transform translate-y-full group-hover:-translate-y-full transition-transform duration-1000 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                <span className="text-white text-xl drop-shadow-md">{card.icon}</span>
              </div>
              
              {/* Change Indicator */}
              <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
                card.changeType === 'positive' 
                  ? 'text-emerald-700 bg-emerald-100/80 border border-emerald-200'
                  : card.changeType === 'negative'
                  ? 'text-rose-700 bg-rose-100/80 border border-rose-200'
                  : 'text-slate-600 bg-slate-100/80 border border-slate-200'
              }`}>
                {card.changeType === 'positive' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {card.changeType === 'negative' && (
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {card.change}
              </div>
            </div>

            {/* Value */}
            <div className="mb-1">
              <div className={`text-3xl font-extrabold tracking-tight ${
                isDarkMode 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600'
              }`}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
            </div>

            {/* Title */}
            <div className={`text-sm font-semibold tracking-wide uppercase ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              {card.title}
            </div>

            {/* Mini Chart or Progress */}
            <div className="mt-5">
              <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.random() * 40 + 60}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 1.5, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${card.gradient} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;