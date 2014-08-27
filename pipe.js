var norma     = require('norma');
var request   = require('request');
var debug     = require('debug')('waif:pipe');
var Uri       = require('./state/uri');
var pathToUrl = require('path-to-url');

module.exports = function(config) {
  var service = this.service;

  var args = norma('url:s, rest:.*', arguments);
  debug('service %s piped to %s', service.name, args.url);

  return function(req, res, next) {
    debug('service %s piping to %s', service.name, req.url);

    var proxyUrl = pathToUrl(args.url, req.params);

    var uri = new Uri();
    uri.set(proxyUrl);

    var proxy = request(uri.requestUrl(proxyUrl));
    req.pipe(proxy);
    proxy.pipe(res);
  };
};
