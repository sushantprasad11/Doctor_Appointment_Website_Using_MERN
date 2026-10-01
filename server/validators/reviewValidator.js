const Joi = require('joi');

const reviewSchema = Joi.object({
  appointmentId: Joi.string().required().messages({
    'any.required': 'Appointment ID is required.',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1.',
    'number.max': 'Rating must be at most 5.',
    'any.required': 'Rating is required.',
  }),
  review: Joi.string().trim().max(1000).allow('').default(''),
});

module.exports = { reviewSchema };
