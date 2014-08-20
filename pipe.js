var http  = require('http');
var norma = require('norma');
var request = require('request');
var debug = require('debug')('waif:pipe');
var url   = require('url');
var _     = require('lodash');

module.exports = function(config) {
  var waif = this.waif;
  var service = this.service;

  var args = norma('url:s', arguments);

  var r = request.defaults({proxy: args.url});

  debug('service %s piped to %s', service.name, args.url);

  return function(req, res, next) {
    debug('service %s piping to %s', service.name, req.url);
    var reqUrl= service.uri.requestUrl(req.url);
    if (!reqUrl) { return next(); }

    var x = r(reqUrl, console.log.bind(console));
    req.pipe(x);
    x.pipe(res);
  };
};
