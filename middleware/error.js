const { func } = require('@hapi/joi');

module.exports = function (err, req, res, next) {
  return res.status(500).send('Something has failed..');
};

// errors only in the process pipeline
