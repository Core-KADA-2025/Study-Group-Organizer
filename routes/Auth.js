const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const { authenticate } = require('../middlewares/auth');
const sendEmail = require('../utils/sendEmails');
const { signToken, verifyToken } = require('../utils/jwt');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({ 
      name, 
      email, 
      password: hashed,
      isVerified: false 
    });
    await user.save();

    // Generate verification token
    const token = signToken({ id: user._id });

    // Send verification email
    const html = `
      <h2>Verify Your Email</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${token}">
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
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// Email verification endpoint
router.get('/verify/:token', async (req, res) => {
  try {
    const decoded = verifyToken(req.params.token);
    
    const user = await User.findByIdAndUpdate(
      decoded.id, 
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification token' 
      });
    }

    // Redirect to frontend with success message
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=true`);
  } catch (error) {
    console.error('Verification error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=verification_failed`);
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email before logging in' 
      });
    }

    // Generate token
    const token = signToken({ id: user._id });

    // Set cookie (optional)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user data' 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed` 
  }),
  (req, res) => {
    try {
      console.log('[Google Callback] User:', req.user);
      
      if (!req.user || !req.user.token) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_token`);
      }

      const token = req.user.token;
      console.log('[Google Callback] Redirecting with token');
      
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-redirect?token=${token}`);
    } catch (error) {
      console.error('[Google Callback] Error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=callback_error`);
    }
  }
);

module.exports = router;