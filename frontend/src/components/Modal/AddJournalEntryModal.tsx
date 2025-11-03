import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { useHealthMetrics } from '../../contexts/HealthMetricsContext';

interface AddJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const moodOptions = [
  { value: 'excellent', label: 'Excellent', emoji: '😄', color: 'text-green-500' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'text-green-400' },
  { value: 'fair', label: 'Fair', emoji: '😐', color: 'text-yellow-500' },
  { value: 'poor', label: 'Poor', emoji: '😟', color: 'text-orange-500' },
  { value: 'bad', label: 'Bad', emoji: '😢', color: 'text-red-500' },
];

const AddJournalEntryModal: React.FC<AddJournalEntryModalProps> = ({ isOpen, onClose }) => {
  const { addJournalEntry } = useHealthMetrics();
  const [formData, setFormData] = useState({
    mood: 'good',
    symptoms: '',
    notes: '',
    activities: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const activitiesArray = formData.activities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const symptomsArray = formData.symptoms
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await addJournalEntry({
        date: new Date(),
        mood: formData.mood as 'excellent' | 'good' | 'fair' | 'poor' | 'bad',
        symptoms: symptomsArray,
        notes: formData.notes,
        activities: activitiesArray,
      });

      // Reset form
      setFormData({
        mood: 'good',
        symptoms: '',
        notes: '',
        activities: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to add journal entry:', error);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add Journal Entry" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How are you feeling today?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => handleInputChange('mood', mood.value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  formData.mood === mood.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-3xl mb-1">{mood.emoji}</span>
                <span className={`text-xs font-medium ${
                  formData.mood === mood.value ? 'text-primary-900' : 'text-gray-600'
                }`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms (comma-separated)
          </label>
          <input
            type="text"
            value={formData.symptoms}
            onChange={(e) => handleInputChange('symptoms', e.target.value)}
            placeholder="e.g., headache, fatigue, nausea"
            className="input-field"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple symptoms with commas
          </p>
        </div>

        {/* Activities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activities (comma-separated)
          </label>
          <input
            type="text"
            value={formData.activities}
            onChange={(e) => handleInputChange('activities', e.target.value)}
            placeholder="e.g., walking, swimming, yoga"
            className="input-field"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple activities with commas
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="How was your day? Any observations about your health?"
            required
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
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddJournalEntryModal;
