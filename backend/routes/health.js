const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthMetric = require('../models/HealthMetric');
const HealthEntry = require('../models/HealthEntry');

// @route   GET /api/health/metrics
// @desc    Get all health metrics for the logged-in user
// @access  Private
router.get('/metrics', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 50 } = req.query;
    
    const query = { userId: req.user.id };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const metrics = await HealthMetric.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/health/metrics/:id
// @desc    Get single health metric
// @access  Private
router.get('/metrics/:id', auth, async (req, res) => {
  try {
    const metric = await HealthMetric.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!metric) {
      return res.status(404).json({ message: 'Metric not found' });
    }
    
    res.json({ metric });
  } catch (error) {
    console.error('Error fetching metric:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/health/metrics
// @desc    Create a new health metric
// @access  Private
router.post('/metrics', auth, async (req, res) => {
  try {
    const { type, value, unit, notes, timestamp } = req.body;
    
    if (!type || !value || !unit) {
      return res.status(400).json({ message: 'Type, value, and unit are required' });
    }
    
    const metric = new HealthMetric({
      userId: req.user.id,
      type,
      value,
      unit,
      notes,
      timestamp: timestamp || new Date()
    });
    
    await metric.save();
    
    res.status(201).json({ metric, message: 'Health metric created successfully' });
  } catch (error) {
    console.error('Error creating health metric:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/health/metrics/:id
// @desc    Update a health metric
// @access  Private
router.put('/metrics/:id', auth, async (req, res) => {
  try {
    const { type, value, unit, notes, timestamp } = req.body;
    
    const metric = await HealthMetric.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!metric) {
      return res.status(404).json({ message: 'Metric not found' });
    }
    
    if (type) metric.type = type;
    if (value !== undefined) metric.value = value;
    if (unit) metric.unit = unit;
    if (notes !== undefined) metric.notes = notes;
    if (timestamp) metric.timestamp = timestamp;
    
    await metric.save();
    
    res.json({ metric, message: 'Health metric updated successfully' });
  } catch (error) {
    console.error('Error updating health metric:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/health/metrics/:id
// @desc    Delete a health metric
// @access  Private
router.delete('/metrics/:id', auth, async (req, res) => {
  try {
    const metric = await HealthMetric.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!metric) {
      return res.status(404).json({ message: 'Metric not found' });
    }
    
    res.json({ message: 'Health metric deleted successfully' });
  } catch (error) {
    console.error('Error deleting health metric:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/health/journal
// @desc    Get all journal entries for the logged-in user
// @access  Private
router.get('/journal', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    
    const query = { userId: req.user.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const entries = await HealthEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/health/journal
// @desc    Create a new journal entry
// @access  Private
router.post('/journal', auth, async (req, res) => {
  try {
    const { date, mood, symptoms, notes, activities } = req.body;
    
    if (!mood || !notes) {
      return res.status(400).json({ message: 'Mood and notes are required' });
    }
    
    const entry = new HealthEntry({
      userId: req.user.id,
      date: date || new Date(),
      mood,
      symptoms: symptoms || [],
      notes,
      activities: activities || []
    });
    
    await entry.save();
    
    res.status(201).json({ entry, message: 'Journal entry created successfully' });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/health/journal/:id
// @desc    Update a journal entry
// @access  Private
router.put('/journal/:id', auth, async (req, res) => {
  try {
    const { date, mood, symptoms, notes, activities } = req.body;
    
    const entry = await HealthEntry.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    if (date) entry.date = date;
    if (mood) entry.mood = mood;
    if (symptoms) entry.symptoms = symptoms;
    if (notes) entry.notes = notes;
    if (activities) entry.activities = activities;
    
    await entry.save();
    
    res.json({ entry, message: 'Journal entry updated successfully' });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/health/journal/:id
// @desc    Delete a journal entry
// @access  Private
router.delete('/journal/:id', auth, async (req, res) => {
  try {
    const entry = await HealthEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }
    
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/health/analytics
// @desc    Get analytics data for health metrics
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    }
    
    const metrics = await HealthMetric.find({
      userId: req.user.id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: 1 });
    
    const entries = await HealthEntry.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });
    
    // Calculate analytics
    const totalMetrics = metrics.length;
    const totalEntries = entries.length;
    
    // Group metrics by type
    const metricsByType = {};
    metrics.forEach(metric => {
      if (!metricsByType[metric.type]) {
        metricsByType[metric.type] = [];
      }
      metricsByType[metric.type].push(metric);
    });
    
    // Calculate averages for numeric metrics
    const averages = {};
    Object.keys(metricsByType).forEach(type => {
      const values = metricsByType[type]
        .map(m => typeof m.value === 'number' ? m.value : null)
        .filter(v => v !== null);
      
      if (values.length > 0) {
        averages[type] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });
    
    res.json({
      period,
      totalMetrics,
      totalEntries,
      metricsByType: Object.keys(metricsByType).map(type => ({
        type,
        count: metricsByType[type].length
      })),
      averages
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
