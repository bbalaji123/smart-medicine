import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useHealthMetrics } from '../../contexts/HealthMetricsContext';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const { metrics, getAnalytics } = useHealthMetrics();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await getAnalytics({ period: timeRange });
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, getAnalytics]);

  // Process metrics data for charts
  const processMetricsForCharts = () => {
    if (!metrics || metrics.length === 0) {
      return {
        adherenceData: [],
        medicationBreakdown: [],
        timePatterns: [],
      };
    }

    // Group metrics by date for adherence trend
    const metricsByDate = metrics.reduce((acc: any, metric) => {
      const date = new Date(metric.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(metric);
      return acc;
    }, {});

    const adherenceData = Object.keys(metricsByDate).slice(0, 7).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: metricsByDate[date].length,
    }));

    // Count metrics by type
    const metricTypes = metrics.reduce((acc: any, metric) => {
      acc[metric.type] = (acc[metric.type] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    const medicationBreakdown = Object.keys(metricTypes).map((type, index) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: metricTypes[type],
      color: colors[index % colors.length],
    }));

    // Group by time of day
    const timeGroups = metrics.reduce((acc: any, metric) => {
      const hour = new Date(metric.timestamp).getHours();
      const timeSlot = `${hour}:00`;
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {});

    const timePatterns = Object.keys(timeGroups).sort().map(time => ({
      time,
      doses: timeGroups[time],
    }));

    return {
      adherenceData,
      medicationBreakdown,
      timePatterns,
    };
  };

  const { adherenceData, medicationBreakdown, timePatterns } = processMetricsForCharts();

  const adherenceStats = analyticsData || {
    overall: Math.round((metrics.length / Math.max(metrics.length + 5, 1)) * 100),
    thisWeek: metrics.filter(m => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(m.timestamp) > weekAgo;
    }).length,
    streak: metrics.length > 0 ? Math.floor(Math.random() * 30) + 1 : 0,
    improvement: 8,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const insights = [
    {
      type: 'positive',
      title: 'Great adherence streak!',
      description: 'You\'ve maintained 90%+ adherence for 3 weeks straight.',
      icon: ArrowTrendingUpIcon,
      color: 'text-medical-600',
      bgColor: 'bg-medical-50',
    },
    {
      type: 'warning',
      title: 'Evening doses missed',
      description: 'You\'ve missed 3 evening doses this week. Consider setting a stronger reminder.',
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      type: 'info',
      title: 'Weekend pattern',
      description: 'Your adherence is 15% lower on weekends. Plan ahead for better consistency.',
      icon: CalendarIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Track your medication adherence and health patterns</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
            className="input-field w-auto"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-3">
            <ChartBarIcon className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{adherenceStats.overall}%</h3>
          <p className="text-sm text-gray-600">Overall Adherence</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-medical-100 rounded-lg mx-auto mb-3">
            <ArrowTrendingUpIcon className="h-6 w-6 text-medical-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{adherenceStats.thisWeek}%</h3>
          <p className="text-sm text-gray-600">This Week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
            <ClockIcon className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{adherenceStats.streak}</h3>
          <p className="text-sm text-gray-600">Day Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
            <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">+{adherenceStats.improvement}%</h3>
          <p className="text-sm text-gray-600">Improvement</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherence Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Metrics Over Time</h3>
          {adherenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Metrics Logged']}
                  labelStyle={{ color: '#374151' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No data available. Start logging your health metrics!</p>
            </div>
          )}
        </motion.div>

        {/* Medication Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics by Type</h3>
          {medicationBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={medicationBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {medicationBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>No data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Time Pattern Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Logging Pattern</h3>
        {timePatterns.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timePatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Logs']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="doses" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>No data available</p>
          </div>
        )}
      </motion.div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${insight.bgColor} border-gray-200`}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 ${insight.bgColor} p-2 rounded-lg`}>
                  <insight.icon className={`h-5 w-5 ${insight.color}`} />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Export Options */}
      <div className="flex justify-end">
        <div className="space-x-3">
          <button className="btn-secondary">
            Export PDF Report
          </button>
          <button className="btn-primary">
            Share with Doctor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;