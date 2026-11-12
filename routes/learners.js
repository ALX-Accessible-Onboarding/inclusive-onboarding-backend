const express = require('express');
const router = express.Router();
const Learner = require('../models/Learner');

// @route   POST /api/learners
// @desc    Create a new learner profile
router.post('/', async (req, res) => {
  try {
    const { name, contact, idRoute, idNumber, mode, language, partnerRef } = req.body;

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

    // 3. Create the learner in the database
    const learner = await Learner.create({
      name,
      contact,
      idRoute,
      idNumber: idNumber || null,
      mode: mode || 'standard',
      language: language || 'en',
      partnerRef: partnerRef || null
    });

    // 4. Return 201 Created
    res.status(201).json(learner);
  } catch (error) {
    // Fallback for any unexpected DB errors
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong. Please try again.' } });
  }
});

module.exports = router;