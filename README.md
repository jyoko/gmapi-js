# Generic Motors API Wrapper

This exposes a sane, consistent API to query a less-obvious vendor API (the nonexistent Generic Motors).

## Usage

Clone the repo, `npm install`, then `npm start`. By default will listen on port 3000 (if environment variable`PORT` not set).

Promises are handled with [Bluebird](https://github.com/petkaantonov/bluebird), but there is some ES2015 function shorthand if you see errors in older versions of Node.

Uses [request.js](https://github.com/request/request) for easy outgoing HTTP and includes [Winston](https://github.com/winstonjs/winston) for logging, used minimally and only with default logger. Tests suppress the console output; more feature-ful logging can be enabled by tweaking winston config in `logger.js`.

## Testing

`npm test` or `mocha`

Tests are split between the local Express API and the translation module (`vehicles/gmapi.js`) and are run with [Mocha](https://mochajs.org/).

Server tests done with [Sinon](http://sinonjs.org/) (to stub gmapi) and [Supertest](https://github.com/visionmedia/supertest), API wrapper with [should](https://github.com/shouldjs/should.js) and Sinon to stub the network requests.

