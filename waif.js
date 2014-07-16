var request = require('request');
var norma = require('norma');
var assert = require('assert');
var _ = require('lodash');
var Service = require('./service');

/**
* Waif constructor.
*
* Instances will contain a map to all of the
* services that have been mounted onto the
* system.
*/
function Waif(opts) {
  this._services = {};
  return this;
}

// retrieve or set a service
Waif.prototype.service = function() {
  var args = norma('s', arguments);
  var name = args[0];

  if (!this._services[name]) {
    this._services[name] = Service.createInstance();
  }

  return this._services[name];
};

Waif.createInstance = function() {
  var _waif = new Waif();
  var fn = function() {
    var args = norma('s', arguments);
    var name = args[0];

    return _waif.service(name);
  };
  fn._id = _.uniqueId();

  fn.createInstance = Waif.createInstance;

  return fn;
};

Waif._instance = null;

Waif.getInstance = function() {
  if(this._instance === null){
    this._instance = Waif.createInstance();
  }
  return this._instance;
};


module.exports = _makeExport();

function _makeExport() {
  var fn = Waif.getInstance.bind(Waif);
  fn.createInstance = Waif.createInstance;
  return fn;
}

