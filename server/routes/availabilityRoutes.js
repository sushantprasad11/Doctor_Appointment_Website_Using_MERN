const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { requireAuth } = require('../middleware/auth');
const { requireDoctor } = require('../middleware/role');
const { validate } = require('../middleware/validation');
const { availabilitySchema, availabilityUpdateSchema } = require('../validators/availabilityValidator');

// Public: get doctor's availability
router.get('/doctor/:doctorId', availabilityController.getDoctorAvailability);

// Protected doctor routes
router.get('/me', requireAuth, requireDoctor, availabilityController.getMyAvailability);

router.post(
  '/',
  requireAuth,
  requireDoctor,
  validate(availabilitySchema),
  availabilityController.createAvailability
);

router.put(
  '/:id',
  requireAuth,
  requireDoctor,
  validate(availabilityUpdateSchema),
  availabilityController.updateAvailability
);

router.delete(
  '/:id',
  requireAuth,
  requireDoctor,
  availabilityController.deleteAvailability
);

module.exports = router;
