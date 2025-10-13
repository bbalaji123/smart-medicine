const express = require('express');
const { body, validationResult } = require('express-validator');
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/medications
// @desc    Get all medications for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const medications = await Medication.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: medications.length,
      medications
    });

  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medications'
    });
  }
});

// @route   GET /api/medications/:id
// @desc    Get single medication by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.json({
      success: true,
      medication
    });

  } catch (error) {
    console.error('Get medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medication'
    });
  }
});

// @route   POST /api/medications
// @desc    Add new medication
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Medication name must be between 1 and 100 characters'),
  body('dosage')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage is required and must be less than 50 characters'),
  body('frequency')
    .isInt({ min: 1, max: 24 })
    .withMessage('Frequency must be between 1 and 24 times per day'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('times')
    .isArray({ min: 1 })
    .withMessage('At least one time must be specified'),
  body('times.*')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Times must be in HH:MM format')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const medicationData = {
      ...req.body,
      user: req.user.id
    };

    const medication = new Medication(medicationData);
    await medication.save();

    res.status(201).json({
      success: true,
      message: 'Medication added successfully',
      medication
    });

  } catch (error) {
    console.error('Add medication error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while adding medication'
    });
  }
});

// @route   PUT /api/medications/:id
// @desc    Update medication
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Medication name must be between 1 and 100 characters'),
  body('dosage')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must be less than 50 characters'),
  body('frequency')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Frequency must be between 1 and 24 times per day'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('times')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one time must be specified'),
  body('times.*')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Times must be in HH:MM format')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.json({
      success: true,
      message: 'Medication updated successfully',
      medication
    });

  } catch (error) {
    console.error('Update medication error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating medication'
    });
  }
});

// @route   DELETE /api/medications/:id
// @desc    Delete medication
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    res.json({
      success: true,
      message: 'Medication deleted successfully'
    });

  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting medication'
    });
  }
});

// @route   POST /api/medications/:id/dose
// @desc    Record a dose taken
// @access  Private
router.post('/:id/dose', [
  auth,
  body('takenAt')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date and time'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { takenAt, notes } = req.body;

    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Add dose record
    medication.dosesRecord.push({
      takenAt: takenAt ? new Date(takenAt) : new Date(),
      notes: notes || ''
    });

    await medication.save();

    res.json({
      success: true,
      message: 'Dose recorded successfully',
      medication
    });

  } catch (error) {
    console.error('Record dose error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while recording dose'
    });
  }
});

// @route   GET /api/medications/:id/adherence
// @desc    Get adherence statistics for a medication
// @access  Private
router.get('/:id/adherence', auth, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    const adherenceRate = medication.adherenceRate;
    const missedDoses = medication.missedDoses;
    const totalDoses = medication.totalExpectedDoses;
    const takenDoses = medication.dosesRecord.length;

    res.json({
      success: true,
      adherence: {
        rate: adherenceRate,
        takenDoses,
        missedDoses,
        totalDoses,
        percentage: Math.round(adherenceRate * 100)
      }
    });

  } catch (error) {
    console.error('Get adherence error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating adherence'
    });
  }
});

// @route   GET /api/medications/schedule/today
// @desc    Get today's medication schedule
// @access  Private
router.get('/schedule/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const medications = await Medication.find({ 
      user: req.user.id,
      isActive: true,
      startDate: { $lte: today },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: today } }
      ]
    });

    const schedule = [];

    medications.forEach(med => {
      med.times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(startOfDay);
        scheduledTime.setHours(hours, minutes, 0, 0);

        // Check if this dose was already taken
        const wasTaken = med.dosesRecord.some(dose => {
          const doseTime = new Date(dose.takenAt);
          return doseTime >= startOfDay && 
                 doseTime < endOfDay && 
                 Math.abs(doseTime - scheduledTime) < 60 * 60 * 1000; // Within 1 hour
        });

        schedule.push({
          medicationId: med._id,
          medicationName: med.name,
          dosage: med.dosage,
          time: time,
          scheduledTime: scheduledTime,
          taken: wasTaken,
          isPastDue: scheduledTime < new Date() && !wasTaken
        });
      });
    });

    // Sort by time
    schedule.sort((a, b) => a.scheduledTime - b.scheduledTime);

    res.json({
      success: true,
      date: today.toISOString().split('T')[0],
      schedule
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching schedule'
    });
  }
});

module.exports = router;