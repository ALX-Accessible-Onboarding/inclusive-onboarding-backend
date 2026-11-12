const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  answers: {
    type: mongoose.Schema.Types.Mixed, // The job application form answers
    default: {}
  },
  supportRequested: {
    type: Boolean,
    default: false,
    // Note: Even though we store this, we will explicitly delete it before sending the response
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'rejected', 'accepted'],
    default: 'submitted'
  }
}, { timestamps: true });

// Here is the magic privacy serializer:
applicationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = `app_${ret._id}`;
    ret.learnerId = `lrn_${ret.learnerId}`;
    ret.jobId = `job_${ret.jobId}`;
    
    // PRIVACY GUARANTEE: Delete this so it is NEVER sent to the employer API
    delete ret.supportRequested; 
    
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Application', applicationSchema);