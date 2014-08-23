/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var request = require('request');
var Waif = require('../');

describe('use defaults with request', function() {
  var waif, req, service;
  before(function() {
    waif = Waif.createInstance();
    service = waif('service')
      .send('/ping', 'pong')
      .send('/foo', 'bar')
      .send('/foo/bar', 'baz')
      .listen(0);

    waif.start();
  });

  it.skip('allow a proxy', function(done) {
    req = request.defaults({
      proxy: service.requestUrl()
    });

    req('http://wikipedia.org/ping', function(err, resp, body) {
      done();
    });
  });

  after(function() {
    waif.stop();
  });
});
