const User = require('../models/User');
const Doctor = require('../models/Doctor');
const DoctorVerification = require('../models/DoctorVerification');
const Appointment = require('../models/Appointment');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { approveDoctor, rejectDoctor } = require('../services/verificationService');
const { VERIFICATION_STATUS, APPOINTMENT_STATUS } = require('../utils/constants');

/**
 * GET /api/admin/dashboard
 * Get platform statistics for admin dashboard.
 */
const getDashboardStats = wrapAsync(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    totalDoctors,
    verifiedDoctors,
    pendingVerifications,
    rejectedDoctors,
    totalAppointments,
    todayAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    Doctor.countDocuments(),
    Doctor.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED }),
    DoctorVerification.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
    Doctor.countDocuments({ verificationStatus: VERIFICATION_STATUS.REJECTED }),
    Appointment.countDocuments(),
    Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    }),
  ]);

  return res.json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      verifiedDoctors,
      pendingVerifications,
      rejectedDoctors,
      totalAppointments,
      todayAppointments,
    },
  });
});

/**
 * GET /api/admin/verifications
 * Get all verification requests (optionally filtered by status).
 */
const getVerifications = wrapAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [verifications, total] = await Promise.all([
    DoctorVerification.find(filter)
      .populate({
        path: 'doctor',
        select: 'fullName qualification specialization profileImage professionalRegNumber user experience',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    DoctorVerification.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    verifications,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * GET /api/admin/verifications/:id
 * Get a single verification record with full documents (admin only).
 */
const getVerificationDetail = wrapAsync(async (req, res) => {
  const verification = await DoctorVerification.findById(req.params.id)
    .populate({
      path: 'doctor',
      select: 'fullName qualification specialization profileImage professionalRegNumber user experience bio languages consultationFee consultationTypes location',
      populate: { path: 'user', select: 'name email phone' },
    })
    .populate('reviewedBy', 'name email');

  if (!verification) {
    throw new ExpressError('Verification record not found.', 404, 'VERIFICATION_NOT_FOUND');
  }

  return res.json({ success: true, verification });
});

/**
 * PATCH /api/admin/verifications/:id/approve
 * Approve a doctor's verification.
 */
const approveVerification = wrapAsync(async (req, res) => {
  const { adminNotes } = req.body;
  const verification = await approveDoctor(req.params.id, req.user._id, adminNotes);

  return res.json({
    success: true,
    message: 'Doctor verification approved.',
    verification,
  });
});

/**
 * PATCH /api/admin/verifications/:id/reject
 * Reject a doctor's verification.
 */
const rejectVerification = wrapAsync(async (req, res) => {
  const { rejectionReason, adminNotes } = req.body;
  const verification = await rejectDoctor(req.params.id, req.user._id, rejectionReason, adminNotes);

  return res.json({
    success: true,
    message: 'Doctor verification rejected.',
    verification,
  });
});

/**
 * PATCH /api/admin/doctors/:id/suspend
 * Suspend a verified doctor.
 */
const suspendDoctor = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new ExpressError('Doctor not found.', 404, 'DOCTOR_NOT_FOUND');
  }

  doctor.verificationStatus = VERIFICATION_STATUS.SUSPENDED;
  await doctor.save();

  return res.json({
    success: true,
    message: 'Doctor has been suspended.',
  });
});

/**
 * GET /api/admin/appointments
 * Get all appointments (admin monitoring).
 */
const getAllAppointments = wrapAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate({ path: 'doctor', select: 'fullName specialization' })
      .populate({ path: 'patient', select: 'name email' })
      .sort({ createdAt: -1 })
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

module.exports = {
  getDashboardStats,
  getVerifications,
  getVerificationDetail,
  approveVerification,
  rejectVerification,
  suspendDoctor,
  getAllAppointments,
};
