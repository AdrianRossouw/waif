/**
* forwarding/listening state machine
*/

var debug        = require('debug')('waif:state:service');
var EventEmitter = require('events').EventEmitter;
var request      = require('request');
var norma        = require('norma');
var state        = require('state');
var assert       = require('assert');
var express      = require('express');
var util         = require('util');

var _            = require('lodash');
var Uri          = require('./uri');
var Status       = require('./status');
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

  this.name                       = name;
  this.middleware                 = [];
  this.uri                        = new Uri();
  this.status                     = new Status();

  this.initialize();

  return this;
}
util.inherits(Service, EventEmitter);

Service.prototype.initialize = function() {
  // Applies an in-line state machine
  state(this, {
    Initial: state('initial', {
      request: noopFn
    }),
    Forwarding: state({
      start: function() {
        debug('%s: start forwarding to %s', this.name, this.uri.get());
        this.emit('start');
        this.status.state().go('start');
      },
      stop: function() {
        debug('%s: stop forwarding to %s', this.name, this.uri.get());
        this.emit('stop');
        this.status.state().go('start');
      } 
    }),
    Listening: state({
      start: function() {
        debug('start listening on service: %s', this.name);

        // new express server
        this.server = express();

        // mount middleware
        _(this.middleware).each(this.mount, this);

        // listen on whatever url we need to
        var listenArgs = this.uri.listenUrl();
        listenArgs.push(listenFn.bind(this));
        this.server.listen.apply(this.server, listenArgs);

        return this;

        //// helpers
        function listenFn(err) {
          debug('%s: start listening on %o', this.name, this.uri.get());
          this.emit('start');
          this.status.state().go('Running');
        }

      },
      stop: function() {
        debug('%s: stop forwarding to %s', this.name, this.uri.get());
        this.emit('stop');
        this.status.state().go('start');
      }, 
      
      mount: function mount(mw) {
        this.server.use.apply(this.server, mw);
      }

    }),
    forward: function(url) {
      this.state().go('Forwarding');
      this.uri.set(url);
      return this;
    },
    listen: function(url) {
      this.state().go('Listening');
      this.uri.set(url);
      return this;
    },
    request: function() {
      var args = norma('path:s?, opts:o?, cb:f?', arguments);
      var cb   = args.cb || null;
      var opts = args.opts || {};
      var path = args.path || opts.url || opts.uri;

      opts.uri = this.uri.requestUrl(path);
      opts.url = null;

      _.defaults(opts, { json: true });

      debug('request on service: %s, %o', this.name, args);
      return request.apply(request, _.compact([opts, cb]));
    },

    use: function() {
      var args = norma('s?, f}', arguments);
      this.middleware.push(_.compact(args));
      debug('use middlware on service: %s', this.name);
      return this;
    },
    mount: noopFn

  });
};

// avoid retyping function(){}
function noopFn() { return this; }

module.exports = Service;
