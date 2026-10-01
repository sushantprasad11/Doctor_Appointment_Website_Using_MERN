const Joi = require('joi');
const { CONSULTATION_TYPES, SPECIALIZATIONS } = require('../utils/constants');

const doctorProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150).required().messages({
    'any.required': 'Full name is required.',
  }),
  qualification: Joi.string().trim().min(2).max(200).required().messages({
    'any.required': 'Qualification is required.',
  }),
  specialization: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one specialization is required.',
      'any.required': 'Specialization is required.',
    }),
  expertise: Joi.array().items(Joi.string().trim()).default([]),
  diseasesTreated: Joi.array().items(Joi.string().trim()).default([]),
  bodySystems: Joi.array().items(Joi.string().trim()).default([]),
  experience: Joi.number().min(0).max(70).default(0),
  languages: Joi.array().items(Joi.string().trim()).default(['English']),
  bio: Joi.string().trim().max(2000).allow('').default(''),
  consultationFee: Joi.number().min(0).default(0),
  consultationTypes: Joi.array()
    .items(Joi.string().valid(...Object.values(CONSULTATION_TYPES)))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one consultation type is required.',
    }),
  location: Joi.object({
    clinicName: Joi.string().trim().allow('').default(''),
    address: Joi.string().trim().allow('').default(''),
    city: Joi.string().trim().allow('').default(''),
    state: Joi.string().trim().allow('').default(''),
    country: Joi.string().trim().default('India'),
    postalCode: Joi.string().trim().allow('').default(''),
  }).default({}),
  professionalRegNumber: Joi.string().trim().allow('').default(''),
});

const doctorUpdateSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150),
  qualification: Joi.string().trim().min(2).max(200),
  specialization: Joi.array().items(Joi.string().trim()).min(1),
  expertise: Joi.array().items(Joi.string().trim()),
  diseasesTreated: Joi.array().items(Joi.string().trim()),
  bodySystems: Joi.array().items(Joi.string().trim()),
  experience: Joi.number().min(0).max(70),
  languages: Joi.array().items(Joi.string().trim()),
  bio: Joi.string().trim().max(2000).allow(''),
  consultationFee: Joi.number().min(0),
  consultationTypes: Joi.array()
    .items(Joi.string().valid(...Object.values(CONSULTATION_TYPES)))
    .min(1),
  location: Joi.object({
    clinicName: Joi.string().trim().allow(''),
    address: Joi.string().trim().allow(''),
    city: Joi.string().trim().allow(''),
    state: Joi.string().trim().allow(''),
    country: Joi.string().trim(),
    postalCode: Joi.string().trim().allow(''),
  }),
  professionalRegNumber: Joi.string().trim().allow(''),
}).min(1);

const doctorSearchSchema = Joi.object({
  q: Joi.string().trim().allow(''),
  specialization: Joi.string().trim().allow(''),
  city: Joi.string().trim().allow(''),
  language: Joi.string().trim().allow(''),
  consultationType: Joi.string().valid(...Object.values(CONSULTATION_TYPES)).allow(''),
  minFee: Joi.number().min(0),
  maxFee: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});

module.exports = { doctorProfileSchema, doctorUpdateSchema, doctorSearchSchema };
