import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  HeartIcon,
  ScaleIcon,
  BeakerIcon,
  FaceSmileIcon,
  BoltIcon,
  MoonIcon,
  ChartBarIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

interface HealthEntry {
  id: string;
  date: Date;
  type: 'vitals' | 'symptoms' | 'mood' | 'exercise' | 'sleep';
  data: Record<string, any>;
  notes?: string;
}

const HealthJournal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'log' | 'trends' | 'reports'>('log');
  const [selectedMetric, setSelectedMetric] = useState('blood_pressure');

  // Mock data
  const healthEntries: HealthEntry[] = [
    {
      id: '1',
      date: new Date('2024-01-15T08:00:00'),
      type: 'vitals',
      data: { 
        systolic: 120, 
        diastolic: 80, 
        heartRate: 72, 
        weight: 165 
      },
      notes: 'Feeling good this morning'
    },
    {
      id: '2',
      date: new Date('2024-01-15T14:00:00'),
      type: 'mood',
      data: { 
        mood: 8, 
        energy: 7, 
        stress: 3 
      },
      notes: 'Had a productive day at work'
    },
    {
      id: '3',
      date: new Date('2024-01-14T22:00:00'),
      type: 'sleep',
      data: { 
        hours: 7.5, 
        quality: 'good',
        bedtime: '22:30',
        wakeup: '06:00'
      },
      notes: 'Slept well, no interruptions'
    },
  ];

  const quickMetrics = [
    {
      name: 'Blood Pressure',
      value: '120/80',
      unit: 'mmHg',
      trend: 'stable',
      icon: HeartIcon,
      color: 'text-medical-600',
      bgColor: 'bg-medical-50',
    },
    {
      name: 'Weight',
      value: '165',
      unit: 'lbs',
      trend: 'down',
      icon: ScaleIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'Blood Sugar',
      value: '95',
      unit: 'mg/dL',
      trend: 'stable',
      icon: BeakerIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Mood',
      value: '8',
      unit: '/10',
      trend: 'up',
      icon: FaceSmileIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const metricTypes = [
    { id: 'blood_pressure', name: 'Blood Pressure', icon: HeartIcon },
    { id: 'weight', name: 'Weight', icon: ScaleIcon },
    { id: 'blood_sugar', name: 'Blood Sugar', icon: BeakerIcon },
    { id: 'mood', name: 'Mood', icon: FaceSmileIcon },
    { id: 'energy', name: 'Energy', icon: BoltIcon },
    { id: 'sleep', name: 'Sleep', icon: MoonIcon },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'vitals':
        return 'bg-medical-100 text-medical-800';
      case 'symptoms':
        return 'bg-danger-100 text-danger-800';
      case 'mood':
        return 'bg-purple-100 text-purple-800';
      case 'exercise':
        return 'bg-orange-100 text-orange-800';
      case 'sleep':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Journal</h1>
          <p className="mt-2 text-gray-600">Track your vitals, symptoms, and overall wellness</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Entry
        </motion.button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${metric.bgColor} p-3 rounded-lg`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                  <div className="flex items-center">
                    <p className="text-xl font-bold text-gray-900">
                      {metric.value}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-lg">
                {getTrendIcon(metric.trend)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('log')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'log'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Entries
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trends'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Recent Entries */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          {healthEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge ${getEntryTypeColor(entry.type)}`}>
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    {Object.entries(entry.data).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {entry.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">{entry.notes}</p>
                    </div>
                  )}
                </div>
                
                <button className="ml-4 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <DocumentIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Trends */}
      {activeTab === 'trends' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Metric Selector */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metric to View</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {metricTypes.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedMetric === metric.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <metric.icon className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{metric.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {metricTypes.find(m => m.id === selectedMetric)?.name} Trends
              </h3>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Trend visualization coming soon</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
        >
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Health Reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate comprehensive health reports for doctor visits.
            </p>
            <div className="mt-6">
              <button className="btn-primary">
                Generate Report
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HealthJournal;