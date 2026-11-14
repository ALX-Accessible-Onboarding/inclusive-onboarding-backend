const express = require('express');
const router = express.Router();
const SupportNeed = require('../models/SupportNeed');
const Learner = require('../models/Learner');

// @route   POST /api/learners/:id/support
// @desc    Create or update private support needs
router.post('/:id/support', async (req, res) => {
  try {
    const learnerId = req.params.id.replace('lrn_', ''); 
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
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(supportRecord);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ errors: { _: 'Invalid Learner ID format.' } });
    }
    res.status(500).json({ errors: { _: 'Something went wrong saving support data.' } });
  }
});

// @route   GET /api/learners/:id/support
// @desc    Get private support needs
router.get('/:id/support', async (req, res) => {
  try {
    const learnerId = req.params.id.replace('lrn_', '');
    
    // We check if the ID is valid before doing a findOne to prevent the 500 error
    if (!learnerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ errors: { _: 'Invalid Learner ID format.' } });
    }

    const supportRecord = await SupportNeed.findOne({ learnerId: learnerId });

    if (!supportRecord) {
      return res.status(404).json({ errors: { _: 'No support record found for this learner.' } });
    }

    res.status(200).json(supportRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong fetching support data.' } });
  }
});

module.exports = router;
