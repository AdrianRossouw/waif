var http  = require('http');
var norma = require('norma');
var request = require('request');
var debug = require('debug')('waif:pipe');
var url   = require('url');
var _     = require('lodash');
var Uri   = require('./state/uri');

module.exports = function(config) {
  var waif = this.waif;
  var service = this.service;

  var args = norma('url:s', arguments);
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
