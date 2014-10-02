/* global describe, it, before, beforeEach, after, afterEach */
var should = require('should');
var through = require('through');
var _ =  require('lodash');
var wrap = require('../wrap');

var Waif = require('../');

describe('headers can be configured', function() {
  var waif = null;
  var request = null;

  before(function() {
    waif = Waif.createInstance();

    this.service = waif('local')
      .use(requestHeaders, {'request-header': 'abc'})
      .use(responseHeaders, {'response-header': '123'})
      .use(_middleware)
      .listen(3006);

    waif('proxy')
      .pipe('http://localhost:3006', {
        headers: { 'proxy-header': 'doremi'}
      })
      .listen(0);

    waif.start();

    function _middleware() {
      return function(req, res, next) {
        request = req;
        res.send({msg: 'ok'});
      };
    }
  });

  after(function() { waif.stop(); });

  it('request headers', function(doneFn) {
    var local = waif('local');

    local('/path/here', test);
    function test(err, resp, body) {
      request.headers.should.have.property('request-header', 'abc');
      doneFn();
    }
  });

  it('response header', function(doneFn) {
    var local = waif('local');

    local('/path/here', test);
    function test(err, resp, body) {
      resp.headers.should.have.property('response-header', '123');
      should.not.exist(err);

      doneFn();
    }
  });

  it('proxy header', function(doneFn) {
    var local = waif('proxy');

    local('/path/here', test);
    function test(err, resp, body) {
      request.headers.should.have.property('host', 'localhost');
      request.headers.should.have.property('proxy-header', 'doremi');
      should.not.exist(err);

      doneFn();
    }
  });
});

//// Helpers

function requestHeaders(config) {
  return function(req, res, next) {
    _.extend(req.headers, config);
    next();
  };
}

function responseHeaders(config) {
  return function(req, res, next) {
    _.each(config, function(val, key) {
      res.setHeader(key, val);
    });
    next();
  };
}
