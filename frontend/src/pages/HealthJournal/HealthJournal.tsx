import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  HeartIcon,
  ScaleIcon,
  BeakerIcon,
  FaceSmileIcon,
  ChartBarIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { useHealthMetrics } from '../../contexts/HealthMetricsContext';
import AddHealthMetricModal from '../../components/Modal/AddHealthMetricModal';
import AddJournalEntryModal from '../../components/Modal/AddJournalEntryModal';

const HealthJournal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'log' | 'metrics' | 'journal'>('log');
  const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState(false);
  const [isAddJournalModalOpen, setIsAddJournalModalOpen] = useState(false);
  const { metrics, journalEntries, isLoading, fetchMetrics, fetchJournalEntries, deleteMetric, deleteJournalEntry } = useHealthMetrics();

  useEffect(() => {
    // Fetch all data when component mounts
    fetchMetrics({ limit: 50 });
    fetchJournalEntries({ limit: 50 });
  }, [fetchMetrics, fetchJournalEntries]);

  // Calculate statistics for overview
  const getOverviewStats = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Count metrics added this week
    const weeklyMetrics = metrics.filter(m => new Date(m.timestamp) >= weekAgo).length;
    
    // Count journal entries this week
    const weeklyJournalEntries = journalEntries.filter(e => new Date(e.date) >= weekAgo).length;
    
    // Calculate average mood from recent journal entries
    const recentMoods = journalEntries.slice(0, 7);
    const moodScores: Record<string, number> = { excellent: 5, good: 4, fair: 3, poor: 2, bad: 1 };
    const avgMoodScore = recentMoods.length > 0 
      ? recentMoods.reduce((sum, e) => sum + (moodScores[e.mood] || 3), 0) / recentMoods.length
      : 3;
    
    let avgMoodText = 'Fair';
    if (avgMoodScore >= 4.5) avgMoodText = 'Excellent';
    else if (avgMoodScore >= 3.5) avgMoodText = 'Good';
    else if (avgMoodScore >= 2.5) avgMoodText = 'Fair';
    else if (avgMoodScore >= 1.5) avgMoodText = 'Poor';
    else avgMoodText = 'Bad';
    
    return {
      weeklyMetrics,
      weeklyJournalEntries,
      avgMoodText,
      totalMetrics: metrics.length,
      totalJournalEntries: journalEntries.length
    };
  };

  const stats = getOverviewStats();

  // Get latest value for a specific metric type
  const getLatestMetricValue = (type: string) => {
    const metric = metrics.find(m => m.type === type);
    if (!metric) return '--';
    
    if (type === 'blood_pressure' && typeof metric.value === 'object') {
      const bp = metric.value as { systolic: number; diastolic: number };
      return `${bp.systolic}/${bp.diastolic}`;
    }
    return metric.value;
  };

  const quickMetrics = [
    {
      name: 'Blood Pressure',
      value: getLatestMetricValue('blood_pressure'),
      unit: 'mmHg',
      trend: 'stable',
      icon: HeartIcon,
      color: 'text-medical-600',
      bgColor: 'bg-medical-50 dark:bg-medical-900',
    },
    {
      name: 'Weight',
      value: getLatestMetricValue('weight'),
      unit: 'lbs',
      trend: 'stable',
      icon: ScaleIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 dark:bg-primary-900',
    },
    {
      name: 'Blood Sugar',
      value: getLatestMetricValue('blood_sugar'),
      unit: 'mg/dL',
      trend: 'stable',
      icon: BeakerIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900',
    },
    {
      name: 'Recent Entries',
      value: stats.weeklyJournalEntries,
      unit: 'this week',
      trend: 'up',
      icon: FaceSmileIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
    },
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

  const getEntryTypeColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'good': return 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300';
      case 'fair': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'poor': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'bad': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      await deleteJournalEntry(id);
    }
  };

  const handleDeleteMetric = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this health metric?')) {
      await deleteMetric(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Journal</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track your vitals, symptoms, and overall wellness</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => activeTab === 'journal' ? setIsAddJournalModalOpen(true) : setIsAddMetricModalOpen(true)}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {activeTab === 'journal' ? 'Add Journal Entry' : 'Add Health Metric'}
        </motion.button>
      </div>

      {/* Loading State */}
      {isLoading && metrics.length === 0 && journalEntries.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Quick Metrics */}
      {!isLoading && (
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
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.name}</p>
                    <div className="flex items-center">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {typeof metric.value === 'object' ? JSON.stringify(metric.value) : metric.value}{' '}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
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
      )}

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
            Overview
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Health Metrics
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journal'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Journal Entries
          </button>
        </nav>
      </div>

      {/* Overview Tab - Recent Activity */}
      {activeTab === 'log' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Metrics</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalMetrics}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.weeklyMetrics} added this week
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Journal Entries</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalJournalEntries}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.weeklyJournalEntries} added this week
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Mood</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.avgMoodText}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on recent entries
              </p>
            </div>
          </div>

          {/* Recent Activity Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {metrics.length + journalEntries.length} total entries
            </p>
          </div>

          {/* Combined Recent Entries */}
          {metrics.length === 0 && journalEntries.length === 0 ? (
            <div className="card text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No entries yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start tracking your health by adding metrics or journal entries.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show recent metrics */}
              {metrics.slice(0, 5).map((metric: any, index: number) => (
                <motion.div
                  key={`metric-${metric._id || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="badge bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          📊 Health Metric
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(new Date(metric.timestamp))}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                            {metric.type.replace(/_/g, ' ')}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {typeof metric.value === 'object' 
                              ? `${(metric.value as any).systolic}/${(metric.value as any).diastolic}` 
                              : metric.value} {metric.unit}
                          </p>
                        </div>
                      </div>

                      {metric.notes && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200">{metric.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteMetric(metric._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete metric"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Show recent journal entries */}
              {journalEntries.slice(0, 5).map((entry: any, index: number) => (
                <motion.div
                  key={`journal-${entry._id || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index + 5) * 0.05 }}
                  className="card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`badge ${getEntryTypeColor(entry.mood)}`}>
                          📝 Journal - {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(new Date(entry.date))}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        {entry.symptoms && entry.symptoms.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Symptoms:</p>
                            <div className="flex flex-wrap gap-1">
                              {entry.symptoms.map((symptom: string, i: number) => (
                                <span key={i} className="badge badge-warning">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {entry.activities && entry.activities.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Activities:</p>
                            <div className="flex flex-wrap gap-1">
                              {entry.activities.map((activity: string, i: number) => (
                                <span key={i} className="badge badge-info">
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {entry.notes && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <p className="text-sm text-purple-800 dark:text-purple-200">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteJournal(entry._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete journal entry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Health Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          {metrics.length === 0 ? (
            <div className="card text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No health metrics yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start tracking your health by adding your first metric.
              </p>
              <button 
                onClick={() => setIsAddMetricModalOpen(true)}
                className="btn-primary mt-4"
              >
                <PlusIcon className="h-5 w-5 inline mr-2" />
                Add Health Metric
              </button>
            </div>
          ) : (
            <>
              {metrics.map((metric: any, index: number) => (
                <motion.div
                  key={metric._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="badge bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {metric.type.replace(/_/g, ' ').split(' ').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(new Date(metric.timestamp))}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Value</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">
                            {typeof metric.value === 'object' 
                              ? `${(metric.value as any).systolic}/${(metric.value as any).diastolic}` 
                              : metric.value}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{metric.unit}</p>
                        </div>
                      </div>

                      {metric.notes && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Notes:</strong> {metric.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteMetric(metric._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete metric"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Journal Entries Tab */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          {journalEntries.length === 0 ? (
            <div className="card text-center py-12">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No journal entries yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start documenting your health journey with your first entry.
              </p>
              <button 
                onClick={() => setIsAddJournalModalOpen(true)}
                className="btn-primary mt-4"
              >
                <PlusIcon className="h-5 w-5 inline mr-2" />
                Add Journal Entry
              </button>
            </div>
          ) : (
            <>
              {journalEntries.map((entry: any, index: number) => (
                <motion.div
                  key={entry._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`badge ${getEntryTypeColor(entry.mood)}`}>
                          Mood: {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(new Date(entry.date))}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-3">
                        {entry.symptoms && entry.symptoms.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Symptoms:</p>
                            <div className="flex flex-wrap gap-2">
                              {entry.symptoms.map((symptom: string, i: number) => (
                                <span key={i} className="badge badge-warning">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.activities && entry.activities.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Activities:</p>
                            <div className="flex flex-wrap gap-2">
                              {entry.activities.map((activity: string, i: number) => (
                                <span key={i} className="badge badge-info">
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {entry.notes && (
                        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            <strong>Notes:</strong> {entry.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteJournal(entry._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete journal entry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {isAddMetricModalOpen && (
        <AddHealthMetricModal
          isOpen={isAddMetricModalOpen}
          onClose={() => setIsAddMetricModalOpen(false)}
        />
      )}
      {isAddJournalModalOpen && (
        <AddJournalEntryModal
          isOpen={isAddJournalModalOpen}
          onClose={() => setIsAddJournalModalOpen(false)}
        />
      )}
    </div>
  );
};

export default HealthJournal;