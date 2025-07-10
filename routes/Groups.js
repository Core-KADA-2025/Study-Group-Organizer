const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middlewares/AuthMiddlewares');

// Buat group dan invite via email
router.post('/', protect, async (req, res) => {
  const { name, description, memberEmails } = req.body;

  try {
    const members = await User.find({ email: { $in: memberEmails } });
    const memberIds = members.map(u => u._id);

    // Tambahkan pembuat jika belum ada
    if (!memberIds.includes(req.user._id)) {
      memberIds.push(req.user._id);
    }

    const group = await Group.create({ name, description, members: memberIds });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
});

// Dapatkan semua group yang user ikuti
router.get('/', protect, async (req, res) => {
  const groups = await Group.find({ members: req.user._id });
  res.json(groups);
});

module.exports = router;
