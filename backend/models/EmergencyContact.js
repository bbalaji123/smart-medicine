const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    required: true,
    enum: ['Family', 'Friend', 'Caregiver', 'Doctor', 'Nurse', 'Neighbor', 'Other']
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one primary contact per user
emergencyContactSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

emergencyContactSchema.index({ userId: 1 });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
