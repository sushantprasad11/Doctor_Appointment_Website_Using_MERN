const Joi = require('joi');

const verificationSubmitSchema = Joi.object({
  documentTypes: Joi.array()
    .items(Joi.string().valid('degree', 'certificate', 'registration', 'other'))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one document type must be specified.',
      'any.required': 'Document types are required.',
    }),
});

const verificationReviewSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required().messages({
    'any.only': 'Action must be either approve or reject.',
    'any.required': 'Review action is required.',
  }),
  rejectionReason: Joi.string().trim().max(500).when('action', {
    is: 'reject',
    then: Joi.required().messages({
      'any.required': 'Rejection reason is required when rejecting.',
    }),
    otherwise: Joi.allow('').default(''),
  }),
  adminNotes: Joi.string().trim().max(1000).allow('').default(''),
});

module.exports = { verificationSubmitSchema, verificationReviewSchema };
