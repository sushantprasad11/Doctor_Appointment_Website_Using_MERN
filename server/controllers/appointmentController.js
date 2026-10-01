const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Availability = require('../models/Availability');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { APPOINTMENT_STATUS, VERIFICATION_STATUS, ROLES } = require('../utils/constants');
const { getAvailableSlots, isSlotAvailable, timeToMinutes, minutesToTime } = require('../services/appointmentService');
const { generateSessionId } = require('../services/consultationService');

/**
 * POST /api/appointments
 * Patient books an appointment with a verified doctor.
 */
const createAppointment = wrapAsync(async (req, res) => {
  const { doctorId, appointmentDate, startTime, consultationType } = req.body;

  // Verify the doctor exists and is verified
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ExpressError('Doctor not found.', 404, 'DOCTOR_NOT_FOUND');
  }
  if (doctor.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
    throw new ExpressError('This doctor is not verified for appointments.', 403, 'DOCTOR_NOT_VERIFIED');
  }

  // Verify consultation type is supported by the doctor
  if (!doctor.consultationTypes.includes(consultationType)) {
    throw new ExpressError(
      `This doctor does not offer ${consultationType} consultations.`,
      400,
      'CONSULTATION_TYPE_NOT_SUPPORTED'
    );
  }

  // Parse the appointment date
  const apptDate = new Date(appointmentDate);
  apptDate.setHours(0, 0, 0, 0);

  // Verify the day has availability
  const dayOfWeek = apptDate.getDay();
  const availability = await Availability.findOne({
    doctor: doctorId,
    dayOfWeek,
    active: true,
  });

  if (!availability) {
    throw new ExpressError('Doctor is not available on this day.', 400, 'DAY_NOT_AVAILABLE');
  }

  // Verify the time slot is within working hours
  const slotStart = timeToMinutes(startTime);
  const slotEnd = slotStart + availability.slotDuration;
  const workStart = timeToMinutes(availability.startTime);
  const workEnd = timeToMinutes(availability.endTime);

  if (slotStart < workStart || slotEnd > workEnd) {
    throw new ExpressError('Selected time is outside working hours.', 400, 'OUTSIDE_WORKING_HOURS');
  }

  // Calculate end time
  const endTime = minutesToTime(slotEnd);

  // Generate a session ID for the consultation
  const consultationSessionId = generateSessionId(doctorId);

  // Attempt atomic insert — the unique compound index prevents double booking
  try {
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate: apptDate,
      startTime,
      endTime,
      consultationType,
      status: APPOINTMENT_STATUS.CONFIRMED,
      bookingTimestamp: new Date(),
      consultationSessionId,
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment,
    });
  } catch (err) {
    // Duplicate key = slot was taken between check and insert
    if (err.code === 11000) {
      throw new ExpressError(
        'This appointment slot is no longer available. Please choose another.',
        409,
        'SLOT_UNAVAILABLE'
      );
    }
    throw err;
  }
});

/**
 * GET /api/appointments
 * Get appointments for the logged-in user (patient or doctor).
 */
const getMyAppointments = wrapAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (req.user.role === ROLES.PATIENT) {
    filter.patient = req.user._id;
  } else if (req.user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      throw new ExpressError('Doctor profile not found.', 404, 'PROFILE_NOT_FOUND');
    }
    filter.doctor = doctor._id;
  }

  if (status) {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate({
        path: 'doctor',
        select: 'fullName profileImage specialization consultationFee location qualification',
      })
      .populate({
        path: 'patient',
        select: 'name email profileImage phone',
      })
      .sort({ appointmentDate: -1, startTime: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    appointments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * GET /api/appointments/:id
 * Get a specific appointment (with ownership check).
 */
const getAppointment = wrapAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'doctor',
      select: 'fullName profileImage specialization consultationFee location user qualification consultationTypes',
    })
    .populate({
      path: 'patient',
      select: 'name email profileImage phone',
    });

  if (!appointment) {
    throw new ExpressError('Appointment not found.', 404, 'APPOINTMENT_NOT_FOUND');
  }

  // Ownership check
  const isPatient = appointment.patient._id.toString() === req.user._id.toString();
  const isDoctor = appointment.doctor.user && appointment.doctor.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isPatient && !isDoctor && !isAdmin) {
    throw new ExpressError('You are not authorized to view this appointment.', 403, 'FORBIDDEN');
  }

  return res.json({ success: true, appointment });
});

/**
 * PATCH /api/appointments/:id/cancel
 * Cancel an appointment (by patient or doctor).
 */
const cancelAppointment = wrapAsync(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('doctor', 'user');

  if (!appointment) {
    throw new ExpressError('Appointment not found.', 404, 'APPOINTMENT_NOT_FOUND');
  }

  // Ownership check
  const isPatient = appointment.patient.toString() === req.user._id.toString();
  const isDoctor = appointment.doctor.user && appointment.doctor.user.toString() === req.user._id.toString();

  if (!isPatient && !isDoctor) {
    throw new ExpressError('You are not authorized to cancel this appointment.', 403, 'FORBIDDEN');
  }

  // Can only cancel pending or confirmed appointments
  if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
    throw new ExpressError(
      `Cannot cancel an appointment with status: ${appointment.status}.`,
      400,
      'CANNOT_CANCEL'
    );
  }

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancellationReason = req.body.cancellationReason || '';
  await appointment.save();

  return res.json({
    success: true,
    message: 'Appointment cancelled successfully.',
    appointment,
  });
});

/**
 * PATCH /api/appointments/:id/complete
 * Mark appointment as completed (by doctor only).
 */
const completeAppointment = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found.', 404, 'PROFILE_NOT_FOUND');
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    doctor: doctor._id,
  });

  if (!appointment) {
    throw new ExpressError('Appointment not found.', 404, 'APPOINTMENT_NOT_FOUND');
  }

  if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
    throw new ExpressError(
      'Only confirmed appointments can be marked as completed.',
      400,
      'CANNOT_COMPLETE'
    );
  }

  appointment.status = APPOINTMENT_STATUS.COMPLETED;
  await appointment.save();

  return res.json({
    success: true,
    message: 'Appointment marked as completed.',
    appointment,
  });
});

/**
 * GET /api/appointments/slots/:doctorId
 * Get available time slots for a doctor on a specific date.
 */
const getAvailableSlotsForDate = wrapAsync(async (req, res) => {
  const { date } = req.query;
  if (!date) {
    throw new ExpressError('Date query parameter is required.', 400, 'DATE_REQUIRED');
  }

  const doctor = await Doctor.findById(req.params.doctorId);
  if (!doctor || doctor.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
    throw new ExpressError('Doctor not found or not verified.', 404, 'DOCTOR_NOT_FOUND');
  }

  const requestedDate = new Date(date);
  if (isNaN(requestedDate.getTime())) {
    throw new ExpressError('Invalid date format.', 400, 'INVALID_DATE');
  }

  const slots = await getAvailableSlots(req.params.doctorId, requestedDate);

  return res.json({
    success: true,
    date: requestedDate.toISOString().split('T')[0],
    slots,
  });
});

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointment,
  cancelAppointment,
  completeAppointment,
  getAvailableSlotsForDate,
};
