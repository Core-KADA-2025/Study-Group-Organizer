const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const paginate = require('../middlewares/paginate');

router.post('/', async (req, res) => {
  const group = new Group(req.body);
  await group.save();
  res.status(201).json(group);
});

router.get('/', paginate(Group), (req, res) => {
  res.json(res.paginatedResults);
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
