import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { useHealthMetrics } from '../../contexts/HealthMetricsContext';
import { HeartIcon, ScaleIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface AddHealthMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const metricTypes = [
  { id: 'blood_pressure', name: 'Blood Pressure', icon: HeartIcon, unit: 'mmHg', fields: ['systolic', 'diastolic'] },
  { id: 'weight', name: 'Weight', icon: ScaleIcon, unit: 'lbs', fields: ['value'] },
  { id: 'blood_sugar', name: 'Blood Sugar', icon: BeakerIcon, unit: 'mg/dL', fields: ['value'] },
  { id: 'heart_rate', name: 'Heart Rate', icon: HeartIcon, unit: 'bpm', fields: ['value'] },
  { id: 'temperature', name: 'Temperature', icon: HeartIcon, unit: '°F', fields: ['value'] },
];

const AddHealthMetricModal: React.FC<AddHealthMetricModalProps> = ({ isOpen, onClose }) => {
  const { addMetric } = useHealthMetrics();
  const [selectedType, setSelectedType] = useState('blood_pressure');
  const [formData, setFormData] = useState<Record<string, any>>({
    systolic: '',
    diastolic: '',
    value: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMetric = metricTypes.find(m => m.id === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let metricValue: any;
      
      if (selectedType === 'blood_pressure') {
        metricValue = {
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
        };
      } else {
        metricValue = parseFloat(formData.value);
      }

      await addMetric({
        type: selectedType as any,
        value: metricValue,
        unit: selectedMetric?.unit || '',
        notes: formData.notes,
        timestamp: new Date(),
      });

      // Reset form
      setFormData({
        systolic: '',
        diastolic: '',
        value: '',
        notes: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to add metric:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Health Metric" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metric Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Metric Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {metricTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                  selectedType === type.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <type.icon className={`h-5 w-5 mr-2 ${
                  selectedType === type.id ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  selectedType === type.id ? 'text-primary-900' : 'text-gray-700'
                }`}>
                  {type.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {selectedMetric?.name} Value
          </label>
          {selectedType === 'blood_pressure' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Systolic</label>
                <input
                  type="number"
                  value={formData.systolic}
                  onChange={(e) => handleInputChange('systolic', e.target.value)}
                  placeholder="120"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Diastolic</label>
                <input
                  type="number"
                  value={formData.diastolic}
                  onChange={(e) => handleInputChange('diastolic', e.target.value)}
                  placeholder="80"
                  required
                  className="input-field"
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder="Enter value"
                required
                className="input-field pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {selectedMetric?.unit}
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder="Add any additional notes..."
            className="input-field resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Metric'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddHealthMetricModal;
