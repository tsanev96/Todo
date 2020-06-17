const express = require('express');
const router = express();
const { Todo, validateTodo } = require('../models/todo');
const { Priority } = require('../models/priority');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  // if (!user) return res.status(404).send('User not found');    ?!
  // TODO: sort by importance
  res.send(user.todos);
});

router.get('/:id', auth, validateObjectId, async (req, res) => {
  const user = await User.findById(req.user._id);
  const todo = user.todos.id(req.params.id);
  if (!todo) return res.status(404).send('Todo not found');

  res.send(todo);
});

router.post('/', auth, validate(validateTodo), async (req, res) => {
  const priority = await Priority.findById(req.body.priorityId);
  if (!priority) return res.status(400).send('Priority not found');

  // needed if check ?
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

router.put(
  '/:id',
  auth,
  validate(validateTodo),
  validateObjectId,
  async (req, res) => {
    const priority = await Priority.findById(req.body.priorityId);
    if (!priority) return res.status(400).send('Priority not found');

    const reqTodo = {
      name: req.body.name,
      priority: {
        _id: priority._id,
        name: priority.name,
        importance: priority.importance,
      },
    };

    const todo = await User.updateOne(
      {
        _id: req.user._id,
        'todos._id': req.params.id,
      },
      {
        $set: {
          'todos.$': reqTodo,
        },
      }
    );
    if (todo.nModified === 0) return res.status(404).send('Todo not found');

    res.send(reqTodo);
  }
);

router.delete('/:id', auth, validateObjectId, async (req, res) => {
  const user = await User.findById(req.user._id);

  const todo = user.todos.id(req.params.id);
  if (!todo) return res.status(404).send('Todo already deleted');
  todo.remove();
  user.save();

  res.send(todo);
});

module.exports = router;
