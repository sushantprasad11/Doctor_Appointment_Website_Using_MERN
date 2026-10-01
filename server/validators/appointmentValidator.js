const Joi = require('joi');
const { CONSULTATION_TYPES } = require('../utils/constants');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const appointmentCreateSchema = Joi.object({
  doctorId: Joi.string().required().messages({
    'any.required': 'Doctor ID is required.',
  }),
  appointmentDate: Joi.date().iso().min('now').required().messages({
    'date.min': 'Appointment date must be in the future.',
    'any.required': 'Appointment date is required.',
  }),
  startTime: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': 'Start time must be in HH:mm format.',
    'any.required': 'Start time is required.',
  }),
  consultationType: Joi.string()
    .valid(...Object.values(CONSULTATION_TYPES))
    .required()
    .messages({
      'any.only': 'Consultation type must be either audio or video.',
      'any.required': 'Consultation type is required.',
    }),
});

const appointmentCancelSchema = Joi.object({
  cancellationReason: Joi.string().trim().max(500).allow('').default(''),
});

module.exports = { appointmentCreateSchema, appointmentCancelSchema };
