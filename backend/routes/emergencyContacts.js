const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EmergencyContact = require('../models/EmergencyContact');

// @route   GET /api/emergency-contacts
// @desc    Get all emergency contacts for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user.id })
      .sort({ isPrimary: -1, name: 1 });
    
    res.json({ contacts });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/emergency-contacts/:id
// @desc    Get single emergency contact
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }
    
    res.json({ contact });
  } catch (error) {
    console.error('Error fetching emergency contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/emergency-contacts
// @desc    Create a new emergency contact
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, relationship, phone, email, isPrimary } = req.body;
    
    if (!name || !relationship || !phone) {
      return res.status(400).json({ message: 'Name, relationship, and phone are required' });
    }
    
    const contact = new EmergencyContact({
      userId: req.user.id,
      name,
      relationship,
      phone,
      email,
      isPrimary: isPrimary || false
    });
    
    await contact.save();
    
    res.status(201).json({ contact, message: 'Emergency contact created successfully' });
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/emergency-contacts/:id
// @desc    Update an emergency contact
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, relationship, phone, email, isPrimary } = req.body;
    
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }
    
    if (name) contact.name = name;
    if (relationship) contact.relationship = relationship;
    if (phone) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;
    
    await contact.save();
    
    res.json({ contact, message: 'Emergency contact updated successfully' });
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/emergency-contacts/:id
// @desc    Delete an emergency contact
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }
    
    res.json({ message: 'Emergency contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/emergency-contacts/:id/set-primary
// @desc    Set an emergency contact as primary
// @access  Private
router.put('/:id/set-primary', auth, async (req, res) => {
  try {
    // First, check if the contact exists and belongs to the user
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }
    
    // Update all contacts to set isPrimary to false
    await EmergencyContact.updateMany(
      { userId: req.user.id },
      { $set: { isPrimary: false } }
    );
    
    // Set the selected contact as primary
    contact.isPrimary = true;
    await contact.save();
    
    res.json({ contact, message: 'Primary contact updated successfully' });
  } catch (error) {
    console.error('Error setting primary contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
