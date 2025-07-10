const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect, authorizeGroupAccess } = require('../middlewares/auth');

// Buat note di dalam room (dan group)
router.post('/', protect, authorizeGroupAccess, async (req, res) => {
  const { title, content, room, group } = req.body;

  const note = new Note({ title, content, room, group });
  await note.save();
  res.status(201).json(note);
});

// Ambil semua notes dalam room dan group tertentu
router.get('/:groupId/:roomId', protect, authorizeGroupAccess, async (req, res) => {
  const { groupId, roomId } = req.params;

  const notes = await Note.find({ group: groupId, room: roomId });
  res.json(notes);
});

module.exports = router;
