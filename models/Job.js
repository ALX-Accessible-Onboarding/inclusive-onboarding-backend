const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required.']
  },
  employer: {
    type: String,
    required: [true, 'Employer name is required.']
  },
  description: {
    type: String,
    required: [true, 'Job description is required.']
  },
  accommodations: [{
    type: String,
    enum: [
      "read_aloud",
      "flexible_hours",
      "screen_reader_friendly",
      "voice_application",
      "extra_interview_time",
      "sign_language_interpreter",
      "other"
    ]
  }]
}, { timestamps: true });

jobSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = `job_${ret._id}`;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Job', jobSchema);