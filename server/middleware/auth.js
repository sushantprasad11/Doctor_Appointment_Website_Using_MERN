const ExpressError = require('../utils/ExpressError');

/**
 * Middleware: Require authentication.
 * Checks if the request is authenticated via Passport session.
 */
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return next(new ExpressError('Authentication required. Please log in.', 401, 'AUTH_REQUIRED'));
}

module.exports = { requireAuth };
