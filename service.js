
var assert       = require('assert');
var norma        = require('norma');
var debug        = require('debug')('waif:service');
var _            = require('lodash');
var EventEmitter = require('events').EventEmitter;
var request      = require('request');
var express      = require('express');
var util         = require('util');

var Uri          = require('./state/uri');
var Status       = require('./state/status');
var send         = require('./send');
var pipe         = require('./pipe');

/**
* Service constructor.
*
* Instances will contain a map to all of the
* services that have been mounted onto the
* system.
*/
function Service(name) {
  debug('new service: %s', name);
  assert(name, "service not supplied with name");

  this.name       = name;
  this.middleware = [];
  this.uri        = new Uri();
  this.status     = new Status();

  this.initialize();

  return this;
}
util.inherits(Service, EventEmitter);

Service.prototype.setWaif = function(waif) {
  this.waif = waif;
  return this;
};

Service.prototype.initialize = function() {};


Service.prototype.start = function () {
  debug('start listening on service: %s', this.name);

  // new express server
  this.server = express();

  // mount middleware
  _(this.middleware).each(this.mount, this);

  // listen on whatever url we need to
  if (this.listening) {
    var listenArgs = this.uri.listenUrl();
    listenArgs.push(listenFn.bind(this));
    this.server.listen.apply(this.server, listenArgs);
  }

  return this;

  //// helpers
  function listenFn(err) {
    debug('%s: start listening on %o', this.name, this.uri.get());
    this.emit('start');
    this.status.state().go('Running');
  }

};

Service.prototype.stop = function() {
  debug('%s: stop forwarding to %s', this.name, this.uri.get());
  this.emit('stop');
  this.status.state().go('start');
};

Service.prototype.mount = function mount(mw) {
  var _args = [];

  mw.path && _args.push(mw.path);
  _args.push(_initHandler.call(this, mw));

  this.server.use.apply(this.server, _args);

  function _initHandler(mw) {
    var context = {
      waif: this.waif,
      service: this
    };
    return mw.handler.apply(context, mw.options || {});
  }
};

Service.prototype.use = function() {
  var args = norma('{path:s?, handler:f, options:.*}', arguments);
  this.middleware.push(args);
  debug('use middlware on service: %s', this.name);
  return this;
};

Service.prototype.pipe = function() {
  var args = norma('{path:s?, options:.*}', arguments);
  args.handler = pipe;
  this.middleware.push(args);
  return this;
};

Service.prototype.send = function() {
  var args = norma('{path:s?, options:.*}', arguments);
  args.handler = send;
  this.middleware.push(args);
  return this;
};

Service.prototype.forward = function(url) {
  console.log("Forward has been deprecated.");
  console.log("Instead do '.use(pipe, \"http://domain.com\").listen()'");
};

Service.prototype.listen = function(url) {
  this.listening = true;
  this.uri.set(url);
  return this;
};

Service.prototype.request = function() {
  var args = norma('path:s?, opts:o?, cb:f?', arguments);
  var cb   = args.cb || null;
  var opts = args.opts || {};
  var path = args.path || opts.url || opts.uri;

  opts.uri = this.uri.requestUrl(path);
  opts.url = null;


  _.defaults(opts, { json: true });

  debug('request on service: %s, %o', this.name, args);
  return request.apply(request, _.compact([opts, cb]));
};


// Each service is also an event emitter,
// to allow you to get notifications of
// start, stop and configure.

Service.createInstance = function(name, waif) {
  var _service = new Service(name);
  _service.setWaif(waif);

  // called directly
  var fn = function() {
    debug('request proxy on service: %s', name);
    return _service.request.apply(_service, arguments);
  };

  fn.instance = _service;

  var proxyMethods = [
    'request', 'listen',
    'use', 'send', 'pipe',
    'start', 'stop', 'on',
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
