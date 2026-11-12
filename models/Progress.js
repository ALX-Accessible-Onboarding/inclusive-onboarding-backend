const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  flow: {
    type: String,
    enum: ['onboarding', 'profile_edit', 'job_apply', 'employer_form'],
    required: true
  },
  stepIndex: {
    type: Number,
    required: true,
    default: 0
  },
  answers: {
    type: mongoose.Schema.Types.Mixed, // Allows any JSON structure for the answers
    default: {}
  }
}, { timestamps: true });

progressSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = `prog_${ret._id}`;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Progress', progressSchema);