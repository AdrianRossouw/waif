
var assert       = require('assert');
var norma        = require('norma');
var debug        = require('debug')('waif:service');
var _            = require('lodash');

var Service      = require('./state/service');

// Each service is also an event emitter,
// to allow you to get notifications of
// start, stop and configure.

Service.createInstance = function(waif, name) {
  var _service = new Service(waif, name);

  // called directly
  var fn = function() {
    debug('request proxy on service: %s', name);
    return _service.request.apply(_service, arguments);
  };

  fn.instance = _service;

  var proxyMethods = [
    'request', 'listen', 'use', 'start', 'stop', 'on'
  ];

  _(proxyMethods).each(function(method) {
    fn[method] = function() {
      _service[method].apply(_service, arguments);
      return fn;
    };
  });

  fn.requestUrl = _service.uri.requestUrl.bind(_service.uri);

  return fn;
};

module.exports = Service;
