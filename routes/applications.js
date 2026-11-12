const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Learner = require('../models/Learner');
const Job = require('../models/Job');

// @route   POST /api/applications
// @desc    Learner applies for a job
router.post('/', async (req, res) => {
  try {
    const { learnerId, jobId, answers, supportRequested } = req.body;

    let errors = {};
    if (!learnerId) errors.learnerId = 'Learner ID is required.';
    if (!jobId) errors.jobId = 'Job ID is required.';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Clean IDs (strip lrn_ and job_ prefixes)
    const cleanLearnerId = learnerId.replace('lrn_', '');
    const cleanJobId = jobId.replace('job_', '');

    // Verify both exist
    const learner = await Learner.findById(cleanLearnerId);
    if (!learner) return res.status(404).json({ errors: { _: 'Learner not found.' } });

    const job = await Job.findById(cleanJobId);
    if (!job) return res.status(404).json({ errors: { _: 'Job not found.' } });

    // Create the application
    const application = await Application.create({
      learnerId: cleanLearnerId,
      jobId: cleanJobId,
      answers: answers || {},
      supportRequested: supportRequested || false
    });

    // The toJSON transform on the model strips the `supportRequested` field automatically
    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong submitting the application.' } });
  }
});

module.exports = router;