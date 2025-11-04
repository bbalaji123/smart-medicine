import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import { CreateCareRecipientData } from '../../services/careRecipients';

interface AddCareRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateCareRecipientData) => Promise<void>;
}

const RELATIONSHIPS = [
  'Parent',
  'Grandparent',
  'Spouse',
  'Child',
  'Sibling',
  'Friend',
  'Other Relative',
  'Other',
];

const AddCareRecipientModal: React.FC<AddCareRecipientModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreateCareRecipientData>({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    medicalConditions: [],
    allergies: [],
    currentMedications: [],
    primaryPhysician: {
      name: '',
      phone: '',
      clinic: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    notes: '',
    permissions: {
      viewMedications: true,
      editReminders: false,
      viewAdherence: true,
      viewHealthMetrics: true,
      emergencyAccess: true,
      manageProfile: false,
    },
  });

  // Temporary input states
  const [medicalConditionInput, setMedicalConditionInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState({ name: '', dosage: '', frequency: '' });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof CreateCareRecipientData] as any),
        [field]: value,
      },
    }));
  };

  const addMedicalCondition = () => {
    if (medicalConditionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalConditions: [...(prev.medicalConditions || []), medicalConditionInput.trim()],
      }));
      setMedicalConditionInput('');
    }
  };

  const removeMedicalCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions?.filter((_, i) => i !== index),
    }));
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergyInput.trim()],
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index),
    }));
  };

  const addMedication = () => {
    if (medicationInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...(prev.currentMedications || []), medicationInput],
      }));
      setMedicationInput({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.relationship) {
      alert('Please fill in the required fields (Name and Relationship)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      handleClose();
    } catch (error) {
      console.error('Error adding care recipient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      relationship: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
      medicalConditions: [],
      allergies: [],
      currentMedications: [],
      primaryPhysician: { name: '', phone: '', clinic: '' },
      emergencyContact: { name: '', phone: '', relationship: '' },
      notes: '',
      permissions: {
        viewMedications: true,
        editReminders: false,
        viewAdherence: true,
        viewHealthMetrics: true,
        emergencyAccess: true,
        manageProfile: false,
      },
    });
    setCurrentStep(1);
    setMedicalConditionInput('');
    setAllergyInput('');
    setMedicationInput({ name: '', dosage: '', frequency: '' });
    onClose();
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-3xl">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Add Care Recipient</h3>
            <p className="text-sm text-gray-500 mt-1">Step {currentStep} of 4</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 flex space-x-2">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-900 flex items-center mb-4">
                <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
                Basic Information
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleInputChange('relationship', e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIPS.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <PhoneIcon className="h-4 w-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="input"
                />
              </div>

              <div className="pt-4">
                <h5 className="font-medium text-gray-900 flex items-center mb-3">
                  <MapPinIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Address (Optional)
                </h5>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.address?.street}
                    onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                    className="input"
                    placeholder="Street Address"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.address?.city}
                      onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                      className="input"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={formData.address?.state}
                      onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                      className="input"
                      placeholder="State"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.address?.zipCode}
                      onChange={(e) => handleNestedInputChange('address', 'zipCode', e.target.value)}
                      className="input"
                      placeholder="ZIP Code"
                    />
                    <input
                      type="text"
                      value={formData.address?.country}
                      onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                      className="input"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Medical Information */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h4 className="font-medium text-gray-900 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-primary-600" />
                Medical Information
              </h4>

              {/* Medical Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={medicalConditionInput}
                    onChange={(e) => setMedicalConditionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicalCondition())}
                    className="input flex-1"
                    placeholder="Add condition and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addMedicalCondition}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalConditions?.map((condition, index) => (
                    <span
                      key={index}
                      className="badge bg-blue-100 text-blue-800 flex items-center gap-1"
                    >
                      {condition}
                      <button onClick={() => removeMedicalCondition(index)}>
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ExclamationTriangleIcon className="h-4 w-4 inline mr-1 text-danger-500" />
                  Allergies
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    className="input flex-1"
                    placeholder="Add allergy and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies?.map((allergy, index) => (
                    <span
                      key={index}
                      className="badge bg-danger-100 text-danger-800 flex items-center gap-1"
                    >
                      {allergy}
                      <button onClick={() => removeAllergy(index)}>
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medications
                </label>
                <div className="space-y-2 mb-2">
                  <input
                    type="text"
                    value={medicationInput.name}
                    onChange={(e) => setMedicationInput(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Medication name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={medicationInput.dosage}
                      onChange={(e) => setMedicationInput(prev => ({ ...prev, dosage: e.target.value }))}
                      className="input"
                      placeholder="Dosage (e.g., 10mg)"
                    />
                    <input
                      type="text"
                      value={medicationInput.frequency}
                      onChange={(e) => setMedicationInput(prev => ({ ...prev, frequency: e.target.value }))}
                      className="input"
                      placeholder="Frequency (e.g., Once daily)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="btn-secondary w-full"
                  >
                    Add Medication
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.currentMedications?.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} • {med.frequency}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMedication(index)}
                        className="text-danger-600 hover:text-danger-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contacts */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h4 className="font-medium text-gray-900 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-primary-600" />
                Contact Information
              </h4>

              {/* Primary Physician */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h5 className="font-medium text-gray-900">Primary Physician</h5>
                <input
                  type="text"
                  value={formData.primaryPhysician?.name}
                  onChange={(e) => handleNestedInputChange('primaryPhysician', 'name', e.target.value)}
                  className="input"
                  placeholder="Doctor's name"
                />
                <input
                  type="tel"
                  value={formData.primaryPhysician?.phone}
                  onChange={(e) => handleNestedInputChange('primaryPhysician', 'phone', e.target.value)}
                  className="input"
                  placeholder="Phone number"
                />
                <input
                  type="text"
                  value={formData.primaryPhysician?.clinic}
                  onChange={(e) => handleNestedInputChange('primaryPhysician', 'clinic', e.target.value)}
                  className="input"
                  placeholder="Clinic/Hospital name"
                />
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-danger-50 rounded-lg space-y-3">
                <h5 className="font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-danger-600" />
                  Emergency Contact
                </h5>
                <input
                  type="text"
                  value={formData.emergencyContact?.name}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                  className="input"
                  placeholder="Contact name"
                />
                <input
                  type="tel"
                  value={formData.emergencyContact?.phone}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                  className="input"
                  placeholder="Phone number"
                />
                <input
                  type="text"
                  value={formData.emergencyContact?.relationship}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                  className="input"
                  placeholder="Relationship"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="input"
                  rows={4}
                  maxLength={1000}
                  placeholder="Any additional information..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.notes?.length || 0}/1000 characters
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Permissions */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-900 flex items-center mb-4">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-primary-600" />
                Access Permissions
              </h4>

              <p className="text-sm text-gray-600 mb-4">
                Choose what information and actions this care recipient can access.
              </p>

              <div className="space-y-3">
                {[
                  { key: 'viewMedications', label: 'View Medications', description: 'Allow viewing medication list' },
                  { key: 'editReminders', label: 'Edit Reminders', description: 'Allow editing medication reminders' },
                  { key: 'viewAdherence', label: 'View Adherence', description: 'Allow viewing adherence statistics' },
                  { key: 'viewHealthMetrics', label: 'View Health Metrics', description: 'Allow viewing health data' },
                  { key: 'emergencyAccess', label: 'Emergency Access', description: 'Allow access in emergencies' },
                  { key: 'manageProfile', label: 'Manage Profile', description: 'Allow editing profile information' },
                ].map(permission => (
                  <label
                    key={permission.key}
                    className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions?.[permission.key as keyof typeof formData.permissions]}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions!,
                            [permission.key]: e.target.checked,
                          },
                        }))
                      }
                      className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{permission.label}</p>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="btn-secondary"
            >
              Previous
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Care Recipient'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddCareRecipientModal;
