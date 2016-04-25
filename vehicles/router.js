/*
 * Handles the incoming Express routes for /vehicles
 *
 */

var P = require('bluebird');
var express = require('express');
var log = require(__dirname + '/../logger');
var app = express();
var router = express.Router();
var askGM = require('./gmapi');

// Another generic error func, slightly different output to differentiate 
// where the error was thrown (vs gmapi)
function topError(res) {
  return function(e) {
    log.error(e);
    res.json({status:'Failed',reason:'Unable to process request'});
  }
}


router.route('/:id')

  .get(function(req, res) {
    askGM.info(req.params.id)
      .then(function(v) { 
        res.json(v);
      })
      .catch(topError(res));

  });

router.route('/:id/:action')

  .get(function(req, res) {
    if (askGM.hasOwnProperty(req.params.action)) {
      askGM[req.params.action](req.params.id)
        .then(function(v) {
          res.json(v);
        })
        .catch(topError(res));
    } else {
      topError(res)(Error('Invalid endpoint'));
    }
  })

  .post(function(req, res) {
    if (req.params.action === 'engine') {
      askGM.engine(req.params.id, req.body.action)
        .then(function(v) {
          res.json(v);
        })
        .catch(topError(res));
    } else {
      topError(res)(Error('Invalid POST request'));
    }
  });

module.exports = router;
