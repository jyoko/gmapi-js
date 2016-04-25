/*
 * Starts the Express server
 *
 *   (You're probably more interested in "vehicles/" for the relevant router
 *    and external API calls)
 *
 */

var express = require('express');
var bodyParser = require('body-parser');
var vehiclesRouter = require('./vehicles/router');
var log = require('./logger');

var app = express();
app.use(bodyParser.json());

// Probably should include input validation & auth middleware here,
// but with only 1 external API seemed simpler to put hook there

// Put the relevant code together in one place
app.use('/vehicles', vehiclesRouter);

// Default to sending "Yep, server here" response for this mockup
app.use(function(req, res) {
  res.send('API server is live');
});

function start() {
  var port = process.env.PORT || 3000;
  app.listen(port);
  log.info('Server listening on port %s', port);
}

// call start if run directly (ie: via `npm start`)
if (require.main === module) {
  start();
}

// export app for testing, start for index.js convention
module.exports = {
  app: app,
  start: start
}

