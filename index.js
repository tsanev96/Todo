const express = require('express');
const app = express();
const port = process.env.PORT || 3900;

require('./startup/config')();
require('./startup/db')();
require('./startup/routes')(app);

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = server;
