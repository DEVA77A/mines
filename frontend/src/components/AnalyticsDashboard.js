import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  MapPin,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

const AnalyticsDashboard = () => {
  const { isDarkMode } = useTheme();
  const { mines, statistics, loading } = useData();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('risk_score');
  const [analyticsData, setAnalyticsData] = useState({});

  // Generate analytics data
  useEffect(() => {
    if (mines.length > 0) {
      const data = generateAnalyticsData(mines, timeRange);
      setAnalyticsData(data);
    }
  }, [mines, timeRange]);

  const generateAnalyticsData = (minesData, range) => {
    // Simulate time-series data generation
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const timeSeriesData = Array.from({ length: days }, (_, i) => {
      const date = new Date(now - (days - 1 - i) * dayMs);
      return {
        date: date.toISOString().split('T')[0],
        risk_score: 0.3 + Math.random() * 0.4,
        alerts: Math.floor(Math.random() * 5),
        inspections: Math.floor(Math.random() * 3),
        incidents: Math.random() > 0.8 ? 1 : 0
      };
    });

    // District-wise risk distribution
    const districtRisk = minesData.reduce((acc, mine) => {
      const district = mine.district;
      if (!acc[district]) {
        acc[district] = { total: 0, highRisk: 0, count: 0 };
      }
      acc[district].count += 1;
      acc[district].total += mine.risk_score;
      if (mine.risk_score > 0.7) acc[district].highRisk += 1;
      return acc;
    }, {});

    // Risk trend calculation
    const riskTrend = timeSeriesData.map((day, index) => ({
      ...day,
      trend: index > 0 ? day.risk_score - timeSeriesData[index - 1].risk_score : 0
    }));

    return {
      timeSeries: timeSeriesData,
      districtRisk,
      riskTrend,
      summary: {
        avgRiskScore: minesData.reduce((sum, mine) => sum + mine.risk_score, 0) / minesData.length,
        riskTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        trendPercentage: (Math.random() * 10 + 1).toFixed(1),
        totalAlerts: Math.floor(Math.random() * 20 + 5),
        resolvedAlerts: Math.floor(Math.random() * 15 + 10)
      }
    };
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  const metricOptions = [
    { value: 'risk_score', label: 'Risk Score', icon: AlertTriangle },
    { value: 'alerts', label: 'Alerts', icon: Activity },
    { value: 'inspections', label: 'Inspections', icon: CheckCircle },
    { value: 'incidents', label: 'Incidents', icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Analytics Dashboard
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Comprehensive insights into rockfall risk patterns and trends
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-4 py-2.5 pr-10 border rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
          >
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Average Risk Score"
          value={analyticsData.summary?.avgRiskScore?.toFixed(2) || '0.00'}
          trend={analyticsData.summary?.riskTrend}
          trendValue={analyticsData.summary?.trendPercentage}
          icon={AlertTriangle}
          color="orange"
          isDarkMode={isDarkMode}
        />
        
        <SummaryCard
          title="Total Alerts"
          value={analyticsData.summary?.totalAlerts || '0'}
          trend="stable"
          trendValue="0.0"
          icon={Activity}
          color="red"
          isDarkMode={isDarkMode}
        />
        
        <SummaryCard
          title="Resolved Alerts"
          value={analyticsData.summary?.resolvedAlerts || '0'}
          trend="increasing"
          trendValue="15.2"
          icon={CheckCircle}
          color="emerald"
          isDarkMode={isDarkMode}
        />
        
        <SummaryCard
          title="Active Mines"
          value={statistics?.active_mines || '0'}
          trend="stable"
          trendValue="2.1"
          icon={MapPin}
          color="blue"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trend Chart */}
        <div className={`p-8 rounded-3xl border shadow-xl backdrop-blur-md ${
          isDarkMode 
            ? 'bg-slate-800/60 border-slate-700/50' 
            : 'bg-white/60 border-white/50'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Risk Score Trend
            </h3>
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-xl">
              {metricOptions.map((metric) => {
                const Icon = metric.icon;
                return (
                  <motion.button
                    key={metric.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMetric(metric.value)}
                    className={`p-2 rounded-lg transition-all ${
                      selectedMetric === metric.value
                        ? 'bg-white dark:bg-slate-600 text-blue-600 shadow-sm'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.button>
                );
              })}
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            <TrendChart 
              data={analyticsData.timeSeries || []} 
              metric={selectedMetric}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* District Risk Distribution */}
        <div className={`p-8 rounded-3xl border shadow-xl backdrop-blur-md ${
          isDarkMode 
            ? 'bg-slate-800/60 border-slate-700/50' 
            : 'bg-white/60 border-white/50'
        }`}>
          <h3 className={`text-xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            District Risk Distribution
          </h3>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(analyticsData.districtRisk || {}).map(([district, data]) => {
              const avgRisk = data.total / data.count;
              const riskLevel = avgRisk > 0.7 ? 'high' : avgRisk > 0.4 ? 'medium' : 'low';
              const riskColor = riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'orange' : 'emerald';
              
              return (
                <motion.div
                  key={district}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' 
                      : 'bg-white/50 border-slate-100 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {district}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-${riskColor}-100 text-${riskColor}-700 dark:bg-${riskColor}-900/30 dark:text-${riskColor}-300`}>
                      {riskLevel}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                      <span className="font-bold">{data.count}</span> mines • <span className="font-bold">{data.highRisk}</span> high risk
                    </span>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {(avgRisk * 100).toFixed(1)}% Risk
                    </span>
                  </div>
                  
                  <div className={`h-2.5 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-slate-600' : 'bg-slate-100'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${avgRisk * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                      className={`h-full bg-${riskColor}-500 rounded-full shadow-sm`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className={`p-8 rounded-3xl border shadow-xl backdrop-blur-md overflow-hidden ${
        isDarkMode 
          ? 'bg-slate-800/60 border-slate-700/50' 
          : 'bg-white/60 border-white/50'
      }`}>
        <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          Recent Activity Log
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <th className={`text-left py-4 px-6 font-bold text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Date
                </th>
                <th className={`text-left py-4 px-6 font-bold text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Risk Score
                </th>
                <th className={`text-left py-4 px-6 font-bold text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Alerts
                </th>
                <th className={`text-left py-4 px-6 font-bold text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Inspections
                </th>
                <th className={`text-left py-4 px-6 font-bold text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {(analyticsData.riskTrend || []).slice(-7).map((day, index) => (
                <motion.tr
                  key={day.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-b last:border-0 ${isDarkMode ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-white/80'} transition-colors`}
                >
                  <td className={`py-4 px-6 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className={`py-4 px-6`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        day.risk_score > 0.7 ? 'bg-red-500' : day.risk_score > 0.4 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`} />
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {(day.risk_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {day.alerts > 0 ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">{day.alerts} Alerts</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className={`py-4 px-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {day.inspections}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {day.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : day.trend < 0 ? (
                        <TrendingDown className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className={`text-sm font-bold ${
                        day.trend > 0 ? 'text-red-500' : 
                        day.trend < 0 ? 'text-emerald-500' : 
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {Math.abs(day.trend * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, trend, trendValue, icon: Icon, color, isDarkMode }) => {
  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'increasing' && color === 'red') return 'text-red-500';
    if (trend === 'increasing' && color === 'emerald') return 'text-emerald-500';
    if (trend === 'decreasing' && color === 'red') return 'text-emerald-500';
    if (trend === 'decreasing' && color === 'emerald') return 'text-red-500';
    return isDarkMode ? 'text-slate-400' : 'text-slate-500';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`p-6 rounded-3xl border shadow-lg backdrop-blur-md transition-all ${
        isDarkMode 
          ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80' 
          : 'bg-white/60 border-white/50 hover:shadow-xl hover:bg-white/80'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center shadow-inner`}>
          <Icon className={`w-7 h-7 text-${color}-500`} />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/50 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{trendValue}%</span>
        </div>
      </div>
      
      <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        {value}
      </div>
      
      <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {title}
      </div>
    </motion.div>
  );
};

// Simple Trend Chart Component
const TrendChart = ({ data, metric, isDarkMode }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center">
        <BarChart3 className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d[metric] || 0));
  
  return (
    <div className="w-full h-full flex items-end justify-between space-x-3 px-4 pb-2">
      {data.map((point, index) => {
        const height = ((point[metric] || 0) / maxValue) * 100;
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1 relative group"
          >
            <div className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-300 ${
              isDarkMode ? 'bg-blue-500/80 group-hover:bg-blue-400' : 'bg-blue-500 group-hover:bg-blue-600'
            }`} style={{ height: '100%' }}></div>
            
            {/* Tooltip */}
            <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
              {point.date}: {typeof point[metric] === 'number' && point[metric] < 1 ? (point[metric]*100).toFixed(1) + '%' : point[metric]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalyticsDashboard;