const Doctor = require('../models/Doctor');
const DoctorVerification = require('../models/DoctorVerification');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { uploadMultiple } = require('../services/cloudinaryService');
const { VERIFICATION_STATUS } = require('../utils/constants');

/**
 * POST /api/verification/submit
 * Doctor submits verification documents.
 */
const submitVerification = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found. Create your profile first.', 404, 'PROFILE_NOT_FOUND');
  }

  // Check if already verified or has pending verification
  if (doctor.verificationStatus === VERIFICATION_STATUS.VERIFIED) {
    throw new ExpressError('Your profile is already verified.', 400, 'ALREADY_VERIFIED');
  }

  const existingPending = await DoctorVerification.findOne({
    doctor: doctor._id,
    status: { $in: ['pending', 'under_review'] },
  });

  if (existingPending) {
    throw new ExpressError(
      'You already have a pending verification request.',
      400,
      'VERIFICATION_PENDING'
    );
  }

  // Validate files
  if (!req.files || req.files.length === 0) {
    throw new ExpressError('At least one document is required for verification.', 400, 'NO_DOCUMENTS');
  }

  // Parse document types from body
  let documentTypes = req.body.documentTypes || [];
  if (typeof documentTypes === 'string') {
    documentTypes = [documentTypes];
  }

  // Upload files to Cloudinary
  const uploadedFiles = await uploadMultiple(req.files, 'docterapp/verifications');

  // Build document entries
  const documents = uploadedFiles.map((file, index) => ({
    url: file.url,
    publicId: file.publicId,
    originalName: file.originalName,
    documentType: documentTypes[index] || 'other',
  }));

  // Create verification record
  const verification = await DoctorVerification.create({
    doctor: doctor._id,
    documents,
    submittedAt: new Date(),
    status: 'pending',
  });

  // Update doctor status
  doctor.verificationStatus = VERIFICATION_STATUS.PENDING;
  await doctor.save();

  return res.status(201).json({
    success: true,
    message: 'Verification documents submitted successfully. Our team will review your application.',
    verification: {
      _id: verification._id,
      status: verification.status,
      submittedAt: verification.submittedAt,
      documentCount: verification.documents.length,
    },
  });
});

/**
 * GET /api/verification/status
 * Doctor checks their verification status.
 */
const getVerificationStatus = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found.', 404, 'PROFILE_NOT_FOUND');
  }

  const latestVerification = await DoctorVerification.findOne({ doctor: doctor._id })
    .sort({ createdAt: -1 })
    .select('-adminNotes'); // Don't expose admin notes to doctor

  return res.json({
    success: true,
    verificationStatus: doctor.verificationStatus,
    verification: latestVerification
      ? {
          _id: latestVerification._id,
          status: latestVerification.status,
          submittedAt: latestVerification.submittedAt,
          reviewedAt: latestVerification.reviewedAt,
          rejectionReason: latestVerification.rejectionReason,
          documentCount: latestVerification.documents.length,
        }
      : null,
  });
});

module.exports = {
  submitVerification,
  getVerificationStatus,
};
