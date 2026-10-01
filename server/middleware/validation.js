const ExpressError = require('../utils/ExpressError');

/**
 * Factory: create Joi validation middleware.
 * @param {Function} schemaFn - A function that returns a Joi schema (or the schema itself).
 * @param {string} property - The request property to validate ('body', 'query', 'params').
 * @returns Express middleware
 *
 * Usage:
 *   const { registerSchema } = require('../validators/authValidator');
 *   router.post('/register', validate(registerSchema), controller.register);
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const dataToValidate = req[property];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('; ');
      return next(new ExpressError(messages, 400, 'VALIDATION_ERROR'));
    }

    // Replace request data with validated/stripped values
    req[property] = value;
    return next();
  };
}

module.exports = { validate };
