const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { requireAuth } = require('../middleware/auth');
const { requireDoctor } = require('../middleware/role');
const { uploadDocuments } = require('../middleware/upload');

// POST /api/verification/submit — Submit verification documents
router.post(
  '/submit',
  requireAuth,
  requireDoctor,
  uploadDocuments,
  verificationController.submitVerification
);

// GET /api/verification/status — Check verification status
router.get(
  '/status',
  requireAuth,
  requireDoctor,
  verificationController.getVerificationStatus
);

module.exports = router;
