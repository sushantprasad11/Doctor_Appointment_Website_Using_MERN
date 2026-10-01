const express = require('express');
const router = express.Router();
const { symptomCheck } = require('../controllers/aiController');

// POST /api/ai/symptom-check
router.post('/symptom-check', symptomCheck);

module.exports = router;
