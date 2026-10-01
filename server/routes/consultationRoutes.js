const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { requireAuth } = require('../middleware/auth');

// GET /api/consultation/:appointmentId/access
router.get('/:appointmentId/access', requireAuth, consultationController.getConsultationAccess);

module.exports = router;
