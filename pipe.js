var http  = require('http');
var norma = require('norma');
var debug = require('debug')('waif:pipe');
var url   = require('url');
var _     = require('lodash');

module.exports = function() {
  var waif = this;

  console.log(this);

  var args = norma('url:s', arguments);
  var _url = url.parse(args.url);

  debug('service %s piped to %s', this.service.name, _url.hostname);

  return function(req, res, next) {
    var options = {
      hostname: _url.hostname,
      method: req.method,
      path: req.url,
      headers: req.headers
    };

    debug('service %s piping to %s, opts: %o', 
      this.service.name, req.hostname, options);

    var proxy = http.request(options, function(proxyRes) {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxy, { end: true });
  };
};
