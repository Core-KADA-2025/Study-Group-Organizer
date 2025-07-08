const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const paginate = require('../middlewares/paginate');

router.post('/', async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.status(201).json(room);
});

router.get('/', paginate(Room, 'group'), (req, res) => {
  res.json(res.paginatedResults);
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
