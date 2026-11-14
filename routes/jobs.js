const express = require('express');
const router = express.Router();
const Job = require('../models/Job');


router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // If frontend sends ?support=read_aloud,flexible_hours
    if (req.query.support) {
      const supportArray = req.query.support.split(',');
      // Find jobs that have AT LEAST ONE of the requested accommodations
      query.accommodations = { $in: supportArray };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    // LEVEL 3 BONUS: Check if the client wants JSON-LD for search engines
    if (req.headers.accept === 'application/ld+json' || req.query.format === 'jsonld')  {
      const jsonLdJobs = jobs.map(job => ({
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.employer
        },
        "datePosted": job.createdAt.toISOString(),
        // Map custom accommodations to schema.org's physicalRequirement (plain text)
        "physicalRequirement": job.accommodations.join(', ') || "None specified"
      }));
      
      return res.status(200).json(jsonLdJobs);
    }

    // Default JSON response
    res.status(200).json({ jobs, total: jobs.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong fetching jobs.' } });
  }
});

// @route   POST /api/jobs
// @desc    Employer creates a job
router.post('/', async (req, res) => {
  try {
    const { title, employer, description, accommodations } = req.body;

    let errors = {};
    if (!title) errors.title = 'Job title is required.';
    if (!employer) errors.employer = 'Employer name is required.';
    if (!description) errors.description = 'Job description is required.';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const job = await Job.create({
      title,
      employer,
      description,
      accommodations: accommodations || []
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: { _: 'Something went wrong creating the job.' } });
  }
});

module.exports = router;
