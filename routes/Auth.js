const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const sendEmail = require('../utils/sendEmails');
const { signToken, verifyToken } = require('../utils/jwt');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already used' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();

  const token = signToken({ id: user._id });
  const html = `<a href="http://localhost:5000/auth/verify/${token}">Verify Email</a>`;
  await sendEmail(email, 'Verify your email', html);

  res.json({ message: 'User registered' });
});

router.get('/verify/:token', async (req, res) => {
  try {
    const decoded = verifyToken(req.params.token);
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    res.send('Email verified!');
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid token');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: 'Invalid credentials' });

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Email not verified' });
  }

  const token = signToken({ id: user._id });
  res.json({ token });
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

module.exports = router;
