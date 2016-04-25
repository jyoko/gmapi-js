/*
 * Tests local API server, stubs gmapi translations
 *
 */

var sinon = require('sinon');
var P = require('bluebird');
var request = require('supertest');
var askGM = require(__dirname + '/../vehicles/gmapi');
var server = require(__dirname + '/../server.js').app;

process.env.NODE_ENV = 'test';

/*
 * Objects for use in below tests
 *
 */
var infoResponse = {
  "vin": "123123412412",
  "color": "Metallic Silver",
  "doorCount": 4,
  "driveTrain": "v8"
}

var doorsResponse = [
  {
    "location": "frontLeft",
    "locked": false
  },
  {
    "location": "frontRight",
    "locked": true
  }
];

var fuelResponse = {
  "percent": 30
};

var batteryResponse = {
  "percent": 50
};
var batteryNullResponse = {
  "percent": "Unavailable"
};

var engineStartRequest = {
  "action" : "START"
};
var engineStopRequest = {
  "action" : "STOP"
};
var engineBadRequest = {
  "action" : "NOT_OK"
};
var engineSuccessResponse = {
  "status": "success"
};
var engineErrorResponse = {
  "status": "error"
};

var genericErrorResponse = {
  "status": "Failed",
  "reason": "Vehicle id: 1337 not found."
};
var catchTopErrorResponse = {
  "status": "Failed",
  "reason": "Unable to process request"
};


describe('API Server Status', function() {

  before(function() {
    function stub(ok) {
      return function(id) {
        return P.try(function() {
          switch(id) {
            case '1234': return ok;
            case '1337': return genericErrorResponse;
            case 'null': return batteryNullResponse;
            case 'engerr': return engineErrorResponse;
            default: throw new Error('Should be caught');
          }
        });
      };
    }
    this.askGM = {};
    this.askGM.info = sinon.stub(askGM, 'info', stub(infoResponse));
    this.askGM.doors = sinon.stub(askGM, 'doors', stub(doorsResponse));
    this.askGM.fuel = sinon.stub(askGM, 'fuel', stub(fuelResponse));
    this.askGM.battery = sinon.stub(askGM, 'battery', stub(batteryResponse));
    this.askGM.engine = sinon.stub(askGM, 'engine', stub(engineSuccessResponse));
  });
  after(function() {
    this.askGM.info.restore();
    this.askGM.doors.restore();
    this.askGM.fuel.restore();
    this.askGM.battery.restore();
    this.askGM.engine.restore();
  });

  it('Should be available for HTTP requests', function(done) {
    request(server)
      .get('/')
      .expect(200)
      .expect('API server is live',done);
  });

  describe('Vehicles route', function() {

    describe('Vehicle Info', function() {

      it('Should reply with info object for /:id', function(done) {
        request(server)
          .get('/vehicles/1234')
          .expect(200)
          .expect(infoResponse, done);
      });

      it('Should reply with error object for negative results from external API', function(done) {
        request(server)
          .get('/vehicles/1337')
          .expect(200)
          .expect(genericErrorResponse,done);
      });

      it('Should reply with error object for problem running gmapi', function(done) {
        request(server)
          .get('/vehicles/willthrow')
          .expect(200)
          .expect(catchTopErrorResponse,done);
      });

    });

    describe('Security', function() {

      it('Should reply with a door array for /:id/doors', function(done) {
        request(server)
          .get('/vehicles/1234/doors')
          .expect(200)
          .expect(doorsResponse, done);
      });

      it('Should reply with error object for negative results from external API', function(done) {
        request(server)
          .get('/vehicles/1337')
          .expect(200)
          .expect(genericErrorResponse,done);
      });

      it('Should reply with error object for problem running gmapi', function(done) {
        request(server)
          .get('/vehicles/willthrow')
          .expect(200)
          .expect(catchTopErrorResponse,done);
      });

    });

    describe('Fuel Range', function() {

      it('Should reply with a percent object for /:id/fuel', function(done) {
        request(server)
          .get('/vehicles/1234/doors')
          .expect(200)
          .expect(doorsResponse, done);
      });

      it('Should reply with error object for negative results from external API', function(done) {
        request(server)
          .get('/vehicles/1337/doors')
          .expect(200)
          .expect(genericErrorResponse,done);
      });

      it('Should reply with error object for problem running gmapi', function(done) {
        request(server)
          .get('/vehicles/willthrow/doors')
          .expect(200)
          .expect(catchTopErrorResponse,done);
      });

    });

    describe('Fuel Range', function() {

      it('Should reply with a percent object for /:id/fuel', function(done) {
        request(server)
          .get('/vehicles/1234/fuel')
          .expect(200)
          .expect(fuelResponse, done);
      });

      it('Should reply with error object for negative results from external API', function(done) {
        request(server)
          .get('/vehicles/1337/fuel')
          .expect(200)
          .expect(genericErrorResponse,done);
      });

      it('Should reply with error object for problem running gmapi', function(done) {
        request(server)
          .get('/vehicles/willthrow/fuel')
          .expect(200)
          .expect(catchTopErrorResponse,done);
      });
    });

    describe('Battery Range', function() {

      it('Should reply with a percent object for /:id/battery', function(done) {
        request(server)
          .get('/vehicles/1234/battery')
          .expect(200)
          .expect(batteryResponse, done);
      });

      it('Should reply with an Unavailable percent object if null for /:id/battery', function(done) {
        request(server)
          .get('/vehicles/null/battery')
          .expect(200)
          .expect(batteryNullResponse, done);
      });

      it('Should reply with error object for negative results from external API', function(done) {
        request(server)
          .get('/vehicles/1337/battery')
          .expect(200)
          .expect(genericErrorResponse,done);
      });

      it('Should reply with error object for problem running gmapi', function(done) {
        request(server)
          .get('/vehicles/willthrow/battery')
          .expect(200)
          .expect(catchTopErrorResponse,done);
      });

    });

    describe('Start/Stop Engine', function() {

      it('Should reply with proper status for STOP action', function(done) {
        request(server)
          .post('/vehicles/1234/engine')
          .send(engineStartRequest)
          .expect(200)
          .expect(engineSuccessResponse, done);
      });

      it('Should reply with proper status for START action', function(done) {
        request(server)
          .post('/vehicles/1234/engine')
          .send(engineStopRequest)
          .expect(200)
          .expect(engineSuccessResponse, done);
      });

      it('Should reply with error status for negative results from external API', function(done) {
        request(server)
          .post('/vehicles/engerr/engine')
          .send(engineBadRequest)
          .expect(200)
          .expect(engineErrorResponse,done);
      });

      it('Should reply with error object for problem running gmapi', function(done) {
        request(server)
          .post('/vehicles/willthrow/engine')
          .send(engineBadRequest)
          .expect(200)
          .expect(catchTopErrorResponse,done);
      });

    });

  });

});

