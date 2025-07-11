const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/User');
const { signToken } = require('../../utils/jwt');

module.exports = new GoogleStrategy({
  clientID: '19302358821-nooes0bnrjn76641cs794vsgig4srto4.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: "https://backend-own.hopto.org/auth/google/callback",
  scope: ['profile', 'email'], 
  passReqToCallback: false 
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('[Google Strategy] Profile:', profile); 
    
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        isVerified: true
      });
    }

    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
    });

    console.log('[Google Strategy] Token created:', token);

    done(null, { token, user });
  } catch (err) {
    console.error('[Google Strategy] Error:', err);
    done(err, null);
  }
});
