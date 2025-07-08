const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/User');

passport.use(new GoogleStrategy({
  clientID: '19302358821-ru7ka6q98v6r2b3k3ju260ve6as8amrh.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0].value,
      });
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));
