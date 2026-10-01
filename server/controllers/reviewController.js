const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { APPOINTMENT_STATUS } = require('../utils/constants');

/**
 * POST /api/reviews
 * Patient creates a review after a completed appointment.
 */
const createReview = wrapAsync(async (req, res) => {
  const { appointmentId, rating, review } = req.body;

  // Verify the appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ExpressError('Appointment not found.', 404, 'APPOINTMENT_NOT_FOUND');
  }

  // Verify ownership
  if (appointment.patient.toString() !== req.user._id.toString()) {
    throw new ExpressError('You can only review your own appointments.', 403, 'FORBIDDEN');
  }

  // Verify appointment is completed
  if (appointment.status !== APPOINTMENT_STATUS.COMPLETED) {
    throw new ExpressError(
      'You can only review a completed appointment.',
      400,
      'APPOINTMENT_NOT_COMPLETED'
    );
  }

  // Check for existing review
  const existingReview = await Review.findOne({
    patient: req.user._id,
    appointment: appointmentId,
  });

  if (existingReview) {
    throw new ExpressError('You have already reviewed this appointment.', 409, 'ALREADY_REVIEWED');
  }

  const newReview = await Review.create({
    patient: req.user._id,
    doctor: appointment.doctor,
    appointment: appointmentId,
    rating,
    review: review || '',
  });

  return res.status(201).json({
    success: true,
    message: 'Review submitted successfully.',
    review: newReview,
  });
});

/**
 * GET /api/reviews/doctor/:doctorId
 * Get all reviews for a doctor.
 */
const getDoctorReviews = wrapAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Review.countDocuments({ doctor: req.params.doctorId }),
  ]);

  // Calculate average rating
  const avgResult = await Review.aggregate([
    { $match: { doctor: require('mongoose').Types.ObjectId.createFromHexString(req.params.doctorId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const averageRating = avgResult.length > 0 ? Math.round(avgResult[0].avgRating * 10) / 10 : 0;
  const totalReviews = avgResult.length > 0 ? avgResult[0].count : 0;

  return res.json({
    success: true,
    reviews,
    averageRating,
    totalReviews,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

module.exports = { createReview, getDoctorReviews };
