const Doctor = require('../models/Doctor');
const DoctorVerification = require('../models/DoctorVerification');
const ExpressError = require('../utils/ExpressError');
const { VERIFICATION_STATUS } = require('../utils/constants');

/**
 * Transition doctor verification status.
 * Enforces valid state transitions.
 *
 * Valid transitions:
 *   pending       -> under_review
 *   under_review  -> verified | rejected
 *   rejected      -> pending (re-submit)
 *   verified      -> suspended
 *   suspended     -> verified | pending
 */
const VALID_TRANSITIONS = {
  [VERIFICATION_STATUS.PENDING]: [VERIFICATION_STATUS.UNDER_REVIEW],
  [VERIFICATION_STATUS.UNDER_REVIEW]: [VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.REJECTED],
  [VERIFICATION_STATUS.REJECTED]: [VERIFICATION_STATUS.PENDING],
  [VERIFICATION_STATUS.VERIFIED]: [VERIFICATION_STATUS.SUSPENDED],
  [VERIFICATION_STATUS.SUSPENDED]: [VERIFICATION_STATUS.VERIFIED, VERIFICATION_STATUS.PENDING],
};

/**
 * Approve a doctor verification.
 * Updates both the DoctorVerification record and the Doctor profile.
 */
async function approveDoctor(verificationId, adminId, adminNotes = '') {
  const verification = await DoctorVerification.findById(verificationId);
  if (!verification) {
    throw new ExpressError('Verification record not found.', 404, 'VERIFICATION_NOT_FOUND');
  }

  // Update verification record
  verification.status = 'approved';
  verification.reviewedAt = new Date();
  verification.reviewedBy = adminId;
  verification.adminNotes = adminNotes;
  await verification.save();

  // Update doctor profile verification status
  await Doctor.findByIdAndUpdate(verification.doctor, {
    verificationStatus: VERIFICATION_STATUS.VERIFIED,
  });

  return verification;
}

/**
 * Reject a doctor verification.
 */
async function rejectDoctor(verificationId, adminId, rejectionReason, adminNotes = '') {
  const verification = await DoctorVerification.findById(verificationId);
  if (!verification) {
    throw new ExpressError('Verification record not found.', 404, 'VERIFICATION_NOT_FOUND');
  }

  verification.status = 'rejected';
  verification.reviewedAt = new Date();
  verification.reviewedBy = adminId;
  verification.rejectionReason = rejectionReason;
  verification.adminNotes = adminNotes;
  await verification.save();

  await Doctor.findByIdAndUpdate(verification.doctor, {
    verificationStatus: VERIFICATION_STATUS.REJECTED,
  });

  return verification;
}

module.exports = {
  approveDoctor,
  rejectDoctor,
  VALID_TRANSITIONS,
};
