const mongoose = require('mongoose');

const learnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'What should we call you?'],
    trim: true
  },
  contact: {
    type: {
      type: String,
      enum: ['phone', 'email'],
      required: [true, 'How can we reach you?']
    },
    value: {
      type: String,
      required: [true, 'Please add your phone number or email.']
    }
  },
  idRoute: {
    type: String,
    enum: ['kebele', 'passport', 'refugee', 'other_document', 'referral'],
    required: [true, 'Please choose an ID route.']
  },
  idNumber: {
    type: String,
    default: null
  },
  mode: {
    type: String,
    enum: ['standard', 'simple'],
    default: 'standard'
  },
  language: {
    type: String,
    enum: ['en', 'am'],
    default: 'en'
  },
  partnerRef: {
    type: String,
    default: null
  },
  consentGiven: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// We are using a custom 'id' field in our API, but Mongo uses '_id'.
// This transform ensures the API returns "id" instead of "_id" and hides "__v".
learnerSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = `lrn_${ret._id}`;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Learner', learnerSchema);