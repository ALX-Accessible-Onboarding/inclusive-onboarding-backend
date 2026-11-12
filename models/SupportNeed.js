const mongoose = require('mongoose');

const supportNeedSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true,
    unique: true // One support record per learner
  },
  items: [{
    type: String,
    enum: ["read_aloud", "larger_text", "voice_input", "more_time", "sign_language", "other"]
  }],
  private: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

supportNeedSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = `sup_${ret._id}`;
    ret.learnerId = `lrn_${ret.learnerId}`; // Format the reference for the frontend
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('SupportNeed', supportNeedSchema);