const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const CareRecipient = require('../models/CareRecipient');

// @route   GET /api/care-recipients
// @desc    Get all care recipients for the logged-in caregiver
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const careRecipients = await CareRecipient.find({ 
      caregiverId: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: careRecipients.length,
      data: careRecipients,
    });
  } catch (error) {
    console.error('Error fetching care recipients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching care recipients',
      error: error.message,
    });
  }
});

// @route   GET /api/care-recipients/:id
// @desc    Get a specific care recipient
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const careRecipient = await CareRecipient.findOne({
      _id: req.params.id,
      caregiverId: req.user.id,
    });

    if (!careRecipient) {
      return res.status(404).json({
        success: false,
        message: 'Care recipient not found',
      });
    }

    res.json({
      success: true,
      data: careRecipient,
    });
  } catch (error) {
    console.error('Error fetching care recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching care recipient',
      error: error.message,
    });
  }
});

// @route   POST /api/care-recipients
// @desc    Add a new care recipient
// @access  Private
router.post(
  '/',
  [
    auth,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('relationship').notEmpty().withMessage('Relationship is required'),
    body('email').optional().trim().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().matches(/^[\d\s\-\(\)\+]+$/).withMessage('Valid phone number is required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    try {
      const {
        name,
        email,
        phone,
        relationship,
        dateOfBirth,
        address,
        medicalConditions,
        allergies,
        currentMedications,
        primaryPhysician,
        emergencyContact,
        notes,
        permissions,
      } = req.body;

      // Check if care recipient with same email already exists for this caregiver
      if (email) {
        const existingRecipient = await CareRecipient.findOne({
          caregiverId: req.user.id,
          email: email.toLowerCase(),
          isActive: true,
        });

        if (existingRecipient) {
          return res.status(400).json({
            success: false,
            message: 'A care recipient with this email already exists',
          });
        }
      }

      // Create new care recipient
      const careRecipient = new CareRecipient({
        caregiverId: req.user.id,
        name,
        email,
        phone,
        relationship,
        dateOfBirth,
        address,
        medicalConditions,
        allergies,
        currentMedications,
        primaryPhysician,
        emergencyContact,
        notes,
        permissions,
      });

      await careRecipient.save();

      res.status(201).json({
        success: true,
        message: 'Care recipient added successfully',
        data: careRecipient,
      });
    } catch (error) {
      console.error('Error adding care recipient:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding care recipient',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/care-recipients/:id
// @desc    Update a care recipient
// @access  Private
router.put(
  '/:id',
  [
    auth,
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().trim().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().matches(/^[\d\s\-\(\)\+]+$/).withMessage('Valid phone number is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    try {
      const careRecipient = await CareRecipient.findOne({
        _id: req.params.id,
        caregiverId: req.user.id,
      });

      if (!careRecipient) {
        return res.status(404).json({
          success: false,
          message: 'Care recipient not found',
        });
      }

      // Update fields
      const allowedUpdates = [
        'name', 'email', 'phone', 'relationship', 'dateOfBirth',
        'address', 'medicalConditions', 'allergies', 'currentMedications',
        'primaryPhysician', 'emergencyContact', 'notes', 'permissions',
      ];

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          careRecipient[field] = req.body[field];
        }
      });

      await careRecipient.save();

      res.json({
        success: true,
        message: 'Care recipient updated successfully',
        data: careRecipient,
      });
    } catch (error) {
      console.error('Error updating care recipient:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating care recipient',
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/care-recipients/:id
// @desc    Delete (deactivate) a care recipient
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const careRecipient = await CareRecipient.findOne({
      _id: req.params.id,
      caregiverId: req.user.id,
    });

    if (!careRecipient) {
      return res.status(404).json({
        success: false,
        message: 'Care recipient not found',
      });
    }

    // Soft delete
    careRecipient.isActive = false;
    await careRecipient.save();

    res.json({
      success: true,
      message: 'Care recipient removed successfully',
    });
  } catch (error) {
    console.error('Error deleting care recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting care recipient',
      error: error.message,
    });
  }
});

// @route   PATCH /api/care-recipients/:id/permissions
// @desc    Update care recipient permissions
// @access  Private
router.patch('/:id/permissions', auth, async (req, res) => {
  try {
    const careRecipient = await CareRecipient.findOne({
      _id: req.params.id,
      caregiverId: req.user.id,
    });

    if (!careRecipient) {
      return res.status(404).json({
        success: false,
        message: 'Care recipient not found',
      });
    }

    // Update permissions
    if (req.body.permissions) {
      careRecipient.permissions = {
        ...careRecipient.permissions,
        ...req.body.permissions,
      };
      await careRecipient.save();
    }

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: careRecipient,
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: error.message,
    });
  }
});

module.exports = router;
