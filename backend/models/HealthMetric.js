const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['blood_pressure', 'weight', 'blood_sugar', 'heart_rate', 'temperature', 'mood', 'energy', 'sleep'],
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
healthMetricSchema.index({ userId: 1, timestamp: -1 });
healthMetricSchema.index({ userId: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);
