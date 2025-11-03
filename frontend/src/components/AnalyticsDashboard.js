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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive insights into rockfall risk patterns and trends
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
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
          color="green"
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
        <div className={`p-6 rounded-2xl border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Risk Score Trend
            </h3>
            <div className="flex items-center space-x-2">
              {metricOptions.map((metric) => {
                const Icon = metric.icon;
                return (
                  <motion.button
                    key={metric.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMetric(metric.value)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedMetric === metric.value
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <div className={`p-6 rounded-2xl border ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            District Risk Distribution
          </h3>
          
          <div className="space-y-4">
            {Object.entries(analyticsData.districtRisk || {}).map(([district, data]) => {
              const avgRisk = data.total / data.count;
              const riskLevel = avgRisk > 0.7 ? 'high' : avgRisk > 0.4 ? 'medium' : 'low';
              const riskColor = riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'yellow' : 'green';
              
              return (
                <motion.div
                  key={district}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {district}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${riskColor}-100 text-${riskColor}-800 dark:bg-${riskColor}-900/20 dark:text-${riskColor}-300`}>
                      {riskLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {data.count} mines • {data.highRisk} high risk
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(avgRisk * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className={`mt-2 h-2 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${avgRisk * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                      className={`h-full bg-${riskColor}-500 rounded-full`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className={`p-6 rounded-2xl border ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Activity
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Risk Score
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Alerts
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Inspections
                </th>
                <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}
                >
                  <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className={`py-4 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {(day.risk_score * 100).toFixed(1)}%
                  </td>
                  <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {day.alerts}
                  </td>
                  <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {day.inspections}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {day.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : day.trend < 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className={`text-sm ${
                        day.trend > 0 ? 'text-red-500' : 
                        day.trend < 0 ? 'text-green-500' : 
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
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
    if (trend === 'increasing' && color === 'green') return 'text-green-500';
    if (trend === 'decreasing' && color === 'red') return 'text-green-500';
    if (trend === 'decreasing' && color === 'green') return 'text-red-500';
    return isDarkMode ? 'text-gray-400' : 'text-gray-600';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl border transition-all ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
          : 'bg-white border-gray-200 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-500 bg-opacity-10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{trendValue}%</span>
        </div>
      </div>
      
      <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      
      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
        <BarChart3 className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d[metric] || 0));
  
  return (
    <div className="w-full h-full flex items-end justify-between space-x-2">
      {data.map((point, index) => {
        const height = ((point[metric] || 0) / maxValue) * 100;
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.1 }}
            className="flex-1 bg-blue-500 rounded-t-md min-h-[4px] max-w-[20px]"
            title={`${point.date}: ${point[metric]}`}
          />
        );
      })}
    </div>
  );
};

export default AnalyticsDashboard;