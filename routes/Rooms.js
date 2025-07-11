const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect, authorizeGroupAccess } = require('../middlewares/auth');

router.post('/', protect, authorizeGroupAccess, async (req, res) => {
  const { name, group } = req.body;

  const room = new Room({ name, group });
  await room.save();
  res.status(201).json(room);
});

router.get('/:groupId', protect, authorizeGroupAccess, async (req, res) => {
  const { groupId } = req.params;

  const rooms = await Room.find({ group: groupId });
  res.json(rooms);
});

module.exports = router;
