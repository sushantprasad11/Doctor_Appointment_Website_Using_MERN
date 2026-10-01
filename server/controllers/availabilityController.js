const Availability = require('../models/Availability');
const Doctor = require('../models/Doctor');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { timeToMinutes } = require('../services/appointmentService');

/**
 * POST /api/availability
 * Doctor adds availability for a specific day.
 */
const createAvailability = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found.', 404, 'PROFILE_NOT_FOUND');
  }

  const { dayOfWeek, startTime, endTime, breakPeriods, slotDuration, maxAppointments } = req.body;

  // Validate time range
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    throw new ExpressError('End time must be after start time.', 400, 'INVALID_TIME_RANGE');
  }

  // Check for overlapping schedules on the same day
  const existing = await Availability.find({
    doctor: doctor._id,
    dayOfWeek,
    active: true,
  });

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  for (const slot of existing) {
    const existStart = timeToMinutes(slot.startTime);
    const existEnd = timeToMinutes(slot.endTime);

    if (newStart < existEnd && newEnd > existStart) {
      throw new ExpressError(
        `Schedule overlaps with existing availability (${slot.startTime} - ${slot.endTime}).`,
        409,
        'SCHEDULE_OVERLAP'
      );
    }
  }

  // Validate break periods
  if (breakPeriods && breakPeriods.length > 0) {
    for (const bp of breakPeriods) {
      const bpStart = timeToMinutes(bp.start);
      const bpEnd = timeToMinutes(bp.end);
      if (bpEnd <= bpStart) {
        throw new ExpressError('Break period end time must be after start time.', 400, 'INVALID_BREAK');
      }
      if (bpStart < newStart || bpEnd > newEnd) {
        throw new ExpressError('Break periods must fall within working hours.', 400, 'BREAK_OUT_OF_RANGE');
      }
    }
  }

  const availability = await Availability.create({
    doctor: doctor._id,
    dayOfWeek,
    startTime,
    endTime,
    breakPeriods: breakPeriods || [],
    slotDuration: slotDuration || 30,
    maxAppointments: maxAppointments || 20,
    active: true,
  });

  return res.status(201).json({
    success: true,
    message: 'Availability created successfully.',
    availability,
  });
});

/**
 * GET /api/availability/me
 * Get logged-in doctor's availability schedule.
 */
const getMyAvailability = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found.', 404, 'PROFILE_NOT_FOUND');
  }

  const availability = await Availability.find({ doctor: doctor._id }).sort({ dayOfWeek: 1 });
  return res.json({ success: true, availability });
});

/**
 * GET /api/availability/doctor/:doctorId
 * Get a specific doctor's public availability (for patients).
 */
const getDoctorAvailability = wrapAsync(async (req, res) => {
  const availability = await Availability.find({
    doctor: req.params.doctorId,
    active: true,
  }).sort({ dayOfWeek: 1 });

  return res.json({ success: true, availability });
});

/**
 * PUT /api/availability/:id
 * Update a specific availability slot.
 */
const updateAvailability = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found.', 404, 'PROFILE_NOT_FOUND');
  }

  const availability = await Availability.findOne({
    _id: req.params.id,
    doctor: doctor._id,
  });

  if (!availability) {
    throw new ExpressError('Availability slot not found.', 404, 'AVAILABILITY_NOT_FOUND');
  }

  // Validate new time range if updated
  const newStart = req.body.startTime || availability.startTime;
  const newEnd = req.body.endTime || availability.endTime;
  if (timeToMinutes(newEnd) <= timeToMinutes(newStart)) {
    throw new ExpressError('End time must be after start time.', 400, 'INVALID_TIME_RANGE');
  }

  Object.assign(availability, req.body);
  await availability.save();

  return res.json({
    success: true,
    message: 'Availability updated successfully.',
    availability,
  });
});

/**
 * DELETE /api/availability/:id
 * Remove an availability slot.
 */
const deleteAvailability = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found.', 404, 'PROFILE_NOT_FOUND');
  }

  const availability = await Availability.findOneAndDelete({
    _id: req.params.id,
    doctor: doctor._id,
  });

  if (!availability) {
    throw new ExpressError('Availability slot not found.', 404, 'AVAILABILITY_NOT_FOUND');
  }

  return res.json({
    success: true,
    message: 'Availability slot removed.',
  });
});

module.exports = {
  createAvailability,
  getMyAvailability,
  getDoctorAvailability,
  updateAvailability,
  deleteAvailability,
};
