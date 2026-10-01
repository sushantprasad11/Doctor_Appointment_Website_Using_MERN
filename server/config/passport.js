const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

/**
 * Configure Passport with Local Strategy.
 * passport-local-mongoose handles authentication logic (hash comparison, etc.)
 */
function configurePassport(passport) {
  // Use the createStrategy() convenience from passport-local-mongoose
  passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));

  // Serialize: store only user ID in session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize: fetch user from DB by ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

module.exports = configurePassport;
