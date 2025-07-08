const passport = require('passport');
require('./strategies/google');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const User = require('../models/User');
  User.findById(id).then(user => done(null, user)).catch(err => done(err));
});

module.exports = passport;
