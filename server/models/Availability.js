const mongoose = require('mongoose');

const breakPeriodSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // "HH:mm"
    end: { type: String, required: true },   // "HH:mm"
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Sunday, 6 = Saturday
    },
    startTime: {
      type: String,
      required: true, // "HH:mm" format
    },
    endTime: {
      type: String,
      required: true, // "HH:mm" format
    },
    breakPeriods: [breakPeriodSchema],
    slotDuration: {
      type: Number,
      required: true,
      min: 5,
      max: 120,
      default: 30, // minutes
    },
    maxAppointments: {
      type: Number,
      min: 1,
      default: 20,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one schedule per doctor per day
availabilitySchema.index({ doctor: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
