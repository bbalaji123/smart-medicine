import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Medication } from '../../types';

const Medications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  const medications: Medication[] = [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      instructions: 'Take with food',
      startDate: new Date('2024-01-01'),
      reminderTimes: ['08:00'],
      refillReminder: true,
      stockCount: 28,
      category: 'prescription',
      prescribedBy: 'Dr. Smith',
      isActive: true,
      sideEffects: ['Dizziness', 'Dry cough'],
      interactions: ['NSAIDs', 'Potassium supplements'],
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      instructions: 'Take with meals',
      startDate: new Date('2024-01-15'),
      reminderTimes: ['08:00', '20:00'],
      refillReminder: true,
      stockCount: 15,
      category: 'prescription',
      prescribedBy: 'Dr. Johnson',
      isActive: true,
      sideEffects: ['Nausea', 'Stomach upset'],
      interactions: ['Alcohol', 'Iodinated contrast agents'],
    },
    {
      id: '3',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Daily',
      instructions: 'Take with fat-containing meal',
      startDate: new Date('2024-02-01'),
      reminderTimes: ['18:00'],
      refillReminder: false,
      stockCount: 45,
      category: 'supplement',
      isActive: true,
    },
  ];

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || med.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prescription':
        return 'bg-primary-100 text-primary-800';
      case 'over-the-counter':
        return 'bg-medical-100 text-medical-800';
      case 'supplement':
        return 'bg-yellow-100 text-yellow-800';
      case 'vitamin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (count: number) => {
    if (count <= 7) return { color: 'text-danger-600', bg: 'bg-danger-50', label: 'Low' };
    if (count <= 14) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Medium' };
    return { color: 'text-medical-600', bg: 'bg-medical-50', label: 'Good' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="mt-2 text-gray-600">Manage your medications and track interactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
            <option value="all">All Categories</option>
            <option value="prescription">Prescription</option>
            <option value="over-the-counter">Over-the-counter</option>
            <option value="supplement">Supplements</option>
            <option value="vitamin">Vitamins</option>
          </select>
        </div>
      </div>

      {/* Drug Interactions Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
      >
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Potential Drug Interaction
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Lisinopril and NSAIDs may interact. Consult your doctor if taking pain relievers.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredMedications.map((medication, index) => {
          const stockStatus = getStockStatus(medication.stockCount);
          
          return (
            <motion.div
              key={medication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {medication.name}
                    </h3>
                    <span className={`badge ${getCategoryColor(medication.category)}`}>
                      {medication.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Dosage:</span> {medication.dosage}</p>
                    <p><span className="font-medium">Frequency:</span> {medication.frequency}</p>
                    <p><span className="font-medium">Instructions:</span> {medication.instructions}</p>
                    {medication.prescribedBy && (
                      <p><span className="font-medium">Prescribed by:</span> {medication.prescribedBy}</p>
                    )}
                  </div>

                  {/* Reminder Times */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reminder Times:</p>
                    <div className="flex flex-wrap gap-1">
                      {medication.reminderTimes.map((time, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-primary-100 text-primary-700 text-xs"
                        >
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mt-3">
                    <div className={`inline-flex items-center px-2 py-1 rounded-md ${stockStatus.bg} ${stockStatus.color} text-xs font-medium`}>
                      {medication.stockCount} pills • {stockStatus.label} stock
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Side Effects and Interactions */}
              {(medication.sideEffects || medication.interactions) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {medication.sideEffects && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Side Effects:</p>
                      <div className="flex flex-wrap gap-1">
                        {medication.sideEffects.map((effect, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medication.interactions && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Interactions:</p>
                      <div className="flex flex-wrap gap-1">
                        {medication.interactions.map((interaction, idx) => (
                          <span key={idx} className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                            {interaction}
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
          <p className="text-gray-500">No medications found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Medications;