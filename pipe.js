var http  = require('http');
var norma = require('norma');
var request = require('request');
var debug = require('debug')('waif:pipe');
var url   = require('url');
var _     = require('lodash');

module.exports = function(config) {
  var args = norma('url:s', arguments);

  var waif = this;
  var r = request.defaults({proxy: args.url});
  this.forward(args.url);
  console.log(this.service.state().name);

  debug('service %s piped to %s', waif.service.name, args.url);

  return function(req, res, next) {
    debug('service %s piping to %s', waif.service.name, req.url);
    var reqUrl= waif.service.uri.requestUrl(req.url);
    if (!reqUrl) { return next(); }

    var x = r(reqUrl, console.log.bind(console));
    req.pipe(x);
    x.pipe(res);
  };
};
