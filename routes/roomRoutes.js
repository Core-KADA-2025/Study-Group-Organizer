const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

router.post('/', async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.status(201).json(room);
});

router.get('/', async (req, res) => {
  const rooms = await Room.find().populate('group');
  res.json(rooms);
});

router.get('/:id', async (req, res) => {
  const room = await Room.findById(req.params.id).populate('group');
  if (!room) return res.status(404).send('Not found');
  res.json(room);
});

router.put('/:id', async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(room);
});

router.delete('/:id', async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
