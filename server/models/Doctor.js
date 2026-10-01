const mongoose = require('mongoose');
const { VERIFICATION_STATUS, CONSULTATION_TYPES } = require('../utils/constants');

const locationSchema = new mongoose.Schema(
  {
    clinicName: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
    postalCode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 150,
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    specialization: [
      {
        type: String,
        trim: true,
      },
    ],
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    diseasesTreated: [
      {
        type: String,
        trim: true,
      },
    ],
    bodySystems: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number,
      min: 0,
      max: 70,
      default: 0,
    },
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    consultationFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    consultationTypes: [
      {
        type: String,
        enum: Object.values(CONSULTATION_TYPES),
      },
    ],
    location: {
      type: locationSchema,
      default: () => ({}),
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },
    professionalRegNumber: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search across multiple fields
doctorSchema.index({
  fullName: 'text',
  qualification: 'text',
  specialization: 'text',
  expertise: 'text',
  diseasesTreated: 'text',
  bodySystems: 'text',
  'location.city': 'text',
  'location.state': 'text',
  'location.clinicName': 'text',
});

// Index for fast filtering by verification status
doctorSchema.index({ verificationStatus: 1 });

// User already has unique index from schema definition

/**
 * Static: find only verified doctors (for public listing).
 */
doctorSchema.statics.findVerified = function (filter = {}) {
  return this.find({ ...filter, verificationStatus: VERIFICATION_STATUS.VERIFIED });
};

module.exports = mongoose.model('Doctor', doctorSchema);
