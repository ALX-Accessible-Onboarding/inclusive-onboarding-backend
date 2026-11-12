const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const Learner = require('../models/Learner');

// @route   POST /api/referrals
// @desc    Create a partner referral
router.post('/', async (req, res) => {
  try {
    const { learnerId, partner, contactPreference } = req.body;

    let errors = {};
    if (!learnerId) errors.learnerId = 'Learner ID is required.';
    if (!partner) errors.partner = 'Please specify a partner organization.';
    if (!['phone', 'email'].includes(contactPreference)) {
      errors.contactPreference = 'Please choose phone or email.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const cleanLearnerId = learnerId.replace('lrn_', '');
    const learner = await Learner.findById(cleanLearnerId);
    if (!learner) {
      return res.status(404).json({ errors: { _: 'Learner not found.' } });
    }

    const referral = await Referral.create({
      learnerId: cleanLearnerId,
      partner,
      contactPreference
    });

    res.status(201).json(referral);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong. Please try again.' } });
  }
});

module.exports = router;