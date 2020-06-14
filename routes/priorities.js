const express = require('express');
const router = express();
const { Priority, validate } = require('../models/priority');
const _ = require('lodash');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', async (req, res) => {
  const priorities = await Priority.find().sort('name');
  res.send(priorities);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const priority = await Priority.findById(req.params.id);
  if (!priority) return res.status(404).send('Priority not found');

  res.send(priority);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const priority = new Priority(_.pick(req.body, ['name', 'importance']));
  await priority.save();

  res.send(priority);
});

router.put('/:id', [auth, admin, validateObjectId], async (req, res) => {
  // TODO:
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const priority = await Priority.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ['name', 'importance']),
    { new: true }
  );
  if (!priority) return res.status(404).send('Priority not found');

  res.send(priority);
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const priority = await Priority.findByIdAndRemove(req.params.id);
  if (!priority) return res.status(404).send('Priority already deleted');

  res.send(priority);
});

module.exports = router;
