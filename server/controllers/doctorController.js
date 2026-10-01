const Doctor = require('../models/Doctor');
const User = require('../models/User');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { VERIFICATION_STATUS } = require('../utils/constants');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

/**
 * POST /api/doctors/profile
 * Create doctor professional profile.
 * Only doctors without an existing profile can create one.
 */
const createProfile = wrapAsync(async (req, res) => {
  const existingProfile = await Doctor.findOne({ user: req.user._id });
  if (existingProfile) {
    throw new ExpressError('Doctor profile already exists. Use update instead.', 409, 'PROFILE_EXISTS');
  }

  const profileData = {
    ...req.body,
    user: req.user._id,
    verificationStatus: VERIFICATION_STATUS.PENDING,
  };

  // Handle profile image upload if present
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'docterapp/profiles');
    profileData.profileImage = result;
  }

  const doctor = await Doctor.create(profileData);

  return res.status(201).json({
    success: true,
    message: 'Doctor profile created successfully. Please submit verification documents.',
    doctor,
  });
});

/**
 * PUT /api/doctors/profile
 * Update doctor profile.
 * Non-verification-sensitive fields can be updated freely.
 * Changes to qualification or specialization trigger re-verification notice.
 */
const updateProfile = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    throw new ExpressError('Doctor profile not found. Please create one first.', 404, 'PROFILE_NOT_FOUND');
  }

  // Fields that trigger re-verification consideration
  const sensitiveFields = ['qualification', 'specialization', 'professionalRegNumber'];
  const hasSensitiveChange = sensitiveFields.some((field) => req.body[field] !== undefined);

  // Handle profile image update
  if (req.file) {
    // Delete old image from Cloudinary
    if (doctor.profileImage?.publicId) {
      await deleteFromCloudinary(doctor.profileImage.publicId);
    }
    const result = await uploadToCloudinary(req.file.buffer, 'docterapp/profiles');
    req.body.profileImage = result;
  }

  // Prevent client from manipulating verification status
  delete req.body.verificationStatus;
  delete req.body.user;

  Object.assign(doctor, req.body);
  await doctor.save();

  const response = {
    success: true,
    message: 'Profile updated successfully.',
    doctor,
  };

  if (hasSensitiveChange && doctor.verificationStatus === VERIFICATION_STATUS.VERIFIED) {
    response.warning = 'Changes to professional credentials may require re-verification.';
  }

  return res.json(response);
});

/**
 * GET /api/doctors/profile/me
 * Get the logged-in doctor's own profile.
 */
const getMyProfile = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return res.json({ success: true, doctor: null });
  }
  return res.json({ success: true, doctor });
});

/**
 * GET /api/doctors/:id
 * Get a public doctor profile (only verified doctors).
 */
const getPublicProfile = wrapAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');

  if (!doctor) {
    throw new ExpressError('Doctor not found.', 404, 'DOCTOR_NOT_FOUND');
  }

  if (doctor.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
    throw new ExpressError('This doctor profile is not available.', 404, 'DOCTOR_NOT_VERIFIED');
  }

  return res.json({ success: true, doctor });
});

/**
 * GET /api/doctors
 * Search and filter verified doctors.
 * Supports: text search, specialization, city, language, consultationType, fee range, pagination.
 */
const searchDoctors = wrapAsync(async (req, res) => {
  const {
    q,
    specialization,
    city,
    language,
    consultationType,
    minFee,
    maxFee,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { verificationStatus: VERIFICATION_STATUS.VERIFIED };

  // Full-text search
  if (q && q.trim()) {
    filter.$text = { $search: q.trim() };
  }

  // Filter by specialization
  if (specialization) {
    filter.specialization = { $regex: new RegExp(specialization, 'i') };
  }

  // Filter by city
  if (city) {
    filter['location.city'] = { $regex: new RegExp(city, 'i') };
  }

  // Filter by language
  if (language) {
    filter.languages = { $regex: new RegExp(language, 'i') };
  }

  // Filter by consultation type
  if (consultationType) {
    filter.consultationTypes = consultationType;
  }

  // Filter by fee range
  if (minFee !== undefined || maxFee !== undefined) {
    filter.consultationFee = {};
    if (minFee !== undefined) filter.consultationFee.$gte = Number(minFee);
    if (maxFee !== undefined) filter.consultationFee.$lte = Number(maxFee);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate('user', 'name')
      .select('-__v')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Doctor.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    doctors,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

module.exports = {
  createProfile,
  updateProfile,
  getMyProfile,
  getPublicProfile,
  searchDoctors,
};
