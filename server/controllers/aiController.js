const { analyzeSymptoms } = require('../services/aiService');
const Doctor = require('../models/Doctor');
const wrapAsync = require('../utils/wrapAsync');
const { VERIFICATION_STATUS } = require('../utils/constants');

/**
 * POST /api/ai/symptom-check
 * Analyze symptoms and recommend doctors.
 * Body: { message: string, history: [{ role, content }] }
 */
const symptomCheck = wrapAsync(async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Please describe your symptoms' });
  }

  // Get AI analysis
  const analysis = await analyzeSymptoms(message.trim(), history);

  // If AI identified a specialization, find matching doctors
  let recommendedDoctors = [];
  if (analysis.specialization) {
    recommendedDoctors = await Doctor.find({
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      specialization: { $regex: new RegExp(analysis.specialization, 'i') },
    })
      .select('fullName qualification specialization experience consultationFee location profileImage')
      .limit(3)
      .lean();
  }

  res.json({
    success: true,
    data: {
      ...analysis,
      recommendedDoctors,
    },
  });
});

module.exports = { symptomCheck };
