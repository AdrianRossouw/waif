/* global describe, it, before, beforeEach, after, afterEach */
var Waif    = require('../');
var wrap    = require('../wrap');
var should  = require('should');

describe('wrap middleware', function() {
  var waif = null;

  before(function() {
    waif = Waif.createInstance();

    this.service = waif('local')
      .use(wrap, middleware)
      .listen();

    waif.start();
  });

  after(function() { waif.stop(); });

  it('request works', function(doneFn) {
    this.proxy('', function(err, resp, body) {
      if (err || resp.statusCode !== 200) { return doneFn(resp.statusCode); }
      should.exist(body);
      body.should.have.property('msg', 'ok');
      doneFn();
    });
  });
});

function middleware(req, res, next) {
  req.send({msg: 'ok'});
}
