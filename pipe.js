var norma = require('norma');
var request = require('request');
var debug = require('debug')('waif:pipe');
var Uri   = require('./state/uri');

module.exports = function(config) {
  var service = this.service;

  var args = norma('url:s, rest:.*', arguments);
  debug('service %s piped to %s', service.name, args.url);

  var _uri = new Uri();
  _uri.set(args.url);

  return function(req, res, next) {
    debug('service %s piping to %s', service.name, req.url);

    var x = request(_uri.requestUrl(req.url));
    req.pipe(x);
    x.pipe(res);
  };
};
