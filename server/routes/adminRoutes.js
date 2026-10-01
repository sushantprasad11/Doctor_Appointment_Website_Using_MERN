const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { validate } = require('../middleware/validation');
const { verificationReviewSchema } = require('../validators/verificationValidator');

// All admin routes require authentication + admin role
router.use(requireAuth, requireAdmin);

// GET /api/admin/dashboard — Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// GET /api/admin/verifications — Verification queue
router.get('/verifications', adminController.getVerifications);

// GET /api/admin/verifications/:id — Verification detail
router.get('/verifications/:id', adminController.getVerificationDetail);

// PATCH /api/admin/verifications/:id/approve
router.patch('/verifications/:id/approve', adminController.approveVerification);

// PATCH /api/admin/verifications/:id/reject
router.patch(
  '/verifications/:id/reject',
  validate(verificationReviewSchema),
  adminController.rejectVerification
);

// PATCH /api/admin/doctors/:id/suspend
router.patch('/doctors/:id/suspend', adminController.suspendDoctor);

// GET /api/admin/appointments — All appointments
router.get('/appointments', adminController.getAllAppointments);

module.exports = router;
