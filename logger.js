/*
 * Would-be configuration for winston (or whatever logger) here
 *
 * Glorified console.log via winston as-is, hide logging during tests
 *
 */

var winston = require('winston');

if (process.env.NODE_ENV === 'test') {
  winston.remove(winston.transports.Console);
}

module.exports = winston;
