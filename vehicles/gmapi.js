/*
 * Handles requests from router to Generic Motors API
 *
 * Calls return promises that resolve to standard response object
 *
 * Enumerable keys on gmapi should match external API requests, makes life easier
 * Shorthand reference for each API call commented above the methods
 *
 * TODO: Type: Null <-- means unavailable?
 *       Status codes <-- What needs to be covered here?
 *                        Non-200 has "reason" (AFAICT)
 */

var P = require('bluebird');
// Promisifying request is a bit odd
// WARNING: use the .HTTP_METHOD functions to allow for test stubs
var request = P.promisifyAll(require('request'));
request.post = P.promisify(request.post);
var log = require(__dirname + '/../logger');
var GM_API = 'https://gmapi.azurewebsites.net';

// Nothing spec'd for error handling, try to pass along messages from server
function GMAPI_ERROR(msg) {
  return {
    'status' : 'Failed',
    'reason' : msg,
  };
}

// Will trigger if actual connection error occurs
function requestError(e) {
  log.warn(e);
  return GMAPI_ERROR('Connection error');
}

function validateID(id) {
  // No validation rules given but only 2 valid values, throw if not in that format
  return P.try(function() {
    if (!/^\d{4}$/m.test(id)) throw new Error('Invalid Vehicle ID');
  });
}

var gmapi = {

  /*
   * 
   * GET /vehicles/:id
   * return:
   * {
   *   vin, color, doorCount, driveTrain
   * }
   *
   *
   * POST /getVehicleInfoService
   * Content-Type: application/json
   *
   * {
   *   id, responseType: JSON
   * }
   * response:
   * {
   *  service, status,
   *  data: {
   *    vin: { type, value },
   *    color: { type, value },
   *    fourDoorSedan: { type, value },
   *    twoDoorCoupe: { type, value },
   *    driveTrain: { type, value },
   *  }
   * }
   *
   */
  info: function(id) {

    return validateID(id)
    .then(function() {
      return request.post({
        uri: GM_API + '/getVehicleInfoService',
        json: {
          id: id,
          responseType: 'JSON',
        }
      });
    }).then(function(d) {
      var gm = d.body;
      if (gm.status !== '200') {
        return GMAPI_ERROR(gm.reason);
      } else {
        return {
          vin: gm.data.vin.value,
          color: gm.data.color.value,
          // TODO: Verify door count response
          doorCount: gm.data.fourDoorSedan.value === 'True' ? 4 : 
                     gm.data.twoDoorCoupe.value === 'True' ? 2 :
                     'Unknown',
          driveTrain: gm.data.driveTrain.value,
        };
      }
    }).catch(requestError);
  },

  /* 
   * GET /vehicles/:id/doors
   * response:
   * [
   *  { location: 'frontLeft', locked: bool },
   * ]
   *
   * POST /getSecurityStatusService
   * Content-Type: application/json
   * {
   *   id, responseType: JSON
   * }
   *
   * response:
   * {
   *  service, status,
   *  data: {
   *    doors: {
   *      values: [
   *        {
   *          location: { type:String, value:'frontRight' },
   *          locked: { type:Boolean, value:'True|False' },
   *        }
   *      ]
   *    }
   *  }
   * }
   */
  doors: function(id){

    return validateID(id)
    .then(function() {
      return request.post({
        uri: GM_API + '/getSecurityStatusService',
        json: {
          id: id,
          responseType: "JSON",
        }
      })
    }).then(function(d) {
      var gm = d.body;
      if (gm.status !== '200') {
        return GMAPI_ERROR(gm.reason);
      } else {
        return gm.data.doors.values.map(function(door) {
          return {
            location: door.location.value,
            locked: door.locked.value==='True',
          }
        });
      }
    }).catch(requestError);
  },

  /* 
   * GET /vehicles/:id/fuel
   * return:
   * { percent }
   *
   *
   * POST /getEnergyService
   * Content-Type: application/json
   * {
   *  id, responseType: JSON
   * }
   *
   * Response:
   * {
   *  service, status,
   *  data: {
   *    tankLevel: {
   *      type: Number, value
   *    }
   *  }
   * }
   *
   */
  fuel: function(id){

    return validateID(id)
    .then(function() {
      return request.post({
        uri: GM_API + '/getEnergyService',
        json: {
          id: id,
          responseType: 'JSON',
        }
      })
    }).then(function(d) {
      var gm = d.body;
      if (gm.status !== '200') {
        return GMAPI_ERROR(gm.reason);
      } else {
        return {
          percent: (gm.data.tankLevel.type === 'Null') ? 'Unavailable' : +gm.data.tankLevel.value
        };
      }
    }).catch(requestError);
  
  },

  /*
   * GET /vehicles/:id/battery
   * return:
   * { percent }
   *
   *
   * POST /getEnergyService
   * Content-Type: application/json
   * {
   *  id, responseType: JSON
   * }
   *
   * Response:
   * {
   *  service, status,
   *  data: {
   *    batteryLevel: {
   *      type: Number, value
   *    }
   *  }
   * }
   */
  battery: function(id){
    return validateID(id)
    .then(function() {
      return request.post({
        uri: GM_API + '/getEnergyService',
        json: {
          id: id,
          responseType: 'JSON',
        }
      })
    }).then(function(d) {
      var gm = d.body;
      if (gm.status !== '200') {
        return GMAPI_ERROR(gm.reason);
      } else {
        return {
          percent: (gm.data.batteryLevel.type === 'Null') ? 'Unavailable' : +gm.data.batteryLevel.value
        };
      }
    }).catch(requestError);
  },

  /* 
   * POST /vehicles/:id/engine
   * return:
   * { status: success | error }
   *
   * 
   * POST /actionEngineService
   * Content-Type: application/json
   * {
   *  id, responseType:JSON,
   *  command: START_VEHICLE | STOP_VEHICLE
   * }
   *
   * Response:
   * {
   *  service, status,
   *  actionResult: {
   *    status: EXECUTED | FAILED
   *  }
   * }
   */
  engine: function(id, action){
    var command = action==='START'?'START_VEHICLE':
                  action==='STOP'?'STOP_VEHICLE':
                    false;
    function validateCommand(command) {
      return P.try(function() {
        if (!command) throw new Error('Bad engine command');
      });
    }
    function translateStatus(status) {
      switch(status) {
        case 'EXECUTED': return 'success';
        case 'FAILED': return 'error';
        default: return 'error';
      }
    }
    return validateID(id)
    .then(_=>validateCommand(command))
    .then(function() {
      return request.post({
        uri: GM_API + '/actionEngineService',
        json: {
          id: id,
          command: command,
          responseType: 'JSON',
        }
      })
    }).then(function(d) {
      var gm = d.body;
      if (gm.status !== '200') {
        return GMAPI_ERROR(gm.reason);
      } else {
        return {
          status: translateStatus(gm.actionResult.status)
        };
      }
    }).catch(requestError);
  },

};


module.exports = gmapi;
