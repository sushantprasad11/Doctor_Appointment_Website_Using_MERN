const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const ExpressError = require('../utils/ExpressError');
const { APPOINTMENT_STATUS } = require('../utils/constants');

/**
 * Generate available time slots for a doctor on a specific date.
 * Accounts for availability schedule, break periods, and existing bookings.
 *
 * @param {string} doctorId - Doctor ObjectId
 * @param {Date} date - The date to check
 * @returns {Promise<Array<{startTime: string, endTime: string, available: boolean}>>}
 */
async function getAvailableSlots(doctorId, date) {
  const dayOfWeek = date.getDay(); // 0 = Sunday

  // Get the doctor's availability for this day
  const availability = await Availability.findOne({
    doctor: doctorId,
    dayOfWeek,
    active: true,
  });

  if (!availability) {
    return []; // Doctor doesn't work this day
  }

  // Generate all possible slots
  const slots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration,
    availability.breakPeriods
  );

  // Get existing active appointments for this doctor on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] },
  });

  const bookedSlots = new Set(existingAppointments.map((a) => a.startTime));

  // Mark booked slots
  return slots.map((slot) => ({
    ...slot,
    available: !bookedSlots.has(slot.startTime),
  }));
}

/**
 * Generate time slots between start and end, excluding break periods.
 * @param {string} startTime - "HH:mm"
 * @param {string} endTime - "HH:mm"
 * @param {number} slotDuration - in minutes
 * @param {Array<{start: string, end: string}>} breakPeriods
 * @returns {Array<{startTime: string, endTime: string}>}
 */
function generateTimeSlots(startTime, endTime, slotDuration, breakPeriods = []) {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current + slotDuration <= end) {
    const slotStart = minutesToTime(current);
    const slotEnd = minutesToTime(current + slotDuration);

    // Check if slot overlaps with any break period
    const isDuringBreak = breakPeriods.some((bp) => {
      const breakStart = timeToMinutes(bp.start);
      const breakEnd = timeToMinutes(bp.end);
      return current < breakEnd && current + slotDuration > breakStart;
    });

    if (!isDuringBreak) {
      slots.push({ startTime: slotStart, endTime: slotEnd });
    }

    current += slotDuration;
  }

  return slots;
}

/**
 * Check if a specific slot is available for booking.
 * Uses an atomic operation to prevent race conditions.
 *
 * @param {string} doctorId
 * @param {Date} appointmentDate
 * @param {string} startTime
 * @returns {Promise<boolean>}
 */
async function isSlotAvailable(doctorId, appointmentDate, startTime) {
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    startTime,
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] },
  });

  return !existing;
}

/**
 * Convert "HH:mm" to total minutes from midnight.
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert total minutes from midnight to "HH:mm".
 */
function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

module.exports = {
  getAvailableSlots,
  isSlotAvailable,
  generateTimeSlots,
  timeToMinutes,
  minutesToTime,
};
