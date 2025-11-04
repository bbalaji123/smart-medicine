import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  PlusIcon,
  HeartIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useCareRecipients } from '../../contexts/CareRecipientsContext';
import AddCareRecipientModal from '../../components/Modal/AddCareRecipientModal';

interface CareRecipientDisplay {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
  adherenceRate: number;
  lastActivity: Date;
  medicationCount: number;
  recentAlerts: number;
  status: 'good' | 'warning' | 'critical';
}

const CaregiverDashboard: React.FC = () => {
  const { careRecipients, loading, addCareRecipient } = useCareRecipients();
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Transform API data to display format with mock stats (in production, these would come from backend)
  const displayRecipients: CareRecipientDisplay[] = careRecipients.map(recipient => {
    // Calculate age if dateOfBirth is available
    const age = recipient.age || (recipient.dateOfBirth 
      ? new Date().getFullYear() - new Date(recipient.dateOfBirth).getFullYear()
      : null);
    
    // Mock data for adherence, last activity, and alerts (replace with real data from backend)
    const adherenceRate = Math.floor(Math.random() * 40) + 60; // Random 60-100%
    const daysAgo = Math.floor(Math.random() * 5); // Random 0-5 days
    const lastActivity = new Date();
    lastActivity.setDate(lastActivity.getDate() - daysAgo);
    
    const medicationCount = recipient.currentMedications?.length || 0;
    const recentAlerts = adherenceRate < 70 ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2);
    
    let status: 'good' | 'warning' | 'critical';
    if (adherenceRate >= 85) status = 'good';
    else if (adherenceRate >= 70) status = 'warning';
    else status = 'critical';

    return {
      id: recipient._id,
      name: `${recipient.name}${age ? ` (${age})` : ''}`,
      relationship: recipient.relationship,
      adherenceRate,
      lastActivity,
      medicationCount,
      recentAlerts,
      status,
    };
  });

  // Mock recent alerts (in production, these would come from backend)
  const recentAlerts = displayRecipients
    .filter(r => r.recentAlerts > 0)
    .slice(0, 3)
    .map((recipient, index) => ({
      id: `${recipient.id}-${index}`,
      recipientName: recipient.name,
      type: index === 0 ? 'missed_dose' : index === 1 ? 'no_activity' : 'refill_needed',
      medication: recipient.medicationCount > 0 ? 'Medication' : 'Multiple medications',
      time: `${Math.floor(Math.random() * 24)} hours ago`,
      severity: recipient.status === 'critical' ? 'high' : recipient.status === 'warning' ? 'medium' : 'low',
    }));

  const handleAddCareRecipient = async (data: any) => {
    await addCareRecipient(data);
    setIsAddModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-medical-100 text-medical-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'missed_dose':
        return <ClockIcon className="h-5 w-5" />;
      case 'no_activity':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'refill_needed':
        return <BellIcon className="h-5 w-5" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caregiver Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor and support your loved ones' medication adherence</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Care Recipient
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 p-3 rounded-lg">
              <UsersIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Care Recipients</p>
              <p className="text-2xl font-bold text-gray-900">{displayRecipients.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-medical-100 p-3 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-medical-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Adherence</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayRecipients.length > 0
                  ? Math.round(displayRecipients.reduce((acc, r) => acc + r.adherenceRate, 0) / displayRecipients.length)
                  : 0}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{recentAlerts.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
              <HeartIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Medications</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayRecipients.reduce((acc, r) => acc + r.medicationCount, 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Care Recipients */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Recipients</h3>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : displayRecipients.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No care recipients yet</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary mt-4 inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Care Recipient
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {displayRecipients.map((recipient) => (
              <div
                key={recipient.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRecipient === recipient.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedRecipient(recipient.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {recipient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{recipient.name}</h4>
                      <p className="text-sm text-gray-500">{recipient.relationship}</p>
                      <p className="text-xs text-gray-400">
                        Last active: {formatLastActivity(recipient.lastActivity)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${getStatusColor(recipient.status)}`}>
                      {recipient.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {recipient.adherenceRate}% adherence
                    </p>
                    <p className="text-xs text-gray-500">
                      {recipient.medicationCount} medications
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <PhoneIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <EnvelopeIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {recipient.recentAlerts > 0 && (
                    <span className="text-xs bg-danger-100 text-danger-800 px-2 py-1 rounded-full">
                      {recipient.recentAlerts} alert{recipient.recentAlerts > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-sm text-gray-600">{alert.recipientName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.medication} • {alert.time}
                        </p>
                      </div>
                      <button className="text-xs text-gray-500 hover:text-gray-700">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed View */}
      {selectedRecipient && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {displayRecipients.find(r => r.id === selectedRecipient)?.name} - Detailed View
            </h3>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm inline-flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Analytics
              </button>
              <button className="btn-primary text-sm">
                Send Message
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Today's Schedule</h4>
              <p className="text-sm text-gray-600">3 medications due</p>
              <p className="text-xs text-gray-500">2 taken, 1 pending</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">This Week</h4>
              <p className="text-sm text-gray-600">
                {displayRecipients.find(r => r.id === selectedRecipient)?.adherenceRate}% adherence
              </p>
              <p className="text-xs text-gray-500">Above average</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Last Contact</h4>
              <p className="text-sm text-gray-600">
                {formatLastActivity(displayRecipients.find(r => r.id === selectedRecipient)?.lastActivity || new Date())}
              </p>
              <p className="text-xs text-gray-500">App activity</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Care Recipient Modal */}
      <AddCareRecipientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCareRecipient}
      />
    </div>
  );
};

export default CaregiverDashboard;