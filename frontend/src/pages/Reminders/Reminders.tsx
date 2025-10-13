import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  BellIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  SpeakerWaveIcon,
  MoonIcon,
  SunIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface ReminderSchedule {
  id: string;
  medicationName: string;
  time: string;
  days: string[];
  timezone: string;
  channels: string[];
  isActive: boolean;
  snoozeEnabled: boolean;
  skipEnabled: boolean;
}

const Reminders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'history'>('scheduled');

  // Mock data
  const reminderSchedules: ReminderSchedule[] = [
    {
      id: '1',
      medicationName: 'Lisinopril',
      time: '08:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      timezone: 'America/New_York',
      channels: ['push', 'email'],
      isActive: true,
      snoozeEnabled: true,
      skipEnabled: false,
    },
    {
      id: '2',
      medicationName: 'Metformin',
      time: '12:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      timezone: 'America/New_York',
      channels: ['push', 'sms'],
      isActive: true,
      snoozeEnabled: true,
      skipEnabled: true,
    },
    {
      id: '3',
      medicationName: 'Metformin',
      time: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      timezone: 'America/New_York',
      channels: ['push'],
      isActive: true,
      snoozeEnabled: false,
      skipEnabled: true,
    },
  ];

  const todaysReminders = [
    { time: '08:00', medication: 'Lisinopril', status: 'taken', takenAt: '08:05' },
    { time: '12:00', medication: 'Metformin', status: 'upcoming', takenAt: null },
    { time: '20:00', medication: 'Metformin', status: 'upcoming', takenAt: null },
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push':
        return <BellIcon className="h-4 w-4" />;
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'sms':
        return <DevicePhoneMobileIcon className="h-4 w-4" />;
      case 'smartwatch':
        return <SpeakerWaveIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'push':
        return 'bg-primary-100 text-primary-700';
      case 'email':
        return 'bg-blue-100 text-blue-700';
      case 'sms':
        return 'bg-medical-100 text-medical-700';
      case 'smartwatch':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="mt-2 text-gray-600">Manage your medication reminder schedules</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Reminder
        </motion.button>
      </div>

      {/* Today's Schedule Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Today's Schedule</h2>
          <CalendarIcon className="h-6 w-6 text-primary-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {todaysReminders.map((reminder, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                reminder.status === 'taken'
                  ? 'bg-white/20 border border-white/30'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium">{reminder.time}</span>
                {reminder.status === 'taken' && (
                  <CheckCircleIcon className="h-5 w-5 text-medical-300" />
                )}
              </div>
              <p className="text-primary-100 text-sm">{reminder.medication}</p>
              {reminder.status === 'taken' && (
                <p className="text-xs text-primary-200 mt-1">Taken at {reminder.takenAt}</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scheduled'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scheduled Reminders
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reminder History
          </button>
        </nav>
      </div>

      {/* Scheduled Reminders */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          {reminderSchedules.map((schedule, index) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schedule.medicationName}
                    </h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.isActive 
                        ? 'bg-medical-100 text-medical-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Time and Days */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-xl font-bold text-primary-600">{schedule.time}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {schedule.days.map((day) => (
                          <span
                            key={day}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Timezone and Channels */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{schedule.timezone}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {schedule.channels.map((channel) => (
                          <span
                            key={channel}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getChannelColor(channel)}`}
                          >
                            {getChannelIcon(channel)}
                            {channel.charAt(0).toUpperCase() + channel.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MoonIcon className="h-4 w-4" />
                      <span>Snooze: {schedule.snoozeEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SunIcon className="h-4 w-4" />
                      <span>Skip: {schedule.skipEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    {schedule.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reminder History */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
        >
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reminder history</h3>
            <p className="mt-1 text-sm text-gray-500">
              Reminder history will appear here once you start taking medications.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reminders;