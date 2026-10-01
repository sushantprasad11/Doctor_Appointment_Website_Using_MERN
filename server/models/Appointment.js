const mongoose = require('mongoose');
const { APPOINTMENT_STATUS, CONSULTATION_TYPES } = require('../utils/constants');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true, // "HH:mm"
    },
    endTime: {
      type: String,
      required: true, // "HH:mm"
    },
    consultationType: {
      type: String,
      enum: Object.values(CONSULTATION_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.CONFIRMED,
    },
    bookingTimestamp: {
      type: Date,
      default: Date.now,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
    consultationSessionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent double-booking the same doctor at the same date/time
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['cancelled', 'rejected'] },
    },
  }
);

// Indexes for fast queries
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1, status: 1 });
appointmentSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
