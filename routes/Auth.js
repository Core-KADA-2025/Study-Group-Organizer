const express = require('express');
const passport = require('passport');
const router = express.Router();

// Mulai login Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Callback dari Google
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: false
}), (req, res) => {
  res.json({
    message: 'Login with Google success!',
    user: req.user
  });
});

module.exports = router;
