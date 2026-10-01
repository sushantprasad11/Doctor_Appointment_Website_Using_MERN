/**
 * Custom error class for Express.
 * Extends Error with HTTP status code and optional error code.
 */
class ExpressError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'ExpressError';
  }
}

module.exports = ExpressError;
