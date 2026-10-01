const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');
const { requirePatient } = require('../middleware/role');
const { validate } = require('../middleware/validation');
const { reviewSchema } = require('../validators/reviewValidator');

// POST /api/reviews — Create review (patient only)
router.post(
  '/',
  requireAuth,
  requirePatient,
  validate(reviewSchema),
  reviewController.createReview
);

// GET /api/reviews/doctor/:doctorId — Get doctor's reviews
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

module.exports = router;
