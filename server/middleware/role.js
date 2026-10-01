const ExpressError = require('../utils/ExpressError');
const Doctor = require('../models/Doctor');
const { ROLES, VERIFICATION_STATUS } = require('../utils/constants');

/**
 * Factory: require one or more roles.
 * Usage: requireRole('admin') or requireRole('doctor', 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ExpressError('Authentication required.', 401, 'AUTH_REQUIRED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ExpressError(
          'You do not have permission to access this resource.',
          403,
          'FORBIDDEN'
        )
      );
    }
    return next();
  };
}

// Convenience middleware
const requireDoctor = requireRole(ROLES.DOCTOR);
const requirePatient = requireRole(ROLES.PATIENT);
const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Middleware: require verified doctor.
 * Checks that the logged-in user is a doctor AND their Doctor profile is verified.
 */
async function requireVerifiedDoctor(req, res, next) {
  try {
    if (!req.user) {
      return next(new ExpressError('Authentication required.', 401, 'AUTH_REQUIRED'));
    }
    if (req.user.role !== ROLES.DOCTOR) {
      return next(new ExpressError('Doctor access required.', 403, 'FORBIDDEN'));
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return next(new ExpressError('Doctor profile not found.', 404, 'DOCTOR_PROFILE_NOT_FOUND'));
    }
    if (doctor.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
      return next(
        new ExpressError(
          'Your profile must be verified before performing this action.',
          403,
          'DOCTOR_NOT_VERIFIED'
        )
      );
    }

    // Attach doctor profile to request for downstream use
    req.doctor = doctor;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  requireRole,
  requireDoctor,
  requirePatient,
  requireAdmin,
  requireVerifiedDoctor,
};
