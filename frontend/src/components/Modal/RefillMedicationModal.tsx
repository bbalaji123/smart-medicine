import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface RefillMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: {
    _id: string;
    name: string;
    dosage: {
      amount: number;
      unit: string;
    };
    refillReminder?: {
      currentSupply?: number;
    };
  } | null;
  onSubmit: (refillData: any) => Promise<void>;
}

const RefillMedicationModal: React.FC<RefillMedicationModalProps> = ({
  isOpen,
  onClose,
  medication,
  onSubmit,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    refillQuantity: 30,
    refillDate: new Date().toISOString().split('T')[0],
    pharmacyName: '',
    pharmacyPhone: '',
    prescriptionNumber: '',
    cost: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.refillQuantity || formData.refillQuantity <= 0) {
      toast.error('Please enter a valid refill quantity');
      return;
    }

    setSubmitting(true);
    try {
      const refillData = {
        ...formData,
        refillQuantity: parseInt(formData.refillQuantity.toString()),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
      };

      await onSubmit(refillData);
      toast.success('Refill recorded successfully!');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record refill');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      refillQuantity: 30,
      refillDate: new Date().toISOString().split('T')[0],
      pharmacyName: '',
      pharmacyPhone: '',
      prescriptionNumber: '',
      cost: '',
      notes: '',
    });
    onClose();
  };

  if (!isOpen || !medication) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order Refill
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {medication.name} - {medication.dosage.amount}{medication.dosage.unit}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Supply Info */}
              {medication.refillReminder?.currentSupply !== undefined && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-primary-800 dark:text-primary-300">
                        Current supply: <span className="font-semibold">{medication.refillReminder.currentSupply} days</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Refill Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refill Quantity (days supply) <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.refillQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        refillQuantity: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Number of days this refill will last
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Refill Date <span className="text-danger-600">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.refillDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, refillDate: e.target.value }))
                      }
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pharmacy Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Pharmacy Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pharmacy Name
                    </label>
                    <div className="relative">
                      <BuildingStorefrontIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.pharmacyName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, pharmacyName: e.target.value }))
                        }
                        className="input-field pl-10"
                        placeholder="e.g., CVS Pharmacy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pharmacy Phone
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.pharmacyPhone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, pharmacyPhone: e.target.value }))
                        }
                        className="input-field pl-10"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prescription Number
                    </label>
                    <input
                      type="text"
                      value={formData.prescriptionNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          prescriptionNumber: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="Rx #123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cost (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, cost: e.target.value }))
                        }
                        className="input-field pl-8"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className="input-field"
                  placeholder="Any additional notes about this refill..."
                />
              </div>

              {/* Supply Calculation Preview */}
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supply Summary
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Current Supply:</span>
                    <span className="font-medium">
                      {medication.refillReminder?.currentSupply || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refill Amount:</span>
                    <span className="font-medium">+{formData.refillQuantity} days</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      New Total Supply:
                    </span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {(medication.refillReminder?.currentSupply || 0) + formData.refillQuantity}{' '}
                      days
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={handleClose} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Recording...' : 'Record Refill'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RefillMedicationModal;
