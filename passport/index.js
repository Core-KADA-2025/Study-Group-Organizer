const passport = require('passport');
const GoogleStrategy = require('./strategies/google');

passport.use(GoogleStrategy);

module.exports = passport;
