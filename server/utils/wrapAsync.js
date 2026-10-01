/**
 * Wraps async route handlers to catch errors
 * and forward them to Express error middleware.
 */
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

module.exports = wrapAsync;
