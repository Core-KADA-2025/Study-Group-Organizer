const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

router.post('/', async (req, res) => {
  const group = new Group(req.body);
  await group.save();
  res.status(201).json(group);
});


router.get('/', async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
});


router.get('/:id', async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).send('Not found');
  res.json(group);
});


router.put('/:id', async (req, res) => {
  const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(group);
});


router.delete('/:id', async (req, res) => {
  await Group.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

module.exports = router;
