const wrapAsync = require('../utils/wrapAsync');
const { validateConsultationAccess } = require('../services/consultationService');

/**
 * GET /api/consultation/:appointmentId/access
 * Validate and return consultation access details.
 */
const getConsultationAccess = wrapAsync(async (req, res) => {
  const { appointment, sessionId } = await validateConsultationAccess(
    req.params.appointmentId,
    req.user._id.toString(),
    req.user.role
  );

  return res.json({
    success: true,
    consultation: {
      sessionId,
      consultationType: appointment.consultationType,
      appointment: {
        _id: appointment._id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
      },
      doctor: {
        name: appointment.doctor.fullName,
        profileImage: appointment.doctor.profileImage,
      },
      patient: {
        name: appointment.patient.name,
        profileImage: appointment.patient.profileImage,
      },
    },
  });
});

module.exports = { getConsultationAccess };
