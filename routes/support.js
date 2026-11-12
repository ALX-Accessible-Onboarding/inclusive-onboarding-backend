const express = require('express');
const router = express.Router();
const SupportNeed = require('../models/SupportNeed');
const Learner = require('../models/Learner');

// @route   POST /api/learners/:id/support
// @desc    Create or update private support needs
router.post('/:id/support', async (req, res) => {
  try {
    const learnerId = req.params.id.replace('lrn_', ''); // Strip prefix for DB query
    const { items } = req.body;

    // Check if learner exists
    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ errors: { _: 'Learner not found.' } });
    }

    // Upsert (update if exists, insert if not)
    const supportRecord = await SupportNeed.findOneAndUpdate(
      { learnerId: learnerId },
      { items, private: true },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(supportRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong. Please try again.' } });
  }
});

// @route   GET /api/learners/:id/support
// @desc    Get private support needs
router.get('/:id/support', async (req, res) => {
  try {
    const learnerId = req.params.id.replace('lrn_', '');
    const supportRecord = await SupportNeed.findOne({ learnerId: learnerId });

    if (!supportRecord) {
      return res.status(404).json({ errors: { _: 'No support record found for this learner.' } });
    }

    res.status(200).json(supportRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong. Please try again.' } });
  }
});

module.exports = router;