const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { requireAuth } = require('../middleware/auth');
const { requireDoctor } = require('../middleware/role');
const { validate } = require('../middleware/validation');
const { doctorProfileSchema, doctorUpdateSchema, doctorSearchSchema } = require('../validators/doctorValidator');
const { uploadProfileImage } = require('../middleware/upload');

// =============================================
// IMPORTANT: Specific routes BEFORE parameterized routes
// =============================================

// Protected doctor routes (must come before /:id)

// GET /api/doctors/profile/me — Get own profile
router.get('/profile/me', requireAuth, requireDoctor, doctorController.getMyProfile);

// POST /api/doctors/profile — Create doctor profile
router.post(
  '/profile',
  requireAuth,
  requireDoctor,
  uploadProfileImage,
  validate(doctorProfileSchema),
  doctorController.createProfile
);

// PUT /api/doctors/profile — Update doctor profile
router.put(
  '/profile',
  requireAuth,
  requireDoctor,
  uploadProfileImage,
  validate(doctorUpdateSchema),
  doctorController.updateProfile
);

// Public routes

// GET /api/doctors — Search verified doctors
router.get('/', validate(doctorSearchSchema, 'query'), doctorController.searchDoctors);

// GET /api/doctors/:id — Public doctor profile (MUST be last)
router.get('/:id', doctorController.getPublicProfile);

module.exports = router;
