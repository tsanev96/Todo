const express = require('express');
const router = express();
const { Todo, validate } = require('../models/todo');
const { Priority } = require('../models/priority');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send('User not found');
  // TODO: sort by importance
  res.send(user.todos);
});

router.get('/:id', [auth, validateObjectId], async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('todos')
    .populate('importance');
  if (!user) return res.status(404).send('User not found');

  res.send(user.todos);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const priority = await Priority.findById(req.body.priorityId);
  if (!priority) return res.status(404).send('Priority not found');

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send('User not found');

  const todo = new Todo({
    name: req.body.name,
    priority: {
      _id: priority._id,
      name: priority.name,
      importance: priority.importance,
    },
  });
  user.todos.push(todo);
  await user.save();

  res.send(todo);
});

router.put('/:id', auth, validateObjectId, async (req, res) => {
  // TODO:
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send('User not found');

  const priority = await Priority.findById(req.body.priorityId);
  if (!priority) return res.status(404).send('Priority not found');

  const todo = {
    name: req.body.name,
    priority: {
      _id: priority._id,
      name: priority.name,
      importance: priority.importance,
    },
  };

  await user.save();

  res.send(todo);
});

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
  const todo = await Todo.findByIdAndRemove(req.params.id);
  if (!todo) return res.status(404).send('todo already deleted');

  res.send(todo);
});

module.exports = router;
