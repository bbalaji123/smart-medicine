const mongoose = require('mongoose');

const healthEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'bad'],
    required: true
  },
  symptoms: [{
    type: String
  }],
  notes: {
    type: String,
    required: true
  },
  activities: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
healthEntrySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('HealthEntry', healthEntrySchema);
