import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import { useEmergencyContacts } from '../../contexts/EmergencyContactsContext';
import { UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface AddEmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const relationshipOptions = [
  'Family',
  'Friend',
  'Caregiver',
  'Doctor',
  'Nurse',
  'Neighbor',
  'Other',
];

const AddEmergencyContactModal: React.FC<AddEmergencyContactModalProps> = ({ isOpen, onClose }) => {
  const { addContact } = useEmergencyContacts();
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Family',
    phone: '',
    email: '',
    isPrimary: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addContact(formData);

      // Reset form
      setFormData({
        name: '',
        relationship: 'Family',
        phone: '',
        email: '',
        isPrimary: false,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Emergency Contact" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              required
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship *
          </label>
          <select
            value={formData.relationship}
            onChange={(e) => handleInputChange('relationship', e.target.value)}
            required
            className="input-field"
          >
            {relationshipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              required
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Primary Contact */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrimary"
            checked={formData.isPrimary}
            onChange={(e) => handleInputChange('isPrimary', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
            Set as primary contact
          </label>
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
            {isSubmitting ? 'Saving...' : 'Add Contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmergencyContactModal;
