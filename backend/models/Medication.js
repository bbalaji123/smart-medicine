const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    amount: {
      type: Number,
      required: [true, 'Dosage amount is required']
    },
    unit: {
      type: String,
      required: [true, 'Dosage unit is required'],
      enum: ['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'puffs', 'units']
    }
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['once-daily', 'twice-daily', 'three-times-daily', 'four-times-daily', 'as-needed', 'custom']
  },
  customFrequency: {
    times: Number,
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    }
  },
  schedule: [{
    time: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    taken: {
      type: Boolean,
      default: false
    },
    takenAt: Date,
    skipped: {
      type: Boolean,
      default: false
    },
    reason: String
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  prescribedBy: {
    name: String,
    contact: String
  },
  instructions: {
    type: String,
    maxlength: [500, 'Instructions cannot exceed 500 characters']
  },
  sideEffects: [String],
  interactions: [{
    medication: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    description: String
  }],
  refillReminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    daysBeforeEmpty: {
      type: Number,
      default: 7
    },
    currentSupply: Number,
    lastRefillDate: Date
  },
  adherenceData: [{
    date: {
      type: Date,
      default: Date.now
    },
    taken: Boolean,
    timesTaken: Number,
    timesScheduled: Number,
    adherenceRate: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Virtual for current adherence rate
medicationSchema.virtual('currentAdherenceRate').get(function() {
  if (!this.adherenceData || this.adherenceData.length === 0) return 0;
  
  const recent = this.adherenceData.slice(-30); // Last 30 days
  const totalTaken = recent.reduce((sum, day) => sum + (day.timesTaken || 0), 0);
  const totalScheduled = recent.reduce((sum, day) => sum + (day.timesScheduled || 0), 0);
  
  return totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
});

// Virtual for days remaining (if end date is set)
medicationSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  
  const today = new Date();
  const diffTime = this.endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for next dose time
medicationSchema.virtual('nextDose').get(function() {
  if (!this.schedule || this.schedule.length === 0) return null;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Find next dose today
  for (let dose of this.schedule) {
    const [hours, minutes] = dose.time.split(':').map(Number);
    const doseTime = hours * 60 + minutes;
    
    if (doseTime > currentTime && !dose.taken) {
      const nextDose = new Date();
      nextDose.setHours(hours, minutes, 0, 0);
      return nextDose;
    }
  }
  
  // If no dose today, find first dose tomorrow
  if (this.schedule.length > 0) {
    const firstDose = this.schedule[0];
    const [hours, minutes] = firstDose.time.split(':').map(Number);
    const nextDose = new Date();
    nextDose.setDate(nextDose.getDate() + 1);
    nextDose.setHours(hours, minutes, 0, 0);
    return nextDose;
  }
  
  return null;
});

// Index for performance
medicationSchema.index({ user: 1, isActive: 1 });
medicationSchema.index({ user: 1, 'schedule.time': 1 });
medicationSchema.index({ createdAt: -1 });

// Static method to find user's active medications
medicationSchema.statics.findActiveByUser = function(userId) {
  return this.find({ user: userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to find medications due now
medicationSchema.statics.findDueNow = function(userId, timeWindow = 30) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const windowStart = currentTime - timeWindow;
  const windowEnd = currentTime + timeWindow;
  
  return this.find({
    user: userId,
    isActive: true,
    'schedule.time': {
      $exists: true
    }
  }).then(medications => {
    return medications.filter(med => {
      return med.schedule.some(dose => {
        const [hours, minutes] = dose.time.split(':').map(Number);
        const doseTime = hours * 60 + minutes;
        return doseTime >= windowStart && doseTime <= windowEnd && !dose.taken;
      });
    });
  });
};

// Instance method to mark dose as taken
medicationSchema.methods.markDoseTaken = function(scheduleIndex, takenAt = new Date()) {
  if (this.schedule[scheduleIndex]) {
    this.schedule[scheduleIndex].taken = true;
    this.schedule[scheduleIndex].takenAt = takenAt;
    this.schedule[scheduleIndex].skipped = false;
    return this.save();
  }
  throw new Error('Invalid schedule index');
};

// Instance method to mark dose as skipped
medicationSchema.methods.markDoseSkipped = function(scheduleIndex, reason = '') {
  if (this.schedule[scheduleIndex]) {
    this.schedule[scheduleIndex].taken = false;
    this.schedule[scheduleIndex].skipped = true;
    this.schedule[scheduleIndex].reason = reason;
    return this.save();
  }
  throw new Error('Invalid schedule index');
};

// Instance method to calculate adherence
medicationSchema.methods.calculateAdherence = function(days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const relevantData = this.adherenceData.filter(
    data => data.date >= startDate && data.date <= endDate
  );
  
  if (relevantData.length === 0) return 0;
  
  const totalTaken = relevantData.reduce((sum, day) => sum + (day.timesTaken || 0), 0);
  const totalScheduled = relevantData.reduce((sum, day) => sum + (day.timesScheduled || 0), 0);
  
  return totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
};

module.exports = mongoose.model('Medication', medicationSchema);