const express = require('express');
const priorities = require('../routes/priorities');
const todos = require('../routes/todos');
const users = require('../routes/users');
const auth = require('../routes/auth');

module.exports = function (app) {
  app.use(express.json());
  app.use('/api/priorities', priorities);
  app.use('/api/todos', todos);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
};
