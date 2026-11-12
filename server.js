require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();


const learnersRouter = require('./routes/learners');
const supportRouter = require('./routes/support');
const referralsRouter = require('./routes/referrals');
const progressRouter = require('./routes/progress');
const jobsRouter = require('./routes/jobs');
const applicationsRouter = require('./routes/applications');
// Middleware
app.use(cors()); // Allows the frontend to talk to us
app.use(express.json()); // Parses incoming JSON payloads


// Routes
app.use('/api/learners', learnersRouter);
app.use('/api/learners', supportRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);
// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Inclusive Onboarding API is running' });
});

// Database connection
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing from .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });