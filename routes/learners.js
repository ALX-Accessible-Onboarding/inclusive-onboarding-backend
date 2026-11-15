const express = require('express');
const router = express.Router();
const Learner = require('../models/Learner');
const Referral = require('../models/Referral');
const SupportNeed = require('../models/SupportNeed');
const Application = require('../models/Application');

// @route   POST /api/v1/learners
// @desc    Create a new learner profile
router.post('/', async (req, res) => {
  try {
    const { name, contact, idRoute, idNumber, mode, language, partnerRef, consentGiven } = req.body;

    // 1. Basic manual validation for plain-language errors
    let errors = {};
    if (!name) errors.name = 'What should we call you?';
    
    if (!contact || !contact.value) {
      errors['contact.value'] = 'Please add your number, like 09 12 34 56 78.';
    } else if (contact.type === 'phone' && !/^\d{10}$/.test(contact.value.replace(/\s/g, ''))) {
      errors['contact.value'] = 'Your phone number looks short. Please check it and try again.';
    }

    if (!idRoute) {
      errors.idRoute = 'Please choose an ID route.';
    }

    // 2. If there are errors, return the agreed-upon error shape
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // 3. Check for exact duplicate
    const existingLearner = await Learner.findOne({
      name: name,
      'contact.value': contact.value
    });

    if (existingLearner) {
      return res.status(409).json({ 
        errors: { _: 'This profile already exists. Loading your data...' },
        existingId: existingLearner.id
      });
    }

    // 4. Create the learner
    const learner = await Learner.create({
      name,
      contact,
      idRoute,
      idNumber: idNumber || null,
      mode: mode || 'standard',
      language: language || 'en',
      partnerRef: partnerRef || null,
      consentGiven: consentGiven || false
    });

    // 5. Create pending Referral if partner
    if (partnerRef && consentGiven) {
      await Referral.create({
        learnerId: learner._id,
        partner: partnerRef,
        contactPreference: contact.type,
        status: 'pending'
      });
    }

    res.status(201).json(learner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong. Please try again.' } });
  }
});

// @route   GET /api/v1/learners/:id
// @desc    Get a learner's profile
router.get('/:id', async (req, res) => {
  try {
    const cleanId = req.params.id.replace('lrn_', '');
    const learner = await Learner.findById(cleanId);
    
    if (!learner) {
      return res.status(404).json({ errors: { _: 'Learner not found.' } });
    }

    res.status(200).json(learner);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: { _: 'Invalid Learner ID format.' } });
    }
    res.status(500).json({ errors: { _: 'Something went wrong fetching the profile.' } });
  }
});

// @route   PATCH /api/v1/learners/:id
// @desc    Update a learner's profile
router.patch('/:id', async (req, res) => {
  try {
    const cleanId = req.params.id.replace('lrn_', '');
    const updates = req.body;

    const learner = await Learner.findByIdAndUpdate(
      cleanId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!learner) {
      return res.status(404).json({ errors: { _: 'Learner not found.' } });
    }

    res.status(200).json(learner);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: { _: 'Invalid Learner ID format.' } });
    }
    res.status(500).json({ errors: { _: 'Something went wrong updating the profile.' } });
  }
});

// @route   GET /api/v1/learners/:id/export
// @desc    Export all data for a learner (Privacy requirement)
router.get('/:id/export', async (req, res) => {
  try {
    const cleanId = req.params.id.replace('lrn_', '');
    
    const learner = await Learner.findById(cleanId);
    if (!learner) return res.status(404).json({ errors: { _: 'Learner not found.' } });

    const support = await SupportNeed.findOne({ learnerId: cleanId });
    const applications = await Application.find({ learnerId: cleanId });
    const referrals = await Referral.find({ learnerId: cleanId });

    res.status(200).json({
      profile: learner,
      supportNeeds: support ? support.items : [],
      applications: applications,
      referrals: referrals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Export failed.' } });
  }
});

// @route   DELETE /api/v1/learners/:id
// @desc    Delete a learner and all their data (Privacy requirement)
router.delete('/:id', async (req, res) => {
  try {
    const cleanId = req.params.id.replace('lrn_', '');
    
    await Learner.findByIdAndDelete(cleanId);
    await SupportNeed.deleteMany({ learnerId: cleanId });
    await Application.deleteMany({ learnerId: cleanId });
    await Referral.deleteMany({ learnerId: cleanId });

    res.status(200).json({ message: 'Learner and all associated data deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Deletion failed.' } });
  }
});

module.exports = router;