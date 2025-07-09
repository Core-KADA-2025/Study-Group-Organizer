const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/User');

module.exports = new GoogleStrategy({
  clientID: '19302358821-nooes0bnrjn76641cs794vsgig4srto4.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const existing = await User.findOne({ googleId: profile.id });
  if (existing) return done(null, existing);

  const newUser = new User({
    googleId: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    isVerified: true
  });
  await newUser.save();
  done(null, newUser);
});
