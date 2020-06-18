require('express-async-errors');
require('winston-mongodb');
const winston = require('winston');
const config = require('config');

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log/logger.log', level: 'info' }),
    new winston.transports.MongoDB({ db: config.get('db') }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'log/exceptions.log' }),
    new winston.transports.Console({ level: 'error' }), // not readable
    new winston.transports.MongoDB({ db: config.get('db') }),
  ],
});

process.on('unhandledRejection', (ex) => {
  throw ex;
});

// process.on('uncaughtException', (ex) => {
//   logger.error(ex.message, ex);
//   process.exit(1);
// });

module.exports = logger;
