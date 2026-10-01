/**
 * Centralized error-handling middleware.
 * All errors flow through here for consistent API responses.
 */
function errorHandler(err, req, res, next) {
  // Default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  const errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Log server errors
  if (statusCode >= 500) {
    console.error(' Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message).join('; ');
    return res.status(400).json({
      success: false,
      message: messages,
      errorCode: 'VALIDATION_ERROR',
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${field}. This record already exists.`,
      errorCode: 'DUPLICATE_KEY',
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}: ${err.value}`,
      errorCode: 'INVALID_ID',
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
