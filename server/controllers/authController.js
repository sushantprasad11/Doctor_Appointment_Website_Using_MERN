const User = require('../models/User');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { ROLES } = require('../utils/constants');

/**
 * POST /api/auth/register
 * Register a new patient or doctor.
 */
const register = wrapAsync(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // Prevent admin registration through API
  if (role === ROLES.ADMIN) {
    throw new ExpressError('Admin registration is not allowed.', 403, 'ADMIN_REG_FORBIDDEN');
  }

  const newUser = new User({ name, email, role, phone });

  // passport-local-mongoose handles password hashing
  const registeredUser = await User.register(newUser, password);

  // Auto-login after registration
  req.login(registeredUser, (err) => {
    if (err) return next(err);
    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: registeredUser.toSafeObject(),
    });
  });
});

/**
 * POST /api/auth/login
 * Login with email and password.
 */
const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return next(new ExpressError(info?.message || 'Invalid credentials.', 401, 'INVALID_CREDENTIALS'));
    }
    if (!user.isActive) {
      return next(new ExpressError('Your account has been deactivated.', 403, 'ACCOUNT_DEACTIVATED'));
    }

    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return res.json({
        success: true,
        message: 'Login successful.',
        user: user.toSafeObject(),
      });
    });
  })(req, res, next);
};

/**
 * POST /api/auth/logout
 * Logout and destroy session.
 */
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destroy error:', destroyErr);
      }
      res.clearCookie('connect.sid');
      return res.json({
        success: true,
        message: 'Logged out successfully.',
      });
    });
  });
};

/**
 * GET /api/auth/me
 * Get current authenticated user.
 */
const getCurrentUser = wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.json({ success: true, user: null });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.json({ success: true, user: null });
  }

  return res.json({
    success: true,
    user: user.toSafeObject(),
  });
});

module.exports = { register, login, logout, getCurrentUser };
