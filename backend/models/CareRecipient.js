const mongoose = require('mongoose');

const careRecipientSchema = new mongoose.Schema({
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Care recipient name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number'],
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: [
      'Parent',
      'Grandparent',
      'Spouse',
      'Child',
      'Sibling',
      'Friend',
      'Other Relative',
      'Other',
    ],
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  medicalConditions: [{
    type: String,
    trim: true,
  }],
  allergies: [{
    type: String,
    trim: true,
  }],
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
  }],
  primaryPhysician: {
    name: String,
    phone: String,
    clinic: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  permissions: {
    viewMedications: {
      type: Boolean,
      default: true,
    },
    editReminders: {
      type: Boolean,
      default: false,
    },
    viewAdherence: {
      type: Boolean,
      default: true,
    },
    viewHealthMetrics: {
      type: Boolean,
      default: true,
    },
    emergencyAccess: {
      type: Boolean,
      default: true,
    },
    manageProfile: {
      type: Boolean,
      default: false,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  invitationStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  linkedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
careRecipientSchema.index({ caregiverId: 1, isActive: 1 });
careRecipientSchema.index({ email: 1 });
careRecipientSchema.index({ phone: 1 });

// Virtual for age
careRecipientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Set virtuals to be included in JSON
careRecipientSchema.set('toJSON', { virtuals: true });
careRecipientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CareRecipient', careRecipientSchema);
