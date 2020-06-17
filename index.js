const express = require('express');
const config = require('config');
const winston = require('winston');
const app = express();

const port = process.env.PORT || config.get('port');

require('./startup/config')();
require('./startup/db')();
require('./startup/routes')(app);

const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}`)
);

module.exports = server;
