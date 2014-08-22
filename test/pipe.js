/* global describe, it, before, beforeEach, after, afterEach */
var Waif    = require('../');
var pipe    = require('../pipe');
var send    = require('../send');
var should  = require('should');
var through = require('through');


describe('pipe service', function() {
  var waif = null;

  before(function() {
    waif = Waif.createInstance();

    this.service = waif('local')
      .use(send, {msg: 'ok'})
      .listen(3002);

    this.proxy = waif('proxy')
      .pipe(this.service.requestUrl())
      .listen();

    waif.start();
  });

  after(function() { waif.stop(); });


  it('request works', function(doneFn) {
    this.proxy('filename.jpg', function(err, resp, body) {
      if (err || resp.statusCode !== 200) { return doneFn(resp.statusCode); }
      should.exist(body);
      body.should.have.property('msg', 'ok');
      doneFn();
    });
  });
});
