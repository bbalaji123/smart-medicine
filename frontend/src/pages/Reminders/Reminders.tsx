import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellIcon,
  ClockIcon,
  CalendarIcon,
  BellAlertIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, BellAlertIcon as BellAlertSolidIcon, BeakerIcon as PillIcon } from '@heroicons/react/24/solid';
import { useMedications } from '../../contexts/MedicationsContext';
import toast from 'react-hot-toast';

interface ReminderSchedule {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  times: string[];
  isActive: boolean;
}

interface ReminderNotification {
  id: string;
  medicationName: string;
  dosage: string;
  time: string;
  scheduledTime: Date;
}

const Reminders: React.FC = () => {
  const { medications, markDoseTaken, markDoseSkipped } = useMedications();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [activeReminders, setActiveReminders] = useState<ReminderNotification[]>([]);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Debug: Log medications when they change
  useEffect(() => {
    console.log('Reminders - medications updated:', medications.length);
  }, [medications]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      setShowNotificationPrompt(false);
      if (permission === 'granted') {
        toast.success('Notifications enabled! You will receive medication reminders.');
      } else {
        toast.error('Notifications denied. You won\'t receive reminder alerts.');
      }
    }
  };

  // Convert medications to reminder schedules
  const reminderSchedules: ReminderSchedule[] = useMemo(() => {
    if (!medications || !Array.isArray(medications)) {
      console.log('Reminders - medications is not an array:', medications);
      return [];
    }
    
    return medications
      .filter(med => med.isActive && med.schedule && med.schedule.length > 0)
      .map(med => ({
        id: med._id,
        medicationId: med._id,
        medicationName: med.name,
        dosage: `${med.dosage.amount} ${med.dosage.unit}`,
        times: med.schedule.map(s => s.time),
        isActive: med.isActive,
      }));
  }, [medications]);

  // Get today's reminders
  const todaysReminders = useMemo(() => {
    if (!medications || !Array.isArray(medications)) {
      return [];
    }
    
    return medications.flatMap(med => 
      (med.schedule || []).map((scheduleItem, index) => {
        const [hours, minutes] = scheduleItem.time.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const now = new Date();
        
        let status: 'upcoming' | 'taken' | 'missed' | 'skipped' = 'upcoming';
        if (scheduleItem.taken) {
          status = 'taken';
        } else if (scheduleItem.skipped) {
          status = 'skipped';
        } else if (now > scheduledTime) {
          status = 'missed';
        }

        return {
          medicationId: med._id,
          scheduleIndex: index,
          medication: med.name,
          dosage: `${med.dosage.amount} ${med.dosage.unit}`,
          time: scheduleItem.time,
          status,
          takenAt: scheduleItem.takenAt 
            ? new Date(scheduleItem.takenAt).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit'
              }) 
            : undefined,
        };
      })
    ).sort((a, b) => a.time.localeCompare(b.time));
  }, [medications]);

  // Handle taking a dose
  const handleTakeDose = useCallback(async (medicationId: string, scheduleIndex: number) => {
    try {
      await markDoseTaken(medicationId, scheduleIndex);
      // Remove from active reminders
      setActiveReminders(prev => prev.filter(r => r.id !== `${medicationId}-${scheduleIndex}`));
      toast.success('Dose marked as taken!');
    } catch (error) {
      toast.error('Failed to mark dose as taken');
    }
  }, [markDoseTaken]);

  // Handle skipping a dose
  const handleSkipDose = useCallback(async (medicationId: string, scheduleIndex: number, reason?: string) => {
    try {
      await markDoseSkipped(medicationId, scheduleIndex, reason);
      // Remove from active reminders
      setActiveReminders(prev => prev.filter(r => r.id !== `${medicationId}-${scheduleIndex}`));
      toast.success('Dose marked as skipped');
    } catch (error) {
      toast.error('Failed to mark dose as skipped');
    }
  }, [markDoseSkipped]);

  // Dismiss a reminder notification
  const dismissReminder = (reminderId: string) => {
    setActiveReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  // Check for due reminders and show notifications
  useEffect(() => {
    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return;
    }
    
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      medications.forEach(med => {
        if (!med.schedule || !Array.isArray(med.schedule)) {
          return;
        }
        
        med.schedule.forEach((scheduleItem, scheduleIndex) => {
          // Check if this reminder is due now and hasn't been taken
          if (scheduleItem.time === currentTime && !scheduleItem.taken && !scheduleItem.skipped) {
            const reminderId = `${med._id}-${scheduleIndex}`;
            
            // Show browser notification
            if (notificationPermission === 'granted' && 'Notification' in window) {
              const notification = new Notification(`Time to take ${med.name}`, {
                body: `Take ${med.dosage.amount} ${med.dosage.unit} now`,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: reminderId,
                requireInteraction: true,
              });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            }
            
            // Add to active reminders
            setActiveReminders(prev => {
              const exists = prev.find(r => r.id === reminderId);
              if (!exists) {
                const [hours, minutes] = scheduleItem.time.split(':');
                const scheduledTime = new Date();
                scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                return [...prev, {
                  id: reminderId,
                  medicationName: med.name,
                  dosage: `${med.dosage.amount} ${med.dosage.unit}`,
                  time: scheduleItem.time,
                  scheduledTime,
                }];
              }
              return prev;
            });
            
            // Show toast notification
            toast((t) => (
              <div className="flex items-center gap-3">
                <BellAlertSolidIcon className="h-6 w-6 text-primary-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{med.name}</p>
                  <p className="text-sm text-gray-600">Take {med.dosage.amount} {med.dosage.unit} now</p>
                </div>
                <button
                  onClick={() => {
                    handleTakeDose(med._id, scheduleIndex);
                    toast.dismiss(t.id);
                  }}
                  className="btn-sm btn-primary"
                >
                  Mark Taken
                </button>
              </div>
            ), {
              duration: 60000, // 1 minute
              position: 'top-center',
              icon: '💊',
            });
          }
        });
      });
    };

    // Check immediately
    checkReminders();
    
    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    
    return () => clearInterval(interval);
  }, [medications, notificationPermission, handleTakeDose]);

  return (
    <div className="space-y-6">
      {/* Active Reminder Notifications */}
      <AnimatePresence>
        {activeReminders.map((reminder) => {
          const scheduleIndex = parseInt(reminder.id.split('-')[1]);
          
          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-4 right-4 z-50 w-96 bg-white rounded-2xl shadow-2xl border-2 border-primary-500 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center animate-pulse">
                    <BellAlertSolidIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Time for {reminder.medicationName}!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Take {reminder.dosage} now • Scheduled for {reminder.time}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTakeDose(reminder.id.split('-')[0], scheduleIndex)}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      <CheckIcon className="h-4 w-4 mr-1 inline" />
                      Mark Taken
                    </button>
                    <button
                      onClick={() => handleSkipDose(reminder.id.split('-')[0], scheduleIndex)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Skip
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => dismissReminder(reminder.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BellAlertIcon className="h-10 w-10 text-white" />
              <div>
                <h3 className="text-lg font-semibold mb-1">Enable Medication Reminders</h3>
                <p className="text-primary-100 text-sm">
                  Get real-time notifications to never miss your medications
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setShowNotificationPrompt(false)}
                className="px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medication Reminders</h1>
          <p className="mt-2 text-gray-600">
            {reminderSchedules.length === 0 
              ? 'Add medications to set up reminders' 
              : `Managing ${reminderSchedules.length} active reminder${reminderSchedules.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {notificationPermission === 'granted' ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-medical-50 text-medical-700 rounded-lg">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Notifications On</span>
            </div>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Enable Alerts</span>
            </button>
          )}
        </div>
      </div>

      {/* Today's Schedule Overview */}
      {todaysReminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Today's Schedule</h2>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary-200" />
              <span className="text-primary-100 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaysReminders.map((reminder, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  reminder.status === 'taken'
                    ? 'bg-white/20 border-2 border-medical-300'
                    : reminder.status === 'skipped'
                    ? 'bg-white/10 border-2 border-yellow-300'
                    : reminder.status === 'missed'
                    ? 'bg-white/10 border-2 border-red-300'
                    : 'bg-white/10 border-2 border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">{reminder.time}</span>
                  {reminder.status === 'taken' && (
                    <CheckCircleIcon className="h-6 w-6 text-medical-300" />
                  )}
                  {reminder.status === 'missed' && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium">
                      Missed
                    </span>
                  )}
                  {reminder.status === 'skipped' && (
                    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-medium">
                      Skipped
                    </span>
                  )}
                </div>
                <p className="text-primary-100 font-medium mb-1">{reminder.medication}</p>
                <p className="text-primary-200 text-xs mb-2">{reminder.dosage}</p>
                {reminder.status === 'taken' && reminder.takenAt && (
                  <p className="text-xs text-medical-200 font-medium">
                    ✓ Taken at {reminder.takenAt}
                  </p>
                )}
                {reminder.status === 'upcoming' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleTakeDose(reminder.medicationId, reminder.scheduleIndex)}
                      className="flex-1 text-xs bg-white/20 hover:bg-white/30 text-white py-1 rounded transition-colors"
                    >
                      Take Now
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Scheduled Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reminderSchedules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full bg-white rounded-2xl shadow-sm p-12 text-center"
          >
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="h-10 w-10 text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reminders Set</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add medications to automatically create reminder schedules and never miss a dose
            </p>
            <button
              onClick={() => window.location.href = '/medications'}
              className="btn-primary inline-flex items-center"
            >
              <BellIcon className="h-5 w-5 mr-2" />
              Add Medications
            </button>
          </motion.div>
        ) : (
          reminderSchedules.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className={`h-2 ${
                reminder.isActive ? 'bg-primary-500' : 'bg-gray-300'
              }`} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      reminder.isActive ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      <PillIcon className={`h-6 w-6 ${
                        reminder.isActive ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{reminder.medicationName}</h3>
                      <p className="text-gray-600">{reminder.dosage}</p>
                    </div>
                  </div>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      reminder.isActive 
                        ? 'bg-medical-100 text-medical-600 hover:bg-medical-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <BellIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">
                      {reminder.times.length} time{reminder.times.length !== 1 ? 's' : ''} per day
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {reminder.times.map((time: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    reminder.isActive ? 'text-medical-600' : 'text-gray-500'
                  }`}>
                    {reminder.isActive ? '● Active' : '○ Disabled'}
                  </span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        reminder.isActive
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      {reminder.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reminder History */}
      {reminderSchedules.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {(medications || [])
              .flatMap(med => 
                (med.schedule || [])
                  .filter(s => s.taken || s.skipped)
                  .map(s => ({
                    medication: med.name,
                    time: s.time,
                    status: s.taken ? 'taken' : 'skipped',
                    takenAt: s.takenAt,
                  }))
              )
              .sort((a, b) => {
                if (!a.takenAt || !b.takenAt) return 0;
                return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
              })
              .slice(0, 5)
              .map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.status === 'taken' 
                        ? 'bg-medical-100 text-medical-600' 
                        : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.status === 'taken' ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <ClockIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.medication}</p>
                      <p className="text-sm text-gray-600">
                        {activity.status === 'taken' ? 'Taken' : 'Skipped'} • Scheduled for {activity.time}
                      </p>
                    </div>
                  </div>
                  {activity.takenAt && (
                    <span className="text-sm text-gray-500">
                      {new Date(activity.takenAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              ))}
            {(medications || []).flatMap(m => (m.schedule || []).filter(s => s.taken || s.skipped)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No activity yet. Start taking your medications to see history here.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reminders;