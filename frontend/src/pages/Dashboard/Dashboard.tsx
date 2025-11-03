import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellIcon,
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { TrophyIcon, FireIcon } from '@heroicons/react/24/solid';
import GamificationSection from '../../components/Gamification/GamificationSection';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthMetrics } from '../../contexts/HealthMetricsContext';
import AddHealthMetricModal from '../../components/Modal/AddHealthMetricModal';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { metrics, fetchMetrics, fetchJournalEntries } = useHealthMetrics();
  const [isAddMetricModalOpen, setIsAddMetricModalOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch recent metrics and journal entries
    fetchMetrics({ limit: 10 });
    fetchJournalEntries({ limit: 5 });
  }, [fetchMetrics, fetchJournalEntries]);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Mock data - In a real app, this would come from state management or API
  const todayReminders = [
    { id: '1', medication: 'Lisinopril', time: '8:00 AM', status: 'taken' },
    { id: '2', medication: 'Metformin', time: '12:00 PM', status: 'upcoming' },
    { id: '3', medication: 'Vitamin D', time: '6:00 PM', status: 'upcoming' },
  ];

  const adherenceRate = 94;
  const currentStreak = 12;
  const achievements = 3;

  const quickStats = [
    {
      name: 'Today\'s Adherence',
      value: '3/3',
      icon: CheckCircleIcon,
      color: 'text-medical-600',
      bgColor: 'bg-medical-50',
    },
    {
      name: 'Current Streak',
      value: `${currentStreak} days`,
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      name: 'This Week',
      value: `${adherenceRate}%`,
      icon: ChartBarIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'Achievements',
      value: achievements,
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const upcomingRefills = [
    { medication: 'Metformin', daysLeft: 3 },
    { medication: 'Lisinopril', daysLeft: 7 },
  ];

  // Get latest health metrics for display
  const latestMetrics = metrics.slice(0, 3).map(metric => {
    let displayValue = '';
    let displayName = '';
    
    switch (metric.type) {
      case 'blood_pressure':
        const bp = metric.value as { systolic: number; diastolic: number };
        displayValue = `${bp.systolic}/${bp.diastolic}`;
        displayName = 'Blood Pressure';
        break;
      case 'heart_rate':
        displayValue = `${metric.value} ${metric.unit}`;
        displayName = 'Heart Rate';
        break;
      case 'weight':
        displayValue = `${metric.value} ${metric.unit}`;
        displayName = 'Weight';
        break;
      case 'blood_sugar':
        displayValue = `${metric.value} ${metric.unit}`;
        displayName = 'Blood Sugar';
        break;
      case 'temperature':
        displayValue = `${metric.value} ${metric.unit}`;
        displayName = 'Temperature';
        break;
      default:
        displayValue = `${metric.value} ${metric.unit}`;
        displayName = metric.type.replace('_', ' ');
    }
    
    return {
      name: displayName,
      value: displayValue,
      trend: 'stable',
      color: 'text-medical-600',
      date: new Date(metric.timestamp).toLocaleDateString(),
    };
  });

  const healthMetrics = latestMetrics.length > 0 ? latestMetrics : [
    { name: 'No metrics yet', value: '--', trend: 'Add your first metric', color: 'text-gray-400', date: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.firstName || 'User'}!
            </h1>
            <p className="text-primary-100 mt-1">
              You have 2 medications scheduled for today
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-white/20 rounded-full p-3">
              <HeartIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Reminders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Reminders</h3>
            <BellIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {todayReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  reminder.status === 'taken'
                    ? 'bg-medical-50 border-medical-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-3 ${
                      reminder.status === 'taken' ? 'bg-medical-500' : 'bg-yellow-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{reminder.medication}</p>
                    <p className="text-sm text-gray-500">{reminder.time}</p>
                  </div>
                </div>
                {reminder.status === 'taken' ? (
                  <CheckCircleIcon className="h-5 w-5 text-medical-500" />
                ) : (
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Refill Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Refill Alerts</h3>
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {upcomingRefills.map((refill, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{refill.medication}</p>
                  <p className="text-sm text-gray-600">
                    {refill.daysLeft} days remaining
                  </p>
                </div>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Order Refill
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Health Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Health Metrics</h3>
          <HeartIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {healthMetrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-lg bg-gray-50 border border-gray-200"
            >
              <p className="text-sm font-medium text-gray-500">{metric.name}</p>
              <p className={`text-xl font-bold ${metric.color} mt-1`}>{metric.value}</p>
              <p className="text-xs text-gray-400 mt-1 capitalize">{metric.trend}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <button onClick={() => navigate('/medications')} className="btn-primary text-center py-4">
          <PlusIcon className="h-5 w-5 inline mr-2" />
          Add Medication
        </button>
        <button onClick={() => setIsAddMetricModalOpen(true)} className="btn-secondary text-center py-4">
          <HeartIcon className="h-5 w-5 inline mr-2" />
          Log Health Metric
        </button>
        <button onClick={() => navigate('/analytics')} className="btn-secondary text-center py-4">
          <ChartBarIcon className="h-5 w-5 inline mr-2" />
          View Analytics
        </button>
        <button onClick={() => navigate('/profile')} className="btn-secondary text-center py-4">
          <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
          Emergency Contact
        </button>
      </motion.div>

      {/* Gamification Section */}
      <GamificationSection />
      
      {/* Add Health Metric Modal */}
      <AddHealthMetricModal 
        isOpen={isAddMetricModalOpen}
        onClose={() => setIsAddMetricModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;