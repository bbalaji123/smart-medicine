import React, { useState } from 'react';
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

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock data for charts
  const adherenceData = [
    { date: 'Week 1', adherence: 95, missed: 2, taken: 38 },
    { date: 'Week 2', adherence: 87, missed: 5, taken: 35 },
    { date: 'Week 3', adherence: 92, missed: 3, taken: 37 },
    { date: 'Week 4', adherence: 96, missed: 1, taken: 39 },
  ];

  const medicationBreakdown = [
    { name: 'Lisinopril', value: 30, color: '#3b82f6' },
    { name: 'Metformin', value: 60, color: '#22c55e' },
    { name: 'Vitamin D', value: 30, color: '#f59e0b' },
    { name: 'Omega-3', value: 30, color: '#8b5cf6' },
  ];

  const timePatterns = [
    { time: '6:00', doses: 1 },
    { time: '8:00', doses: 2 },
    { time: '12:00', doses: 2 },
    { time: '18:00', doses: 1 },
    { time: '20:00', doses: 2 },
    { time: '22:00', doses: 1 },
  ];

  const adherenceStats = {
    overall: 94,
    thisWeek: 96,
    streak: 12,
    improvement: 8,
  };

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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adherence Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={adherenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, 'Adherence Rate']}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="adherence" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Medication Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication Breakdown</h3>
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
        </motion.div>
      </div>

      {/* Time Pattern Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Dose Timing</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timePatterns}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value}`, 'Doses']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="doses" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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