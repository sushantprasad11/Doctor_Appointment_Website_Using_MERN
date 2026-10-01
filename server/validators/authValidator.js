const Joi = require('joi');
const { ROLES } = require('../utils/constants');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters.',
    'string.max': 'Name must be at most 100 characters.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters.',
    'string.max': 'Password must be at most 128 characters.',
    'any.required': 'Password is required.',
  }),
  role: Joi.string()
    .valid(ROLES.PATIENT, ROLES.DOCTOR)
    .required()
    .messages({
      'any.only': 'Role must be either patient or doctor.',
      'any.required': 'Role is required.',
    }),
  phone: Joi.string().trim().allow('').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required.',
  }),
});

module.exports = { registerSchema, loginSchema };
