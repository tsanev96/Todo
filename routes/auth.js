const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/user');

router.post('/', async (req, res) => {
  // logind - email/username and password
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Wrong password or username');

  const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatePassword)
    return res.status(400).send('Wrong password or username');

  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;
