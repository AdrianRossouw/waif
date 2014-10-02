var norma     = require('norma');
var url       = require('url');
var request   = require('request');
var debug     = require('debug')('waif:pipe');
var Uri       = require('./state/uri');
var pathToUrl = require('path-to-url');
var _         = require('lodash');

module.exports = function(config) {
  var service = this.service;

  var args = norma('url:s, opts:o?, rest:.*', arguments);
  debug('service %s piped to %s', service.name, args.url);

  return function(req, res, next) {

    var proxyUrl = pathToUrl(args.url, req.params) + req.url;

    debug('service %s piping to %s', service.name, proxyUrl);

    var uri = new Uri();
    uri.set(proxyUrl);

    var reqUrl = uri.requestUrl(proxyUrl);

    var opts = {
      url: reqUrl,
      headers: {
        host: url.parse(reqUrl).hostname
      }
    };

    if (args.opts && args.opts.headers) {
      _.extend(opts.headers, args.opts.headers);
    }

    var proxy = request(opts);
    proxy.on('error', errorHandler);
    req.pipe(proxy);
    proxy.pipe(res);

    function errorHandler(err) {
      return res.status(500).send(err);
    }
  };
};
