import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { searchMedications, MedicationSearchResult } from '../../services/medicationSearch';
import toast from 'react-hot-toast';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medicationData: any) => Promise<void>;
}

const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    dosage: {
      amount: '',
      unit: 'mg',
    },
    frequency: 'Once Daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    schedule: [{ time: '08:00', taken: false, skipped: false }],
    instructions: '',
    prescribedBy: {
      name: '',
      contact: '',
    },
    sideEffects: [] as string[],
    interactions: [] as any[],
    refillReminder: {
      enabled: false,
      currentSupply: 30,
      reminderThreshold: 7,
    },
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);

  // Search medications with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchMedications(searchQuery, 8);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search medications');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectMedication = (med: MedicationSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      name: med.brandName,
      genericName: med.genericName,
      sideEffects: med.sideEffects || [],
    }));
    setSearchQuery(med.brandName);
    setShowResults(false);
    setStep(2);
  };

  const handleAddScheduleTime = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { time: '12:00', taken: false, skipped: false },
      ],
    }));
  };

  const handleRemoveScheduleTime = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  const handleScheduleTimeChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newSchedule = [...prev.schedule];
      newSchedule[index] = { ...newSchedule[index], time: value };
      return { ...prev, schedule: newSchedule };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.dosage.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Convert string values to proper types
      const submitData = {
        ...formData,
        dosage: {
          amount: parseFloat(formData.dosage.amount),
          unit: formData.dosage.unit,
        },
        refillReminder: {
          enabled: formData.refillReminder.enabled,
          daysBeforeEmpty: formData.refillReminder.reminderThreshold,
          currentSupply: formData.refillReminder.currentSupply,
        },
      };
      
      await onSubmit(submitData);
      toast.success('Medication added successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add medication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setFormData({
      name: '',
      genericName: '',
      dosage: { amount: '', unit: 'mg' },
      frequency: 'Once Daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      schedule: [{ time: '08:00', taken: false, skipped: false }],
      instructions: '',
      prescribedBy: { name: '', contact: '' },
      sideEffects: [],
      interactions: [],
      refillReminder: { enabled: false, currentSupply: 30, reminderThreshold: 7 },
      isActive: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Add Medication
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Step {step} of 2: {step === 1 ? 'Search Medication' : 'Add Details'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6">
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Medication <span className="text-danger-600">*</span>
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type medication name (e.g., Aspirin, Metformin)..."
                      className="input-field pl-10"
                      autoFocus
                    />
                    {searching && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {showResults && searchResults.length > 0 && (
                    <div className="mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      {searchResults.map((med, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectMedication(med)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {med.brandName}
                              </h4>
                              {med.genericName && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {med.genericName}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {med.manufacturer} • {med.route}
                              </p>
                            </div>
                            <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                              {med.productType.includes('PRESCRIPTION') ? 'Rx' : 'OTC'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showResults && searchResults.length === 0 && !searching && (
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No medications found. You can still enter the name manually.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-primary-800 dark:text-primary-300">
                        Search for your medication or type the name manually to continue.
                        We'll auto-fill available information from our database.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual entry option */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, name: searchQuery }));
                      setStep(2);
                    }}
                    disabled={!searchQuery.trim()}
                    className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue with "{searchQuery || 'medication name'}"
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medication Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Brand Name <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, genericName: e.target.value }))
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Dosage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dosage Amount <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.dosage.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dosage: { ...prev.dosage, amount: e.target.value },
                        }))
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit <span className="text-danger-600">*</span>
                    </label>
                    <select
                      value={formData.dosage.unit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dosage: { ...prev.dosage, unit: e.target.value },
                        }))
                      }
                      className="input-field"
                      required
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="mcg">mcg</option>
                      <option value="ml">ml</option>
                      <option value="units">units</option>
                      <option value="tablets">tablets</option>
                      <option value="capsules">capsules</option>
                    </select>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency <span className="text-danger-600">*</span>
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, frequency: e.target.value }))
                    }
                    className="input-field"
                    required
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three Times Daily">Three Times Daily</option>
                    <option value="Four Times Daily">Four Times Daily</option>
                    <option value="Every 6 Hours">Every 6 Hours</option>
                    <option value="Every 8 Hours">Every 8 Hours</option>
                    <option value="Every 12 Hours">Every 12 Hours</option>
                    <option value="As Needed">As Needed</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                {/* Schedule Times */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Schedule Times
                    </label>
                    <button
                      type="button"
                      onClick={handleAddScheduleTime}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Time
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.schedule.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleScheduleTimeChange(index, e.target.value)}
                          className="input-field flex-1"
                        />
                        {formData.schedule.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveScheduleTime(index)}
                            className="p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, instructions: e.target.value }))
                    }
                    rows={3}
                    className="input-field"
                    placeholder="e.g., Take with food, Avoid alcohol..."
                  />
                </div>

                {/* Prescribed By */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prescribed By
                    </label>
                    <input
                      type="text"
                      value={formData.prescribedBy.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prescribedBy: { ...prev.prescribedBy, name: e.target.value },
                        }))
                      }
                      className="input-field"
                      placeholder="Dr. Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Doctor's Contact
                    </label>
                    <input
                      type="text"
                      value={formData.prescribedBy.contact}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prescribedBy: { ...prev.prescribedBy, contact: e.target.value },
                        }))
                      }
                      className="input-field"
                      placeholder="Phone or email"
                    />
                  </div>
                </div>

                {/* Refill Reminder */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Refill Reminders
                    </label>
                    <input
                      type="checkbox"
                      checked={formData.refillReminder.enabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          refillReminder: {
                            ...prev.refillReminder,
                            enabled: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  {formData.refillReminder.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Current Supply (days)
                        </label>
                        <input
                          type="number"
                          value={formData.refillReminder.currentSupply}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              refillReminder: {
                                ...prev.refillReminder,
                                currentSupply: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Reminder Threshold (days)
                        </label>
                        <input
                          type="number"
                          value={formData.refillReminder.reminderThreshold}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              refillReminder: {
                                ...prev.refillReminder,
                                reminderThreshold: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              {step === 2 && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding...' : 'Add Medication'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddMedicationModal;
