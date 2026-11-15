require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Routes
const learnersRouter = require('./routes/learners');
const supportRouter = require('./routes/support');
const referralsRouter = require('./routes/referrals');
const progressRouter = require('./routes/progress');
const jobsRouter = require('./routes/jobs');
const applicationsRouter = require('./routes/applications');
const voiceRouter = require('./routes/voice');

// API Version 1 Wiring
app.use('/api/v1/learners', learnersRouter);
app.use('/api/v1/learners', supportRouter); // Mounts /api/v1/learners/:id/support
app.use('/api/v1/referrals', referralsRouter);
app.use('/api/v1/progress', progressRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/voice', voiceRouter); // Kept as /api/voice for the TTS

// Swagger Docs
const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Inclusive Onboarding API is running (v1)' });
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