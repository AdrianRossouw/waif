var request = require('request');
var norma = require('norma');
var debug = require('debug', 'waif:waif');
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

  debug('service', args);
  if (!this._services[name]) {
    this._services[name] = Service.createInstance(name, this);
  }
  return this._services[name];
};

Waif.prototype.start = function() {
  debug('start');
  
  _(this._services).invoke('start');
  return this;
};

Waif.prototype.stop = function() {
  debug('stop');
  //_(this._services).invoke('stop');
  return this;
};


Waif.createInstance = function() {
  var _waif = new Waif();
  var fn = function() {
    var args = norma('s', arguments);
    var name = args[0];

    return _waif.service(name);
  };
  fn._id = _.uniqueId();

  fn.instance = _waif;
  fn.createInstance = Waif.createInstance;
  fn.start = _waif.start.bind(_waif);
  fn.stop = _waif.stop.bind(_waif);

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

