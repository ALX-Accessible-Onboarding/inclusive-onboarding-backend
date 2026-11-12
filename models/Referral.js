const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true
  },
  partner: {
    type: String,
    required: true
  },
  contactPreference: {
    type: String,
    enum: ['phone', 'email'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending'
  }
}, { timestamps: true });

referralSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = `ref_${ret._id}`;
    ret.learnerId = `lrn_${ret.learnerId}`;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Referral', referralSchema);