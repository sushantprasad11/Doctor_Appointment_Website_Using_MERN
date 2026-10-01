const { v4: uuidv4 } = require('uuid');
const Appointment = require('../models/Appointment');
const ExpressError = require('../utils/ExpressError');
const { APPOINTMENT_STATUS, CONSULTATION_WINDOW } = require('../utils/constants');

/**
 * Generate a unique consultation session ID for an appointment.
 * @param {string} appointmentId
 * @returns {string} session ID
 */
function generateSessionId(appointmentId) {
  return `session_${appointmentId}_${uuidv4().slice(0, 8)}`;
}

/**
 * Validate whether a user can access a consultation.
 * Checks:
 *   1. Appointment exists and is confirmed
 *   2. User is the assigned patient or doctor
 *   3. Current time is within the consultation window
 *
 * @param {string} appointmentId
 * @param {string} userId - The logged-in user's ID
 * @param {string} userRole - 'patient' or 'doctor'
 * @returns {Promise<{appointment: Object, sessionId: string}>}
 */
async function validateConsultationAccess(appointmentId, userId, userRole) {
  const appointment = await Appointment.findById(appointmentId)
    .populate({
      path: 'doctor',
      select: 'fullName user profileImage',
    })
    .populate({
      path: 'patient',
      select: 'name email profileImage',
    });

  if (!appointment) {
    throw new ExpressError('Appointment not found.', 404, 'APPOINTMENT_NOT_FOUND');
  }

  // Check appointment status
  if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
    throw new ExpressError(
      'Consultation is only available for confirmed appointments.',
      403,
      'APPOINTMENT_NOT_CONFIRMED'
    );
  }

  // Check ownership
  const isPatient = appointment.patient._id.toString() === userId;
  const isDoctor = appointment.doctor.user && appointment.doctor.user.toString() === userId;

  if (!isPatient && !isDoctor) {
    throw new ExpressError(
      'You are not authorized to access this consultation.',
      403,
      'CONSULTATION_UNAUTHORIZED'
    );
  }

  // Check time window
  const now = new Date();
  const appointmentDateTime = new Date(appointment.appointmentDate);
  const [hours, minutes] = appointment.startTime.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const windowStart = new Date(appointmentDateTime.getTime() - CONSULTATION_WINDOW.BEFORE_START * 60000);
  const windowEnd = new Date(appointmentDateTime.getTime() + CONSULTATION_WINDOW.AFTER_START * 60000);

  if (now < windowStart) {
    const minutesUntil = Math.ceil((windowStart - now) / 60000);
    throw new ExpressError(
      `Consultation is not available yet. You can join ${minutesUntil} minute(s) before the scheduled time.`,
      403,
      'CONSULTATION_TOO_EARLY'
    );
  }

  if (now > windowEnd) {
    throw new ExpressError(
      'The consultation window has expired.',
      403,
      'CONSULTATION_EXPIRED'
    );
  }

  // Ensure session ID exists
  if (!appointment.consultationSessionId) {
    appointment.consultationSessionId = generateSessionId(appointmentId);
    await appointment.save();
  }

  return {
    appointment,
    sessionId: appointment.consultationSessionId,
  };
}

module.exports = {
  generateSessionId,
  validateConsultationAccess,
};
