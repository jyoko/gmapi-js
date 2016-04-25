/*
 * Tests GMAPI vehicles translation, stubs external requests
 *
 */

process.env.NODE_ENV = 'test';

var P = require('bluebird');
var should = require('should');
var sinon = require('sinon');
var request = require('request');
var askGM = require(__dirname + '/../vehicles/gmapi');

/*
 * Create generic GM Response objects and matching translated objects for
 * use in below tests
 */

var gmVehicleInfo = {
  "service": "getVehicleInfo",
  "status": "200",
  "data": {
    "vin": {
      "type": "String",
      "value": "123123412412"
    },
    "color": {
      "type": "String",
      "value": "Metallic Silver"
    },
    "fourDoorSedan": {
      "type": "Boolean",
      "value": "True"
    },
    "twoDoorCoupe": {
      "type": "Boolean",
      "value": "False"
    },
    "driveTrain": {
      "type": "String",
      "value": "v8"
    }
  }
};
var translatedVehicleInfo = {
  "vin": "123123412412",
  "color": "Metallic Silver",
  "doorCount": 4,
  "driveTrain": "v8"
}

var gmSecurity = {
  "service": "getSecurityStatus",
  "status": "200",
  "data": {
    "doors": {
      "type": "Array",
      "values": [
        {
          "location": {
            "type": "String",
            "value": "frontLeft"
          },
          "locked": {
            "type": "Boolean",
            "value": "False"
          }
        },
        {
          "location": {
            "type": "String",
            "value": "frontRight"
          },
          "locked": {
            "type": "Boolean",
            "value": "True"
          }
        }
      ]
    }
  }
};
var translatedSecurity = [
  {
    "location": "frontLeft",
    "locked": false
  },
  {
    "location": "frontRight",
    "locked": true
  }
];

var gmFuel = {
  "service": "getEnergyService",
  "status": "200",
  "data": {
    "tankLevel": {
      "type": "Number",
      "value": "30"
    },
    "batteryLevel": {
      "type": "Null",
      "value": "null"
    }
  }
};
var translatedFuel = {
  "percent": 30
};

var gmBattery = {
  "service": "getEnergyService",
  "status": "200",
  "data": {
    "tankLevel": {
      "type": "Number",
      "value": "30"
    },
    "batteryLevel": {
      "type": "Number",
      "value": "50"
    }
  }
};
var translatedBattery = {
  "percent": 50
};
var gmBatteryNull = {
  "service": "getEnergyService",
  "status": "200",
  "data": {
    "tankLevel": {
      "type": "Number",
      "value": "30"
    },
    "batteryLevel": {
      "type": "Null",
      "value": "null"
    }
  }
};
var translatedBatteryNull = {
  "percent": "Unavailable"
};

var gmEngineSuccess = {
  "service": "actionEngine",
  "status": "200",
  "actionResult": {
    "status": "EXECUTED"
  }
};
var translatedEngineSuccess = {
  "status": "success"
};
var gmEngineError = {
  "service": "actionEngine",
  "status": "200",
  "actionResult": {
    "status": "FAILED"
  }
};
var translatedEngineError = {
  "status": "error"
};

var gmGenericError = {
  "status": "404",
  "reason": "Vehicle id: 1337 not found."
};
var translatedGenericError = {
  "status": "Failed",
  "reason": "Vehicle id: 1337 not found."
};
var translatedConnectionError = {
  "status": "Failed",
  "reason": "Connection error"
};

describe('GMAPI Wrapper for Vehicles API', function() {

  before(function() {
    this.request = sinon.stub(request,'post');
  });
  after(function() {
    this.request.restore();
  });

  describe('Vehicle Info - /:id', function() {

    it('Should validate ID format', function(done) {
      askGM.info(111111).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).then(function() {
        return askGM.info('asdf')
      }).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).finally(done);
    });

    it('Should include authorization');

    it('Should take ID and return translated object via Promise', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmVehicleInfo
        });
      }));

      askGM.info(1234).then(function(response) {
        response.should.deepEqual(translatedVehicleInfo, 'gmapi should translate vehicle object correctly');
        done();
      });
    });

    it('Should return error object if error from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmGenericError
        });
      }));

      askGM.info(1337).then(function(response) {
        response.should.deepEqual(translatedGenericError, 'gmapi should translate error correctly');
        done();
      });
    });

    it('Should return error object if error fetching from GM API', function(done) {
      this.request.returns(new P(function() {
        throw new Error('Should get caught');
      }));
      askGM.info(1337).then(function(response) {
        response.should.deepEqual(translatedConnectionError, 'gmapi should handle exceptions in external request');
        done();
      });
    });

  });

  describe('Security - /:id/doors', function() {

    it('Should validate ID format', function(done) {
      askGM.doors(111111).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).then(function() {
        return askGM.doors('asdf')
      }).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).finally(done);
    });

    it('Should include authorization');

    it('Should take ID and return translated object via Promise', function(done) {
      
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmSecurity
        });
      }));

      askGM.doors(1234).then(function(response) {
        response.should.deepEqual(translatedSecurity, 'gmapi should translate security object correctly');
        done();
      });
      
    });

    it('Should return error object if error from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmGenericError
        });
      }));

      askGM.doors(1234).then(function(response) {
        response.should.deepEqual(translatedGenericError, 'gmapi should translate error object correctly');
        done();
      });
    });

    it('Should return error object if error fetching from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        throw new Error('Should be caught');
      }));

      askGM.doors(1234).then(function(response) {
        response.should.deepEqual(translatedConnectionError, 'gmapi should catch connection errors');
        done();
      });
    });

  });

  describe('Fuel Range - /:id/fuel', function() {

    it('Should validate ID format', function(done) {
      askGM.fuel(111111).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).then(function() {
        return askGM.fuel('asdf')
      }).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).finally(done);
    });

    it('Should include authorization');

    it('Should take ID and return translated object via Promise', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmFuel
        });
      }));

      askGM.fuel(1234).then(function(response) {
        response.should.deepEqual(translatedFuel, 'gmapi should translate fuel object correctly');
        done();
      });
    });

    it('Should return error object if error from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmGenericError
        });
      }));

      askGM.fuel(1234).then(function(response) {
        response.should.deepEqual(translatedGenericError, 'gmapi should translate error object correctly');
        done();
      });
    });

    it('Should return error object if error fetching from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        throw new Error('Should be caught');
      }));

      askGM.fuel(1234).then(function(response) {
        response.should.deepEqual(translatedConnectionError, 'gmapi should catch connection errors');
        done();
      });
    });
  });

  describe('Battery Range - /:id/battery', function() {

    it('Should validate ID format', function(done) {
      askGM.battery(111111).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).then(function() {
        return askGM.battery('asdf')
      }).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).finally(done);
    });

    it('Should include authorization');

    it('Should take ID and return translated object via Promise', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmBattery
        });
      }));

      askGM.battery(1234).then(function(response) {
        response.should.deepEqual(translatedBattery, 'gmapi should translate battery object correctly');
        done();
      });
    });

    it('Should handle Null values correctly', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmBatteryNull
        });
      }));

      askGM.battery(1234).then(function(response) {
        response.should.deepEqual(translatedBatteryNull, 'gmapi should translate null battery object correctly');
        done();
      });
    });

    it('Should return error object if error from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmGenericError
        });
      }));

      askGM.battery(1234).then(function(response) {
        response.should.deepEqual(translatedGenericError, 'gmapi should translate error object correctly');
        done();
      });
    });

    it('Should return error object if error fetching from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        throw new Error('Should be caught');
      }));

      askGM.battery(1234).then(function(response) {
        response.should.deepEqual(translatedConnectionError, 'gmapi should catch connection errors');
        done();
      });
    });
  });

  describe('Start/Stop Engine - /:id/engine', function() {

    it('Should validate ID format', function(done) {
      askGM.engine(111111,'START').then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).then(function() {
        return askGM.engine('asdf','STOP')
      }).then(function(response) {
        return P.try(function() {
          response.should.deepEqual(translatedConnectionError, 'gmapi should reject invalid IDs');
        });
      }).finally(done);
    });

    it('Should include authorization');

    it('Should take ID and START and return translated object via Promise', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmEngineSuccess
        });
      }));

      askGM.engine(1234, 'START').then(function(response) {
        response.should.deepEqual(translatedEngineSuccess, 'gmapi should translate engine start object correctly');
        done();
      });
    });

    it('Should take ID and STOP and return translated object via Promise', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmEngineSuccess
        });
      }));

      askGM.engine(1234,'STOP').then(function(response) {
        response.should.deepEqual(translatedEngineSuccess, 'gmapi should translate engine stop object correctly');
        done();
      });
    });

    it('Should catch invalid engine commands', function(done) {
      askGM.engine(1234, 'NOT_OK').then(function(response) {
        response.should.deepEqual(translatedConnectionError, 'gmapi should catch invalid engine commands');
        done();
      });
    });

    it('Should return error object if error from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        // fake response body
        resolve({
          body: gmEngineError
        });
      }));

      askGM.engine(1234,'STOP').then(function(response) {
        response.should.deepEqual(translatedEngineError, 'gmapi should translate engine error object correctly');
        done();
      });
    });

    it('Should return error object if error fetching from GM API', function(done) {
      this.request.returns(new P(function(resolve) {
        throw new Error('Should be caught');
      }));

      askGM.engine(1234,'STOP').then(function(response) {
        response.should.deepEqual(translatedConnectionError, 'gmapi should catch connection errors');
        done();
      });
    });
  });

});
