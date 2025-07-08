const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const paginate = require('../middlewares/paginate');

router.post('/', async (req, res) => {
  const note = new Note(req.body);
  await note.save();
  res.status(201).json(note);
});

router.get('/', paginate(Note, 'room'), (req, res) => {
  res.json(res.paginatedResults);
});

router.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id).populate('room');
  if (!note) return res.status(404).send('Not found');
  res.json(note);
});

router.put('/:id', async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(note);
});

router.delete('/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
