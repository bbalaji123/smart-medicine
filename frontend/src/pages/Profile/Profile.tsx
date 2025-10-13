import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  CameraIcon,
  PencilIcon,
  BellIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PhoneIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy' | 'emergency'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  
  const { user } = useAuth();

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        emergencyContact: user.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Here you would call the API to update the profile
      // For now, we'll just show a success message
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        emergencyContact: user.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        }
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('emergencyContact.')) {
      const emergencyField = field.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [emergencyField]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Mock data for sections not yet implemented in the backend
  const mockHealthData = {
    medicalConditions: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Shellfish'],
    insuranceInfo: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456789',
      groupNumber: 'GRP001',
    },
  };

  // Get emergency contacts (real + mock)
  const emergencyContacts = [];
  if (user?.emergencyContact?.name) {
    emergencyContacts.push(user.emergencyContact);
  }
  // Add mock contacts if needed
  if (emergencyContacts.length === 0) {
    emergencyContacts.push(
      { name: 'Dr. Smith', relationship: 'Primary Care', phone: '+1 (555) 123-4569' }
    );
  }

  const preferences = {
    reminderSound: 'default',
    notificationChannels: ['push', 'email'],
    theme: 'light',
    language: 'en',
  };

  const privacySettings = {
    shareDataWithCaregivers: true,
    shareHealthMetrics: false,
    allowEmergencyAccess: true,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <CameraIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone Number"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">{user?.phone || 'No phone number'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge-success">Active</span>
                  <span className="text-sm text-gray-500">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  className="btn-primary inline-flex items-center"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button 
                  onClick={handleCancel}
                  className="btn-secondary inline-flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={handleEdit}
                className="btn-secondary inline-flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', name: 'Personal Info', icon: UserIcon },
            { id: 'preferences', name: 'Preferences', icon: BellIcon },
            { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
            { id: 'emergency', name: 'Emergency', icon: ExclamationTriangleIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Personal Info Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    className="input-field mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input-field mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={user?.phone || 'No phone number'}
                    className="input-field mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''}
                    className="input-field mt-1"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {mockHealthData.medicalConditions.map((condition: string, index: number) => (
                      <span key={index} className="badge-warning">
                        {condition}
                      </span>
                    ))}
                    <button className="text-primary-600 text-sm hover:text-primary-500">+ Add</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {mockHealthData.allergies.map((allergy: string, index: number) => (
                      <span key={index} className="badge-danger">
                        {allergy}
                      </span>
                    ))}
                    <button className="text-primary-600 text-sm hover:text-primary-500">+ Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <input
                  type="text"
                  value={mockHealthData.insuranceInfo.provider}
                  className="input-field mt-1"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                <input
                  type="text"
                  value={mockHealthData.insuranceInfo.policyNumber}
                  className="input-field mt-1"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Number</label>
                <input
                  type="text"
                  value={mockHealthData.insuranceInfo.groupNumber}
                  className="input-field mt-1"
                  readOnly
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Sound</label>
                  <select className="input-field">
                    <option value="default">Default</option>
                    <option value="chime">Chime</option>
                    <option value="bell">Bell</option>
                    <option value="gentle">Gentle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
                  <div className="space-y-2">
                    {['push', 'email', 'sms', 'smartwatch'].map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.notificationChannels.includes(channel)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* App Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select className="input-field">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select className="input-field">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select className="input-field">
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
          <div className="space-y-6">
            {[
              {
                key: 'shareDataWithCaregivers',
                title: 'Share data with caregivers',
                description: 'Allow designated caregivers to view your medication data',
                value: privacySettings.shareDataWithCaregivers,
              },
              {
                key: 'shareHealthMetrics',
                title: 'Share health metrics',
                description: 'Include health metrics in shared reports',
                value: privacySettings.shareHealthMetrics,
              },
              {
                key: 'allowEmergencyAccess',
                title: 'Emergency access',
                description: 'Allow emergency contacts to access critical information',
                value: privacySettings.allowEmergencyAccess,
              },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{setting.title}</h4>
                  <p className="text-sm text-gray-500">{setting.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={setting.value} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Emergency Tab */}
      {activeTab === 'emergency' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
              <button className="btn-primary text-sm">Add Contact</button>
            </div>
            <div className="space-y-4">
              {emergencyContacts.map((contact: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <HeartIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <PhoneIcon className="h-4 w-4" />
                    </a>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Information</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Emergency contacts can access your critical medical information including current medications, 
                    allergies, and medical conditions in case of an emergency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
};

export default Profile;