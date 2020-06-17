const express = require('express');
const router = express();
const { User, validateUser } = require('../models/user');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const validate = require('../middleware/validate');

router.get('/me', async (req, res) => {});

// register an user
router.post('/', validate(validateUser), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered');

  user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send('User already registered');

  user = new User(_.pick(req.body, ['username', 'email', 'password', 'name']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'name', 'email', 'username']));
});

module.exports = router;
