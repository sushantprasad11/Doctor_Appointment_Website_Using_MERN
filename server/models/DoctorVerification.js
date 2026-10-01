const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, default: '' },
    documentType: {
      type: String,
      enum: ['degree', 'certificate', 'registration', 'other'],
      default: 'other',
    },
  },
  { _id: false }
);

const doctorVerificationSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    documents: [documentSchema],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup by doctor and status
doctorVerificationSchema.index({ doctor: 1 });
doctorVerificationSchema.index({ status: 1 });

module.exports = mongoose.model('DoctorVerification', doctorVerificationSchema);
