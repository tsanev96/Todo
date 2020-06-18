const logger = require('../startup/logging');

module.exports = function (err, req, res, next) {
  logger.error(err.message, err);
  return res.status(500).send('Something has failed..');
};

// errors only in the process pipeline
