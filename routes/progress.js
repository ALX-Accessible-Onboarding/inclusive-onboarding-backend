const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// @route   POST /api/progress
// @desc    Save or update form progress
router.post('/', async (req, res) => {
  try {
    const { sessionId, flow, stepIndex, answers } = req.body;

    if (!sessionId || !flow) {
      return res.status(400).json({ errors: { _: 'Session ID and flow are required.' } });
    }

    const progress = await Progress.findOneAndUpdate(
      { sessionId: sessionId },
      { flow, stepIndex, answers },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong saving progress.' } });
  }
});

// @route   GET /api/progress/:sessionId
// @desc    Get form progress for resume
router.get('/:sessionId', async (req, res) => {
  try {
    const progress = await Progress.findOne({ sessionId: req.params.sessionId });
    if (!progress) {
      return res.status(404).json({ errors: { _: 'No progress found for this session.' } });
    }
    res.status(200).json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong fetching progress.' } });
  }
});

module.exports = router;