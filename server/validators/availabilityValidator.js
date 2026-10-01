const Joi = require('joi');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilitySchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required().messages({
    'any.required': 'Day of week is required (0=Sunday, 6=Saturday).',
  }),
  startTime: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': 'Start time must be in HH:mm format.',
    'any.required': 'Start time is required.',
  }),
  endTime: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': 'End time must be in HH:mm format.',
    'any.required': 'End time is required.',
  }),
  breakPeriods: Joi.array()
    .items(
      Joi.object({
        start: Joi.string().pattern(timePattern).required(),
        end: Joi.string().pattern(timePattern).required(),
      })
    )
    .default([]),
  slotDuration: Joi.number().integer().min(5).max(120).default(30).messages({
    'number.min': 'Slot duration must be at least 5 minutes.',
    'number.max': 'Slot duration must be at most 120 minutes.',
  }),
  maxAppointments: Joi.number().integer().min(1).default(20),
  active: Joi.boolean().default(true),
});

const availabilityUpdateSchema = Joi.object({
  startTime: Joi.string().pattern(timePattern),
  endTime: Joi.string().pattern(timePattern),
  breakPeriods: Joi.array().items(
    Joi.object({
      start: Joi.string().pattern(timePattern).required(),
      end: Joi.string().pattern(timePattern).required(),
    })
  ),
  slotDuration: Joi.number().integer().min(5).max(120),
  maxAppointments: Joi.number().integer().min(1),
  active: Joi.boolean(),
}).min(1);

module.exports = { availabilitySchema, availabilityUpdateSchema };
