import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useMedications } from '../../contexts/MedicationsContext';
import AddMedicationModal from '../../components/Modal/AddMedicationModal';
import RefillMedicationModal from '../../components/Modal/RefillMedicationModal';
import type { Medication } from '../../services/medications';

const Medications: React.FC = () => {
  const { 
    medications, 
    loading, 
    fetchMedications,
    createMedication,
    deleteMedication, 
    markDoseTaken, 
    markDoseSkipped,
    recordRefill,
  } = useMedications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || 
      (filterCategory === 'active' ? med.isActive : !med.isActive);
    return matchesSearch && matchesFilter;
  });

  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily':
      case 'once daily':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100';
      case 'twice daily':
        return 'bg-medical-100 text-medical-800 dark:bg-medical-900 dark:text-medical-100';
      case 'three times daily':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'as needed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    }
  };

  const getCurrentSupplyStatus = (med: Medication) => {
    const supply = med.refillReminder?.currentSupply || 0;
    if (supply <= 7) return { color: 'text-danger-600', bg: 'bg-danger-50', label: 'Low' };
    if (supply <= 14) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium' };
    return { color: 'text-medical-600', bg: 'bg-medical-50', label: 'Good' };
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const handleDelete = async (id: string) => {
    if (showDeleteConfirm === id) {
      await deleteMedication(id);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(id);
      setTimeout(() => setShowDeleteConfirm(null), 3000);
    }
  };

  const handleDoseTaken = async (medId: string, scheduleIndex: number) => {
    await markDoseTaken(medId, scheduleIndex);
  };

  const handleDoseSkipped = async (medId: string, scheduleIndex: number) => {
    await markDoseSkipped(medId, scheduleIndex, 'User skipped');
  };

  const handleOpenRefill = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowRefillModal(true);
  };

  const handleRefillSubmit = async (refillData: any) => {
    if (selectedMedication) {
      await recordRefill(selectedMedication._id, refillData);
    }
  };

  // Check for potential interactions
  const hasInteractions = medications.some(med => 
    med.interactions && med.interactions.length > 0
  );

  if (loading && medications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your medications and track interactions
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Medication
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="all">All Medications</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Drug Interactions Alert */}
      {hasInteractions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Potential Drug Interactions
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Some of your medications may interact. Review the interaction warnings below.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Medications Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredMedications.map((medication, index) => {
          const supplyStatus = getCurrentSupplyStatus(medication);
          
          return (
            <motion.div
              key={medication._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {medication.name}
                    </h3>
                    <span className={`badge ${getFrequencyColor(medication.frequency)}`}>
                      {medication.frequency}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Dosage:</span>{' '}
                      {medication.dosage.amount} {medication.dosage.unit}
                    </p>
                    {medication.instructions && (
                      <p>
                        <span className="font-medium">Instructions:</span>{' '}
                        {medication.instructions}
                      </p>
                    )}
                    {medication.prescribedBy && (
                      <p>
                        <span className="font-medium">Prescribed by:</span>{' '}
                        {medication.prescribedBy.name}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Start Date:</span>{' '}
                      {formatDate(medication.startDate)}
                    </p>
                    {medication.endDate && (
                      <p>
                        <span className="font-medium">End Date:</span>{' '}
                        {formatDate(medication.endDate)}
                      </p>
                    )}
                  </div>

                  {/* Schedule Times */}
                  {medication.schedule && medication.schedule.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Schedule:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {medication.schedule.map((slot, idx) => (
                          <div
                            key={idx}
                            className="group relative inline-flex items-center gap-1"
                          >
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${
                                slot.taken
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                                  : slot.skipped
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
                                  : 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100'
                              }`}
                            >
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {slot.time}
                            </span>
                            {!slot.taken && !slot.skipped && (
                              <div className="hidden group-hover:flex absolute top-full left-0 mt-1 z-10 gap-1">
                                <button
                                  onClick={() => handleDoseTaken(medication._id, idx)}
                                  className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                  title="Mark as taken"
                                >
                                  <CheckCircleIcon className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDoseSkipped(medication._id, idx)}
                                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                  title="Mark as skipped"
                                >
                                  <XCircleIcon className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supply Status */}
                  {medication.refillReminder?.enabled && (
                    <div className="mt-3">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-md ${supplyStatus.bg} ${supplyStatus.color} text-xs font-medium`}
                      >
                        {medication.refillReminder.currentSupply || 0} remaining •{' '}
                        {supplyStatus.label} stock
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  {medication.refillReminder?.enabled && (
                    <button
                      onClick={() => handleOpenRefill(medication)}
                      className="p-2 text-gray-400 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-900/20 rounded-lg transition-colors"
                      title="Order Refill"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(medication._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      showDeleteConfirm === medication._id
                        ? 'bg-danger-600 text-white'
                        : 'text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                    }`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Side Effects and Interactions */}
              {((medication.sideEffects && medication.sideEffects.length > 0) ||
                (medication.interactions && medication.interactions.length > 0)) && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {medication.sideEffects && medication.sideEffects.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Side Effects:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {medication.sideEffects.map((effect, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {medication.interactions && medication.interactions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Interactions:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {medication.interactions.map((interaction, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded"
                            title={`${interaction.severity}: ${interaction.description}`}
                          >
                            {interaction.medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {medications.length === 0
              ? 'No medications added yet. Click "Add Medication" to get started.'
              : 'No medications found matching your criteria.'}
          </p>
        </div>
      )}

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={createMedication}
      />

      {/* Refill Medication Modal */}
      <RefillMedicationModal
        isOpen={showRefillModal}
        onClose={() => {
          setShowRefillModal(false);
          setSelectedMedication(null);
        }}
        medication={selectedMedication}
        onSubmit={handleRefillSubmit}
      />
    </div>
  );
};

export default Medications;