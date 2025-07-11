const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { authenticate } = require('../middlewares/auth');
const sendEmail = require('../utils/sendEmails');
const { signToken, verifyToken } = require('../utils/jwt');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashed, isVerified: false });
    await user.save();

    const token = signToken({ id: user._id });

    const html = `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${process.env.BACKEND_URL || 'https://backend-own.hopto.org/'}/auth/verify/${token}">
        Verify Email
      </a>
    `;

    await sendEmail(email, 'Verify your email', html);

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. Please check your email for verification.', 
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const decoded = verifyToken(req.params.token);
    console.log('[VERIFY] Token decoded:', decoded);

    const user = await User.findByIdAndUpdate(decoded.id, { isVerified: true }, { new: true });

    if (!user) {
      console.error('[VERIFY] User not found');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verified=false`);
    }

    console.log('[VERIFY] User verified:', user.email);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verified=true`);
  } catch (error) {
    console.error('[VERIFY] Error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?verified=false`);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
    }

    const token = signToken({ id: user._id });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user data' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      if (!req.user || !req.user.token) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_token`);
      }

      const token = req.user.token;
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-redirect?token=${token}`);
    } catch (error) {
      console.error('[Google Callback] Error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=callback_error`);
    }
  }
);

module.exports = router;
