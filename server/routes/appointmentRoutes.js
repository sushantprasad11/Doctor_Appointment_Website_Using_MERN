const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/auth');
const { requirePatient, requireDoctor } = require('../middleware/role');
const { validate } = require('../middleware/validation');
const { appointmentCreateSchema, appointmentCancelSchema } = require('../validators/appointmentValidator');

// POST /api/appointments — Book appointment (patient only)
router.post(
  '/',
  requireAuth,
  requirePatient,
  validate(appointmentCreateSchema),
  appointmentController.createAppointment
);

// GET /api/appointments — Get my appointments (patient or doctor)
router.get('/', requireAuth, appointmentController.getMyAppointments);

// GET /api/appointments/slots/:doctorId — Get available slots
router.get('/slots/:doctorId', appointmentController.getAvailableSlotsForDate);

// GET /api/appointments/:id — Get specific appointment
router.get('/:id', requireAuth, appointmentController.getAppointment);

// PATCH /api/appointments/:id/cancel — Cancel appointment
router.patch(
  '/:id/cancel',
  requireAuth,
  validate(appointmentCancelSchema),
  appointmentController.cancelAppointment
);

// PATCH /api/appointments/:id/complete — Complete appointment (doctor only)
router.patch(
  '/:id/complete',
  requireAuth,
  requireDoctor,
  appointmentController.completeAppointment
);

module.exports = router;
